import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Cpu,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Copy,
  Check,
  Bot,
  User,
  ShieldAlert,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { ChatMessage, OllamaStatus } from '../types';
import { api } from '../services/api';

interface NatureGuideProps {
  aiStatus: OllamaStatus | null;
  onOpenAiModal: () => void;
  onRefreshStatus: () => Promise<void>;
}

const EXAMPLE_QUESTIONS = [
  "How can I tell poison ivy apart from Virginia creeper?",
  "What do bird warning calls sound like versus singing for a mate?",
  "How do I recognize mammal tracks in soft soil or mud?",
  "What are the 7 core Leave No Trace principles?",
  "How can I identify common tree families by their leaf venation?",
  "What should I do if a bee or wasp hovers near me on a trail?",
];

export const NatureGuide: React.FC<NatureGuideProps> = ({
  aiStatus,
  onOpenAiModal,
  onRefreshStatus,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        "Welcome to your AI Nature Guide! 🌲\n\nI'm your local, open-weight outdoor companion. Ask me questions about identifying plant features, listening to bird calls, understanding forest ecology, or trail safety.\n\n*Note: I am a conversational field guide to spark curiosity, not an automated botanical lab. Never ingest wild mushrooms or plants without local expert verification!*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      disclaimer: "Field guidance generated with local open-weight AI.",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend || inputValue).trim();
    if (!question || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build conversation payload for backend
      const historyPayload = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.sendAiChat(historyPayload);

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        disclaimer: res.disclaimer,
        follow_up_tips: res.follow_up_tips,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Could not reach local Ollama AI: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header and Connection Status Banner */}
      <div className="bg-white rounded-3xl p-6 border border-nature-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-nature-700 to-nature-900 text-white flex items-center justify-center shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-nature-900 tracking-tight">
                AI Nature Guide
              </h1>
              <p className="text-xs text-nature-600">
                Powered locally by Ollama • Open-Weight Models • Zero Cloud APIs
              </p>
            </div>
          </div>

          {/* Connection Status Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAiModal}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all ${
                aiStatus?.connected
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>
                {aiStatus?.connected
                  ? `Connected: ${aiStatus.model_configured}`
                  : 'Ollama Offline — Setup Guide'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  aiStatus?.connected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Offline Alert Box if Ollama is disconnected */}
        {!aiStatus?.connected && (
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>Local AI is not running yet.</span>
            </div>
            <p className="leading-relaxed">
              TrailBuddy connects to Ollama on your machine (`http://127.0.0.1:11434`).
              Open your Ubuntu terminal and run:
            </p>
            <div className="bg-nature-950 text-emerald-300 font-mono p-2.5 rounded-xl text-xs flex items-center justify-between">
              <span>ollama serve</span>
              <span className="text-nature-400 text-[10px]">in terminal</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-amber-800">
                Then pull the model: <code>ollama pull {aiStatus?.model_configured || 'llama3.2'}</code>
              </span>
              <button
                onClick={onOpenAiModal}
                className="font-bold underline text-amber-900 hover:text-amber-950"
              >
                View Full Setup Instructions
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl border border-nature-200 shadow-sm flex flex-col h-[560px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[88%] sm:max-w-[80%] ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs ${
                  msg.role === 'user'
                    ? 'bg-nature-800 text-white'
                    : msg.isError
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-3xl text-sm leading-relaxed relative group ${
                  msg.role === 'user'
                    ? 'bg-nature-800 text-white rounded-tr-xs'
                    : msg.isError
                    ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-tl-xs'
                    : 'bg-cream-100 border border-nature-200/80 text-nature-900 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* AI Follow-up tips or observation cues */}
                {msg.follow_up_tips && msg.follow_up_tips.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-nature-200/60 text-xs text-nature-700 space-y-1">
                    <span className="font-bold text-[11px] text-nature-800 uppercase tracking-wider block">
                      Field Observation Cues:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {msg.follow_up_tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Disclaimer pill */}
                {msg.disclaimer && (
                  <div className="mt-2 text-[10px] text-nature-500 italic">
                    ⚠️ {msg.disclaimer}
                  </div>
                )}

                {/* Timestamp & Copy */}
                <div className="flex items-center justify-between gap-3 mt-2 text-[10px] opacity-75">
                  <span>{msg.timestamp}</span>
                  {msg.role === 'assistant' && !msg.isError && (
                    <button
                      onClick={() => copyMessage(msg.content, msg.id)}
                      className="hover:opacity-100 flex items-center gap-1"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center animate-fadeIn">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-3xl bg-cream-100 border border-nature-200/80 text-nature-700 text-xs flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>AI Nature Guide is generating response with local model...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Example Questions Chips */}
        <div className="p-3 bg-cream-50 border-t border-nature-100 overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="text-[11px] font-bold text-nature-600 uppercase tracking-wider flex-shrink-0 pl-1">
            Ideas:
          </span>
          {EXAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-full bg-white hover:bg-cream-200 border border-nature-200/80 text-nature-800 whitespace-nowrap flex-shrink-0 shadow-2xs transition-colors hover:border-nature-300"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-nature-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about birds, leaves, animal tracks, safety..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-2xl bg-cream-50 border border-nature-200 text-sm text-nature-900 placeholder:text-nature-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-3 sm:px-5 sm:py-3 rounded-2xl bg-nature-800 hover:bg-nature-900 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask Guide</span>
            </button>
          </form>

          {/* Responsible Notice */}
          <div className="mt-2 text-center text-[11px] text-nature-500">
            Never ingest wild plants or fungi. Answers generated locally via Ollama.
          </div>
        </div>
      </div>
    </div>
  );
};
