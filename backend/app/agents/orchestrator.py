# backend/app/agents/orchestrator.py
import os
import numpy as np
from typing import Any, Dict, List, Tuple
from dataclasses import dataclass, field
from scipy.integrate import solve_ivp
from openai import OpenAI

# Internal module mapping bindings
from app.physics.aerospace import (
    map_prompt_to_scipy_tracking,
    get_dynamics_function
)
from app.physics.geometry_builder import ObjectBuilder, components_to_blueprint
from app.agents.evaluator import TelemetryEvaluator

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "YOUR_API_KEY"))

def detect_object_build_request(prompt: str) -> bool:
    """Detect if user is asking to build a 3D object instead of simulating physics"""
    object_keywords = [
        "build", "create", "make", "generate", "design",
        "table", "chair", "box", "sphere", "cube", "pyramid",
        "building", "house", "desk", "bench", "object",
        "3d model", "3d object", "geometry", "shape",
        "red box", "blue table", "wooden chair", "metal building"
    ]
    prompt_lower = prompt.lower()
    return any(keyword in prompt_lower for keyword in object_keywords)


def generate_object_blueprint(user_prompt: str) -> Dict[str, Any]:
    """
    Generate a 3D object based on user description.
    Uses LLM to convert natural language to structured object description.
    """
    try:
        # Use LLM to structure the object description
        system_instruction = (
            "You are a 3D geometry generator. Convert user descriptions into structured object specifications. "
            "Generate descriptions that can be parsed by the ObjectBuilder system. "
            "Format: object_type [color] [at position x,y,z] [width/height/depth values]. "
            "Examples: "
            "'red box size 1,2,1 at 0,0,0', "
            "'wooden table width 2 depth 1 at 1,0,0', "
            "'blue chair at 0,0,1', "
            "'building height 5 width 2 color gray at 0,0,0'. "
            "Always include color, object type, and position. Use lowercase."
        )
        
        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": f"Create this 3D object: {user_prompt}"}
        ]
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.3
        )
        
        object_description = response.choices[0].message.content
        
        # Parse and build the geometry
        components = ObjectBuilder.parse_and_build(object_description)
        blueprint = components_to_blueprint(components)
        
        return {
            "success": True,
            "model_type": "custom_3d_object",
            "iterations": 1,
            "logs": f"Generated 3D object: {object_description}",
            "telemetry": {
                "timeline": [0.0],
                "state_matrices": [[0.0, 0.0, 0.0]],
                "labels": ["x", "y", "z"],
                "visual_blueprint": blueprint,
                "parameters": {},
            },
            "visual_blueprint": blueprint,
            "parameters": {},
        }
    except Exception as e:
        # Fallback to simple box
        components = [ObjectBuilder.build_box()]
        blueprint = components_to_blueprint(components)
        return {
            "success": False,
            "model_type": "custom_3d_object",
            "iterations": 1,
            "logs": f"Object generation error: {str(e)}. Generated fallback box.",
            "telemetry": {
                "timeline": [0.0],
                "state_matrices": [[0.0, 0.0, 0.0]],
                "labels": ["x", "y", "z"],
                "visual_blueprint": blueprint,
                "parameters": {},
            },
            "visual_blueprint": blueprint,
            "parameters": {},
        }


def run_automated_sandbox_loop(user_prompt: str, max_retries: int = 3) -> Dict[str, Any]:
    """
    Core self-correction loop controller. Extracts tokens with the LLM, 
    integrates with SciPy, evaluates using physical boundaries, and updates parameters.
    Can also generate 3D objects if user requests object building instead of physics simulation.
    """
    
    # Check if user is asking to build a 3D object
    if detect_object_build_request(user_prompt):
        return generate_object_blueprint(user_prompt)
    
    evaluator = TelemetryEvaluator()
    current_input_context = user_prompt
    attempt_history = []
    
    system_instruction = (
        "You are the high-fidelity aerospace trajectory controller for a physical sandbox. "
        "Analyze the user's prompt or failure diagnostic logs, then generate optimized parameters. "
        "You must return metrics explicitly matching expected regex patterns. "
        "Example output format: 'rocket launch with mass 50000kg thrust 760000n altitude 0m velocity 0m/s'."
    )

    for iteration in range(max_retries):
        try:
            # 1. Ask LLM to refine parameters based on historical failure data
            messages = [{"role": "system", "content": system_instruction}]
            for past_run in attempt_history:
                messages.append({"role": "user", "content": past_run["prompt"]})
                messages.append({"role": "assistant", "content": past_run["feedback"]})
                
            messages.append({"role": "user", "content": f"Target Objective / Fault Log: {current_input_context}"})
            
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.1
            )
            optimized_prompt_text = response.choices[0].message.content
        except Exception:
            # Safe network/API drop fallback string parser bypass
            optimized_prompt_text = current_input_context

        # 2. Map structured prompt down to your internal aerospace configurations
        config = map_prompt_to_scipy_tracking(optimized_prompt_text)
        scipy_inputs = config.to_scipy_inputs()
        
        # 3. Dynamically fetch matching derivative systems
        dynamics_fn = get_dynamics_function(config.model_type)
        
        # 4. Integrate math states using SciPy
        solution = solve_ivp(
            fun=dynamics_fn,
            t_span=scipy_inputs["t_span"],
            y0=scipy_inputs["y0"],
            t_eval=scipy_inputs["time_steps"], # Maps cleanly onto configured tracking arrays
            args=(scipy_inputs["parameters"], scipy_inputs["control_inputs"], scipy_inputs["time_steps"]),
            method="RK45"
        )
        
        if not solution.success:
            current_input_context = "Integration failed due to mathematical overflow error. Reduce forces or steps."
            continue

        # 5. Evaluate execution matrix arrays against your safety sanity metrics
        eval_metrics = evaluator.evaluate(
            config.model_type,
            solution.t,
            solution.y,
            scipy_inputs["parameters"],
            config.visual_blueprint,
        )
        
        if eval_metrics["passed"]:
            # Success: return telemetry coordinates to the frontend client mesh space
            return {
                "success": True,
                "model_type": config.model_type,
                "iterations": iteration + 1,
                "logs": eval_metrics["feedback"],
                "telemetry": {
                    "timeline": solution.t.tolist(),
                    "state_matrices": solution.y.tolist(),
                    "labels": config.state_labels,
                    "visual_blueprint": config.visual_blueprint,
                    "parameters": config.parameters,
                }
            }
            
        # 6. Self-Correction step: append logs to context history arrays and retry loop
        attempt_history.append({
            "prompt": optimized_prompt_text,
            "feedback": eval_metrics["feedback"]
        })
        current_input_context = f"Regenerate configurations. Engine error context logs: {eval_metrics['feedback']}"

    # Loop timed out without satisfying constraints
    return {
        "success": False,
        "model_type": config.model_type,
        "iterations": max_retries,
        "logs": f"Self-correction sequence timed out. Terminal error: {current_input_context}",
        "telemetry": None,
        "visual_blueprint": config.visual_blueprint,
        "parameters": config.parameters,
    }
