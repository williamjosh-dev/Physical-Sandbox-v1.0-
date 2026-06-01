import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# to start uvicorn - uvicorn backend.app.main:app --reload

from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator, Dict, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.agents.evaluator import evaluate_prompt
from app.agents.orchestrator import map_prompt_to_scipy_tracking
from app.physics.aerospace import MODEL_TYPES
from app.schemas.request import ConfigRequest, PromptRequest
from app.schemas.simulation import ConfigResponse, SimulationResponse


settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup logic
    app.state.settings = settings
    yield
    # Shutdown logic (if any) can go here

app = FastAPI(
    title=settings.app_name,
    description="FastAPI gateway for aerospace prompt mapping and SciPy simulation execution.",
    version="0.1.0",
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
            control_inputs={name: values.tolist() for name, values in config.control_inputs.items()},
        )
    except ValueError as e:
        # Catch specific errors from map_prompt_to_scipy_tracking if it raises them
        raise HTTPException(status_code=422, detail=f"Invalid prompt for configuration: {e}")
    except Exception as e:
        # Catch any other unexpected errors during configuration building
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during configuration: {e}")


@app.post("/api/simulate", response_model=SimulationResponse)
def simulate_prompt(request: PromptRequest) -> SimulationResponse:
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
    
    try:
        result = evaluate_prompt(request.prompt, rtol=request.rtol, atol=request.atol)
        return SimulationResponse(
            success=result.success,
            physics_passed=result.physics_passed,
            message=result.message,
            model_type=result.model_type,
            labels=result.config.state_labels,
            t=result.t.tolist(),
            y=result.y.T.tolist() if result.y.ndim == 2 else result.y.tolist(),
            parameters=result.config.parameters,
            prompt=result.config.prompt,
        )
    except ValueError as e:
        # Catch specific errors from evaluate_prompt if it raises them (e.g., invalid parameters)
        raise HTTPException(status_code=422, detail=f"Simulation input error: {e}")
    except Exception as e:
        # Catch any other unexpected errors during simulation execution
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during simulation: {e}")


@app.get("/api/root_route")
async def api_root_route() -> Dict[str, object]:
    return {
        "status": "online",
        "project": "4D AI Physics Sandbox Core",
        "environment": settings.environment,
        "supported_models": MODEL_TYPES,
    }


# Mount frontend static files last so they don't override API routes
if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")


def start():
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, log_level=settings.log_level)

