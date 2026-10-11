import React from 'react';
import { Smartphone, Eye, Sparkles, Wind } from 'lucide-react';

interface PutPhoneAwayBannerProps {
  onStartMissionClick?: () => void;
}

export const PutPhoneAwayBanner: React.FC<PutPhoneAwayBannerProps> = ({
  onStartMissionClick,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-nature-900 via-nature-850 to-nature-950 text-white p-6 sm:p-8 shadow-xl border border-nature-700/60">
      {/* Decorative botanical orbs */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-nature-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-sage/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nature-700/60 text-emerald-300 text-xs font-semibold tracking-wide border border-nature-600/50">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Digital Detox Protocol</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-cream-50 font-serif-display">
            Step Outside • Lower Your Phone • Look Around
          </h3>

          <p className="text-sm text-nature-200/90 leading-relaxed">
            TrailBuddy is built with an unconventional purpose:{' '}
            <span className="text-emerald-200 font-medium">
              to get you away from screens
            </span>
            . Start a challenge, slip your device in your pocket, and let your eyes, ears, and breath calibrate to the real world.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-nature-300/80 pt-1">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-400" />
              Tune eyes to tree canopy
            </span>
            <span className="flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-emerald-400" />
              Breathe petrichor & cedar
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Collect exploration XP
            </span>
          </div>
        </div>

        {onStartMissionClick && (
          <button
            onClick={onStartMissionClick}
            className="flex-shrink-0 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-nature-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span>Touch Grass Today</span>
            <span>🌿</span>
          </button>
        )}
      </div>
    </div>
  );
};
