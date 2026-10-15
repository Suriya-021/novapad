from fastapi import APIRouter, HTTPException
from app.api.schemas.execution import ExecutionRequestModel, ExecutionResponseModel
from app.execution.workers.isolated_runner import run_isolated_task
from app.core.config import settings

router = APIRouter()

@router.post("/execute", response_model=ExecutionResponseModel)
def execute_code(request: ExecutionRequestModel):
    # Security Validation
    if len(request.source.encode("utf-8")) > settings.MAX_SOURCE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"Source code payload exceeds maximum allowable size of {settings.MAX_SOURCE_BYTES} bytes."
        )

    timeout = min(request.timeoutSeconds or settings.DEFAULT_TIMEOUT_SECONDS, settings.MAX_TIMEOUT_SECONDS)

    result_dict = run_isolated_task(
        language=request.language,
        active_file=request.activeFile,
        source=request.source,
        files=request.files or {},
        timeout_sec=timeout,
        stdin=request.stdin or "",
    )

    return ExecutionResponseModel(
        requestId=request.requestId,
        status=result_dict.get("status", "error"),
        stdout=result_dict.get("stdout", ""),
        stderr=result_dict.get("stderr", ""),
        exitCode=result_dict.get("exitCode"),
        durationMs=result_dict.get("durationMs", 0),
        errorCategory=result_dict.get("errorCategory"),
        errorMessage=result_dict.get("errorMessage"),
        compilerOutput=result_dict.get("compilerOutput"),
    )
