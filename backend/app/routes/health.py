from fastapi import APIRouter, Depends
import aiosqlite
from ..database import get_db
from ..services.ollama_service import ollama_service
from ..schemas import HealthCheckResponse
from ..config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", response_model=HealthCheckResponse)
async def check_health(db: aiosqlite.Connection = Depends(get_db)):
    """Check overall system health, SQLite connection, and Ollama connectivity."""
    db_healthy = False
    try:
        cursor = await db.execute("SELECT 1;")
        res = await cursor.fetchone()
        db_healthy = bool(res and res[0] == 1)
    except Exception:
        db_healthy = False

    ollama_info = await ollama_service.get_status()

    return HealthCheckResponse(
        status="ok" if db_healthy else "degraded",
        database_healthy=db_healthy,
        ollama_connected=ollama_info["connected"],
        ollama_url=ollama_info["base_url"],
        current_model=settings.OLLAMA_MODEL,
        available_models=ollama_info["available_models"],
        message=(
            "TrailBuddy backend is healthy."
            if ollama_info["connected"]
            else "TrailBuddy is running, but Ollama local AI is offline or unreachable."
        )
    )
