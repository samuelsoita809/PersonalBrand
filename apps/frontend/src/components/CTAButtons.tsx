import React from 'react';

interface CTA {
  id: string;
  label: string;
  type: string;
  disabled?: boolean;
}

interface CTAButtonsProps {
  ctas: CTA[];
  onCtaClick: (id: string, label: string) => void;
}

const CTAButtons: React.FC<CTAButtonsProps> = ({ ctas, onCtaClick }) => {
  return (
    <div className="flex flex-wrap gap-4">
      {ctas.map((cta) => (
        <button
          key={cta.id}
          id={cta.id}
          disabled={cta.disabled}
          className={`px-8 py-4 rounded-full font-bold transition-all transform ${
            cta.disabled 
              ? 'opacity-40 cursor-not-allowed grayscale' 
              : 'hover:scale-105 active:scale-95'
          } ${
            cta.type === 'primary'
              ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-slate-200'
              : 'bg-transparent border border-white/20 text-white hover:bg-white/5'
          }`}
          onClick={() => !cta.disabled && onCtaClick(cta.id, cta.label)}
        >
          {cta.label}
        </button>
      ))}
    </div>
  );
};

export default CTAButtons;
