import React, { useState } from 'react';
import Modal from './Modal';
import { Mail, Linkedin, Twitter, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAnalytics } from '../context/analytics';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const connectSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  message: z.string().min(5, 'Message is too short (min 5 chars)'),
});

type ConnectFormData = z.infer<typeof connectSchema>;

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { trackEvent } = useAnalytics();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ConnectFormData>({
    resolver: zodResolver(connectSchema),
  });

  const handleQuickConnect = async (platform: string) => {
    trackEvent('cta_connect_click', { platform });
    window.open(platform === 'linkedin' ? 'https://linkedin.com' : 'https://twitter.com', '_blank');
  };

  const onSubmit = async (data: ConnectFormData) => {
    setLoading(true);
    
    // Simulate API call (DevSecOps - Build Logic)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    trackEvent('modal_submit', { type: 'connect_with_me' });
    setIsSubmitted(true);
    setLoading(false);
    reset();
    
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect & Network">
      {!isSubmitted ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Social Links */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleQuickConnect('linkedin')}
              className="flex items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-slate-300 hover:text-white group"
            >
              <Linkedin size={20} className="text-blue-400 group-hover:scale-110 transition-transform" />
              <span>LinkedIn</span>
            </button>
            <button 
              onClick={() => handleQuickConnect('twitter')}
              className="flex items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-slate-300 hover:text-white group"
            >
              <Twitter size={20} className="text-sky-400 group-hover:scale-110 transition-transform" />
              <span>Twitter / X</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500 font-bold tracking-widest">Or Send a Direct Message</span>
            </div>
          </div>

          {/* Direct Message Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Email</label>
              <input 
                {...register('email')}
                type="email" 
                placeholder="your@email.com"
                className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all`}
              />
              {errors.email && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Message</label>
              <textarea 
                {...register('message')}
                rows={3}
                placeholder="Let's discuss something amazing..."
                className={`w-full bg-white/5 border ${errors.message ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all resize-none`}
              ></textarea>
              {errors.message && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.message.message}
                </p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Mail size={18} />
                  Send Quick Note
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={32} className="text-purple-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Connected!</h3>
          <p className="text-slate-400">
            I've received your note and will reach back shortly. Looking forward to it!
          </p>
        </div>
      )}
    </Modal>
  );
};

export default ConnectModal;
