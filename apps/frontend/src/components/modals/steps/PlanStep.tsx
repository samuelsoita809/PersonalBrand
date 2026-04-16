import React from 'react';
import { Check, Zap, TrendingUp } from 'lucide-react';
import pricingData from '../../../config/pricing-plans.json';

interface PlanStepProps {
  selectedPlanId: string;
  onNext: (planId: string) => void;
}

const PlanStep: React.FC<PlanStepProps> = ({ selectedPlanId, onNext }) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Micro Value Line - High Trust Header */}
      <div className="text-center space-y-2">
        <p className="text-blue-400 font-bold tracking-widest uppercase text-xs">Value Proposition</p>
        <h3 className="text-2xl sm:text-3xl font-black text-white italic">
           "{pricingData.microValueLine}"
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {pricingData.plans.map((plan: any) => (
          <div 
            key={plan.id}
            className={`relative p-8 rounded-3xl border transition-all cursor-pointer group flex flex-col ${
              selectedPlanId === plan.id 
                ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_40px_rgba(59,130,246,0.15)]' 
                : 'border-white/10 bg-slate-900/40 hover:border-white/20 hover:bg-slate-800/60'
            }`}
            onClick={() => onNext(plan.id)}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/20">
                Most Popular
              </span>
            )}
            
            <div className="mb-6">
              <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">{plan.description}</p>
            </div>
            
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white tracking-tight">${plan.price}</span>
              <span className="text-slate-500 text-sm font-bold">/ project</span>
            </div>

            {/* Key Results Cluster - ROI Focused */}
            <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Results You Get</span>
              </div>
              <ul className="space-y-2">
                {plan.keyResults?.map((result: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm font-bold text-blue-100">
                    <Zap size={12} className="text-blue-400 fill-blue-400" />
                    <span>{result}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300 font-medium">
                  <Check size={16} className="text-blue-500 mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <button 
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${
                selectedPlanId === plan.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                  : 'bg-white/5 text-slate-300 group-hover:bg-white/10 group-hover:text-white'
              }`}
            >
              {selectedPlanId === plan.id ? <span className="flex items-center justify-center gap-2">Selected <Check size={16} /></span> : 'Get Started Now'}
            </button>
          </div>
        ))}
      </div>
      
      <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
        Numbers = Trust • Simple Words = Clarity • Solution-Based
      </p>
    </div>
  );
};

export default PlanStep;
