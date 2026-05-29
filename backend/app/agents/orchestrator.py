import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Tuple

import numpy as np
from app.physics.aerospace import (
    build_control_inputs,
    build_default_parameters,
    build_initial_state,
    extract_named_values,
    parse_model_type,
)


@dataclass
class AerospaceTrackingConfig:
    model_type: str
    prompt: str
    state_labels: List[str]
    initial_state: np.ndarray
    time_span: Tuple[float, float]
    time_steps: np.ndarray
    parameters: Dict[str, float]
    control_inputs: Dict[str, np.ndarray] = field(default_factory=dict)

    def to_scipy_inputs(self) -> Dict[str, Any]:
        return {
            "y0": self.initial_state,
            "t_span": self.time_span,
            "t_eval": self.time_steps,
            "args": (self.parameters, self.control_inputs),
        }


def _normalize_prompt(prompt: str) -> str:
    return prompt.strip().replace("–", "-").lower()


def _extract_number(prompt: str, patterns: List[str], default: float = 0.0) -> float:
    for pattern in patterns:
        match = re.search(pattern, prompt, flags=re.IGNORECASE)
        if match:
            value = match.group("value")
            try:
                return float(value)
            except ValueError:
                continue
    return default


def _duration_from_prompt(prompt: str) -> float:
    patterns = [r"(?P<value>\d+(?:\.\d+)?)\s*(?:seconds|second|s)",
                r"(?P<value>\d+(?:\.\d+)?)\s*(?:minutes|minute|mins|min)",
                r"(?P<value>\d+(?:\.\d+)?)\s*(?:hours|hour)"]
    raw = _extract_number(prompt, patterns, default=10.0)
    if re.search(r"minutes|minute|mins|min", prompt, flags=re.IGNORECASE):
        raw *= 60.0
    elif re.search(r"hours|hour", prompt, flags=re.IGNORECASE):
        raw *= 3600.0
    return max(raw, 0.1)


def _time_step_from_prompt(prompt: str, duration: float) -> float:
    patterns = [r"(?P<value>\d+(?:\.\d+)?)\s*(?:time step|dt|step)\b",
                r"(?P<value>\d+(?:\.\d+)?)\s*(?:seconds|second|s)\s*(?:per step|per interval)"]
    dt = _extract_number(prompt, patterns, default=0.1)
    return min(max(dt, duration / 1000.0), duration / 10.0)


def map_prompt_to_scipy_tracking(prompt: str) -> AerospaceTrackingConfig:
    normalized = _normalize_prompt(prompt)
    model_type = parse_model_type(normalized)
    duration = _duration_from_prompt(normalized)
    dt = _time_step_from_prompt(normalized, duration)
    steps = int(max(2, np.ceil(duration / dt)))
    time_steps = np.linspace(0.0, duration, steps, dtype=float)

    named = extract_named_values(normalized)
    parameters = build_default_parameters(model_type)
    parameters.update({k: v for k, v in named.items() if k in parameters})

    state_labels, initial_state = build_initial_state(model_type, named)
    control_inputs = build_control_inputs(normalized, duration, len(time_steps))

    return AerospaceTrackingConfig(
        model_type=model_type,
        prompt=prompt,
        state_labels=state_labels,
        initial_state=initial_state,
        time_span=(0.0, duration),
        time_steps=time_steps,
        parameters=parameters,
        control_inputs=control_inputs,
    )
