import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { FormData } from '../DeliverProjectModal';

const detailsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  projectType: z.string().min(1, 'Please select a project type'),
  description: z.string().min(10, 'Please provide at least 10 characters')
});

type ProjectDetails = z.infer<typeof detailsSchema>;

interface DetailsStepProps {
  initialData: FormData;
  onNext: (data: Partial<FormData>) => void;
  onBack: () => void;
}

const DetailsStep: React.FC<DetailsStepProps> = ({ initialData, onNext, onBack }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ProjectDetails>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      name: initialData.name,
      email: initialData.email,
      projectType: initialData.projectType,
      description: initialData.description
    }
  });

  const onSubmit = (data: ProjectDetails) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-300">Name</label>
          <input 
            id="name"
            {...register('name')}
            className={`w-full px-4 py-3 bg-slate-950/50 border rounded-xl text-white outline-none transition-all ${
              errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-blue-500'
            }`}
            placeholder="Your name"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-300">Email</label>
          <input 
            id="email"
            {...register('email')}
            className={`w-full px-4 py-3 bg-slate-950/50 border rounded-xl text-white outline-none transition-all ${
              errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-blue-500'
            }`}
            placeholder="your@email.com"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="projectType" className="text-sm font-medium text-slate-300">Project Type</label>
        <select 
          id="projectType"
          {...register('projectType')}
          className={`w-full px-4 py-3 bg-slate-950/50 border rounded-xl text-white outline-none transition-all appearance-none cursor-pointer ${
            errors.projectType ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-blue-500'
          }`}
        >
          <option value="" className="bg-slate-900">Select Project Type</option>
          <option value="Web Application" className="bg-slate-900">Web Application</option>
          <option value="Mobile App" className="bg-slate-900">Mobile App</option>
          <option value="Landing Page" className="bg-slate-900">Landing Page</option>
          <option value="Full MVP Development" className="bg-slate-900">Full MVP Development</option>
          <option value="Technical Consultation" className="bg-slate-900">Technical Consultation</option>
        </select>
        {errors.projectType && <p className="text-xs text-red-500 mt-1">{errors.projectType.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-slate-300">Description</label>
        <textarea 
          id="description"
          {...register('description')}
          className={`w-full px-4 py-3 min-h-[120px] bg-slate-950/50 border rounded-xl text-white outline-none transition-all resize-none ${
            errors.description ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-blue-500'
          }`}
          placeholder="Briefly describe your project goals..."
        />
        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <button 
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Plans
        </button>
        <button 
          type="submit"
          className="flex items-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg transition-all"
        >
          Review Selection
          <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
};

export default DetailsStep;
