from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import List, Union

from dotenv import load_dotenv
from pydantic import BaseModel, Field, validator


ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)


class Settings(BaseModel):
    app_name: str = Field("Physical Sandbox Backend")
    environment: str = Field("development")
    debug: bool = Field(False)
    host: str = Field("0.0.0.0")
    port: int = Field(8000)
    log_level: str = Field("info")
    cors_origins: List[str] = Field(default_factory=lambda: ["*"])
    # WARNING: For production, replace ["*"] with a list of specific allowed origins
    # e.g., ["https://your-frontend-domain.com"]
    enable_docs: bool = Field(True)
    default_solver_rtol: float = Field(1e-6)
    default_solver_atol: float = Field(1e-9)

    @validator("cors_origins", pre=True)
    def normalize_cors_origins(cls, value: Union[str, List[str]]) -> List[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            app_name=os.getenv("APP_NAME", "Physical Sandbox Backend"),
            environment=os.getenv("ENVIRONMENT", "development"),
            debug=os.getenv("DEBUG", "false").lower() in ("1", "true", "yes"),
            host=os.getenv("APP_HOST", "0.0.0.0"),
            port=int(os.getenv("APP_PORT", 8000)),
            log_level=os.getenv("LOG_LEVEL", "info"),
            cors_origins=os.getenv("CORS_ORIGINS", "*") or "*",
            enable_docs=os.getenv("ENABLE_DOCS", "true").lower() in ("1", "true", "yes"),
            default_solver_rtol=float(os.getenv("DEFAULT_SOLVER_RTOL", 1e-6)),
            default_solver_atol=float(os.getenv("DEFAULT_SOLVER_ATOL", 1e-9)),
        )


@lru_cache()
def get_settings() -> Settings:
    return Settings.from_env()
