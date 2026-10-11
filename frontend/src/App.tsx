import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { OllamaStatusModal } from './components/OllamaStatusModal';
import { MissionTimerModal } from './components/MissionTimerModal';
import { Dashboard } from './pages/Dashboard';
import { NatureGuide } from './pages/NatureGuide';
import { Missions } from './pages/Missions';
import { Journal } from './pages/Journal';
import { api } from './services/api';
import { Mission, JournalEntry, UserStats, OllamaStatus } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'guide' | 'missions' | 'journal'>('dashboard');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [todaysMission, setTodaysMission] = useState<Mission | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [aiStatus, setAiStatus] = useState<OllamaStatus | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [selectedActiveMission, setSelectedActiveMission] = useState<Mission | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch initial app data
  const loadAppData = async () => {
    try {
      setBackendError(null);
      const [missionsData, todayData, journalData, statsData, statusData] = await Promise.allSettled([
        api.getMissions(),
        api.getTodaysMission(),
        api.getJournalEntries(),
        api.getStats(),
        api.getAiStatus(),
      ]);

      if (missionsData.status === 'fulfilled') {
        setMissions(missionsData.value);
      }
      if (todayData.status === 'fulfilled') {
        setTodaysMission(todayData.value);
      }
      if (journalData.status === 'fulfilled') {
        setJournalEntries(journalData.value);
      }
      if (statsData.status === 'fulfilled') {
        setUserStats(statsData.value);
      }
      if (statusData.status === 'fulfilled') {
        setAiStatus(statusData.value);
      }
    } catch (err: any) {
      setBackendError(err.message || 'Failed to load initial data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppData();
  }, []);

  const handleStartMission = (mission: Mission) => {
    setSelectedActiveMission(mission);
  };

  const handleMissionCompleted = async (awardedPoints: number) => {
    // Refresh stats and missions
    await loadAppData();
  };

  const handleRefreshAiStatus = async () => {
    try {
      const status = await api.getAiStatus();
      setAiStatus(status);
    } catch {
      setAiStatus({
        connected: false,
        base_url: 'http://127.0.0.1:11434',
        model_configured: 'llama3.2',
        model_installed: false,
        available_models: [],
        status_message: 'Could not connect to Ollama daemon.',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-leaf-pattern text-nature-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        aiStatus={aiStatus}
        userStats={userStats}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        isOnline={isOnline}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6">
        {/* Backend Warning Banner if unreachable */}
        {backendError && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <span>
              ⚠️ {backendError}. Please ensure the TrailBuddy server is running.
            </span>
            <button
              onClick={loadAppData}
              className="font-bold underline text-amber-950"
            >
              Retry
            </button>
          </div>
        )}

        {/* View Router */}
        {activeTab === 'dashboard' && (
          <Dashboard
            todaysMission={todaysMission}
            userStats={userStats}
            recentEntries={journalEntries}
            aiStatus={aiStatus}
            onNavigate={setActiveTab}
            onStartMission={handleStartMission}
            onOpenAiModal={() => setIsAiModalOpen(true)}
          />
        )}

        {activeTab === 'guide' && (
          <NatureGuide
            aiStatus={aiStatus}
            onOpenAiModal={() => setIsAiModalOpen(true)}
            onRefreshStatus={handleRefreshAiStatus}
          />
        )}

        {activeTab === 'missions' && (
          <Missions
            missions={missions}
            onStartMission={handleStartMission}
            onOpenJournal={() => setActiveTab('journal')}
          />
        )}

        {activeTab === 'journal' && (
          <Journal
            entries={journalEntries}
            onRefreshEntries={loadAppData}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Active Mission Timer Modal */}
      <MissionTimerModal
        mission={selectedActiveMission}
        isOpen={Boolean(selectedActiveMission)}
        onClose={() => setSelectedActiveMission(null)}
        onCompleted={handleMissionCompleted}
      />

      {/* Ollama Status & Setup Guide Modal */}
      <OllamaStatusModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        status={aiStatus}
        onRefresh={handleRefreshAiStatus}
      />
    </div>
  );
}

export default App;
