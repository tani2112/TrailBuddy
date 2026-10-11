import React, { useState } from 'react';
import {
  Compass,
  Clock,
  Sparkles,
  CheckCircle2,
  Filter,
  History,
  BookOpen,
  ArrowRight,
  Eye,
  Feather,
  Leaf,
  Ear,
  Palette,
  CloudSun,
  TreeDeciduous,
  Bug,
  SunMedium,
  Wind,
  Sprout,
  Droplets,
  HeartHandshake,
} from 'lucide-react';
import { Mission, MissionCategory, MissionDifficulty } from '../types';

interface MissionsProps {
  missions: Mission[];
  onStartMission: (mission: Mission) => void;
  onOpenJournal: () => void;
}

const CATEGORIES = ['All', 'Wildlife', 'Botany', 'Sensory', 'Mindfulness', 'Earth'];
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Explorer'];

export const Missions: React.FC<MissionsProps> = ({
  missions,
  onStartMission,
  onOpenJournal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'completed'>('all');

  // Filter missions
  const filteredMissions = missions.filter((m) => {
    if (selectedCategory !== 'All' && m.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (selectedDifficulty !== 'All' && m.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) {
      return false;
    }
    if (statusFilter === 'completed' && !m.is_completed) return false;
    if (statusFilter === 'available' && m.is_completed) return false;
    return true;
  });

  const completedCount = missions.filter((m) => m.is_completed).length;

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'wildlife':
        return <Feather className="w-4 h-4 text-emerald-600" />;
      case 'botany':
        return <Leaf className="w-4 h-4 text-emerald-700" />;
      case 'sensory':
        return <Ear className="w-4 h-4 text-amber-600" />;
      case 'mindfulness':
        return <HeartHandshake className="w-4 h-4 text-teal-600" />;
      case 'earth':
        return <CloudSun className="w-4 h-4 text-sky-600" />;
      default:
        return <Compass className="w-4 h-4 text-nature-600" />;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-nature-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <span>🌿</span>
              <span>18 Outdoor Challenges</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-nature-900 tracking-tight">
              Touch Grass Missions
            </h1>
            <p className="text-xs sm:text-sm text-nature-600 max-w-xl">
              Real-world outdoor missions designed to awaken your senses. Start a challenge, put your device in your pocket, and explore the living world.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-cream-100 px-4 py-2.5 rounded-2xl border border-nature-200 text-center">
              <div className="text-lg font-black text-nature-900">
                {completedCount} / {missions.length}
              </div>
              <div className="text-[10px] font-semibold text-nature-600 uppercase tracking-wider">
                Completed
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="pt-4 border-t border-nature-100 space-y-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-nature-800 text-white shadow-xs'
                  : 'bg-cream-100 text-nature-700 hover:bg-cream-200'
              }`}
            >
              All Challenges ({missions.length})
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'available'
                  ? 'bg-nature-800 text-white shadow-xs'
                  : 'bg-cream-100 text-nature-700 hover:bg-cream-200'
              }`}
            >
              Available ({missions.length - completedCount})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'completed'
                  ? 'bg-nature-800 text-white shadow-xs'
                  : 'bg-cream-100 text-nature-700 hover:bg-cream-200'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-nature-500 uppercase tracking-wider mr-1">
              Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-cream-50 hover:bg-cream-200 border border-nature-200 text-nature-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulty Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-nature-500 uppercase tracking-wider mr-1">
              Difficulty:
            </span>
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-nature-700 text-white'
                    : 'bg-cream-50 hover:bg-cream-200 border border-nature-200 text-nature-600'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMissions.map((mission) => (
          <div
            key={mission.id}
            className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ${
              mission.is_completed
                ? 'border-emerald-200 bg-emerald-50/20 shadow-xs'
                : 'border-nature-200 shadow-xs hover:shadow-md card-hover-glow'
            }`}
          >
            <div className="space-y-4">
              {/* Category & Points Badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cream-100 border border-nature-200 text-xs font-semibold text-nature-800">
                  {getCategoryIcon(mission.category)}
                  <span>{mission.category}</span>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-sun-100 text-amber-900 border border-amber-200/60 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>+{mission.points} XP</span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-lg font-black text-nature-900 tracking-tight">
                  {mission.title}
                </h3>
                <p className="text-xs text-nature-600 leading-relaxed mt-1.5">
                  {mission.description}
                </p>
              </div>

              {/* Mindfulness Prompt Box */}
              <div className="p-3 rounded-2xl bg-cream-100/90 border border-nature-200/70 text-xs text-nature-800 italic leading-relaxed">
                &ldquo;{mission.mindfulness_prompt}&rdquo;
              </div>

              {/* Meta: Time & Difficulty */}
              <div className="flex items-center gap-4 text-xs text-nature-500 pt-1">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-nature-400" />
                  {mission.duration_minutes} mins
                </span>
                <span className="font-medium">• {mission.difficulty}</span>
                {mission.badge_reward && (
                  <span className="font-semibold text-emerald-800">
                    Badge: {mission.badge_reward}
                  </span>
                )}
              </div>

              {/* Previous Reflection if completed */}
              {mission.is_completed && mission.last_reflection && (
                <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-200 text-[11px] text-emerald-950">
                  <strong>Your Reflection:</strong> {mission.last_reflection}
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="mt-6 pt-4 border-t border-nature-100 flex items-center justify-between">
              {mission.is_completed ? (
                <div className="flex items-center justify-between w-full">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Completed
                  </span>
                  <button
                    onClick={() => onStartMission(mission)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-cream-200 hover:bg-cream-300 text-nature-800 transition-colors"
                  >
                    Repeat Mission
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onStartMission(mission)}
                  className="w-full py-2.5 px-4 rounded-xl bg-nature-800 hover:bg-nature-900 text-white font-bold text-xs shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  <span>Start Challenge ({mission.duration_minutes}m)</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredMissions.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-nature-200 space-y-3">
          <p className="text-nature-500 text-sm">
            No missions matched your selected filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedDifficulty('All');
              setStatusFilter('all');
            }}
            className="text-xs font-bold text-nature-800 underline"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
};
