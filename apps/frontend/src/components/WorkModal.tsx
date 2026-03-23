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
  const [step, setStep] = useState<'selection' | 'form'>('selection');
  const [journey, setJourney] = useState<string | null>(null);
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

  const handleSelection = (id: string) => {
    setJourney(id);
    trackEvent('journey_select', { journeyId: id });
    setStep('form');
  };

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
          message: `[Journey: ${journey}] ${data.message}`
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      trackEvent('modal_submit', { 
        type: 'work',
        journey,
        projectName: data.projectName 
      });
      
      setIsSubmitted(true);
      reset();
      
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setStep('selection');
        setJourney(null);
      }, 3000);
    } catch (error) {
      console.error('Submission error:', error);
      trackEvent('modal_submit_failure', { error: 'API_ERROR' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={step === 'selection' ? "How can I help you?" : "Let's Get Started"}>
      {isSubmitted ? (
        <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Message Received</h3>
          <p className="text-slate-400">
            Thank you for reaching out. I've received your inquiry and will review it shortly.
          </p>
        </div>
      ) : step === 'selection' ? (
        <div className="grid grid-cols-1 gap-4 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {[
            { id: 'deliver', label: 'Deliver Project', desc: 'End-to-end technical delivery' },
            { id: 'mentor', label: 'Mentor Me', desc: '1-on-1 technical guidance' },
            { id: 'coffee', label: 'Coffee', desc: 'Discuss ideas & networking' },
            { id: 'problem', label: 'Solve a Problem', desc: 'Technical audit or quick fix' },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelection(option.id)}
              className="group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{option.label}</div>
                  <div className="text-sm text-slate-400">{option.desc}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all">
                  <Send size={18} className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-6">
            <button 
              onClick={() => setStep('selection')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← CHANGE JOURNEY
            </button>
            <span className="text-xs text-slate-600">/</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{journey?.replace('-', ' ')}</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Project / Topic Name</label>
            <input 
              {...register('projectName')}
              placeholder="e.g. Scalable API Design"
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
                Send Request
              </>
            )}
          </button>
        </form>
      )}
    </Modal>
  );
};

export default WorkModal;
