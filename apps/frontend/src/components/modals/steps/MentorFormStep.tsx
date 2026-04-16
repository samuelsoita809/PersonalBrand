import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const mentorFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  level: z.string().min(1, 'Please select your current level'),
  goal: z.string().min(1, 'Please select a primary goal'),
  description: z.string().min(10, 'Please provide at least 10 characters')
});

type MentorFormValues = z.infer<typeof mentorFormSchema>;

interface MentorFormStepProps {
  initialData: any;
  onNext: (data: Partial<any>) => void;
  onBack: () => void;
}

const MentorFormStep: React.FC<MentorFormStepProps> = ({ initialData, onNext, onBack }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<MentorFormValues>({
    resolver: zodResolver(mentorFormSchema),
    defaultValues: {
      name: initialData.name,
      email: initialData.email,
      level: initialData.level,
      goal: initialData.goal,
      description: initialData.description
    }
  });

  const onSubmit = (data: MentorFormValues) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-300">Full Name</label>
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
          <label htmlFor="email" className="text-sm font-medium text-slate-300">Email Address</label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="level" className="text-sm font-medium text-slate-300">Current Level</label>
          <select 
            id="level"
            {...register('level')}
            className={`w-full px-4 py-3 bg-slate-950/50 border rounded-xl text-white outline-none transition-all appearance-none cursor-pointer ${
              errors.level ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-blue-500'
            }`}
          >
            <option value="" className="bg-slate-900">Select Level</option>
            <option value="Beginner" className="bg-slate-900">Beginner</option>
            <option value="Intermediate" className="bg-slate-900">Intermediate</option>
            <option value="Advanced" className="bg-slate-900">Advanced</option>
          </select>
          {errors.level && <p className="text-xs text-red-500 mt-1">{errors.level.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="goal" className="text-sm font-medium text-slate-300">Primary Goal</label>
          <select 
            id="goal"
            {...register('goal')}
            className={`w-full px-4 py-3 bg-slate-950/50 border rounded-xl text-white outline-none transition-all appearance-none cursor-pointer ${
              errors.goal ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-blue-500'
            }`}
          >
            <option value="" className="bg-slate-900">Select Goal</option>
            <option value="Get a job" className="bg-slate-900">Get a job</option>
            <option value="Improve skills" className="bg-slate-900">Improve skills</option>
            <option value="Build projects" className="bg-slate-900">Build projects</option>
            <option value="Career advice" className="bg-slate-900">Career advice</option>
          </select>
          {errors.goal && <p className="text-xs text-red-500 mt-1">{errors.goal.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-slate-300">Learning Goals & Details</label>
        <textarea 
          id="description"
          {...register('description')}
          className={`w-full px-4 py-3 min-h-[120px] bg-slate-950/50 border rounded-xl text-white outline-none transition-all resize-none ${
            errors.description ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-blue-500'
          }`}
          placeholder="Tell me more about what you want to achieve..."
        />
        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <button 
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Plans
        </button>
        <button 
          type="submit"
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all"
        >
          Submit Request
          <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
};

export default MentorFormStep;
