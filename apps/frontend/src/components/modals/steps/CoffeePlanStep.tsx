import React from 'react';
import { Check, Star, Shield, Trophy } from 'lucide-react';
import coffeeConfig from '../../../config/coffee-config.json';

interface CoffeePlanStepProps {
  selectedPlanId: string;
  onSelect: (planId: string) => void;
  onBack: () => void;
}

const CoffeePlanStep: React.FC<CoffeePlanStepProps> = ({ selectedPlanId, onSelect, onBack }) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <p className="text-amber-400 font-bold tracking-widest uppercase text-xs">Pricing Tiers</p>
        <h3 className="text-2xl sm:text-3xl font-black text-white italic">
           Scale Your Clarity
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {coffeeConfig.plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative p-8 rounded-3xl border transition-all cursor-pointer group flex flex-col ${
              selectedPlanId === plan.id 
                ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_40px_rgba(245,158,11,0.15)]' 
                : 'border-white/10 bg-slate-900/40 hover:border-white/20 hover:bg-slate-800/60'
            }`}
            onClick={() => onSelect(plan.id)}
          >
            <div className="mb-6 flex justify-between items-start">
              <h3 className="text-2xl font-black text-white">{plan.title}</h3>
              {plan.id === 'growth' && <Star size={20} className="text-amber-400 fill-amber-400" />}
              {plan.id === 'pro' && <Trophy size={20} className="text-amber-400 fill-amber-400" />}
            </div>

            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white tracking-tight">{plan.price}</span>
              <span className="text-slate-500 text-sm font-bold">/ session</span>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300 font-medium">
                  <Check size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <button 
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${
                selectedPlanId === plan.id 
                  ? 'bg-amber-600 text-white shadow-xl shadow-amber-500/20' 
                  : 'bg-white/5 text-slate-300 group-hover:bg-white/10 group-hover:text-white'
              }`}
            >
              {selectedPlanId === plan.id ? 'Selected 💎' : 'Choose Plan'}
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button 
          onClick={onBack}
          className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
        >
          ← Change Consultancy Option
        </button>
      </div>
    </div>
  );
};

export default CoffeePlanStep;
