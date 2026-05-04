import React from 'react';

interface QuickRepliesProps {
  onSelect: (intent: string) => void;
  disabled?: boolean;
}

const QuickReplies: React.FC<QuickRepliesProps> = ({ onSelect, disabled }) => {
  const intents = [
    "Start a Project",
    "Get Advice",
    "Mentorship",
    "Ask a Question"
  ];

  return (
    <div className="flex flex-col gap-3 mt-6">
      {intents.map((intent) => (
        <button
          key={intent}
          onClick={() => onSelect(intent)}
          disabled={disabled}
          className="w-full py-3 px-4 rounded-xl text-left bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all duration-200 text-slate-200 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-between"
        >
          <span className="font-medium">{intent}</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">→</span>
        </button>
      ))}
    </div>
  );
};

export default QuickReplies;
