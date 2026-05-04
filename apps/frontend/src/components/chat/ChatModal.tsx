import React, { useState, useEffect } from 'react';
import { X, Bot, Send, AlertCircle } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAnalytics, getSessionIdCached } from '../../context/analytics';
import QuickReplies from './QuickReplies';

const ChatModal: React.FC = () => {
  const { isChatOpen, closeChat } = useChat();
  const { trackEvent } = useAnalytics();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);

  useEffect(() => {
    if (isChatOpen) {
      trackEvent('chat_opened');
    }
  }, [isChatOpen, trackEvent]);

  if (!isChatOpen) return null;

  const handleIntentSelect = async (intent: string) => {
    setIsSubmitting(true);
    setError(null);
    setSelectedIntent(intent);

    try {
      const response = await fetch('/api/v1/chat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent,
          session_id: getSessionIdCached()
        })
      });

      if (!response.ok) throw new Error('Failed to save intent');

      trackEvent('intent_selected', { intent });
      
      // In Slice 1, we just stop here or show a placeholder success message
      // For now, let's just keep the state
    } catch (err) {
      console.error('Chat start error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-4 pointer-events-none">
      {/* Backdrop for mobile */}
      <div 
        className="sm:hidden absolute inset-0 bg-slate-950/40 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-300"
        onClick={closeChat}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[400px] bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-4 duration-300 flex flex-col max-h-[600px] mb-20 sm:mb-24 mr-0 sm:mr-4">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white tracking-tight">Samuel's AI</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Online</span>
              </div>
            </div>
          </div>
          <button 
            onClick={closeChat}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Welcome Message */}
          <div className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-500">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-slate-800/50 rounded-2xl rounded-tl-none p-4 text-slate-200 text-sm leading-relaxed border border-white/5">
              Hello! 👋 I'm Samuel's virtual assistant. How can I help you today?
            </div>
          </div>

          {!selectedIntent ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
              <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-2 ml-11">Select an option</p>
              <div className="ml-11">
                <QuickReplies onSelect={handleIntentSelect} disabled={isSubmitting} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* User Message */}
              <div className="flex gap-3 justify-end animate-in fade-in slide-in-from-right-2 duration-500">
                <div className="bg-blue-600 rounded-2xl rounded-tr-none p-4 text-white text-sm leading-relaxed shadow-lg shadow-blue-900/20">
                  {selectedIntent}
                </div>
              </div>

              {/* Bot Response (Placeholder for Slice 1) */}
              {!error && (
                <div className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-500 delay-500">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-slate-800/50 rounded-2xl rounded-tl-none p-4 text-slate-200 text-sm leading-relaxed border border-white/5">
                    {isSubmitting ? (
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce delay-150"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce delay-300"></span>
                      </div>
                    ) : (
                      "Great choice! I've noted that you're interested in " + selectedIntent.toLowerCase() + ". Someone will get back to you shortly, or you can continue exploring."
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-in shake duration-300">
              <AlertCircle size={14} />
              <span>{error}</span>
              <button 
                onClick={() => handleIntentSelect(selectedIntent!)}
                className="ml-auto underline font-bold"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Footer (Disabled in Slice 1) */}
        <div className="p-4 border-t border-white/5 bg-slate-950/30">
          <div className="relative group opacity-50 cursor-not-allowed">
            <input 
              type="text" 
              placeholder="Type a message..." 
              disabled
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-4 pr-12 text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500">
              <Send size={18} />
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-600 mt-3 font-medium">Powered by Gemini AI</p>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
