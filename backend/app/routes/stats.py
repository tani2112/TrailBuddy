from fastapi import APIRouter, Depends
import aiosqlite
from ..database import get_db
from ..schemas import UserStatsResponse

router = APIRouter(prefix="/stats", tags=["User Stats"])

@router.get("", response_model=UserStatsResponse)
async def get_user_stats(db: aiosqlite.Connection = Depends(get_db)):
    """Calculate exploration points, completed missions, journal counts, and badges."""
    # 1. Total missions
    cursor = await db.execute("SELECT COUNT(*) FROM missions;")
    total_missions = (await cursor.fetchone())[0]

    # 2. Completed missions & points
    cursor = await db.execute("""
        SELECT 
            COUNT(DISTINCT mission_id) as completed_count,
            COALESCE(SUM(points_awarded), 0) as total_pts,
            COALESCE(SUM(duration_spent_seconds), 0) as total_seconds
        FROM mission_progress
        WHERE status = 'completed';
    """)
    prog_row = await cursor.fetchone()
    completed_count = prog_row["completed_count"] or 0
    total_points = prog_row["total_pts"] or 0
    total_seconds = prog_row["total_seconds"] or 0

    # 3. Journal entries count
    cursor = await db.execute("SELECT COUNT(*) FROM journal_entries;")
    journal_count = (await cursor.fetchone())[0]

    # 4. Badges earned
    cursor = await db.execute("""
        SELECT DISTINCT m.badge_reward
        FROM missions m
        INNER JOIN mission_progress mp ON m.id = mp.mission_id
        WHERE mp.status = 'completed';
    """)
    badge_rows = await cursor.fetchall()
    badges = [r[0] for r in badge_rows if r[0]]

    # 5. Outdoor minutes logged
    outdoor_minutes = max(total_seconds // 60, completed_count * 5)

    # 6. Simple streak calculation
    cursor = await db.execute("""
        SELECT DISTINCT SUBSTR(completed_at, 1, 10) as day
        FROM mission_progress
        WHERE status = 'completed'
        ORDER BY day DESC
        LIMIT 7;
    """)
    day_rows = await cursor.fetchall()
    streak_days = len(day_rows) if day_rows else (1 if completed_count > 0 or journal_count > 0 else 0)

    return UserStatsResponse(
        total_points=total_points,
        completed_missions_count=completed_count,
        total_missions_count=total_missions,
        journal_entries_count=journal_count,
        outdoor_minutes_logged=outdoor_minutes,
        badges_earned=badges,
        streak_days=streak_days
    )
