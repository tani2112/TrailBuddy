import React from 'react';
import {
  Compass,
  MessageSquare,
  BookOpen,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sun,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { Mission, UserStats, JournalEntry, OllamaStatus } from '../types';
import { PutPhoneAwayBanner } from '../components/PutPhoneAwayBanner';

interface DashboardProps {
  todaysMission: Mission | null;
  userStats: UserStats | null;
  recentEntries: JournalEntry[];
  aiStatus: OllamaStatus | null;
  onNavigate: (tab: 'dashboard' | 'guide' | 'missions' | 'journal') => void;
  onStartMission: (mission: Mission) => void;
  onOpenAiModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  todaysMission,
  userStats,
  recentEntries,
  aiStatus,
  onNavigate,
  onStartMission,
  onOpenAiModal,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Hero Welcome Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-nature-800 via-nature-700 to-nature-900 text-white p-8 sm:p-12 shadow-xl border border-nature-600/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-nature-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200">
            <span>🌿</span>
            <span>Step away from screens</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-serif-display leading-tight text-cream-50">
            Your next adventure starts outside.
          </h1>

          <p className="text-sm sm:text-base text-nature-100/90 leading-relaxed max-w-xl">
            TrailBuddy connects you to the natural world right outside your door.
            Complete mindful outdoor challenges, consult your local open-weight AI guide, and record what you uncover.
          </p>

          {/* 3 Prominent Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => onNavigate('guide')}
              className="px-5 py-3 rounded-2xl bg-white text-nature-900 font-bold text-sm shadow-md hover:bg-cream-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-nature-700" />
              <span>Explore Nature</span>
            </button>

            <button
              onClick={() => onNavigate('missions')}
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-nature-950 font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Start a Mission</span>
            </button>

            <button
              onClick={() => onNavigate('journal')}
              className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Open Journal</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Points */}
        <div className="bg-white rounded-3xl p-5 border border-nature-200/80 shadow-xs card-hover-glow flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sun-100 text-amber-700 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-nature-900">
              {userStats?.total_points ?? 0}
            </div>
            <div className="text-xs font-semibold text-nature-600">Exploration Points</div>
          </div>
        </div>

        {/* Completed Missions */}
        <div className="bg-white rounded-3xl p-5 border border-nature-200/80 shadow-xs card-hover-glow flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-nature-900">
              {userStats?.completed_missions_count ?? 0}
              <span className="text-xs font-normal text-nature-400 ml-1">
                / {userStats?.total_missions_count ?? 18}
              </span>
            </div>
            <div className="text-xs font-semibold text-nature-600">Missions Completed</div>
          </div>
        </div>

        {/* Journal Entries */}
        <div className="bg-white rounded-3xl p-5 border border-nature-200/80 shadow-xs card-hover-glow flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-nature-100 text-nature-800 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-nature-900">
              {userStats?.journal_entries_count ?? 0}
            </div>
            <div className="text-xs font-semibold text-nature-600">Journal Entries</div>
          </div>
        </div>

        {/* Nature Outdoor Minutes or Streak */}
        <div className="bg-white rounded-3xl p-5 border border-nature-200/80 shadow-xs card-hover-glow flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Flame className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-nature-900">
              {userStats?.outdoor_minutes_logged ?? 0}
              <span className="text-xs font-normal text-nature-400 ml-1">mins</span>
            </div>
            <div className="text-xs font-semibold text-nature-600">Outdoor Time Logged</div>
          </div>
        </div>
      </section>

      {/* Today's Featured Mission Card */}
      {todaysMission && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-nature-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide uppercase">
                  Today's Featured Mission
                </span>
                <span className="text-xs text-nature-500 font-semibold">
                  {todaysMission.category} • {todaysMission.difficulty}
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-nature-900">
                {todaysMission.title}
              </h2>

              <p className="text-sm text-nature-700 leading-relaxed">
                {todaysMission.description}
              </p>

              <div className="p-3.5 rounded-2xl bg-cream-100 border border-nature-200/80 text-xs text-nature-800 flex items-center gap-2.5">
                <span className="text-base">💭</span>
                <span className="italic font-medium">
                  "{todaysMission.mindfulness_prompt}"
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-nature-600 pt-1">
                <span className="flex items-center gap-1 font-semibold">
                  <Clock className="w-4 h-4 text-nature-500" />
                  {todaysMission.duration_minutes} minutes
                </span>
                <span className="flex items-center gap-1 font-semibold text-amber-700">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  +{todaysMission.points} Exploration XP
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto flex-shrink-0">
              <button
                onClick={() => onStartMission(todaysMission)}
                className="px-6 py-3.5 rounded-2xl bg-nature-800 hover:bg-nature-900 text-white font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>
                  {todaysMission.is_completed ? 'Repeat Challenge' : 'Start Today’s Mission'}
                </span>
              </button>
              <button
                onClick={() => onNavigate('missions')}
                className="px-5 py-3 rounded-2xl bg-cream-100 hover:bg-cream-200 text-nature-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
              >
                <span>View all 18 missions</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Mindful Screen-Time Banner */}
      <PutPhoneAwayBanner onStartMissionClick={() => onNavigate('missions')} />

      {/* Two-Column Section: AI Companion Preview + Recent Journal */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Local AI Guide Card */}
        <div className="bg-white rounded-3xl p-6 border border-nature-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-nature-100 text-nature-800 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-nature-900">
                  AI Nature Guide
                </h3>
              </div>
              <button
                onClick={onOpenAiModal}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  aiStatus?.connected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {aiStatus?.connected ? 'Ollama Online' : 'Ollama Offline'}
              </button>
            </div>

            <p className="text-xs text-nature-600 leading-relaxed">
              Ask questions about birds, plants, safety, or leave-no-trace ethics.
              Powered entirely on your machine via Ollama open-weight models.
            </p>

            <div className="space-y-1.5 pt-1">
              <div
                onClick={() => onNavigate('guide')}
                className="p-2.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-xs text-nature-800 cursor-pointer transition-colors flex items-center justify-between"
              >
                <span>"How do I tell poison ivy apart from Virginia creeper?"</span>
                <ArrowRight className="w-3.5 h-3.5 text-nature-500" />
              </div>
              <div
                onClick={() => onNavigate('guide')}
                className="p-2.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-xs text-nature-800 cursor-pointer transition-colors flex items-center justify-between"
              >
                <span>"What do bird warning calls sound like?"</span>
                <ArrowRight className="w-3.5 h-3.5 text-nature-500" />
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('guide')}
            className="mt-5 w-full py-2.5 px-4 rounded-xl bg-cream-200 hover:bg-cream-300 text-nature-900 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Ask Nature Guide</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Nature Journal Preview */}
        <div className="bg-white rounded-3xl p-6 border border-nature-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-nature-100 text-nature-800 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-nature-900">
                  Recent Journal Memories
                </h3>
              </div>
              <button
                onClick={() => onNavigate('journal')}
                className="text-xs font-semibold text-nature-600 hover:text-nature-900"
              >
                View all ({recentEntries.length})
              </button>
            </div>

            {recentEntries.length > 0 ? (
              <div className="space-y-2 pt-1">
                {recentEntries.slice(0, 2).map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => onNavigate('journal')}
                    className="p-3 rounded-2xl bg-cream-100 border border-nature-200/60 hover:bg-cream-200/80 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between text-[11px] text-nature-500 mb-1">
                      <span className="font-semibold text-emerald-800 uppercase">
                        {entry.category}
                      </span>
                      <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-xs text-nature-900 line-clamp-1">
                      {entry.title}
                    </h4>
                    <p className="text-[11px] text-nature-600 line-clamp-1 mt-0.5">
                      {entry.notes}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-4 bg-cream-50 rounded-2xl border border-dashed border-nature-200">
                <p className="text-xs text-nature-500">
                  No observations recorded yet. Complete your first mission to write one!
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('journal')}
            className="mt-5 w-full py-2.5 px-4 rounded-xl bg-nature-800 hover:bg-nature-900 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Open Field Journal</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
