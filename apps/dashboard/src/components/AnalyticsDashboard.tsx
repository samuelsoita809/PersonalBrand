import React from 'react';
import { BarChart3, MousePointer2, ExternalLink, Users } from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
  const stats = [
    { label: 'Total Page Views', value: '1,284', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'CTA Clicks', value: '342', icon: MousePointer2, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Modal Opens', value: '156', icon: ExternalLink, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { label: 'Conversion Rate', value: '12.4%', icon: BarChart3, color: 'text-green-400', bg: 'bg-green-400/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-card p-6 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 h-64 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Traffic Overview</h3>
          <div className="flex-1 flex items-end gap-2 px-2">
            {[40, 70, 45, 90, 65, 80, 55, 95, 75, 60, 85, 50].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-gradient-to-t from-blue-500/20 to-blue-400/60 rounded-t-sm transition-all hover:to-blue-400"
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </div>

        <div className="glass-card p-6 h-64 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Engagement by CTA</h3>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {[
              { label: 'Work With Me', value: 65, color: 'bg-blue-500' },
              { label: 'Connect With Me', value: 35, color: 'bg-purple-500' },
              { label: 'Social Links', value: 20, color: 'bg-pink-500' }
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="text-white">{item.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
