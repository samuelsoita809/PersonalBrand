import React, { useState } from 'react';
import Modal from './Modal';
import { Send, CheckCircle2, AlertCircle, ChevronRight, Armchair, Rocket, Coffee, Search, Clock, Users } from 'lucide-react';
import { useAnalytics } from '../context/analytics';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define the pricing matrix
const PRICING_MATRIX: Record<string, any[]> = {
  'deliver-project': [
    { id: 'mvp-sprint', label: 'MVP Sprint', price: '$2,500', description: 'Core features, fast turnaround (2 weeks).' },
    { id: 'product-launch', label: 'Product Launch', price: '$7,500', description: 'Full production-ready app, testing, deployment.' },
    { id: 'enterprise', label: 'Enterprise Scale', price: '$15,000+', description: 'Scalable architecture, security audit, ongoing support.' },
  ],
  'mentor-me': [
    { id: 'focused-session', label: 'Focused Session', price: '$150/hr', description: 'Single session for specific technical blockages.' },
    { id: 'monthly-growth', label: 'Monthly Growth', price: '$1,200/mo', description: 'Weekly sessions, code reviews, async support.' },
    { id: 'career-accelerator', label: 'Career Accelerator', price: '$3,000/mo', description: 'Intensive daily support and personal roadmap.' },
  ],
  'coffee-consult': [
    { id: 'quick-brainstorm', label: 'Quick Brainstorm', price: '$100', description: '30 min chat for high-level technical ideas.' },
    { id: 'strategy-deep-dive', label: 'Strategy Deep Dive', price: '$450', description: '2 hour architecture and roadmap review.' },
    { id: 'executive-partner', label: 'Executive Partner', price: '$1,500', description: 'Full day of strategic consulting and team assessment.' },
  ],
};

const WORK_OPTIONS = [
  { id: 'deliver-project', label: 'Deliver My Project', desc: 'End-to-end technical delivery', icon: Rocket },
  { id: 'mentor-me', label: 'Mentor Me', desc: '1-on-1 technical guidance', icon: Armchair },
  { id: 'coffee-consult', label: 'Coffee With Me', desc: 'Discuss ideas & Get Quick Fixes', icon: Coffee },
];

const HELP_OPTIONS = [
  { id: 'audit', label: 'Audit (Review) my Website', desc: 'Technical performance & UX audit', icon: Search },
  { id: 'chat', label: '15 Minutes Chat', desc: 'Quick technical Q&A session', icon: Clock },
  { id: 'catchup', label: '1-2-Many Tech CatchUp', desc: 'Group sessions or team syncing', icon: Users },
];

const workSchema = z.object({
  projectName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid business email'),
  message: z.string().min(10, 'Please provide a bit more detail (min 10 chars)'),
});

type WorkFormData = z.infer<typeof workSchema>;

interface WorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  journeyType: 'work' | 'help';
}

const WorkModal: React.FC<WorkModalProps> = ({ isOpen, onClose, journeyType }) => {
  const [step, setStep] = useState<'selection' | 'pricing' | 'details' | 'success'>('selection');
  const [journey, setJourney] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
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
    trackEvent('journey_select', { journeyType, journeyId: id });
    
    // Help journey skips pricing for now
    if (journeyType === 'help') {
      setStep('details');
    } else {
      setStep('pricing');
    }
  };

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
    trackEvent('plan_select', { journeyId: journey, planId: plan.id });
    setStep('details');
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
          message: `[Type: ${journeyType}] [Journey: ${journey}] ${selectedPlan ? `[Plan: ${selectedPlan.label}]` : ''} ${data.message}`
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      trackEvent('modal_submit', { 
        type: journeyType,
        journey,
        plan: selectedPlan?.id,
        name: data.projectName 
      });
      
      setStep('success');
      reset();
      
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (error) {
      console.error('Submission error:', error);
      trackEvent('modal_submit_failure', { error: 'API_ERROR' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
        setStep('selection');
        setJourney(null);
        setSelectedPlan(null);
    }, 500);
  };

  const getTitle = () => {
    if (step === 'success') return "Success!";
    if (journeyType === 'help') {
        return step === 'selection' ? "How Can I Help You?" : "Request Your " + journey?.replace('-', ' ');
    }
    switch (step) {
      case 'selection': return "Start Your Journey";
      case 'pricing': return "Select Your Plan";
      case 'details': return "A Few More Details";
      default: return "Work With Me";
    }
  };

  const options = journeyType === 'work' ? WORK_OPTIONS : HELP_OPTIONS;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getTitle()}>
      {step === 'success' ? (
        <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Request Received</h3>
          <p className="text-slate-400">
            Thank you for reaching out. I've received your inquiry for <span className="text-blue-400 font-bold">{journey?.replace('-', ' ')}</span> and will review it shortly.
          </p>
        </div>
      ) : step === 'selection' ? (
        <div className="grid grid-cols-1 gap-4 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => handleSelection(option.id)}
                className="group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 hover:border-blue-500/30 transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Icon size={80} />
                </div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                        <Icon size={24} />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{option.label}</div>
                      <div className="text-sm text-slate-400">{option.desc}</div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            )
          })}
        </div>
      ) : step === 'pricing' ? (
        <div className="space-y-4 py-4 animate-in fade-in slide-in-from-right-4 duration-500">
          <button 
            onClick={() => setStep('selection')}
            className="text-xs font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-1 mb-2"
          >
            ← BACK TO SERVICES
          </button>
          <div className="grid grid-cols-1 gap-4">
            {journey && PRICING_MATRIX[journey] && PRICING_MATRIX[journey].map((plan) => (
              <button
                key={plan.id}
                onClick={() => handlePlanSelect(plan)}
                className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 hover:border-green-500/30 transition-all flex justify-between items-center"
              >
                <div className="space-y-1">
                  <div className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">{plan.label}</div>
                  <div className="text-sm text-slate-400">{plan.description}</div>
                </div>
                <div className="text-xl font-bold text-white bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
                    {plan.price}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex items-center gap-2 mb-6">
            <button 
              onClick={() => journeyType === 'work' ? setStep('pricing') : setStep('selection')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase"
            >
              ← {selectedPlan?.label || 'Selection'}
            </button>
            <span className="text-xs text-slate-600">/</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{journey?.replace('-', ' ')}</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Your Name / Project Title</label>
            <input 
              {...register('projectName')}
              placeholder="e.g. Samuel Soita / Website Audit"
              className={`w-full bg-white/5 border ${errors.projectName ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600`}
            />
            {errors.projectName && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <AlertCircle size={12} /> {errors.projectName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Business Email</label>
            <input 
              {...register('email')}
              type="email" 
              placeholder="hello@company.com"
              className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600`}
            />
            {errors.email && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <AlertCircle size={12} /> {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Details</label>
            <textarea 
              {...register('message')}
              rows={4}
              placeholder="Tell me more about how I can help..."
              className={`w-full bg-white/5 border ${errors.message ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none placeholder:text-slate-600`}
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
