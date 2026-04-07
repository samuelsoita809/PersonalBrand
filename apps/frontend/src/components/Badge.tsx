import React from 'react';

interface BadgeProps {
  text: string;
  className?: string;
  delay?: string;
}

const Badge: React.FC<BadgeProps> = ({ text, className = "", delay = "delay-100" }) => {
  return (
    <div className={`z-20 animate-in fade-in slide-in-from-bottom-4 duration-700 ${delay} ${className}`}>
      <div className="bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl shadow-lg hover:scale-105 transition-transform cursor-default text-center leading-tight w-[160px] min-h-[44px] flex items-center justify-center">
        <span className="text-[10px] font-bold text-white/75 uppercase tracking-wider whitespace-nowrap">{text}</span>
      </div>
    </div>
  );
};

export default Badge;
