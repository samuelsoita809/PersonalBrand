import React from 'react';

interface HeroTextProps {
  heading: string;
  subheading: string;
  paragraph: string;
}

const HeroText: React.FC<HeroTextProps> = ({ heading, subheading, paragraph }) => {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
        {heading}
      </h1>
      <h2 className="text-2xl md:text-3xl font-medium text-slate-200">
        {subheading}
      </h2>
      <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
        {paragraph}
      </p>
    </div>
  );
};

export default HeroText;
