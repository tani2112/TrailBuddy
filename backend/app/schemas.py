from typing import List, Optional
from pydantic import BaseModel, Field

# --- AI & Chat Schemas ---
class ChatMessage(BaseModel):
    role: str = Field(..., description="Role: 'user', 'assistant', or 'system'")
    content: str = Field(..., description="Message text")

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., description="Chat message history")
    model: Optional[str] = Field(None, description="Optional override for Ollama model")

class ChatResponse(BaseModel):
    response: str
    model_used: str
    disclaimer: str
    follow_up_tips: List[str] = []

class OllamaStatusResponse(BaseModel):
    connected: bool
    base_url: str
    model_configured: str
    model_installed: bool
    available_models: List[str]
    status_message: str

# --- Mission Schemas ---
class MissionBase(BaseModel):
    id: str
    title: str
    category: str
    description: str
    duration_minutes: int
    difficulty: str
    points: int
    mindfulness_prompt: str
    instructions: List[str]
    icon_name: str
    badge_reward: str

class MissionItem(MissionBase):
    is_completed: bool = False
    in_progress: bool = False
    completed_at: Optional[str] = None
    last_reflection: Optional[str] = None

class StartMissionRequest(BaseModel):
    mission_id: str

class CompleteMissionRequest(BaseModel):
    duration_spent_seconds: int = Field(default=0, ge=0)
    user_reflection: Optional[str] = Field(default="", description="Optional thoughts or observations")

class MissionProgressResponse(BaseModel):
    id: str
    mission_id: str
    status: str
    started_at: str
    completed_at: Optional[str] = None
    duration_spent_seconds: int
    user_reflection: str
    points_awarded: int

# --- Journal Schemas ---
class JournalEntryCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    notes: str = Field(..., min_length=1)
    location_name: Optional[str] = Field(default="", description="User-entered general location (no GPS required)")
    weather: Optional[str] = Field(default="Pleasant")
    category: Optional[str] = Field(default="General")
    tags: Optional[List[str]] = Field(default_factory=list)
    linked_mission_id: Optional[str] = None
    sensory_observation: Optional[str] = Field(default="", description="Sensory notes (sounds, smells, textures)")

class JournalEntryUpdate(BaseModel):
    title: Optional[str] = None
    notes: Optional[str] = None
    location_name: Optional[str] = None
    weather: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    linked_mission_id: Optional[str] = None
    sensory_observation: Optional[str] = None

class JournalEntryResponse(BaseModel):
    id: str
    title: str
    notes: str
    created_at: str
    updated_at: str
    location_name: str
    weather: str
    category: str
    tags: List[str]
    linked_mission_id: Optional[str] = None
    sensory_observation: str

# --- Stats Schema ---
class UserStatsResponse(BaseModel):
    total_points: int
    completed_missions_count: int
    total_missions_count: int
    journal_entries_count: int
    outdoor_minutes_logged: int
    badges_earned: List[str]
    streak_days: int

# --- Health Schema ---
class HealthCheckResponse(BaseModel):
    status: str
    database_healthy: bool
    ollama_connected: bool
    ollama_url: str
    current_model: str
    available_models: List[str]
    message: str
