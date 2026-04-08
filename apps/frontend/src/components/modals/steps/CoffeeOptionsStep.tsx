import React from 'react';
import { Coffee, Search, Users, Zap, TrendingUp, Check } from 'lucide-react';
import coffeeConfig from '../../../config/coffee-config.json';

interface CoffeeOptionsStepProps {
  selectedOptionId: string;
  onSelect: (optionId: string) => void;
}

const CoffeeOptionsStep: React.FC<CoffeeOptionsStepProps> = ({ selectedOptionId, onSelect }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee': return <Coffee className="w-8 h-8" />;
      case 'Search': return <Search className="w-8 h-8" />;
      case 'Users': return <Users className="w-8 h-8" />;
      default: return <Coffee className="w-8 h-8" />;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Micro Value Line - High Trust Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <p className="text-amber-400 font-bold tracking-widest uppercase text-xs">Clarity • Direction • Fast Decisions</p>
        <h3 className="text-2xl sm:text-3xl font-black text-white italic">
          "{coffeeConfig.tagline}"
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {coffeeConfig.options.map((option) => (
          <div 
            key={option.id}
            className={`relative p-8 rounded-3xl border transition-all cursor-pointer group flex flex-col ${
              selectedOptionId === option.id 
                ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_40px_rgba(245,158,11,0.15)]' 
                : 'border-white/10 bg-slate-900/40 hover:border-white/20 hover:bg-slate-800/60'
            }`}
            onClick={() => onSelect(option.id)}
          >
            <div className={`mb-6 p-4 w-fit rounded-2xl transition-colors ${
              selectedOptionId === option.id ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-amber-400'
            }`}>
              {getIcon(option.icon)}
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-black text-white mb-2">{option.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">{option.subtitle}</p>
            </div>

            {/* Key Results Cluster - ROI Focused */}
            <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/5 w-full">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Results You Get</span>
              </div>
              <ul className="space-y-2">
                {option.keyResults?.map((result: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm font-bold text-amber-100">
                    <Zap size={12} className="text-amber-400 fill-amber-400" />
                    <span>{result}</span>
                  </li>
                ))}
              </ul>
            </div>

            <ul className="space-y-3 mb-8 w-full flex-1">
              {option.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-300 font-bold">
                  <Check size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <button 
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${
                selectedOptionId === option.id 
                  ? 'bg-amber-600 text-white shadow-xl shadow-amber-500/20' 
                  : 'bg-white/5 text-slate-300 group-hover:bg-white/10 group-hover:text-white'
              }`}
            >
              {selectedOptionId === option.id ? 'Selected ☕' : 'Choose Option'}
            </button>
          </div>
        ))}
      </div>
      
      <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
        Consultancy • Strategic Clarity • Fast Execution
      </p>
    </div>
  );
};

export default CoffeeOptionsStep;
