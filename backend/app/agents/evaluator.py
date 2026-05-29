from dataclasses import dataclass
from typing import Any, Dict

import numpy as np

from app.agents.orchestrator import AerospaceTrackingConfig, map_prompt_to_scipy_tracking
from app.physics.solvers import solve_aerospace_tracking_config


@dataclass
class EvaluationResult:
    t: np.ndarray
    y: np.ndarray
    config: AerospaceTrackingConfig
    success: bool
    physics_passed: bool
    message: str
    model_type: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "t": self.t.tolist(),
            "y": self.y.tolist(),
            "model_type": self.model_type,
            "success": self.success,
            "physics_passed": self.physics_passed,
            "message": self.message,
            "labels": self.config.state_labels,
        }
    
def evaluate_tracking_config(config: AerospaceTrackingConfig, rtol: float = 1e-6, atol: float = 1e-9) -> EvaluationResult:
    solver_result = solve_aerospace_tracking_config(config, rtol=rtol, atol=atol)
    return EvaluationResult(
        t=solver_result.t,
        y=solver_result.y,
        config=config,
        success=solver_result.success,
        physics_passed=solver_result.physics_passed,
        message=solver_result.message,
        model_type=config.model_type,
    )


def evaluate_prompt(prompt: str, rtol: float = 1e-6, atol: float = 1e-9) -> EvaluationResult:
    config = map_prompt_to_scipy_tracking(prompt)
    return evaluate_tracking_config(config, rtol=rtol, atol=atol)
