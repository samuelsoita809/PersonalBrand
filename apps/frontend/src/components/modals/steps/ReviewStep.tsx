import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, Zap } from 'lucide-react';
import type { FormData } from '../DeliverProjectModal';
import pricingData from '../../../config/pricing-plans.json';

interface ReviewStepProps {
  formData: FormData;
  onNext: () => void;
  onBack: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ formData, onNext, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedPlan = pricingData.plans.find(p => p.id === formData.planId) as any;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await onNext();
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto">
      {/* Final Value Reinforcement */}
      <div className="text-center p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10 mb-2">
         <p className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Final Review</p>
         <h3 className="text-xl font-bold text-white italic">
            "{pricingData.microValueLine}"
         </h3>
      </div>

      <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Plan Header */}
        <div className="p-8 bg-gradient-to-r from-blue-600/20 to-transparent border-b border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Selected Strategy</span>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">{selectedPlan?.name}</h3>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-white tracking-tighter">${selectedPlan?.price}</span>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Fixed Price</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client</span>
              <p className="text-white font-bold">{formData.name}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email</span>
              <p className="text-white font-bold truncate">{formData.email}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Type</span>
              <p className="text-white font-bold">{formData.projectType}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Delivery</span>
              <p className="text-blue-400 font-black">{selectedPlan?.delivery}</p>
            </div>
          </div>

          <div className="space-y-2 pt-6 border-t border-white/5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expected Results</span>
            <div className="flex flex-wrap gap-2 pt-1">
                {selectedPlan?.keyResults?.map((result: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-300 text-[10px] font-black rounded-lg border border-blue-500/20 flex items-center gap-1.5">
                        <Zap size={10} className="fill-blue-400 text-blue-400" />
                        {result}
                    </span>
                ))}
            </div>
          </div>

          <div className="space-y-2 pt-6 border-t border-white/5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Brief</span>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
              {formData.description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
        <button 
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-slate-400 hover:text-white font-bold transition-all disabled:opacity-50 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Edit Details
        </button>
        <button 
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="w-full flex-1 flex items-center justify-center gap-2 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processing Your Order...
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              Confirm & Start Delivery
            </>
          )}
        </button>
      </div>

      <p className="text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
        Numbers = Trust • Simple Words = Clarity • Fast Scanning
      </p>
    </div>
  );
};

export default ReviewStep;
