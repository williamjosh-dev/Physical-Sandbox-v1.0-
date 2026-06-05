# backend/app/physics/solvers.py
import numpy as np
from typing import Dict, List, Any

class AerospaceSolver:
    """
    Deterministic numerical integrator (RK4) for aerospace and orbital mechanics.
    Eliminates LLM math hallucinations by evaluating physical state vectors over time.
    """
    def __init__(self):
        self.G = 6.67430e-11          # Gravitational constant (m^3 kg^-1 s^-2)
        self.M_earth = 5.972e24       # Mass of Earth (kg)
        self.R_earth = 6371000.0      # Radius of Earth (m)

    def compute_gravity(self, pos: np.ndarray) -> np.ndarray:
        """Calculates gravitational acceleration vector based on 3D distance from center."""
        r_mag = np.linalg.norm(pos)
        if r_mag < self.R_earth:
            return np.array([0.0, 0.0, 0.0]) # Handle impact grounding safely
        
        acc_mag = - (self.G * self.M_earth) / (r_mag ** 3)
        return acc_mag * pos

    def compute_drag(self, pos: np.ndarray, vel: np.ndarray, cd: float, area: float) -> np.ndarray:
        """Calculates barometric atmospheric drag vector up to 100km altitude."""
        r_mag = np.linalg.norm(pos)
        altitude = r_mag - self.R_earth
        
        if altitude > 100000.0 or altitude < 0:
            return np.array([0.0, 0.0, 0.0]) # Vacuum conditions or grounded
        
        # Simple exponential atmospheric density model (P = P0 * e^(-h/H))
        rho_0 = 1.225 # Sea level density (kg/m^3)
        H = 8500.0    # Scale height (m)
        rho = rho_0 * np.exp(-altitude / H)
        
        vel_mag = np.linalg.norm(vel)
        if vel_mag == 0:
            return np.array([0.0, 0.0, 0.0])
            
        drag_mag = 0.5 * rho * vel_mag**2 * cd * area
        drag_direction = -vel / vel_mag
        return drag_mag * drag_direction

    def run_simulation(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes a 4D deterministic trajectory loop using 4th Order Runge-Kutta integration.
        """
        # Parse initial configuration tokens provided by the orchestrator
        mass = float(config.get("initial_mass", 50000.0))       # kg
        dry_mass = float(config.get("dry_mass", 5000.0))         # kg
        thrust_mag = float(config.get("thrust", 760000.0))      # N
        burn_time = float(config.get("burn_time", 150.0))       # seconds
        isp = float(config.get("isp", 300.0))                   # Specific Impulse (s)
        g0 = 9.80665
        
        # Mass flow rate (mdot = Thrust / (Isp * g0))
        mdot = thrust_mag / (isp * g0) if thrust_mag > 0 else 0

        # Initialize physical vectors [x, y, z] relative to Earth center
        pos = np.array(config.get("initial_position", [0.0, self.R_earth, 0.0]), dtype=np.float64)
        vel = np.array(config.get("initial_velocity", [0.0, 0.0, 0.0]), dtype=np.float64)
        
        dt = float(config.get("dt", 1.0))
        max_steps = int(config.get("max_steps", 1200))
        
        trajectory_log = []
        status = "simulating"
        failure_reason = ""
        
        # Simulation execution loop
        for step in range(max_steps):
            t = step * dt
            current_altitude = np.linalg.norm(pos) - self.R_earth
            
            # Crash condition
            if current_altitude < -10.0:
                status = "failed"
                failure_reason = f"Structural impact detected on Earth surface at t={t}s. Velocity: {np.linalg.norm(vel):.2f} m/s."
                break
                
            # Compute current mass based on engine consumption
            current_fuel_mass = mass - dry_mass
            is_burning = t < burn_time and current_fuel_mass > 0
            
            # Pitch profile: Basic gravity turn control logic
            # LLM parameter manipulation modifies this pitch vector path
            if is_burning:
                # Gradual pitch over from vertical as altitude increases
                pitch_factor = min(1.0, current_altitude / 50000.0) if current_altitude > 2000 else 0.0
                thrust_dir = np.array([pitch_factor, 1.0 - (pitch_factor * 0.3), 0.0])
                thrust_dir = thrust_dir / np.linalg.norm(thrust_dir)
                thrust_vector = thrust_dir * thrust_mag
                mass -= mdot * dt
            else:
                thrust_vector = np.array([0.0, 0.0, 0.0])

            # RK4 Integration steps for state derivatives
            def derivatives(p, v, m):
                g_acc = self.compute_gravity(p)
                d_force = self.compute_drag(p, v, cd=0.5, area=10.0)
                t_acc = thrust_vector / m
                total_acc = g_acc + (d_force / m) + t_acc
                return v, total_acc

            vk1, ak1 = derivatives(pos, vel, mass)
            vk2, ak2 = derivatives(pos + 0.5*dt*vk1, vel + 0.5*dt*ak1, mass)
            vk3, ak3 = derivatives(pos + 0.5*dt*vk2, vel + 0.5*dt*ak2, mass)
            vk4, ak4 = derivatives(pos + dt*vk3, vel + dt*ak3, mass)

            pos += (dt / 6.0) * (vk1 + 2*vk2 + 2*vk3 + vk4)
            vel += (dt / 6.0) * (ak1 + 2*ak2 + 2*ak3 + ak4)

            # Log frame state for telemetry processing and frontend rendering
            trajectory_log.append({
                "time": t,
                "position": pos.tolist(),
                "velocity": vel.tolist(),
                "altitude": current_altitude,
                "speed": float(np.linalg.norm(vel)),
                "mass": mass
            })

            # Break early if target orbit criteria achieved
            if current_altitude > 200000.0 and float(np.linalg.norm(vel)) > 7800.0:
                status = "success"
                failure_reason = "Stable low earth orbit injection accomplished."
                break
        
        if status == "simulating":
            status = "failed"
            failure_reason = "Apoapsis insufficient. Vehicle fell back or lost power before orbit achieved."

        return {
            "status": status,
            "message": failure_reason,
            "trajectory": trajectory_log
        }
