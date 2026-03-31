import React from 'react';

interface InfoPanelProps {
 title: string;
 content: string;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ title, content }) => (
 <div className="glass-card p-6 rounded-2xl max-w-sm transition-all duration-300 hover:shadow-2xl hover:bg-white/10 group">
   <div className="flex items-center gap-3 mb-4">
     <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">i</div>
     <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{title}</h3>
   </div>
   <p className="text-slate-400 font-medium leading-relaxed">{content}</p>
 </div>
);

export default InfoPanel;
