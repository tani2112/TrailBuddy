import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
import aiosqlite
from ..database import get_db
from ..schemas import (
    MissionItem,
    StartMissionRequest,
    CompleteMissionRequest,
    MissionProgressResponse,
)

router = APIRouter(prefix="/missions", tags=["Touch Grass Missions"])

@router.get("", response_model=List[MissionItem])
async def list_missions(
    category: Optional[str] = Query(None, description="Filter by category (Botany, Wildlife, Sensory, Mindfulness, Earth)"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty (Beginner, Intermediate, Explorer)"),
    status_filter: Optional[str] = Query(None, description="Filter by status (all, completed, available, in_progress)"),
    db: aiosqlite.Connection = Depends(get_db)
):
    """
    Retrieve all missions with current user completion and in-progress status.
    """
    query = """
        SELECT 
            m.id, m.title, m.category, m.description, m.duration_minutes,
            m.difficulty, m.points, m.mindfulness_prompt, m.instructions,
            m.icon_name, m.badge_reward,
            mp.status as progress_status,
            mp.completed_at,
            mp.user_reflection
        FROM missions m
        LEFT JOIN (
            SELECT mission_id, status, completed_at, user_reflection
            FROM mission_progress
            WHERE id IN (
                SELECT id FROM mission_progress ORDER BY started_at DESC
            )
        ) mp ON m.id = mp.mission_id
        WHERE 1=1
    """
    params = []

    if category and category.lower() != "all":
        query += " AND LOWER(m.category) = LOWER(?)"
        params.append(category)

    if difficulty and difficulty.lower() != "all":
        query += " AND LOWER(m.difficulty) = LOWER(?)"
        params.append(difficulty)

    query += " ORDER BY m.id ASC"

    cursor = await db.execute(query, params)
    rows = await cursor.fetchall()

    results: List[MissionItem] = []
    for row in rows:
        instructions_list = []
        try:
            instructions_list = json.loads(row["instructions"])
        except Exception:
            instructions_list = [row["instructions"]]

        is_completed = (row["progress_status"] == "completed")
        in_progress = (row["progress_status"] == "in_progress")

        if status_filter == "completed" and not is_completed:
            continue
        if status_filter == "in_progress" and not in_progress:
            continue
        if status_filter == "available" and is_completed:
            continue

        results.append(MissionItem(
            id=row["id"],
            title=row["title"],
            category=row["category"],
            description=row["description"],
            duration_minutes=row["duration_minutes"],
            difficulty=row["difficulty"],
            points=row["points"],
            mindfulness_prompt=row["mindfulness_prompt"],
            instructions=instructions_list,
            icon_name=row["icon_name"],
            badge_reward=row["badge_reward"],
            is_completed=is_completed,
            in_progress=in_progress,
            completed_at=row["completed_at"],
            last_reflection=row["user_reflection"]
        ))

    return results

@router.get("/today", response_model=MissionItem)
async def get_todays_featured_mission(db: aiosqlite.Connection = Depends(get_db)):
    """
    Select today's outdoor challenge. Rotates daily and prioritizes uncompleted missions.
    """
    all_missions = await list_missions(category=None, difficulty=None, status_filter=None, db=db)
    if not all_missions:
        raise HTTPException(status_code=404, detail="No missions found.")

    # Prioritize available (not yet completed) missions
    available = [m for m in all_missions if not m.is_completed]
    pool = available if available else all_missions

    # Use day-of-year to deterministically pick a daily mission
    day_of_year = datetime.now(timezone.utc).timetuple().tm_yday
    selected_mission = pool[day_of_year % len(pool)]
    return selected_mission

@router.get("/{mission_id}", response_model=MissionItem)
async def get_mission_detail(mission_id: str, db: aiosqlite.Connection = Depends(get_db)):
    """Fetch details of a single mission by ID."""
    cursor = await db.execute("""
        SELECT 
            m.id, m.title, m.category, m.description, m.duration_minutes,
            m.difficulty, m.points, m.mindfulness_prompt, m.instructions,
            m.icon_name, m.badge_reward,
            mp.status as progress_status,
            mp.completed_at,
            mp.user_reflection
        FROM missions m
        LEFT JOIN (
            SELECT mission_id, status, completed_at, user_reflection
            FROM mission_progress
            WHERE mission_id = ?
            ORDER BY started_at DESC LIMIT 1
        ) mp ON m.id = mp.mission_id
        WHERE m.id = ?
    """, (mission_id, mission_id))
    row = await cursor.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Mission not found.")

    try:
        instructions = json.loads(row["instructions"])
    except Exception:
        instructions = [row["instructions"]]

    return MissionItem(
        id=row["id"],
        title=row["title"],
        category=row["category"],
        description=row["description"],
        duration_minutes=row["duration_minutes"],
        difficulty=row["difficulty"],
        points=row["points"],
        mindfulness_prompt=row["mindfulness_prompt"],
        instructions=instructions,
        icon_name=row["icon_name"],
        badge_reward=row["badge_reward"],
        is_completed=(row["progress_status"] == "completed"),
        in_progress=(row["progress_status"] == "in_progress"),
        completed_at=row["completed_at"],
        last_reflection=row["user_reflection"]
    )

@router.post("/{mission_id}/start")
async def start_mission(mission_id: str, db: aiosqlite.Connection = Depends(get_db)):
    """Mark a mission as currently active / in progress."""
    # Check if mission exists
    cursor = await db.execute("SELECT id FROM missions WHERE id = ?", (mission_id,))
    if not await cursor.fetchone():
        raise HTTPException(status_code=404, detail="Mission not found.")

    progress_id = f"prog-{uuid.uuid4().hex[:10]}"
    now_iso = datetime.now(timezone.utc).isoformat()

    # Cancel any other currently in-progress missions so only one is active at a time
    await db.execute("""
        UPDATE mission_progress
        SET status = 'abandoned'
        WHERE status = 'in_progress'
    """)

    await db.execute("""
        INSERT INTO mission_progress (
            id, mission_id, status, started_at, duration_spent_seconds, points_awarded
        ) VALUES (?, ?, 'in_progress', ?, 0, 0)
    """, (progress_id, mission_id, now_iso))
    await db.commit()

    return {"message": "Mission started", "progress_id": progress_id, "started_at": now_iso}

@router.post("/{mission_id}/complete", response_model=MissionProgressResponse)
async def complete_mission(
    mission_id: str,
    payload: CompleteMissionRequest,
    db: aiosqlite.Connection = Depends(get_db)
):
    """
    Complete an active outdoor challenge, save observations, and award exploration points.
    """
    cursor = await db.execute("SELECT id, points, title FROM missions WHERE id = ?", (mission_id,))
    mission_row = await cursor.fetchone()
    if not mission_row:
        raise HTTPException(status_code=404, detail="Mission not found.")

    now_iso = datetime.now(timezone.utc).isoformat()
    points = mission_row["points"]

    # Check for existing in-progress entry
    cursor = await db.execute("""
        SELECT id, started_at FROM mission_progress
        WHERE mission_id = ? AND status = 'in_progress'
        ORDER BY started_at DESC LIMIT 1
    """, (mission_id,))
    in_prog = await cursor.fetchone()

    if in_prog:
        progress_id = in_prog["id"]
        started_at = in_prog["started_at"]
        await db.execute("""
            UPDATE mission_progress
            SET status = 'completed',
                completed_at = ?,
                duration_spent_seconds = ?,
                user_reflection = ?,
                points_awarded = ?
            WHERE id = ?
        """, (now_iso, payload.duration_spent_seconds, payload.user_reflection or "", points, progress_id))
    else:
        # User directly completed it
        progress_id = f"prog-{uuid.uuid4().hex[:10]}"
        started_at = now_iso
        await db.execute("""
            INSERT INTO mission_progress (
                id, mission_id, status, started_at, completed_at,
                duration_spent_seconds, user_reflection, points_awarded
            ) VALUES (?, ?, 'completed', ?, ?, ?, ?, ?)
        """, (
            progress_id,
            mission_id,
            started_at,
            now_iso,
            payload.duration_spent_seconds,
            payload.user_reflection or "",
            points
        ))

    await db.commit()

    return MissionProgressResponse(
        id=progress_id,
        mission_id=mission_id,
        status="completed",
        started_at=started_at,
        completed_at=now_iso,
        duration_spent_seconds=payload.duration_spent_seconds,
        user_reflection=payload.user_reflection or "",
        points_awarded=points
    )

@router.post("/{mission_id}/cancel")
async def cancel_mission(mission_id: str, db: aiosqlite.Connection = Depends(get_db)):
    """Cancel / reset an in-progress mission."""
    await db.execute("""
        UPDATE mission_progress
        SET status = 'abandoned'
        WHERE mission_id = ? AND status = 'in_progress'
    """, (mission_id,))
    await db.commit()
    return {"message": "Mission cancelled"}

@router.get("/history/log", response_model=List[MissionProgressResponse])
async def get_mission_history(db: aiosqlite.Connection = Depends(get_db)):
    """Return all completed missions in reverse chronological order."""
    cursor = await db.execute("""
        SELECT id, mission_id, status, started_at, completed_at, duration_spent_seconds, user_reflection, points_awarded
        FROM mission_progress
        WHERE status = 'completed'
        ORDER BY completed_at DESC
    """)
    rows = await cursor.fetchall()
    return [
        MissionProgressResponse(
            id=r["id"],
            mission_id=r["mission_id"],
            status=r["status"],
            started_at=r["started_at"],
            completed_at=r["completed_at"],
            duration_spent_seconds=r["duration_spent_seconds"],
            user_reflection=r["user_reflection"],
            points_awarded=r["points_awarded"]
        )
        for r in rows
    ]
