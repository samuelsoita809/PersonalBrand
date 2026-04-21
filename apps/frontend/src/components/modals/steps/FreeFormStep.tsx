import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Send } from 'lucide-react';
import freeConfig from '../../../config/free-services.json';

const freeFormSchema = z.object({
  name: z.string().min(1, 'Full Name is required'),
  email: z.string().email('Invalid email address'),
  url: z.string().url('Invalid website URL').optional().or(z.literal('')),
  frequency: z.string().optional(),
  message: z.string().min(10, 'Please provide a bit more detail (min 10 characters)')
});

type FreeFormValues = z.infer<typeof freeFormSchema>;

interface FreeFormStepProps {
  serviceId: string;
  initialData: any;
  onNext: (data: FreeFormValues) => void;
  onBack: () => void;
}

const FreeFormStep: React.FC<FreeFormStepProps> = ({ serviceId, initialData, onNext, onBack }) => {
  const service = freeConfig.services.find(s => s.id === serviceId);
  
  const { register, handleSubmit, formState: { errors, isValid } } = useForm<FreeFormValues>({
    resolver: zodResolver(freeFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: initialData.name || '',
      email: initialData.email || '',
      url: initialData.url || '',
      frequency: initialData.frequency || (service?.frequencyOptions?.[0] || ''),
      message: initialData.message || ''
    }
  });

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Selected Service</p>
          <div className="flex items-center gap-3">
             <span className="text-white font-black text-xl italic tracking-tight">{service?.title}</span>
          </div>
        </div>
        <button 
          onClick={onBack}
          aria-label="Back to Services"
          className="p-3 bg-white/5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-2xl transition-all"
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
                errors.name ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-blue-500'
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
                errors.email ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-blue-500'
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.email.message}</p>}
          </div>
        </div>

        {serviceId === 'website_audit' && (
          <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-500">
            <label htmlFor="url" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Website URL</label>
            <input
              {...register('url')}
              id="url"
              type="url"
              placeholder="https://yourwebsite.com"
              className={`w-full px-5 py-4 bg-slate-950/50 border rounded-2xl text-white font-medium outline-none transition-all ${
                errors.url ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-blue-500'
              }`}
            />
            {errors.url && <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.url.message}</p>}
          </div>
        )}

        {serviceId === 'tech_catchup' && service?.frequencyOptions && (
          <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-500">
            <label htmlFor="frequency" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">How often should we catch up?</label>
            <select
              {...register('frequency')}
              id="frequency"
              className="w-full px-5 py-4 bg-slate-950/50 border border-white/10 rounded-2xl text-white font-medium outline-none transition-all focus:border-blue-500 appearance-none cursor-pointer"
            >
              {service.frequencyOptions.map((opt: string) => (
                <option key={opt} value={opt} className="bg-slate-900">{opt}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label htmlFor="message" className="text-xs font-black uppercase tracking-widest text-slate-400">
              {service?.intentLabel || 'How can I help you?'}
            </label>
          </div>
          <textarea
            {...register('message')}
            id="message"
            placeholder="Provide context to help me prepare..."
            className={`w-full px-5 py-4 min-h-[160px] bg-slate-950/50 border rounded-2xl text-white font-medium outline-none transition-all resize-none ${
              errors.message ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-blue-500'
            }`}
          />
          {errors.message && <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors.message.message}</p>}
        </div>

        <div className="flex items-center justify-end pt-6">
          <button
            type="submit"
            className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
              isValid 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/25 hover:bg-blue-500 hover:-translate-y-1' 
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

export default FreeFormStep;
