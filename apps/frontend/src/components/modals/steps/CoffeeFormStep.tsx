import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, ArrowLeft, Send } from 'lucide-react';

const coffeeFormSchema = z.object({
  name: z.string().min(1, 'Full Name is required'),
  email: z.string().email('Invalid email address'),
  description: z.string().min(10, 'Please provide at least 10 characters describing what you need help with')
});

type CoffeeFormValues = z.infer<typeof coffeeFormSchema>;

interface CoffeeFormStepProps {
  initialData: any;
  onNext: (data: CoffeeFormValues) => void;
  onBack: () => void;
}

const CoffeeFormStep: React.FC<CoffeeFormStepProps> = ({ initialData, onNext, onBack }) => {
  const { register, handleSubmit, formState: { errors, isValid } } = useForm<CoffeeFormValues>({
    resolver: zodResolver(coffeeFormSchema),
    defaultValues: {
      name: initialData.name || '',
      email: initialData.email || '',
      description: initialData.description || ''
    }
  });

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 p-6 bg-amber-500/5 rounded-3xl border border-amber-500/10 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">Selected Consultancy</p>
          <div className="flex items-center gap-3">
             <span className="text-white font-black text-lg">{initialData.optionId}</span>
             <span className="text-slate-500 font-bold">•</span>
             <span className="text-amber-200 font-bold uppercase text-xs tracking-widest">{initialData.planId} Plan</span>
          </div>
        </div>
        <button 
          onClick={onBack}
          aria-label="Back to Plans"
          className="p-2 text-slate-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-bold text-slate-300 ml-1">Full Name</label>
            <input
              {...register('name')}
              id="name"
              placeholder="Your name"
              className={`w-full px-5 py-4 bg-slate-950/50 border rounded-2xl text-white outline-none transition-all ${
                errors.name ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-amber-500'
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-bold text-slate-300 ml-1">Email Address</label>
            <input
              {...register('email')}
              id="email"
              type="email"
              placeholder="your@email.com"
              className={`w-full px-5 py-4 bg-slate-950/50 border rounded-2xl text-white outline-none transition-all ${
                errors.email ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-amber-500'
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.email.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-bold text-slate-300 ml-1">What do you need help with?</label>
          <textarea
            {...register('description')}
            id="description"
            placeholder="Describe your challenge, idea, or questions... Get clear. Move fast."
            className={`w-full px-5 py-4 min-h-[160px] bg-slate-950/50 border rounded-2xl text-white outline-none transition-all resize-none ${
              errors.description ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-amber-500'
            }`}
          />
          {errors.description && <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.description.message}</p>}
        </div>

        <div className="flex items-center justify-between pt-6">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic">
            Ready to Pay • Strategic Focus
          </p>
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
