import React from 'react';

interface BadgeProps {
  text: string;
  className?: string;
  delay?: string;
}

const Badge: React.FC<BadgeProps> = ({ text, className = "", delay = "delay-100" }) => {
  return (
    <div className={`absolute z-20 animate-in fade-in slide-in-from-bottom-4 duration-700 ${delay} ${className}`}>
      <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl shadow-xl hover:scale-105 transition-transform cursor-default group whitespace-nowrap">
        <span className="text-[11px] font-bold text-white/80 group-hover:text-white uppercase tracking-wider">
          {text}
        </span>
      </div>
    </div>
  );
};

export default Badge;
