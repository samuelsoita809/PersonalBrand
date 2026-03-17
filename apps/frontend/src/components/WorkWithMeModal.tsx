import React, { useState } from 'react';
import Modal from './Modal';
import { Send, CheckCircle2 } from 'lucide-react';
import { useAnalytics } from '../context/analytics';

interface WorkWithMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkWithMeModal: React.FC<WorkWithMeModalProps> = ({ isOpen, onClose }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { trackEvent } = useAnalytics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    trackEvent('modal_submit', { type: 'work_with_me' });
    setIsSubmitted(true);
    setLoading(false);
    
    // Close modal after success message
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Let's Build Something Great">
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-slate-400 text-sm mb-6">
            Looking for a technical partner or premium engineering? Tell me about your project and I'll get back to you within 24 hours.
          </p>
          
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Project Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Next-Gen Brand Identity"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Your Email</label>
            <input 
              required
              type="email" 
              placeholder="hello@company.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Brief Overview</label>
            <textarea 
              required
              rows={4}
              placeholder="How can I help you scale?"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none"
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Send size={18} />
                Send Proposal Request
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Message Received</h3>
          <p className="text-slate-400">
            Thank you for reaching out. I've received your inquiry and will review it shortly.
          </p>
        </div>
      )}
    </Modal>
  );
};

export default WorkWithMeModal;
