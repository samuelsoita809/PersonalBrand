import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Send, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

const coffeeFormSchema = z.object({
  name: z.string().min(1, 'Full Name is required'),
  email: z.string().email('Invalid email address'),
  idea: z.string().min(20, 'Please provide at least 20 characters to help me understand your context'),
  urgency: z.enum(['low', 'medium', 'high'])
});

type CoffeeFormValues = z.infer<typeof coffeeFormSchema>;

interface CoffeeFormStepProps {
  initialData: any;
  onNext: (data: CoffeeFormValues) => void;
  onBack: () => void;
}

const CoffeeFormStep: React.FC<CoffeeFormStepProps> = ({ initialData, onNext, onBack }) => {
  const [selectedUrgency, setSelectedUrgency] = useState<'low' | 'medium' | 'high'>(initialData.urgency || 'medium');
  
  const { register, handleSubmit, watch, formState: { errors, isValid }, setValue } = useForm<CoffeeFormValues>({
    resolver: zodResolver(coffeeFormSchema),
    defaultValues: {
      name: initialData.name || '',
      email: initialData.email || '',
      idea: initialData.idea || '',
      urgency: initialData.urgency || 'medium'
    }
  });

  const ideaText = watch('idea');
  const isVague = ideaText.length > 0 && ideaText.length < 50;

  const handleUrgencyChange = (val: 'low' | 'medium' | 'high') => {
    setSelectedUrgency(val);
    setValue('urgency', val, { shouldValidate: true });
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 p-6 bg-amber-500/5 rounded-3xl border border-amber-500/10 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">Selected Plan</p>
          <div className="flex items-center gap-3">
             <span className="text-white font-black text-xl italic tracking-tight">{initialData.planId.toUpperCase()}</span>
             <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-tighter">Verified Priority</span>
          </div>
        </div>
        <button 
          onClick={onBack}
          aria-label="Back to Plans"
          className="p-3 bg-white/5 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-2xl transition-all"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
            <input
              {...register('name')}
              id="name"
              placeholder="Your name"
              className={`w-full px-5 py-4 bg-slate-950/50 border rounded-2xl text-white font-medium outline-none transition-all ${
                errors.name ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-amber-500'
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
            <input
              {...register('email')}
              id="email"
              type="email"
              placeholder="your@email.com"
              className={`w-full px-5 py-4 bg-slate-950/50 border rounded-2xl text-white font-medium outline-none transition-all ${
                errors.email ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-amber-500'
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.email.message}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Submission Urgency</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'low', label: 'Low', icon: ShieldCheck, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
              { id: 'medium', label: 'Medium', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
              { id: 'high', label: 'High', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' }
            ].map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleUrgencyChange(u.id as any)}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  selectedUrgency === u.id 
                    ? `bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20`
                    : `bg-slate-950/50 border-white/10 text-slate-400 hover:border-white/20`
                }`}
              >
                <u.icon size={20} className={selectedUrgency === u.id ? 'text-white' : u.color} />
                <span className="text-[10px] font-black uppercase tracking-widest">{u.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label htmlFor="idea" className="text-xs font-black uppercase tracking-widest text-slate-400">Tell me about your idea or problem</label>
            {isVague && (
              <span className="text-[10px] font-black text-amber-500 animate-pulse">⚠️ DETAILS MATTER</span>
            )}
          </div>
          <textarea
            {...register('idea')}
            id="idea"
            placeholder="Describe your challenge in detail. More context = better results. What are you building? Where are you stuck?"
            className={`w-full px-5 py-4 min-h-[160px] bg-slate-950/50 border rounded-2xl text-white font-medium outline-none transition-all resize-none ${
              errors.idea ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-amber-500'
            }`}
          />
          {errors.idea && <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.idea.message}</p>}
          {isVague && (
            <p className="text-[10px] text-amber-500/80 font-bold mt-2 ml-1 italic">
              Pro tip: Providing more details about your current roadblocks helps me prepare a more impactful session for you.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end pt-6">
          <button
            type="submit"
            className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
              isValid 
                ? 'bg-amber-600 text-white shadow-xl shadow-amber-500/25 hover:bg-amber-500 hover:-translate-y-1' 
                : 'bg-white/5 text-slate-500 cursor-not-allowed'
            }`}
          >
            Submit Request
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CoffeeFormStep;
