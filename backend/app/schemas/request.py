from typing import Optional

from pydantic import BaseModel, Field

# ==========================================
# 1. INCOMING REQUEST SCHEMAS (Client -> API)
# ==========================================


class PromptRequest(BaseModel):
    """
    Validates payload sent by the user prompt component.
    """
    prompt: str = Field(
        ..., 
        description="Raw aerospace simulation prompt string (e.g., 'rocket', 'orbital')"
    )
    rtol: Optional[float] = Field(
        default=1e-6, 
        ge=0.0, 
        description="Relative tolerance parameter for the SciPy numerical integrator"
    )
    atol: Optional[float] = Field(
        default=1e-9, 
        ge=0.0, 
        description="Absolute tolerance parameter for the SciPy numerical integrator"
    )


class ConfigRequest(BaseModel):
    prompt: str = Field(..., description="Raw aerospace prompt to translate into a simulation config")
