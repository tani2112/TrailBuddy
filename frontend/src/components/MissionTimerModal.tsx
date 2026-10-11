import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Eye,
  Smartphone,
  Sparkles,
  BookOpen,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Mission } from '../types';
import { api } from '../services/api';

interface MissionTimerModalProps {
  mission: Mission | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleted: (awardedPoints: number) => void;
  onSaveToJournal?: (entry: { title: string; notes: string; linked_mission_id: string }) => void;
}

export const MissionTimerModal: React.FC<MissionTimerModalProps> = ({
  mission,
  isOpen,
  onClose,
  onCompleted,
  onSaveToJournal,
}) => {
  if (!isOpen || !mission) return null;

  const totalTargetSeconds = mission.duration_minutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalTargetSeconds);
  const [isActive, setIsActive] = useState(true);
  const [isPocketMode, setIsPocketMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const [reflection, setReflection] = useState('');
  const [autoSaveJournal, setAutoSaveJournal] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset timer state when mission changes
  useEffect(() => {
    setSecondsRemaining(mission.duration_minutes * 60);
    setIsActive(true);
    setIsPocketMode(false);
    setIsFinishing(false);
    setReflection('');
  }, [mission]);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Play gentle chime if sound enabled
            playChime();
            setIsActive(false);
            setIsFinishing(true);
            triggerCelebration();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining]);

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, audioCtx.currentTime); // 528 Hz - nature solfeggio frequency
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 2.0);
    } catch {
      // AudioContext unavailable or blocked
    }
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#52B788', '#2D6A4F', '#74C69D', '#F59E0B', '#D8F3DC'],
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleManualComplete = () => {
    setIsActive(false);
    setIsFinishing(true);
    triggerCelebration();
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const durationSpent = totalTargetSeconds - secondsRemaining;
      await api.completeMission(mission.id, Math.max(durationSpent, 30), reflection);

      // Optionally save to journal
      if (autoSaveJournal) {
        await api.createJournalEntry({
          title: `Mission Completed: ${mission.title}`,
          notes: reflection.trim()
            ? reflection
            : `Completed the "${mission.title}" challenge in ${mission.duration_minutes} minutes. Observed nature mindfully without screen interference.`,
          category: mission.category,
          linked_mission_id: mission.id,
          sensory_observation: mission.mindfulness_prompt,
          tags: [mission.category.toLowerCase(), 'touch-grass', 'mission'],
        });
      }

      onCompleted(mission.points);
      onClose();
    } catch (err: any) {
      alert(`Could not save mission progress: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Pocket / Look Around Mode ---
  if (isPocketMode) {
    return (
      <div
        onClick={() => setIsPocketMode(false)}
        className="fixed inset-0 z-50 bg-nature-950 text-white flex flex-col items-center justify-between p-8 select-none cursor-pointer transition-all duration-700 animate-fadeIn"
      >
        <div className="flex items-center justify-between w-full max-w-md pt-4 text-xs text-nature-400">
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            Pocket Mode Active
          </span>
          <span>Tap anywhere to wake screen</span>
        </div>

        {/* Breathing Nature Orb */}
        <div className="flex flex-col items-center text-center space-y-6 my-auto">
          <div className="relative flex items-center justify-center">
            <div className="w-56 h-56 rounded-full bg-emerald-500/10 animate-breathe blur-xl absolute" />
            <div className="w-44 h-44 rounded-full bg-gradient-to-tr from-nature-800 to-nature-600 border border-emerald-400/30 flex flex-col items-center justify-center shadow-2xl animate-breathe">
              <span className="text-4xl mb-1">🍃</span>
              <span className="font-mono text-3xl font-extrabold text-emerald-300 tracking-wider">
                {formatTime(secondsRemaining)}
              </span>
            </div>
          </div>

          <div className="space-y-2 max-w-sm">
            <h3 className="text-xl font-bold text-cream-100 font-serif-display">
              Look Around You
            </h3>
            <p className="text-sm text-nature-300 leading-relaxed">
              Don't stare at the screen. Put your phone in your pocket or face down.
              Observe the living world around you.
            </p>
          </div>
        </div>

        <div className="pb-6 text-center text-xs text-nature-500">
          <span>Tap screen when ready to reflect • Timer running in background</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nature-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-nature-200 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-nature-400 hover:text-nature-800 hover:bg-cream-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isFinishing ? (
          /* Active Mission Countdown Screen */
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-nature-100 text-nature-800 text-[11px] font-bold uppercase tracking-wider">
                  {mission.category}
                </span>
                <span className="text-xs text-nature-500">
                  {mission.difficulty} • {mission.points} XP
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-nature-900 tracking-tight">
                {mission.title}
              </h2>
            </div>

            {/* Mindfulness Box */}
            <div className="p-4 rounded-2xl bg-cream-100 border border-nature-200 text-xs text-nature-800 flex items-start gap-3">
              <span className="text-xl flex-shrink-0">🌿</span>
              <p className="leading-relaxed italic font-medium">
                &ldquo;{mission.mindfulness_prompt}&rdquo;
              </p>
            </div>

            {/* Timer Display */}
            <div className="flex flex-col items-center justify-center py-4 bg-nature-50 rounded-3xl border border-nature-200/80">
              <div className="font-mono text-5xl font-black text-nature-900 tracking-widest">
                {formatTime(secondsRemaining)}
              </div>
              <span className="text-xs font-semibold text-nature-600 mt-1 uppercase tracking-wider">
                {isActive ? 'Challenge in Progress' : 'Paused'}
              </span>

              {/* Controls */}
              <div className="flex items-center gap-4 mt-5">
                <button
                  onClick={() => setIsActive(!isActive)}
                  className="p-3 rounded-2xl bg-nature-800 hover:bg-nature-900 text-white shadow-md transition-all hover:scale-105 active:scale-95"
                  title={isActive ? 'Pause Timer' : 'Resume Timer'}
                >
                  {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => {
                    setSecondsRemaining(totalTargetSeconds);
                    setIsActive(false);
                  }}
                  className="p-3 rounded-2xl bg-white border border-nature-200 hover:bg-cream-100 text-nature-700 transition-all shadow-xs"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-3 rounded-2xl bg-white border border-nature-200 hover:bg-cream-100 text-nature-700 transition-all shadow-xs"
                  title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-nature-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Pocket Mode Action Button */}
            <button
              onClick={() => setIsPocketMode(true)}
              className="w-full py-3 px-4 rounded-2xl bg-nature-900 hover:bg-nature-950 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Enter Pocket Mode (Screen-Free)</span>
            </button>

            {/* Step-by-step instructions */}
            <div className="space-y-2 text-xs text-nature-700">
              <span className="font-bold text-nature-900 block uppercase tracking-wider text-[11px]">
                Field Instructions:
              </span>
              <ul className="space-y-1.5 pl-4 list-disc marker:text-nature-600">
                {mission.instructions.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Complete Button */}
            <div className="pt-2 flex justify-between items-center text-xs">
              <button
                onClick={onClose}
                className="text-nature-500 hover:text-nature-800 font-medium"
              >
                Cancel Mission
              </button>
              <button
                onClick={handleManualComplete}
                className="flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Finished Early / Complete</span>
              </button>
            </div>
          </div>
        ) : (
          /* Mission Finished & Reflection Screen */
          <div className="space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center text-3xl shadow-inner">
              ✨
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-sun-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
                +{mission.points} Exploration Points!
              </span>
              <h2 className="text-2xl font-black text-nature-900 mt-2">
                Challenge Completed!
              </h2>
              <p className="text-xs text-nature-600 mt-1 max-w-sm mx-auto">
                You took time out of the digital world to observe real nature.
                How did your surroundings look, sound, or smell?
              </p>
            </div>

            {/* Reflection Note Input */}
            <div className="text-left space-y-2">
              <label className="text-xs font-bold text-nature-800 block">
                Field Observation Notes (Optional):
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="e.g. Watched a robin turn a dry oak leaf. Scent of damp soil was strong after morning mist..."
                rows={3}
                className="w-full p-3 rounded-2xl bg-cream-50 border border-nature-200 text-sm text-nature-900 placeholder:text-nature-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Checkbox to auto-save to Journal */}
            <label className="flex items-center gap-2.5 text-xs text-nature-700 text-left cursor-pointer p-3 rounded-xl bg-cream-100 border border-nature-200">
              <input
                type="checkbox"
                checked={autoSaveJournal}
                onChange={(e) => setAutoSaveJournal(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
              />
              <div className="flex items-center gap-1.5 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                <span>Save this observation to my private Nature Journal</span>
              </div>
            </label>

            {/* Save Button */}
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-nature-800 hover:bg-nature-900 text-white font-bold text-sm shadow-lg shadow-nature-800/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isSubmitting ? 'Recording Points...' : 'Claim Points & Return'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
