import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface SuccessStepProps {
  onClose: () => void;
  title?: string;
  description?: string;
  steps?: { title: string; description: string }[];
  action?: { label: string; url: string; icon?: React.ReactNode };
}

const SuccessStep: React.FC<SuccessStepProps> = ({ 
  onClose, 
  title = "Project Request Sent!", 
  description = "Thank you for reaching out. I've received your project details and will review them personally. Expect a response within the next 24 hours.",
  steps = [
    { title: "Step 1", description: "Initial review of your project requirements." },
    { title: "Step 2", description: "Strategy call to align on technical details." }
  ],
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in-95 duration-700">
      <div className="mb-8 p-4 bg-blue-500/10 rounded-full animate-bounce duration-1000">
        <CheckCircle2 size={80} className="text-blue-500" />
      </div>

      <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
        {title}
      </h2>
      
      <p className="text-lg text-slate-400 max-w-md mx-auto mb-10 leading-relaxed">
        {description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mb-12 text-left">
        {steps.map((step, index) => (
          <div key={index} className={`p-4 bg-white/5 border border-white/5 rounded-2xl ${index > 0 ? 'opacity-60' : ''}`}>
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">{step.title}</p>
            <p className="text-sm text-slate-300">{step.description}</p>
          </div>
        ))}
      </div>

      {action && (
        <a 
          href={action.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/20 mb-4 uppercase tracking-widest text-sm"
        >
          {action.icon || <ArrowRight size={20} />}
          {action.label}
        </a>
      )}

      <button 
        onClick={onClose}
        className="flex items-center gap-2 px-10 py-4 bg-white/5 text-slate-300 font-bold rounded-2xl hover:bg-white/10 transition-all transform hover:scale-105 active:scale-95 border border-white/10"
      >
        Return to Site
        <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default SuccessStep;
