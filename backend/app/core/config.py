import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "NovaPad Execution Service"
    API_V1_STR: str = "/api/v1"
    DEFAULT_TIMEOUT_SECONDS: int = 10
    MAX_TIMEOUT_SECONDS: int = 25
    MAX_OUTPUT_BYTES: int = 256 * 1024  # 256 KB
    MAX_SOURCE_BYTES: int = 512 * 1024  # 512 KB
    ALLOWED_ORIGINS: list[str] = ["*"]

settings = Settings()
