from fastapi import APIRouter
from app.core.config import settings
from app.security.limits import detect_available_compilers

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "compilers": detect_available_compilers(),
    }
