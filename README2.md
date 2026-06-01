# Physical Sandbox v1.0 - Technical Overview

This project is a **4D Aerospace Simulation Sandbox** that bridges the gap between natural language prompts and rigorous numerical physics. It allows users to describe an aerospace scenario (like an orbit or a rocket launch) and see it visualized in a real-time 3D environment.

## ⚙️ How It Works

### 1. The Intelligence Layer (Backend)
The backend is powered by **FastAPI** and acts as the "Physics Engine as a Service."
- **Prompt Mapping**: When you enter a prompt like `"orbital"` or `"rocket"`, the `orchestrator` and `evaluator` agents map that text to specific Scipy-based tracking configurations.
- **Numerical Integration**: The system calculates the state vectors (position and velocity over time) using high-precision solvers. It doesn't just "animate"—it solves the governing differential equations of motion.
- **Educational Feedback**: Along with the raw data, the backend generates a `TheoryPayload` containing the LaTeX-formatted equations (e.g., $\vec{F} = m\vec{a}$) and concepts relevant to your specific simulation.

### 2. The Visualization Layer (Frontend)
The frontend is a **React** application that transforms mathematical matrices into a 3D experience.
- **Three.js Scene**: Renders a 3D Earth and spacecraft. It utilizes a `BufferGeometry` to draw the entire calculated trajectory as a path in space.
- **Playback Engine**: A custom ticker synchronizes the current "frame" of the simulation with the 4th dimension (time), moving the spacecraft mesh along the computed coordinates.
- **Interactive Controls**: Users can play, pause, or scrub through the timeline of the flight using the `ControlPanel`, while the `Sidebar` displays real-time telemetry and physics theory.

## 🛰️ Project Architecture

```text
[ User Prompt ] -> [ FastAPI Gateway ] -> [ SciPy Solver ] 
                                                 |
                                                 v
[ Three.js Canvas ] <- [ React State ] <- [ JSON Trajectory Data ]
```

## 🛠 Key Endpoints
- `POST /api/config`: Validates the prompt and returns the initial parameters and time steps.
- `POST /api/simulate`: Executes the full numerical simulation and returns the coordinate matrix ($y$) and physics theory.
- `GET /api/root_route`: Lists supported models (e.g., orbital, rocket).

## 🚀 Quick Start
1. **Backend**: `uvicorn backend.app.main:app --reload`
2. **Frontend**: `npm start`

This architecture ensures that while the visualization is fluid and "game-like," the underlying data is scientifically grounded in aerospace dynamics.
