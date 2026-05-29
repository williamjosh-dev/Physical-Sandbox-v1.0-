from dataclasses import dataclass
from typing import Dict

import numpy as np
from scipy.integrate import solve_ivp

from .aerospace import get_dynamics_function, run_physics_sanity_checks
from ..agents.orchestrator import AerospaceTrackingConfig


@dataclass
class SolverResult:
    t: np.ndarray
    y: np.ndarray
    success: bool
    message: str
    physics_passed: bool


def solve_aerospace_tracking_config(
    config: AerospaceTrackingConfig,
    rtol: float = 1e-6,
    atol: float = 1e-9,
) -> SolverResult:
    dynamics = get_dynamics_function(config.model_type)
    result = solve_ivp(
        fun=lambda t, y: dynamics(t, y, config.parameters, config.control_inputs, config.time_steps),
        t_span=config.time_span,
        y0=config.initial_state,
        t_eval=config.time_steps,
        rtol=rtol,
        atol=atol,
        vectorized=False,
    )
    if result.success:
        physics_passed, status_msg = run_physics_sanity_checks(config.model_type, result.y, config.parameters)
    else:
        physics_passed = False
        status_msg = result.message
    return SolverResult(
        t=result.t,
        y=result.y,
        success=result.success,
        message=status_msg,
        physics_passed=physics_passed,
    )
