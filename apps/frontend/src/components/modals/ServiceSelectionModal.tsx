import React from 'react';
import { X, Rocket, Target } from 'lucide-react';

interface ServiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectService: (serviceId: string) => void;
}

const ServiceSelectionModal: React.FC<ServiceSelectionModalProps> = ({ isOpen, onClose, onSelectService }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-blue-500/10 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Choose How You Want to Work Together
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <p className="text-slate-400 text-lg">
            Select a service to start your journey. Each path is specialized for your unique needs.
          </p>

          <div className="grid gap-4">
            {/* Active Path: Deliver My Project */}
            <button
              onClick={() => onSelectService('deliver_project')}
              className="group relative flex items-center p-6 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 rounded-2xl transition-all duration-300 text-left overflow-hidden translate-y-0 active:translate-y-1"
            >
              <div className="mr-6 p-4 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                <Rocket className="text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-transform duration-300" size={32} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-white">Deliver My Project</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
                    Active
                  </span>
                </div>
                <p className="text-slate-400 text-sm italic">
                  (Execution, delivery, business results)
                </p>
              </div>
              
              {/* Subtle accent hover effect */}
              <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            </button>

            {/* Path: Mentor Me */}
            <button
              onClick={() => onSelectService('mentor_me')}
              className="group relative flex items-center p-6 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-emerald-500/50 rounded-2xl transition-all duration-300 text-left overflow-hidden translate-y-0 active:translate-y-1"
            >
              <div className="mr-6 p-4 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                <Target className="text-emerald-400 group-hover:text-emerald-300 group-hover:scale-110 transition-transform duration-300" size={32} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-white">Mentor Me</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                    New
                  </span>
                </div>
                <p className="text-slate-400 text-sm italic">
                  (Growth, skills, career results)
                </p>
              </div>
              
              {/* Subtle accent hover effect */}
              <div className="absolute right-0 top-0 h-full w-1 bg-emerald-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-900/80 border-t border-white/5 text-center">
          <p className="text-xs text-slate-500">
            Secure processing • High-performance delivery focused
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionModal;
