# backend/app/agents/evaluator.py
import numpy as np
from dataclasses import dataclass
from typing import Any, List, Dict, Tuple
from scipy.integrate import solve_ivp

@dataclass
class SimulationResult:
    success: bool          # Did SciPy solve the calculus without throwing errors?
    physics_passed: bool   # Did the spacecraft actually achieve its target objective?
    message: str           # The critique or feedback log text
    model_type: str
    config: Any
    t: List[float]
    y: List[List[float]]

def evaluate_physics_run(config: Any) -> SimulationResult:
    """
    Pure deterministic physical evaluation layer. Integrates states over time 
    and checks if boundaries/flight criteria were met.
    """
    scipy_inputs = config.to_scipy_inputs()
    
    # Core ODE System Matrix
    def core_ode_system(t, y, params, controls):
        if config.model_type == "rocket":
            # state vector y = [altitude, velocity, mass]
            alt, vel, mass = y[0], y[1], y[2]
            thrust = params.get("thrust", 760000.0)
            gravity = params.get("gravity", 9.80665)
            dry_mass = params.get("dry_mass", 10000.0)
            isp = params.get("isp", 300.0)
            
            # Ground constraint safety boundary
            if alt <= 0 and vel < 0:
                return [0.0, 0.0, 0.0]
                
            d_alt = vel
            d_vel = (thrust / max(mass, 100.0)) - gravity
            d_mass = -thrust / (isp * 9.80665) if mass > dry_mass else 0.0
            return [d_alt, d_vel, d_mass]
            
        elif config.model_type == "orbital":
            # state vector y = [x, y, vx, vy]
            x_pos, y_pos, vx, vy = y[0], y[1], y[2], y[3]
            mu = params.get("mu", 3.986e14)
            r3 = (x_pos**2 + y_pos**2)**(1.5)
            
            # Crash boundary (Earth radius check)
            if np.sqrt(x_pos**2 + y_pos**2) < 6371000.0:
                return [0.0, 0.0, 0.0, 0.0]
                
            return [vx, vy, -mu * x_pos / r3, -mu * y_pos / r3]
            
        else: # point-mass default
            return [y[2], y[3], 0.0, -params.get("gravity", 9.80665)]

    # Solve across time grid arrays
    solution = solve_ivp(
        fun=core_ode_system,
        t_span=scipy_inputs["t_span"],
        y0=scipy_inputs["y0"],
        t_eval=scipy_inputs["t_eval"],
        args=scipy_inputs["args"],
        method="RK45",
        rtol=1e-6,
        atol=1e-6
    )

    if not solution.success:
        return SimulationResult(
            success=False, physics_passed=False,
            message="SciPy engine encountered mathematical divergence during integration.",
            model_type=config.model_type, config=config, t=[], y=[]
        )

    # Output post-processing and criteria assessment
    physics_passed = True
    critique_msg = "All flight trajectory parameters are stable and physically consistent."
    
    t_data = solution.t.tolist()
    y_data = solution.y.tolist() # Format shape safely into arrays for JSON transmission

    if config.model_type == "rocket":
        final_alt = solution.y[0][-1]
        final_vel = solution.y[1][-1]
        
        # Check if the rocket lost power and crashed back down
        if final_alt <= 0 and final_vel <= 0:
            physics_passed = False
            critique_msg = (
                f"CRASH DETECTED: Ground impact occurred at terminal frame. "
                f"Final altitude: {final_alt:.2f}m. Final Velocity: {final_vel:.2f} m/s. "
                f"The initial thrust profile is burning out too quickly or the mass payload is too heavy. "
                f"Action: Increase thrust, decrease structural dry mass, or optimize burn timing."
            )
            
    elif config.model_type == "orbital":
        radii = np.sqrt(solution.y[0]**2 + solution.y[1]**2)
        min_radius = np.min(radii)
        
        # Check for planetary lithobreaking / atmosphere intersection
        if min_radius < 6371000.0:
            physics_passed = False
            critique_msg = (
                f"ORBITAL DECAY DETECTED: Perigee crossed Earth's radius surface limit. "
                f"Minimum approach distance: {min_radius:.2f}m. "
                f"Action: Increase initial horizontal injection tangential speed component vector (vx, vy)."
            )

    return SimulationResult(
        success=True,
        physics_passed=physics_passed,
        message=critique_msg,
        model_type=config.model_type,
        config=config,
        t=t_data,
        y=y_data
    )
