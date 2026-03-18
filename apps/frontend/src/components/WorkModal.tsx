import React, { useState } from 'react';
import Modal from './Modal';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAnalytics } from '../context/analytics';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const workSchema = z.object({
  projectName: z.string().min(2, 'Project name must be at least 2 characters'),
  email: z.string().email('Please enter a valid business email'),
  message: z.string().min(10, 'Please provide a bit more detail (min 10 chars)'),
});

type WorkFormData = z.infer<typeof workSchema>;

interface WorkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkModal: React.FC<WorkModalProps> = ({ isOpen, onClose }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { trackEvent } = useAnalytics();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<WorkFormData>({
    resolver: zodResolver(workSchema),
  });

  const onSubmit = async (data: WorkFormData) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/v1/hero/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.projectName,

          email: data.email,
          message: data.message
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      trackEvent('modal_submit', { 
        type: 'work',
        projectName: data.projectName 
      });
      
      setIsSubmitted(true);
      reset();
      
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Submission error:', error);

      trackEvent('modal_submit_failure', { error: 'API_ERROR' });
    } finally {
      setLoading(false);
    }

  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Let's Build Something Great">
      {!isSubmitted ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-slate-400 text-sm mb-6">
            Looking for a technical partner or premium engineering? Tell me about your project and I'll get back to you within 24 hours.
          </p>
          
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Project Name</label>
            <input 
              {...register('projectName')}
              placeholder="e.g. Next-Gen Brand Identity"
              className={`w-full bg-white/5 border ${errors.projectName ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all`}
            />
            {errors.projectName && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <AlertCircle size={12} /> {errors.projectName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Your Email</label>
            <input 
              {...register('email')}
              type="email" 
              placeholder="hello@company.com"
              className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all`}
            />
            {errors.email && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <AlertCircle size={12} /> {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Brief Overview</label>
            <textarea 
              {...register('message')}
              rows={4}
              placeholder="How can I help you scale?"
              className={`w-full bg-white/5 border ${errors.message ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none`}
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

export default WorkModal;
