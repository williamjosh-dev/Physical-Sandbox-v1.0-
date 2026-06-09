from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Tuple

import numpy as np


TControls = Dict[str, np.ndarray]
DynamicsFunction = Callable[[float, np.ndarray, Dict[str, float], TControls, np.ndarray], np.ndarray]

MODEL_TYPES = ["point-mass", "fixed-wing", "orbital", "rocket", "modular"]

@dataclass
class SimulationConfig:
    model_type: str
    prompt: str
    state_labels: List[str]
    initial_state: np.ndarray
    time_span: Tuple[float, float]
    time_steps: np.ndarray
    parameters: Dict[str, float]
    control_inputs: TControls
    visual_blueprint: List[Dict[str, Any]] = field(default_factory=list)

    def to_scipy_inputs(self) -> Dict[str, Any]:
        return {
            "t_span": self.time_span,
            "y0": self.initial_state,
            "time_steps": self.time_steps,
            "parameters": self.parameters,
            "control_inputs": self.control_inputs,
        }

DEFAULT_PARAMETERS: Dict[str, Dict[str, float]] = {
    "point-mass": {
        "mass": 1000.0,
        "drag_coefficient": 0.05,
        "area": 1.0,
        "air_density": 1.225,
        "gravity": 9.80665,
    },
    "fixed-wing": {
        "mass": 7500.0,
        "wing_area": 27.0,
        "drag_coefficient": 0.03,
        "air_density": 1.225,
        "gravity": 9.80665,
    },
    "orbital": {
        "mass": 500.0,
        "mu": 3.986e14,
        "drag_coefficient": 2.2,
        "area": 10.0,
    },
    "rocket": {
        "mass": 50000.0,
        "thrust": 760000.0,
        "isp": 300.0,
        "drag_coefficient": 0.5,
        "area": 10.0,
        "air_density": 1.225,
        "gravity": 9.80665,
        "dry_mass": 10000.0,
    },
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


def parse_model_type(prompt: str) -> str:
    normalized = _normalize_prompt(prompt)
    if re.search(r"(?:orbital|orbit|satellite|spacecraft|orbiter)", normalized, flags=re.IGNORECASE):
        return "orbital"
    if re.search(r"(?:rocket|launch vehicle|ascent|booster)", normalized, flags=re.IGNORECASE):
        return "rocket"
    if re.search(r"(?:aircraft|aeroplane|fixed[- ]wing|airplane|flight)", normalized, flags=re.IGNORECASE):
        return "fixed-wing"
    if re.search(r"(?:module|workspace|assembly|structure|sandbox|drone|robot|platform|vehicle)", normalized, flags=re.IGNORECASE):
        return "modular"
    return "point-mass"


def build_default_parameters(model_type: str) -> Dict[str, float]:
    return DEFAULT_PARAMETERS.get(model_type, DEFAULT_PARAMETERS["point-mass"]).copy()


def extract_named_values(prompt: str) -> Dict[str, float]:
    normalized = _normalize_prompt(prompt)
    results: Dict[str, float] = {}
    named_patterns = {
        "mass": [r"mass(?:\s+of)?\s*(?P<value>\d+(?:\.\d+)?)\s*(?:kg|kilograms?)"],
        "altitude": [r"altitude(?:\s+of)?\s*(?P<value>\d+(?:\.\d+)?)\s*(?:m|meters?)"],
        "velocity": [r"velocity(?:\s+of)?\s*(?P<value>\d+(?:\.\d+)?)\s*(?:m/s|m per s|meters per second)"],
        "speed": [r"speed(?:\s+of)?\s*(?P<value>\d+(?:\.\d+)?)\s*(?:m/s|m per s|meters per second)"],
        "angle": [r"angle(?:\s+of)?\s*(?P<value>\d+(?:\.\d+)?)\s*(?:deg|°|degrees?)"],
        "thrust": [r"thrust(?:\s+of)?\s*(?P<value>\d+(?:\.\d+)?)\s*(?:n|kn|kN|newtons?)"],
        "wing_area": [r"wing area(?:\s+of)?\s*(?P<value>\d+(?:\.\d+)?)\s*(?:m\^2|m2|square meters?)"],
        "drag_coefficient": [r"drag coefficient(?:\s+of)?\s*(?P<value>\d+(?:\.\d+)?)"],
    }
    for name, patterns in named_patterns.items():
        value = _extract_number(normalized, patterns, default=None)
        if value is not None:
            results[name] = value
    return results


def _parse_force(prompt: str) -> float:
    normalized = _normalize_prompt(prompt)
    amount = _extract_number(normalized, [r"(?P<value>\d+(?:\.\d+)?)\s*(?:kn|kN|newtons?|n)"])
    if re.search(r"\bkn\b|\bkN\b", normalized, flags=re.IGNORECASE):
        amount *= 1000.0
    return amount


def _parse_angle(prompt: str) -> float:
    normalized = _normalize_prompt(prompt)
    angle = _extract_number(normalized, [r"(?P<value>\d+(?:\.\d+)?)\s*(?:deg|°|degrees?)"])
    return angle


def build_initial_state(model_type: str, named: Dict[str, float]) -> Tuple[List[str], np.ndarray]:
    if model_type == "orbital":
        labels = ["x", "y", "vx", "vy"]
        radius = named.get("altitude", 7000e3)
        speed = named.get("velocity", 7800.0)
        return labels, np.array([radius, 0.0, 0.0, speed], dtype=float)

    if model_type == "rocket":
        labels = ["altitude", "velocity", "mass"]
        altitude = named.get("altitude", 0.0)
        velocity = named.get("velocity", 0.0)
        mass = named.get("mass", DEFAULT_PARAMETERS["rocket"]["mass"])
        return labels, np.array([altitude, velocity, mass], dtype=float)

    if model_type == "fixed-wing":
        labels = ["x", "y", "vx", "vy", "theta", "omega"]
        altitude = named.get("altitude", 1000.0)
        speed = named.get("velocity", 70.0)
        angle = np.deg2rad(named.get("angle", 0.0))
        return labels, np.array([0.0, altitude, speed * np.cos(angle), speed * np.sin(angle), angle, 0.0], dtype=float)

    if model_type == "modular":
        labels = ["x", "y", "z", "vx", "vy", "vz"]
        altitude = named.get("altitude", 0.0)
        speed = named.get("velocity", 20.0)
        angle = np.deg2rad(named.get("angle", 0.0))
        return labels, np.array([0.0, altitude, 0.0, speed * np.cos(angle), speed * np.sin(angle), 0.0], dtype=float)

    labels = ["x", "y", "vx", "vy"]
    altitude = named.get("altitude", 0.0)
    speed = named.get("velocity", 10.0)
    return labels, np.array([0.0, altitude, speed, 0.0], dtype=float)


def build_control_inputs(prompt: str, duration: float, steps: int) -> TControls:
    normalized = _normalize_prompt(prompt)
    controls: TControls = {}

    thrust_value = _parse_force(normalized)
    if thrust_value > 0.0:
        controls["thrust"] = np.full(steps, thrust_value, dtype=float)

    if "pitch" in normalized or "elevator" in normalized:
        pitch = _parse_angle(normalized)
        controls["pitch"] = np.full(steps, np.deg2rad(pitch), dtype=float)

    if "roll" in normalized:
        roll = _parse_angle(normalized)
        controls["roll"] = np.full(steps, np.deg2rad(roll), dtype=float)

    if "yaw" in normalized:
        yaw = _parse_angle(normalized)
        controls["yaw"] = np.full(steps, np.deg2rad(yaw), dtype=float)

    if not controls:
        controls["none"] = np.zeros(steps, dtype=float)

    return controls


def map_prompt_to_scipy_tracking(prompt: str) -> SimulationConfig:
    model_type = parse_model_type(prompt)
    named = extract_named_values(prompt)
    parameters = build_default_parameters(model_type)
    parameters.update(named)

    state_labels, initial_state = build_initial_state(model_type, named)
    time_horizon = named.get("duration", 120.0)
    time_steps = np.linspace(0.0, time_horizon, 120)
    control_inputs = build_control_inputs(prompt, time_horizon, len(time_steps))
    visual_blueprint = _build_visual_blueprint(prompt, model_type)

    return SimulationConfig(
        model_type=model_type,
        prompt=prompt,
        state_labels=state_labels,
        initial_state=initial_state,
        time_span=(0.0, time_horizon),
        time_steps=time_steps,
        parameters=parameters,
        control_inputs=control_inputs,
        visual_blueprint=visual_blueprint,
    )


def _build_visual_blueprint(prompt: str, model_type: str) -> List[Dict[str, Any]]:
    normalized = _normalize_prompt(prompt)
    blueprint: List[Dict[str, Any]] = []

    if model_type == "rocket":
        blueprint = [
            {"shape": "cone", "scale": [60000.0, 180000.0, 24.0], "position": [0.0, 100000.0, 0.0], "color": "0x22c55e"},
            {"shape": "cylinder", "scale": [30000.0, 160000.0, 24.0], "position": [0.0, 0.0, 0.0], "color": "0x0ea5e9"},
            {"shape": "box", "scale": [40000.0, 60000.0, 40000.0], "position": [0.0, -110000.0, 0.0], "color": "0x334155"},
        ]
    elif model_type == "orbital":
        blueprint = [
            {"shape": "sphere", "scale": [120000.0, 120000.0, 120000.0], "position": [0.0, 0.0, 0.0], "color": "0xfbbf24"},
            {"shape": "cylinder", "scale": [15000.0, 160000.0, 16.0], "position": [0.0, 0.0, 0.0], "color": "0x94a3b8"},
        ]
    elif model_type == "fixed-wing":
        blueprint = [
            {"shape": "box", "scale": [180000.0, 20000.0, 30000.0], "position": [0.0, 0.0, 0.0], "color": "0x38bdf8"},
            {"shape": "box", "scale": [300000.0, 4000.0, 30000.0], "position": [0.0, 0.0, 0.0], "color": "0x0ea5e9"},
            {"shape": "box", "scale": [150000.0, 1000.0, 20000.0], "position": [0.0, -12000.0, 0.0], "color": "0x0284c7"},
        ]
    else:
        if "drone" in normalized or "quad" in normalized or "rotor" in normalized:
            blueprint = [
                {"shape": "box", "scale": [90000.0, 25000.0, 35000.0], "position": [0.0, 0.0, 0.0], "color": "0x34d399"},
                {"shape": "cylinder", "scale": [12000.0, 70000.0, 16.0], "position": [60000.0, 0.0, 0.0], "color": "0xf59e0b"},
                {"shape": "cylinder", "scale": [12000.0, 70000.0, 16.0], "position": [-60000.0, 0.0, 0.0], "color": "0xf59e0b"},
            ]
        elif "crane" in normalized or "assembly" in normalized or "workspace" in normalized or "module" in normalized or "structure" in normalized:
            blueprint = [
                {"shape": "box", "scale": [160000.0, 40000.0, 80000.0], "position": [0.0, -20000.0, 0.0], "color": "0x64748b"},
                {"shape": "cylinder", "scale": [15000.0, 140000.0, 16.0], "position": [85000.0, 60000.0, 0.0], "color": "0xf97316"},
                {"shape": "cone", "scale": [30000.0, 70000.0, 16.0], "position": [-90000.0, 50000.0, 0.0], "color": "0x22d3ee"},
            ]
        else:
            blueprint = [
                {"shape": "sphere", "scale": [90000.0, 90000.0, 90000.0], "position": [0.0, 0.0, 0.0], "color": "0x60a5fa"},
                {"shape": "box", "scale": [40000.0, 25000.0, 45000.0], "position": [0.0, -45000.0, 0.0], "color": "0x334155"},
            ]

    return blueprint


def _interpolate_controls(t: float, time_grid: np.ndarray, control_inputs: TControls) -> Dict[str, float]:
    values: Dict[str, float] = {}
    for name, series in control_inputs.items():
        if series.size == 0:
            values[name] = 0.0
        else:
            values[name] = float(np.interp(t, time_grid, series, left=series[0], right=series[-1]))
    return values


def _drag_force(velocity: float, parameters: Dict[str, float]) -> float:
    rho = parameters.get("air_density", 1.225)
    cd = parameters.get("drag_coefficient", 0.05)
    area = parameters.get("area", 1.0)
    return 0.5 * rho * cd * area * velocity * velocity


def _point_mass_dynamics(t: float, state: np.ndarray, parameters: Dict[str, float], controls: TControls, time_grid: np.ndarray) -> np.ndarray:
    x, y, vx, vy = state
    mass = parameters.get("mass", 1000.0)
    g = parameters.get("gravity", 9.80665)
    speed = np.hypot(vx, vy)
    drag = _drag_force(speed, parameters) if speed > 0.0 else 0.0
    ax = -drag * (vx / speed if speed > 0 else 0.0) / mass
    ay = -g - drag * (vy / speed if speed > 0 else 0.0) / mass
    return np.array([vx, vy, ax, ay], dtype=float)


def _orbital_dynamics(t: float, state: np.ndarray, parameters: Dict[str, float], controls: TControls, time_grid: np.ndarray) -> np.ndarray:
    x, y, vx, vy = state
    mu = parameters.get("mu", 3.986e14)
    r = np.hypot(x, y)
    if r <= 0.0:
        return np.zeros(4, dtype=float)
    accel = -mu / (r ** 3)
    ax = accel * x
    ay = accel * y
    return np.array([vx, vy, ax, ay], dtype=float)


def _fixed_wing_dynamics(t: float, state: np.ndarray, parameters: Dict[str, float], controls: TControls, time_grid: np.ndarray) -> np.ndarray:
    x, y, vx, vy, theta, omega = state
    mass = parameters.get("mass", 7500.0)
    g = parameters.get("gravity", 9.80665)
    controls_at_t = _interpolate_controls(t, time_grid, controls)
    thrust = controls_at_t.get("thrust", 0.0)
    pitch_cmd = controls_at_t.get("pitch", 0.0)
    speed = np.hypot(vx, vy)
    drag = _drag_force(speed, parameters) if speed > 0.0 else 0.0
    ax = (thrust - drag) / mass * np.cos(theta)
    ay = (thrust - drag) / mass * np.sin(theta) - g
    theta_dot = omega
    omega_dot = (pitch_cmd - omega) * 0.5
    return np.array([vx, vy, ax, ay, theta_dot, omega_dot], dtype=float)


def _rocket_dynamics(t: float, state: np.ndarray, parameters: Dict[str, float], controls: TControls, time_grid: np.ndarray) -> np.ndarray:
    altitude, velocity, mass = state
    g = parameters.get("gravity", 9.80665)
    controls_at_t = _interpolate_controls(t, time_grid, controls)
    thrust = controls_at_t.get("thrust", parameters.get("thrust", 0.0))
    isp = parameters.get("isp", 300.0)
    speed = abs(velocity)
    drag = _drag_force(speed, parameters)
    thrust_acc = thrust / mass if mass > 0 else 0.0
    mass_flow = -thrust / (isp * g) if isp > 0 else 0.0
    vel_dot = thrust_acc - drag / mass - g
    if altitude <= 0.0 and velocity < 0.0:
        vel_dot = 0.0
        velocity = 0.0
    return np.array([velocity, vel_dot, mass_flow], dtype=float)


def _modular_dynamics(t: float, state: np.ndarray, parameters: Dict[str, float], controls: TControls, time_grid: np.ndarray) -> np.ndarray:
    x, y, z, vx, vy, vz = state
    mass = parameters.get("mass", 1000.0)
    g = parameters.get("gravity", 9.80665)
    controls_at_t = _interpolate_controls(t, time_grid, controls)
    thrust = controls_at_t.get("thrust", 0.0)
    pitch = controls_at_t.get("pitch", 0.0)
    yaw = controls_at_t.get("yaw", 0.0)
    direction = np.array([
        np.cos(pitch) * np.cos(yaw),
        np.sin(pitch) * np.cos(yaw),
        np.sin(yaw),
    ], dtype=float)
    speed = np.hypot(vx, vy, vz)
    drag = _drag_force(speed, parameters) if speed > 0.0 else 0.0
    ax = (thrust * direction[0] - drag * (vx / speed if speed > 0 else 0.0)) / mass
    ay = (thrust * direction[1] - drag * (vy / speed if speed > 0 else 0.0)) / mass
    az = -g + (thrust * direction[2] - drag * (vz / speed if speed > 0 else 0.0)) / mass
    return np.array([vx, vy, vz, ax, ay, az], dtype=float)


def get_dynamics_function(model_type: str) -> DynamicsFunction:
    if model_type == "orbital":
        return _orbital_dynamics
    if model_type == "rocket":
        return _rocket_dynamics
    if model_type == "fixed-wing":
        return _fixed_wing_dynamics
    if model_type == "modular":
        return _modular_dynamics
    return _point_mass_dynamics


def run_physics_sanity_checks(model_type: str, y_data: np.ndarray, parameters: Dict[str, float]) -> tuple[bool, str]:
    if y_data.size == 0:
        return False, "Simulation returned empty matrix states."
    if model_type == "rocket":
        altitudes = y_data[0]
        masses = y_data[2]
        dry_mass = parameters.get("dry_mass", 10000.0)
        for step, alt in enumerate(altitudes[1:], start=1):
            if alt < 0.0:
                return False, f"PHYSICS_CRASH: Rocket impacted terrain at time step index {step}."
        if masses[-1] <= dry_mass:
            return False, "FUEL_DEPLETED: Structural mass minimum boundary hit before time step completion."
    elif model_type == "orbital":
        x_pos = y_data[0]
        y_pos = y_data[1]
        radii = np.hypot(x_pos, y_pos)
        core_radius = parameters.get("core_radius", 6371000.0)
        if np.any(radii[1:] < core_radius):
            return False, "ORBITAL_DECAY: Spacecraft atmospheric re-entry or core celestial body impact detected."
    elif model_type == "modular":
        z_pos = y_data[2] if y_data.shape[0] > 2 else np.zeros(y_data.shape[1])
        if np.any(z_pos < -1.0):
            return False, "MODULE_INVALID: Modular assembly passed below the ground plane."
    return True, "FLIGHT_VERIFIED: All spatial coordinate steps conform to physical boundaries."
