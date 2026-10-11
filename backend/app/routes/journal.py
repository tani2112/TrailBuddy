import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
import aiosqlite
from ..database import get_db
from ..schemas import (
    JournalEntryCreate,
    JournalEntryUpdate,
    JournalEntryResponse,
)

router = APIRouter(prefix="/journal", tags=["Nature Journal"])

def format_entry_row(row) -> JournalEntryResponse:
    tags = []
    try:
        tags = json.loads(row["tags"]) if row["tags"] else []
    except Exception:
        tags = []

    return JournalEntryResponse(
        id=row["id"],
        title=row["title"],
        notes=row["notes"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
        location_name=row["location_name"] or "",
        weather=row["weather"] or "Pleasant",
        category=row["category"] or "General",
        tags=tags,
        linked_mission_id=row["linked_mission_id"],
        sensory_observation=row["sensory_observation"] or ""
    )

@router.get("", response_model=List[JournalEntryResponse])
async def list_journal_entries(
    q: Optional[str] = Query(None, description="Search keyword in title, notes, or location"),
    category: Optional[str] = Query(None, description="Filter by category (Bird, Plant, Insect, etc.)"),
    tag: Optional[str] = Query(None, description="Filter by specific tag"),
    db: aiosqlite.Connection = Depends(get_db)
):
    """List all nature journal entries with optional search and category filters."""
    query = """
        SELECT id, title, notes, created_at, updated_at, location_name,
               weather, category, tags, linked_mission_id, sensory_observation
        FROM journal_entries
        WHERE 1=1
    """
    params = []

    if q:
        query += " AND (title LIKE ? OR notes LIKE ? OR location_name LIKE ? OR sensory_observation LIKE ?)"
        wildcard = f"%{q}%"
        params.extend([wildcard, wildcard, wildcard, wildcard])

    if category and category.lower() != "all":
        query += " AND LOWER(category) = LOWER(?)"
        params.append(category)

    if tag:
        query += " AND tags LIKE ?"
        params.append(f"%{tag}%")

    query += " ORDER BY created_at DESC"

    cursor = await db.execute(query, params)
    rows = await cursor.fetchall()

    return [format_entry_row(r) for r in rows]

@router.post("", response_model=JournalEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_journal_entry(
    payload: JournalEntryCreate,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Create a new outdoor observation journal entry."""
    entry_id = f"entry-{uuid.uuid4().hex[:10]}"
    now_iso = datetime.now(timezone.utc).isoformat()
    tags_json = json.dumps(payload.tags or [])

    await db.execute("""
        INSERT INTO journal_entries (
            id, title, notes, created_at, updated_at, location_name,
            weather, category, tags, linked_mission_id, sensory_observation
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        entry_id,
        payload.title,
        payload.notes,
        now_iso,
        now_iso,
        payload.location_name or "",
        payload.weather or "Pleasant",
        payload.category or "General",
        tags_json,
        payload.linked_mission_id,
        payload.sensory_observation or ""
    ))
    await db.commit()

    cursor = await db.execute("SELECT * FROM journal_entries WHERE id = ?", (entry_id,))
    row = await cursor.fetchone()
    return format_entry_row(row)

@router.get("/{entry_id}", response_model=JournalEntryResponse)
async def get_journal_entry(entry_id: str, db: aiosqlite.Connection = Depends(get_db)):
    """Retrieve a single journal entry."""
    cursor = await db.execute("SELECT * FROM journal_entries WHERE id = ?", (entry_id,))
    row = await cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Journal entry not found.")
    return format_entry_row(row)

@router.put("/{entry_id}", response_model=JournalEntryResponse)
async def update_journal_entry(
    entry_id: str,
    payload: JournalEntryUpdate,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Update an existing journal entry."""
    cursor = await db.execute("SELECT * FROM journal_entries WHERE id = ?", (entry_id,))
    existing = await cursor.fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="Journal entry not found.")

    now_iso = datetime.now(timezone.utc).isoformat()

    title = payload.title if payload.title is not None else existing["title"]
    notes = payload.notes if payload.notes is not None else existing["notes"]
    location_name = payload.location_name if payload.location_name is not None else existing["location_name"]
    weather = payload.weather if payload.weather is not None else existing["weather"]
    category = payload.category if payload.category is not None else existing["category"]
    tags = json.dumps(payload.tags) if payload.tags is not None else existing["tags"]
    linked_mission_id = payload.linked_mission_id if payload.linked_mission_id is not None else existing["linked_mission_id"]
    sensory_observation = payload.sensory_observation if payload.sensory_observation is not None else existing["sensory_observation"]

    await db.execute("""
        UPDATE journal_entries
        SET title = ?, notes = ?, updated_at = ?, location_name = ?,
            weather = ?, category = ?, tags = ?, linked_mission_id = ?,
            sensory_observation = ?
        WHERE id = ?
    """, (
        title, notes, now_iso, location_name,
        weather, category, tags, linked_mission_id,
        sensory_observation, entry_id
    ))
    await db.commit()

    cursor = await db.execute("SELECT * FROM journal_entries WHERE id = ?", (entry_id,))
    row = await cursor.fetchone()
    return format_entry_row(row)

@router.delete("/{entry_id}")
async def delete_journal_entry(entry_id: str, db: aiosqlite.Connection = Depends(get_db)):
    """Delete a journal entry."""
    cursor = await db.execute("SELECT id FROM journal_entries WHERE id = ?", (entry_id,))
    if not await cursor.fetchone():
        raise HTTPException(status_code=404, detail="Journal entry not found.")

    await db.execute("DELETE FROM journal_entries WHERE id = ?", (entry_id,))
    await db.commit()
    return {"message": "Journal entry successfully deleted", "id": entry_id}
