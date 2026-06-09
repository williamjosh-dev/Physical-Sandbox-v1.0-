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
from app.agents.evaluator import TelemetryEvaluator

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "YOUR_API_KEY"))

def run_automated_sandbox_loop(user_prompt: str, max_retries: int = 3) -> Dict[str, Any]:
    """
    Core self-correction loop controller. Extracts tokens with the LLM, 
    integrates with SciPy, evaluates using physical boundaries, and updates parameters.
    # Add this requirement into your orchestrator.py system_instruction string:

    In addition to physical parameters, output a structured 'visual_blueprint' list of JSON shapes to represent the vehicle.
    Example format:
    [   
    {"shape": "cone", "scale":, "position":, "color": "0x00ffcc"},
    {"shape": "cylinder", "scale":, "position": [0, -300000, 0], "color": "0x334455"}
    ]
    """
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
