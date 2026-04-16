import React from 'react';
import { Check, Star, Shield, Trophy } from 'lucide-react';
import coffeeConfig from '../../../config/coffee-config.json';

interface CoffeePlan {
  id: string;
  title: string;
  price: string;
  features: string[];
}

interface CoffeePlanStepProps {
  selectedPlanId: string;
  onSelect: (planId: string) => void;
}

const CoffeePlanStep: React.FC<CoffeePlanStepProps> = ({ selectedPlanId, onSelect }) => {
  const plans = coffeeConfig.plans as CoffeePlan[];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <p className="text-blue-400 font-bold tracking-widest uppercase text-xs">Pricing Tiers</p>
        <h3 className="text-2xl sm:text-3xl font-black text-white italic tracking-tight">
           Scale Your Clarity
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative p-8 rounded-3xl border transition-all cursor-pointer group flex flex-col ${
              selectedPlanId === plan.id 
                ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_40px_rgba(59,130,246,0.15)]' 
                : 'border-white/10 bg-slate-900/40 hover:border-white/20 hover:bg-slate-800/60'
            }`}
            onClick={() => onSelect(plan.id)}
          >
            <div className="mb-6 flex justify-between items-start">
              <h3 className="text-2xl font-black text-white">{plan.title}</h3>
              {plan.id === 'growth' && <Star size={20} className="text-blue-400 fill-blue-400" />}
              {plan.id === 'pro' && <Trophy size={20} className="text-blue-400 fill-blue-400" />}
            </div>

            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white tracking-tight">{plan.price}</span>
              <span className="text-slate-500 text-sm font-bold">/ session</span>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, i) => (
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
              {selectedPlanId === plan.id ? <span className="flex items-center justify-center gap-2">Selected <Check size={16} /></span> : 'Choose Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoffeePlanStep;
