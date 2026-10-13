from typing import Optional, Dict
from pydantic import BaseModel, Field

class ExecutionRequestModel(BaseModel):
    requestId: str = Field(..., description="Unique client-generated execution request identifier")
    projectId: Optional[str] = Field(None, description="Project identifier")
    language: str = Field(..., description="Programming language (e.g. c, cpp, python_server)")
    activeFile: str = Field(..., description="Entrypoint filename")
    source: str = Field(..., description="Source code content")
    files: Optional[Dict[str, str]] = Field(default_factory=dict, description="Associated project files")
    timeoutSeconds: Optional[int] = Field(10, ge=1, le=25, description="Maximum execution timeout in seconds")

class ExecutionResponseModel(BaseModel):
    requestId: str
    status: str
    stdout: str = ""
    stderr: str = ""
    exitCode: Optional[int] = None
    durationMs: int = 0
    errorCategory: Optional[str] = None
    errorMessage: Optional[str] = None
    compilerOutput: Optional[str] = None
