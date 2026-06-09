# backend/app/main.py
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# To start uvicorn - uvicorn backend.app.main:app --reload

from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator, Dict, List
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
# Import our new multi-pass self-correction entry point loop
from app.agents.orchestrator import run_automated_sandbox_loop, map_prompt_to_scipy_tracking
from app.physics.aerospace import MODEL_TYPES
from app.schemas.request import ConfigRequest, PromptRequest
from app.schemas.simulation import ConfigResponse, SimulationResponse

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    app.state.settings = settings
    yield

app = FastAPI(
    title=settings.app_name,
    description="4D Neuro-Symbolic Sandbox Gateway. Uses an LLM code loop validated by a deterministic SciPy execution layer.",
    version="1.0.0",
    lifespan=lifespan,
)

BASE_DIR = Path(__file__).resolve().parents[2]
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check() -> Dict[str, str]:
    return {
        "status": "ok",
        "service": "physical-sandbox-backend",
        "environment": settings.environment,
    }

@app.post("/api/config", response_model=ConfigResponse)
def build_simulation_config(request: ConfigRequest) -> ConfigResponse:
    try:
        config = map_prompt_to_scipy_tracking(request.prompt)
        return ConfigResponse(
            model_type=config.model_type,
            prompt=config.prompt,
            state_labels=config.state_labels,
            initial_state=config.initial_state.tolist(),
            time_span=config.time_span,
            time_steps=config.time_steps.tolist(),
            parameters=config.parameters,
            blueprint=config.visual_blueprint,
            control_inputs={name: values.tolist() for name, values in config.control_inputs.items()},
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"Invalid prompt for configuration: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during configuration: {e}")

@app.post("/api/simulate", response_model=SimulationResponse)
def simulate_prompt(request: PromptRequest) -> SimulationResponse:
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
    
    try:
        # 1. Trigger our multi-turn autonomous self-correction loop engine
        # Pass request.max_retries if available in your schema, else default to 3
        max_retries = getattr(request, 'max_retries', 3)
        result = run_automated_sandbox_loop(request.prompt, max_retries=max_retries)
        
        # 2. Check if the simulation timed out completely without matching physics parameters
        if not result["success"] and result["telemetry"] is None:
            return SimulationResponse(
                success=False,
                physics_passed=False,
                message=result["logs"],
                model_type=result["model_type"],
                labels=[],
                t=[],
                y=[],
                parameters=result.get("parameters", {}),
                blueprint=result.get("visual_blueprint"),
                prompt=request.prompt
            )
            
        telemetry = result["telemetry"]
        state_matrices = np.array(telemetry["state_matrices"])
        
        # 3. Normalize state vectors into a 3D render frame for the frontend canvas
        raw_frames = state_matrices.T.tolist() if state_matrices.ndim == 2 else state_matrices.tolist()
        formatted_y = [
            (frame[:3] + [0.0] * max(0, 3 - len(frame))) if len(frame) < 3 else frame[:3]
            for frame in raw_frames
        ]

        return SimulationResponse(
            success=result["success"],
            physics_passed=True,
            message=result["logs"],
            model_type=result["model_type"],
            labels=telemetry["labels"],
            t=telemetry["timeline"],
            y=formatted_y,
            parameters=telemetry.get("parameters", {}),
            blueprint=telemetry.get("visual_blueprint"),
            prompt=request.prompt,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"Simulation input validation failure: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred inside the sandbox pipeline: {e}")

@app.get("/api/root_route")
async def api_root_route() -> Dict[str, object]:
    return {
        "status": "online",
        "project": "4D AI Physics Sandbox Core",
        "environment": settings.environment,
        "supported_models": MODEL_TYPES,
    }

# Mount frontend static files safely
if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")
        
    texture_dir = FRONTEND_DIST / "texture"
    if texture_dir.exists():
        app.mount("/texture", StaticFiles(directory=str(texture_dir)), name="texture")

    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")

def start():
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, log_level=settings.log_level)
