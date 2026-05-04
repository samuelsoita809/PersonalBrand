import React, { useState, useEffect } from 'react';
import { X, Bot, Send, AlertCircle, ArrowRight } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useModals } from '../../context/ModalContext';
import { useAnalytics, getSessionIdCached } from '../../context/analytics';
import QuickReplies from './QuickReplies';

interface AIResponse {
  message: string;
  ctaText: string;
  solutionId: string;
}

const ChatModal: React.FC = () => {
  const { isChatOpen, closeChat } = useChat();
  const { openModal } = useModals();
  const { trackEvent } = useAnalytics();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [captureStep, setCaptureStep] = useState<'NAME' | 'EMAIL' | 'SUCCESS' | null>(null);
  const [leadData, setLeadData] = useState({ name: '', email: '' });
  const [inputValue, setInputValue] = useState('');

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
      // 1. Start Session
      const startRes = await fetch('/api/v1/chat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent,
          session_id: getSessionIdCached()
        })
      });

      if (!startRes.ok) throw new Error('Failed to save intent');

      // 2. Get AI Response
      const respondRes = await fetch('/api/v1/chat/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent })
      });

      if (!respondRes.ok) throw new Error('Failed to get AI response');

      const data: AIResponse = await respondRes.json();
      setAiResponse(data);

      trackEvent('intent_selected', { intent });
      trackEvent('solution_recommended', { intent, solutionId: data.solutionId });
      
    } catch (err) {
      console.error('Chat error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCtaClick = () => {
    if (!aiResponse) return;
    
    trackEvent('chat_cta_clicked', { 
      intent: selectedIntent, 
      ctaText: aiResponse.ctaText,
      solutionId: aiResponse.solutionId
    });

    if (aiResponse.solutionId === 'show_options') {
      setSelectedIntent(null);
      setAiResponse(null);
      return;
    }

    // NEW: Start lead capture flow instead of opening modal immediately
    setCaptureStep('NAME');
    trackEvent('lead_capture_started', { intent: selectedIntent });
  };

  const handleInputSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;

    if (captureStep === 'NAME') {
      setLeadData(prev => ({ ...prev, name: inputValue.trim() }));
      setInputValue('');
      setCaptureStep('EMAIL');
    } else if (captureStep === 'EMAIL') {
      const email = inputValue.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        return;
      }

      setError(null);
      setIsSubmitting(true);

      try {
        const response = await fetch('/api/v1/chat/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: leadData.name,
            email: email,
            intent: selectedIntent,
            session_id: getSessionIdCached()
          })
        });

        if (!response.ok) throw new Error('Failed to save lead');

        setLeadData(prev => ({ ...prev, email }));
        setInputValue('');
        setCaptureStep('SUCCESS');
        trackEvent('lead_captured', { intent: selectedIntent });

        // Auto-open the solution modal after a brief delay
        setTimeout(() => {
          closeChat();
          setTimeout(() => {
            openModal(aiResponse?.solutionId as any);
          }, 300);
        }, 2000);

      } catch (err) {
        console.error('Lead capture error:', err);
        setError('Failed to save your details. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
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
              {/* User Intent Message */}
              <div className="flex gap-3 justify-end animate-in fade-in slide-in-from-right-2 duration-500">
                <div className="bg-blue-600 rounded-2xl rounded-tr-none p-4 text-white text-sm leading-relaxed shadow-lg shadow-blue-900/20">
                  {selectedIntent}
                </div>
              </div>

              {/* Bot AI Response */}
              {(isSubmitting || aiResponse) && (
                <div className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-500 delay-500">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="bg-slate-800/50 rounded-2xl rounded-tl-none p-4 text-slate-200 text-sm leading-relaxed border border-white/5">
                      {isSubmitting && !captureStep ? (
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce delay-150"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce delay-300"></span>
                        </div>
                      ) : (
                        aiResponse?.message
                      )}
                    </div>

                    {/* CTA Button */}
                    {aiResponse && !isSubmitting && !captureStep && (
                      <button
                        onClick={handleCtaClick}
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all duration-200 shadow-lg shadow-blue-900/20 group animate-in slide-in-from-bottom-2 duration-500"
                      >
                        {aiResponse.ctaText}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Lead Capture Flow */}
              {captureStep && (
                <>
                  {/* User clicks CTA (implicit message) */}
                  <div className="flex gap-3 justify-end animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="bg-blue-600 rounded-2xl rounded-tr-none p-4 text-white text-sm leading-relaxed">
                      {aiResponse?.ctaText}
                    </div>
                  </div>

                  {/* Bot prompts for Name */}
                  <div className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-500">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <Bot size={16} />
                    </div>
                    <div className="bg-slate-800/50 rounded-2xl rounded-tl-none p-4 text-slate-200 text-sm leading-relaxed border border-white/5">
                      I'd love to help with that! Before we continue, what's your name?
                    </div>
                  </div>

                  {/* User Name input response */}
                  {leadData.name && (
                    <div className="flex gap-3 justify-end animate-in fade-in slide-in-from-right-2 duration-300">
                      <div className="bg-blue-600 rounded-2xl rounded-tr-none p-4 text-white text-sm leading-relaxed">
                        {leadData.name}
                      </div>
                    </div>
                  )}

                  {/* Bot prompts for Email */}
                  {captureStep !== 'NAME' && (
                    <div className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-500">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                        <Bot size={16} />
                      </div>
                      <div className="bg-slate-800/50 rounded-2xl rounded-tl-none p-4 text-slate-200 text-sm leading-relaxed border border-white/5">
                        Thanks, {leadData.name}! And what's your email so I can follow up?
                      </div>
                    </div>
                  )}

                  {/* User Email input response */}
                  {leadData.email && (
                    <div className="flex gap-3 justify-end animate-in fade-in slide-in-from-right-2 duration-300">
                      <div className="bg-blue-600 rounded-2xl rounded-tr-none p-4 text-white text-sm leading-relaxed">
                        {leadData.email}
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {captureStep === 'SUCCESS' && (
                    <div className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-500">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                        <Bot size={16} />
                      </div>
                      <div className="bg-slate-800/50 rounded-2xl rounded-tl-none p-4 text-slate-200 text-sm leading-relaxed border border-white/5">
                        Perfect! I've saved your details. Opening the solution for you now... 🚀
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-in shake duration-300">
              <AlertCircle size={14} />
              <span>{error}</span>
              {captureStep === null && (
                <button 
                  onClick={() => handleIntentSelect(selectedIntent!)}
                  className="ml-auto underline font-bold"
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer - Input enabled during lead capture */}
        <div className="p-4 border-t border-white/5 bg-slate-950/30">
          <form 
            onSubmit={handleInputSubmit}
            className={`relative group ${!captureStep || captureStep === 'SUCCESS' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input 
              type="text" 
              placeholder={
                captureStep === 'NAME' ? "Enter your name..." : 
                captureStep === 'EMAIL' ? "Enter your email..." : 
                "Type a message..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={!captureStep || captureStep === 'SUCCESS' || isSubmitting}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-4 pr-12 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <button 
              type="submit"
              disabled={!captureStep || captureStep === 'SUCCESS' || isSubmitting || !inputValue.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-500 hover:text-blue-400 transition-colors disabled:text-slate-600"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-600 mt-3 font-medium">Powered by Gemini AI</p>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
