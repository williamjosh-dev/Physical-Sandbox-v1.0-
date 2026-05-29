from typing import Dict, List, Tuple

from pydantic import BaseModel, Field


# ==========================================
# 2. OUTGOING RESPONSE SCHEMAS (API -> Client)
# ==========================================


class SimulationResponse(BaseModel):
    """
    Enforces structure on computed 4D data sent out to the Three.js viewport canvas.
    """
    success: bool = Field(..., description="True if the numerical solver executed successfully")
    physics_passed: bool = Field(..., description="True if the vehicle stayed within safe limits")
    message: str = Field(..., description="Status breakdown message detailing flight success or crash events")
    model_type: str = Field(..., description="The calculated category mode: 'rocket', 'orbital', etc.")
    labels: List[str] = Field(..., description="The context labels for each column axis index in the y matrix")
    t: List[float] = Field(..., description="The 4th dimension: full array timeline steps")
    y: List[List[float]] = Field(..., description="The multi-dimensional coordinate trajectory states per step")
    parameters: Dict[str, float] = Field(..., description="The engineering configuration constants generated")
    prompt: str = Field(..., description="Echoes back the starting user parameter string")


class ConfigResponse(BaseModel):
    """
    Validates raw config parameters when reviewing state data prior to trajectory steps.
    """
    model_type: str
    prompt: str
    state_labels: List[str]
    initial_state: List[float]
    time_span: Tuple[float, float]
    time_steps: List[float]
    parameters: Dict[str, float]
    control_inputs: Dict[str, List[float]]
