import React from 'react';
import {
  Compass,
  BookOpen,
  MessageSquare,
  Sparkles,
  Cpu,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { OllamaStatus, UserStats } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'guide' | 'missions' | 'journal';
  setActiveTab: (tab: 'dashboard' | 'guide' | 'missions' | 'journal') => void;
  aiStatus: OllamaStatus | null;
  userStats: UserStats | null;
  onOpenAiModal: () => void;
  isOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  aiStatus,
  userStats,
  onOpenAiModal,
  isOnline,
}) => {
  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-nature-100 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nature-700 to-nature-900 flex items-center justify-center text-white shadow-md shadow-nature-800/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">🌿</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-nature-900 tracking-tight">
                  TrailBuddy
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-nature-100 text-nature-800 border border-nature-200">
                  Local AI
                </span>
              </div>
              <p className="text-[11px] text-nature-600 font-medium hidden sm:block">
                Your AI Nature Companion
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 bg-cream-200/60 p-1 rounded-full border border-nature-200/60">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-nature-800 text-white shadow-sm'
                  : 'text-nature-700 hover:text-nature-900 hover:bg-cream-300/60'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'bg-nature-800 text-white shadow-sm'
                  : 'text-nature-700 hover:text-nature-900 hover:bg-cream-300/60'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              AI Nature Guide
            </button>
            <button
              onClick={() => setActiveTab('missions')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'missions'
                  ? 'bg-nature-800 text-white shadow-sm'
                  : 'text-nature-700 hover:text-nature-900 hover:bg-cream-300/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              Touch Grass
            </button>
            <button
              onClick={() => setActiveTab('journal')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'journal'
                  ? 'bg-nature-800 text-white shadow-sm'
                  : 'text-nature-700 hover:text-nature-900 hover:bg-cream-300/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Journal
            </button>
          </nav>

          {/* Right Status Actions */}
          <div className="flex items-center gap-2">
            {/* Exploration Points */}
            <div
              title="Your Exploration Points (Earned by completing missions)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sun-100 text-amber-900 border border-amber-200/80 text-xs font-bold shadow-xs cursor-default"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{userStats?.total_points ?? 0} pts</span>
            </div>

            {/* Local Ollama Status Pill */}
            <button
              onClick={onOpenAiModal}
              title={
                aiStatus?.connected
                  ? `Ollama AI Connected (${aiStatus.model_configured})`
                  : 'Ollama AI Offline — Click for Setup Guide'
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                aiStatus?.connected
                  ? 'bg-nature-50 text-nature-800 border-nature-300 hover:bg-nature-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 animate-pulse'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {aiStatus?.connected ? 'Ollama Online' : 'Local AI Offline'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  aiStatus?.connected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </button>

            {/* Offline Network Pill if offline */}
            {!isOnline && (
              <div
                title="Browser is offline. Local SQLite entries and cached missions are ready."
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
              >
                <WifiOff className="w-3 h-3 text-slate-500" />
                <span className="hidden lg:inline text-[11px]">Offline</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-nature-200 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? 'text-nature-800 font-bold'
              : 'text-nature-500 font-medium'
          }`}
        >
          <span className="text-lg">🏕️</span>
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'guide'
              ? 'text-nature-800 font-bold'
              : 'text-nature-500 font-medium'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px]">AI Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('missions')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'missions'
              ? 'text-nature-800 font-bold'
              : 'text-nature-500 font-medium'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Missions</span>
        </button>

        <button
          onClick={() => setActiveTab('journal')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'journal'
              ? 'text-nature-800 font-bold'
              : 'text-nature-500 font-medium'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px]">Journal</span>
        </button>
      </div>
    </>
  );
};
