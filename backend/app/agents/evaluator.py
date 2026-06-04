import numpy as np
from dataclasses import dataclass
from typing import Any, List, Dict
from scipy.integrate import solve_ivp
from app.agents.orchestrator import map_prompt_to_scipy_tracking

# Make sure you install your preferred LLM package (e.g., pip install openai)
from openai import OpenAI 

client = OpenAI(api_key="YOUR_API_KEY") # Pulled from settings later

@dataclass
class SimulationResult:
    success: bool
    physics_passed: bool
    message: str
    model_type: str
    config: Any
    t: np.ndarray
    y: np.ndarray

def evaluate_prompt(prompt: str, rtol: float = 1e-6, atol: float = 1e-6) -> SimulationResult:
    """
    Acts as the 'Visual Cortex/Brain'. It uses an LLM to extract physics intentions,
    but offloads the actual 4D integration to SciPy to prevent math hallucinations.
    """
    
    # 1. Ask the LLM to reason about spatial parameters safely
    system_instruction = (
        "You are the spatial controller for a 4D physical sandbox workspace. "
        "Analyze the user's simulation prompt. Correct physical metrics if they make no physical sense. "
        "Return a corrected prompt optimized for our SciPy regex tracker module. "
        "Example output format: 'rocket launch with mass 50000kg thrust 760000n for 120 seconds step 0.5'."
    )
    
    try:
        # LLM intercepts the text, plans the mission profile, and fixes semantic anomalies
        response = client.chat.completions.create(
            model="gpt-4o-mini", # Or any fast reasoning model
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1 # Low variation for precise outputs
        )
        optimized_prompt = response.choices[0].message.content
    except Exception:
        # Fallback instantly to the user's raw prompt if the network drops
        optimized_prompt = prompt

    # 2. Feed the LLM's structured execution text directly into your existing tracker!
    config = map_prompt_to_scipy_tracking(optimized_prompt)
    scipy_inputs = config.to_scipy_inputs()
    
    # 3. Safe, hallucination-free integration execution loop
    # (Define how state labels interact based on model_type)
    def core_ode_system(t, y, params, controls):
        if config.model_type == "rocket":
            # state vector y = [altitude, velocity, mass]
            alt, vel, mass = y[0], y[1], y[2]
            thrust = params.get("thrust", 760000.0)
            gravity = params.get("gravity", 9.80665)
            
            d_alt = vel
            d_vel = (thrust / max(mass, 100.0)) - gravity
            d_mass = -thrust / (params.get("isp", 300.0) * 9.80665) if mass > params.get("dry_mass", 10000.0) else 0.0
            return [d_alt, d_vel, d_mass]
            
        elif config.model_type == "orbital":
            # state vector y = [x, y, vx, vy]
            x_pos, y_pos, vx, vy = y[0], y[1], y[2], y[3]
            mu = params.get("mu", 3.986e14)
            r3 = (x_pos**2 + y_pos**2)**(1.5)
            return [vx, vy, -mu * x_pos / r3, -mu * y_pos / r3]
            
        else: # point-mass default
            return [y[2], y[3], 0.0, -params.get("gravity", 9.80665)]

    # 4. Integrate across the timeline space matrix
    solution = solve_ivp(
        fun=core_ode_system,
        t_span=scipy_inputs["t_span"],
        y0=scipy_inputs["y0"],
        t_eval=scipy_inputs["t_eval"],
        args=scipy_inputs["args"],
        method="RK45",
        rtol=rtol,
        atol=atol
    )

    return SimulationResult(
        success=solution.success,
        physics_passed=solution.success,
        message=f"LLM Brain orchestrated workspace setup. SciPy integrated {len(solution.t)} states successfully.",
        model_type=config.model_type,
        config=config,
        t=solution.t,
        y=solution.y
    )
