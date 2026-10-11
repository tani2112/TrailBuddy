import React from 'react';
import { Heart, ShieldCheck, Smartphone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-nature-200/80 bg-cream-100 py-12 px-4 pb-24 md:pb-12 text-center text-nature-800">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cream-200 border border-nature-200 text-xs font-semibold text-nature-800">
          <Smartphone className="w-4 h-4 text-nature-600" />
          <span>Screen-Time Philosophy: Less digital noise, more birdsong & fresh pine</span>
        </div>

        <h3 className="font-serif-display italic text-2xl text-nature-900 font-semibold max-w-xl mx-auto leading-relaxed">
          &ldquo;The real world outside has no battery limit, zero latency, and infinite resolution.&rdquo;
        </h3>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-nature-600 font-medium pt-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-nature-600" />
            <span>100% Local Open-Weight AI (Ollama)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>•</span>
            <span>Private Local SQLite Journal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>•</span>
            <span>No Cloud Subscriptions</span>
          </div>
        </div>

        <p className="text-xs text-nature-500 pt-3">
          Made with <Heart className="w-3.5 h-3.5 inline text-rose-500 fill-rose-500" /> for nature lovers and mindful explorers.
        </p>
      </div>
    </footer>
  );
};
