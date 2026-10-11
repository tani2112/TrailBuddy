import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routes.health import router as health_router
from app.routes.ai import router as ai_router
from app.routes.missions import router as missions_router
from app.routes.journal import router as journal_router
from app.routes.stats import router as stats_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("trailbuddy")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle event handler for DB initialization and startup tasks."""
    logger.info("Initializing TrailBuddy SQLite database...")
    await init_db()
    logger.info("TrailBuddy backend initialized successfully.")
    yield
    logger.info("TrailBuddy backend shutting down.")

app = FastAPI(
    title="TrailBuddy API — Your AI Nature Companion",
    description="Backend API powering outdoor exploration, Touch Grass challenges, local Ollama AI guide, and private nature journaling.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite dev server and production frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes with /api prefix
app.include_router(health_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(missions_router, prefix="/api")
app.include_router(journal_router, prefix="/api")
app.include_router(stats_router, prefix="/api")

@app.get("/api")
async def api_root():
    return {
        "app": "TrailBuddy — Your AI Nature Companion",
        "description": "Encouraging more time in nature, less screen time.",
        "status": "online",
        "docs_url": "/docs",
        "ollama_model": settings.OLLAMA_MODEL,
        "ollama_url": settings.OLLAMA_BASE_URL
    }

# Mount frontend production build if present (for single-service deployment on Render)
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow /docs and /openapi.json to reach FastAPI
        if full_path in ["docs", "openapi.json", "redoc"]:
            return None
        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/")
    async def root():
        return {
            "app": "TrailBuddy — Your AI Nature Companion",
            "description": "Encouraging more time in nature, less screen time.",
            "status": "online",
            "docs_url": "/docs",
            "ollama_model": settings.OLLAMA_MODEL,
            "ollama_url": settings.OLLAMA_BASE_URL
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
