import React, { useEffect, useState } from 'react';
import { BarChart3, MousePointer2, ExternalLink, Users, RefreshCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createLogger } from '@monorepo/shared';

const logger = createLogger('AnalyticsDashboard');

const AnalyticsDashboard: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/analytics/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      
      // Transform specification-aligned summary data into dashboard widgets
      const transformedStats = [
        { label: 'Page Views', value: data.page_views, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'CTA Clicks', value: data.cta_clicks, icon: MousePointer2, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: 'Modal Opens', value: data.modal_opens, icon: ExternalLink, color: 'text-pink-400', bg: 'bg-pink-400/10' },
        { label: 'Total Leads', value: data.leads, icon: Users, color: 'text-green-400', bg: 'bg-green-400/10' },
        { label: 'CTR', value: `${(data.ctr * 100).toFixed(1)}%`, icon: BarChart3, color: 'text-orange-400', bg: 'bg-orange-400/10' },
        { label: 'Modal Rate', value: `${(data.modal_rate * 100).toFixed(1)}%`, icon: BarChart3, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
      ];
      
      setStats(transformedStats);
      setError(null);
    } catch (err: any) {
      logger.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Realtime Analytics Polling (DevSecOps Alignment)
    const interval = setInterval(() => {
      fetchStats();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [token]);

  if (loading && stats.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCcw className="animate-spin text-blue-400" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
        <p className="font-bold">Error loading analytics</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors text-xs font-bold uppercase"
        >
          Try Again
        </button>
      </div>
    );
  }


  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Engagement Overview</h2>
        <button 
          onClick={fetchStats}
          disabled={loading}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mock Chart Area 1 */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl h-64 flex flex-col">
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

        {/* Mock Chart Area 2 */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl h-64 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Engagement by CTA</h3>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {[
              { label: 'Journey Starts', value: 45, color: 'bg-pink-500' }
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="text-white">{item.value}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }}></div>
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
