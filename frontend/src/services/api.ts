import {
  Mission,
  JournalEntry,
  UserStats,
  OllamaStatus,
  SystemHealth,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
        ...options,
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { detail: `HTTP ${response.status} error` };
        }
        throw new Error(
          typeof errorData.detail === 'string'
            ? errorData.detail
            : errorData.detail?.message || `Request failed (${response.status})`
        );
      }

      return await response.json();
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        throw new Error(
          'Cannot reach the TrailBuddy backend. Please ensure the FastAPI server is running on http://localhost:8000.'
        );
      }
      throw err;
    }
  }

  // --- Health & AI ---
  async getHealth(): Promise<SystemHealth> {
    return this.request<SystemHealth>('/health');
  }

  async getAiStatus(): Promise<OllamaStatus> {
    return this.request<OllamaStatus>('/ai/status');
  }

  async sendAiChat(
    messages: { role: string; content: string }[],
    model?: string
  ): Promise<{
    response: string;
    model_used: string;
    disclaimer: string;
    follow_up_tips: string[];
  }> {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, model }),
    });
  }

  // --- Missions ---
  async getMissions(category?: string, difficulty?: string, status?: string): Promise<Mission[]> {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (difficulty && difficulty !== 'All') params.append('difficulty', difficulty);
    if (status && status !== 'all') params.append('status_filter', status);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Mission[]>(`/missions${query}`);
  }

  async getTodaysMission(): Promise<Mission> {
    return this.request<Mission>('/missions/today');
  }

  async startMission(missionId: string): Promise<{ message: string; progress_id: string }> {
    return this.request(`/missions/${missionId}/start`, {
      method: 'POST',
    });
  }

  async completeMission(
    missionId: string,
    durationSpentSeconds: number,
    reflection: string
  ): Promise<any> {
    return this.request(`/missions/${missionId}/complete`, {
      method: 'POST',
      body: JSON.stringify({
        duration_spent_seconds: durationSpentSeconds,
        user_reflection: reflection,
      }),
    });
  }

  async cancelMission(missionId: string): Promise<any> {
    return this.request(`/missions/${missionId}/cancel`, {
      method: 'POST',
    });
  }

  // --- Journal ---
  async getJournalEntries(q?: string, category?: string, tag?: string): Promise<JournalEntry[]> {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (category && category !== 'All') params.append('category', category);
    if (tag) params.append('tag', tag);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<JournalEntry[]>(`/journal${query}`);
  }

  async createJournalEntry(entry: {
    title: string;
    notes: string;
    location_name?: string;
    weather?: string;
    category?: string;
    tags?: string[];
    linked_mission_id?: string | null;
    sensory_observation?: string;
  }): Promise<JournalEntry> {
    return this.request<JournalEntry>('/journal', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async updateJournalEntry(id: string, entry: Partial<JournalEntry>): Promise<JournalEntry> {
    return this.request<JournalEntry>(`/journal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    });
  }

  async deleteJournalEntry(id: string): Promise<{ message: string; id: string }> {
    return this.request(`/journal/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Stats ---
  async getStats(): Promise<UserStats> {
    return this.request<UserStats>('/stats');
  }
}

export const api = new ApiService();
