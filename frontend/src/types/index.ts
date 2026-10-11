export type MissionDifficulty = 'Beginner' | 'Intermediate' | 'Explorer';

export type MissionCategory = 'Wildlife' | 'Botany' | 'Sensory' | 'Mindfulness' | 'Earth';

export interface Mission {
  id: string;
  title: string;
  category: string;
  description: string;
  duration_minutes: number;
  difficulty: MissionDifficulty;
  points: number;
  mindfulness_prompt: string;
  instructions: string[];
  icon_name: string;
  badge_reward: string;
  is_completed: boolean;
  in_progress: boolean;
  completed_at?: string | null;
  last_reflection?: string | null;
}

export interface JournalEntry {
  id: string;
  title: string;
  notes: string;
  created_at: string;
  updated_at: string;
  location_name: string;
  weather: string;
  category: string;
  tags: string[];
  linked_mission_id?: string | null;
  sensory_observation: string;
}

export interface UserStats {
  total_points: number;
  completed_missions_count: number;
  total_missions_count: number;
  journal_entries_count: number;
  outdoor_minutes_logged: number;
  badges_earned: string[];
  streak_days: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  disclaimer?: string;
  follow_up_tips?: string[];
  isError?: boolean;
}

export interface OllamaStatus {
  connected: boolean;
  base_url: string;
  model_configured: string;
  model_installed: boolean;
  available_models: string[];
  status_message: string;
}

export interface SystemHealth {
  status: string;
  database_healthy: boolean;
  ollama_connected: boolean;
  ollama_url: string;
  current_model: string;
  available_models: string[];
  message: string;
}
