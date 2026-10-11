import React, { useState } from 'react';
import {
  X,
  Cpu,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { OllamaStatus } from '../types';

interface OllamaStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: OllamaStatus | null;
  onRefresh: () => Promise<void>;
}

export const OllamaStatusModal: React.FC<OllamaStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefresh,
}) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, stepNumber: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepNumber);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const configuredModel = status?.model_configured || 'llama3.2';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nature-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-nature-200 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-nature-200/50 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-nature-100">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl ${
                status?.connected
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-nature-900">
                Local Open-Weight AI (Ollama)
              </h2>
              <p className="text-xs text-nature-600">
                100% private, on-device intelligence without cloud fees or subscriptions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-nature-500 hover:text-nature-900 hover:bg-cream-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Connection Status Box */}
        <div
          className={`mt-6 p-4 rounded-2xl border ${
            status?.connected
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {status?.connected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              )}
              <span className="font-bold text-sm">
                {status?.connected
                  ? 'Ollama Service is Connected & Active'
                  : 'Ollama Service is Not Detected'}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/80 border border-nature-200 hover:bg-white text-nature-800 transition-all shadow-xs"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>Check</span>
            </button>
          </div>

          <div className="mt-3 text-xs space-y-1 pl-7 opacity-90">
            <div>
              <strong>Endpoint:</strong>{' '}
              <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono text-[11px]">
                {status?.base_url || 'http://127.0.0.1:11434'}
              </code>
            </div>
            <div>
              <strong>Configured Model:</strong>{' '}
              <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono text-[11px]">
                {configuredModel}
              </code>
            </div>
            {status?.connected && (
              <div>
                <strong>Installed Models:</strong>{' '}
                {status.available_models.length > 0
                  ? status.available_models.join(', ')
                  : 'None pulled yet'}
              </div>
            )}
          </div>
        </div>

        {/* Ubuntu Linux Setup Steps */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-nature-700" />
            <h3 className="text-sm font-bold text-nature-900 uppercase tracking-wider">
              How to Run Ollama on Ubuntu Linux
            </h3>
          </div>

          {/* Step 1 */}
          <div className="bg-cream-100 rounded-2xl p-3.5 border border-nature-200">
            <div className="flex items-center justify-between text-xs font-semibold text-nature-800 mb-1.5">
              <span>Step 1: Install Ollama (if not already installed)</span>
              <button
                onClick={() =>
                  copyToClipboard('curl -fsSL https://ollama.com/install.sh | sh', 1)
                }
                className="flex items-center gap-1 text-nature-600 hover:text-nature-900"
              >
                {copiedStep === 1 ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span className="text-[11px]">{copiedStep === 1 ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="bg-nature-950 text-emerald-300 p-2.5 rounded-xl text-xs font-mono overflow-x-auto">
              curl -fsSL https://ollama.com/install.sh | sh
            </pre>
          </div>

          {/* Step 2 */}
          <div className="bg-cream-100 rounded-2xl p-3.5 border border-nature-200">
            <div className="flex items-center justify-between text-xs font-semibold text-nature-800 mb-1.5">
              <span>Step 2: Start the Ollama server</span>
              <button
                onClick={() => copyToClipboard('ollama serve', 2)}
                className="flex items-center gap-1 text-nature-600 hover:text-nature-900"
              >
                {copiedStep === 2 ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span className="text-[11px]">{copiedStep === 2 ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="bg-nature-950 text-emerald-300 p-2.5 rounded-xl text-xs font-mono overflow-x-auto">
              ollama serve
            </pre>
          </div>

          {/* Step 3 */}
          <div className="bg-cream-100 rounded-2xl p-3.5 border border-nature-200">
            <div className="flex items-center justify-between text-xs font-semibold text-nature-800 mb-1.5">
              <span>Step 3: Pull your chosen open-weight model</span>
              <button
                onClick={() => copyToClipboard(`ollama run ${configuredModel}`, 3)}
                className="flex items-center gap-1 text-nature-600 hover:text-nature-900"
              >
                {copiedStep === 3 ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span className="text-[11px]">{copiedStep === 3 ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="bg-nature-950 text-emerald-300 p-2.5 rounded-xl text-xs font-mono overflow-x-auto">
              ollama run {configuredModel}
            </pre>
            <p className="text-[11px] text-nature-600 mt-2">
              💡 For lightweight hardware or faster responses, you can also use{' '}
              <code className="bg-cream-200 px-1 py-0.5 rounded font-mono">llama3.2:1b</code> or{' '}
              <code className="bg-cream-200 px-1 py-0.5 rounded font-mono">phi3</code>.
            </p>
          </div>
        </div>

        {/* Offline Friendly Note */}
        <div className="mt-6 p-4 rounded-2xl bg-cream-200/70 border border-nature-200 text-xs text-nature-700 leading-relaxed">
          <p>
            <strong>Note:</strong> While AI Chat requires Ollama running locally on your
            computer, all other TrailBuddy features — including <strong>Touch Grass Missions</strong> and the <strong>Nature Journal</strong> — work completely offline without any internet connection!
          </p>
        </div>

        {/* Footer Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-nature-800 hover:bg-nature-900 text-white font-semibold text-sm shadow-md transition-all"
          >
            Got it, Let's Explore
          </button>
        </div>
      </div>
    </div>
  );
};
