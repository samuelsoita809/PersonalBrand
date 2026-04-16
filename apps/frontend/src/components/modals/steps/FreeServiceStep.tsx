import React from 'react';
import { Search, MessageCircle, Users, Check } from 'lucide-react';
import freeConfig from '../../../config/free-services.json';

interface FreeServiceStepProps {
  selectedServiceId: string;
  onSelect: (serviceId: string) => void;
}

const iconMap: Record<string, any> = {
  Search,
  MessageCircle,
  Users
};

const FreeServiceStep: React.FC<FreeServiceStepProps> = ({ selectedServiceId, onSelect }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <p className="text-slate-400">Select one of the free options below to get started.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {freeConfig.services.map((service) => {
          const Icon = iconMap[service.icon] || Search;
          const isSelected = selectedServiceId === service.id;

          return (
            <button
              key={service.id}
              onClick={() => onSelect(service.id)}
              className={`relative flex flex-col items-center text-center p-8 rounded-3xl transition-all duration-300 transform ${
                isSelected 
                  ? 'bg-blue-500/20 border-blue-500/50 scale-105 shadow-[0_0_30px_rgba(59,130,246,0.2)]' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              } border-2`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 bg-blue-500 p-1 rounded-full text-white">
                  <Check size={16} />
                </div>
              )}
              
              <div className={`p-4 rounded-2xl mb-6 ${isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-400'}`}>
                <Icon size={32} />
              </div>

              <h3 className={`text-xl font-bold mb-3 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                {service.title}
              </h3>
              
              <p className="text-sm text-slate-400 leading-relaxed">
                {service.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FreeServiceStep;
