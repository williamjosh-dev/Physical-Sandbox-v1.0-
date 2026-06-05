# backend/app/agents/evaluator.py
import numpy as np
from typing import Dict, Any
from app.physics.aerospace import run_physics_sanity_checks

class TelemetryEvaluator:
    """
    Evaluates physical simulation output datasets using internal boundary checks
    and translates failures into actionable technical instructions for the LLM.
    """
    def __init__(self):
        pass

    def evaluate(self, model_type: str, t_array: np.ndarray, y_array: np.ndarray, parameters: Dict[str, float]) -> Dict[str, Any]:
        if y_array is None or y_array.size == 0:
            return {
                "passed": False,
                "feedback": "CRITICAL ENGINE ERROR: Simulation output matrix states are entirely empty."
            }

        # 1. Execute your exact internal structural boundary check constraints
        passed, physics_message = run_physics_sanity_checks(model_type, y_array, parameters)
        
        # 2. Extract technical extremes from coordinate array matrices
        feedback = f"Simulation Execution Engine Log: {physics_message}\n"
        
        if model_type == "rocket":
            altitudes = y_array[0]
            velocities = y_array[1]
            feedback += f"Peak Altitude Reached: {np.max(altitudes) / 1000.0:.2f} km\n"
            feedback += f"Terminal Burn Velocity: {velocities[-1]:.2f} m/s\n"
            
        elif model_type == "orbital":
            x_pos = y_array[0]
            y_pos = y_array[1]
            radii = np.hypot(x_pos, y_pos)
            feedback += f"Minimum Approach Radius: {np.min(radii) / 1000.0:.2f} km\n"
            feedback += f"Maximum Apoapsis Offset: {np.max(radii) / 1000.0:.2f} km\n"

        # 3. Translate raw errors into analytical feedback loops for the LLM
        if not passed:
            feedback += "\n--- CRITIC FEEDBACK FOR AUTOMATIC RETRY ---\n"
            if "PHYSICS_CRASH" in physics_message:
                feedback += (
                    "The vehicle suffered terminal gravity losses and hit the terrain. "
                    "Action: Increase thrust parameters, decrease the structural dry_mass, "
                    "or reduce total simulation timeline duration.\n"
                )
            elif "FUEL_DEPLETED" in physics_message:
                feedback += (
                    "The engine consumed all fuel mass resources before stable trajectory completed. "
                    "Action: Reduce total active thrust, increase starting fuel mass, or optimize ISP efficiency parameters.\n"
                )
            elif "ORBITAL_DECAY" in physics_message:
                feedback += (
                    "Spacecraft velocity was too low to counteract gravitational pull, resulting in re-entry. "
                    "Action: Drastically boost your initial tangential insertion velocity speeds.\n"
                )
        else:
            feedback += "\nTrajectory successfully verified. System state conforms to 4D physical space requirements."

        return {
            "passed": passed,
            "feedback": feedback
        }
