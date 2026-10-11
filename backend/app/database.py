import aiosqlite
import json
import logging
from pathlib import Path
from typing import AsyncGenerator
from .config import settings

logger = logging.getLogger(__name__)

DB_PATH = settings.DATABASE_PATH

async def get_db() -> AsyncGenerator[aiosqlite.Connection, None]:
    """Dependency that yields an async database connection."""
    conn = await aiosqlite.connect(DB_PATH)
    conn.row_factory = aiosqlite.Row
    await conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
    finally:
        await conn.close()

async def init_db():
    """Initializes tables and seeds initial mission data if not present."""
    db_file = Path(DB_PATH)
    db_file.parent.mkdir(parents=True, exist_ok=True)

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("PRAGMA foreign_keys = ON;")

        # Create missions catalog table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS missions (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                duration_minutes INTEGER NOT NULL DEFAULT 5,
                difficulty TEXT NOT NULL DEFAULT 'Beginner',
                points INTEGER NOT NULL DEFAULT 25,
                mindfulness_prompt TEXT NOT NULL,
                instructions TEXT NOT NULL,
                icon_name TEXT NOT NULL DEFAULT 'Compass',
                badge_reward TEXT NOT NULL DEFAULT 'Explorer'
            );
        """)

        # Create mission progress tracking table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS mission_progress (
                id TEXT PRIMARY KEY,
                mission_id TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
                started_at TEXT NOT NULL,
                completed_at TEXT,
                duration_spent_seconds INTEGER DEFAULT 0,
                user_reflection TEXT DEFAULT '',
                points_awarded INTEGER DEFAULT 0,
                FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE
            );
        """)

        # Create journal entries table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS journal_entries (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                notes TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                location_name TEXT DEFAULT '',
                weather TEXT DEFAULT 'Pleasant',
                category TEXT DEFAULT 'General',
                tags TEXT DEFAULT '[]',
                linked_mission_id TEXT,
                sensory_observation TEXT DEFAULT ''
            );
        """)

        await db.commit()

        # Check if missions already seeded
        cursor = await db.execute("SELECT COUNT(*) as count FROM missions;")
        row = await cursor.fetchone()
        mission_count = row[0] if row else 0

        if mission_count == 0:
            logger.info("Seeding initial Touch Grass missions...")
            from .seed_data import SEED_MISSIONS
            for m in SEED_MISSIONS:
                await db.execute("""
                    INSERT INTO missions (
                        id, title, category, description, duration_minutes,
                        difficulty, points, mindfulness_prompt, instructions,
                        icon_name, badge_reward
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    m["id"],
                    m["title"],
                    m["category"],
                    m["description"],
                    m["duration_minutes"],
                    m["difficulty"],
                    m["points"],
                    m["mindfulness_prompt"],
                    json.dumps(m["instructions"]),
                    m["icon_name"],
                    m["badge_reward"]
                ))
            await db.commit()
            logger.info(f"Successfully seeded {len(SEED_MISSIONS)} missions.")
