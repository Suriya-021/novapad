from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health, execute, curriculum

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Isolated backend execution service for the browser-first IDE",
)

# CORS Middleware for local frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(execute.router, prefix=settings.API_V1_STR, tags=["Execution"])
app.include_router(curriculum.router, prefix=settings.API_V1_STR, tags=["Curriculum"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
