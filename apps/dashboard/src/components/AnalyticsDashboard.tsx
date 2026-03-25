/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { BarChart3, MousePointer2, ExternalLink, Users, RefreshCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createLogger } from '@monorepo/shared';

const logger = createLogger('AnalyticsDashboard');

const AnalyticsDashboard: React.FC = () => {
  const { token, logout } = useAuth();
  const [stats, setStats] = useState<any[]>([]);
  const [timeSeries, setTimeSeries] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  const [isReal, setIsReal] = useState(true);

  const fetchStats = async () => {
    // Only show loader on initial fetch
    if (stats.length === 0) setLoading(true);
    
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [summaryRes, seriesRes, historyRes] = await Promise.all([
        fetch('/api/v1/analytics/summary', { headers }),
        fetch('/api/v1/analytics/timeseries', { headers }),
        fetch('/api/v1/analytics/history', { headers })
      ]);

      const statuses = [summaryRes.status, seriesRes.status, historyRes.status];
      if (statuses.some(s => s === 401 || s === 403)) {
        logout();
        return; // Component will unmount
      }

      if (!summaryRes.ok || !seriesRes.ok || !historyRes.ok) {
        throw new Error('Failed to fetch complete analytics data');
      }

      const [summaryData, seriesData, historyData] = await Promise.all([
        summaryRes.json(),
        seriesRes.json(),
        historyRes.json()
      ]);
      
      const transformedStats = [
        { label: 'Page Views', value: summaryData.page_views, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'CTA Clicks', value: summaryData.cta_clicks, icon: MousePointer2, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: 'Modal Opens', value: summaryData.modal_opens, icon: ExternalLink, color: 'text-pink-400', bg: 'bg-pink-400/10' },
        { label: 'Total Leads', value: summaryData.leads, icon: Users, color: 'text-green-400', bg: 'bg-green-400/10' },
        { label: 'CTR', value: `${(summaryData.ctr * 100).toFixed(1)}%`, icon: BarChart3, color: 'text-orange-400', bg: 'bg-orange-400/10' },
        { label: 'Modal Rate', value: `${(summaryData.modal_rate * 100).toFixed(1)}%`, icon: BarChart3, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
      ];
      
      setStats(transformedStats);
      setTimeSeries(seriesData);
      setHistory(historyData);
      setIsReal(summaryData.isReal ?? true);
      setDbError(summaryData.error || null);
      setError(null);
    } catch (err: any) {
      logger.error('Error fetching analytics:', err);
      // Don't show full screen error if we already have data
      if (stats.length === 0) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchStats();
    // Real-time polling every 10 seconds (as per live monitoring requirement)
    const interval = setInterval(fetchStats, 10000);
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
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Engagement Overview</h2>
          {isReal ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Live Connection</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Degraded: Static Data</span>
            </div>
          )}
        </div>
        <button 
          onClick={fetchStats}
          disabled={loading}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {!isReal && (
        <div className="bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-xl flex items-start gap-4 animate-in fade-in zoom-in-95 duration-500">
           <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
             <BarChart3 size={20} />
           </div>
           <div>
             <h4 className="text-sm font-bold text-yellow-500">PostgreSQL Sync Disabled</h4>
             <p className="text-xs text-yellow-500/70 mt-1">
               The dashboard is currently displaying cached/static data because the database connection failed. 
             </p>
             {dbError && (
               <p className="text-[10px] font-mono bg-black/20 p-2 rounded mt-2 text-red-300 border border-red-500/20">
                 System Error: {dbError}
               </p>
             )}
             <p className="text-xs text-yellow-500/70 mt-2">
               Please verify your <span className="font-mono text-white/50">DATABASE_URL</span> and run migrations.
             </p>
           </div>
        </div>
      )}

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
        {/* Real Time Series Chart */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl h-64 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Traffic (Last 7 Days)</h3>
          <div className="flex-1 flex items-end gap-2 px-2">
            {timeSeries.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1 h-full justify-end group/bar relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 text-[8px] px-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                   {d.views}
                </div>
                <div 
                  className="bg-blue-400/60 rounded-t-sm transition-all hover:bg-blue-400"
                   style={{ height: `${Math.min(100, (d.views / (Math.max(...timeSeries.map(x => x.views)) || 1)) * 100)}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
            {timeSeries.map((d, i) => (
              <span key={i}>{d.date.split('-').slice(1).join('/')}</span>
            ))}
          </div>
        </div>

        {/* Recent Events History */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl h-64 flex flex-col overflow-hidden">
          <h3 className="text-lg font-bold text-white mb-4">Live Event Feed</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {history.map((event, i) => (
              <div key={i} className="flex flex-col py-3 border-b border-white/5 last:border-0 group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">{event.event_name}</span>
                    <span className="text-[9px] text-slate-500">{new Date(event.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded">
                    {event.context || 'frontend'}
                  </div>
                </div>
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <span key={key} className="text-[8px] bg-blue-500/10 text-blue-300/70 py-0.5 px-1.5 rounded-md border border-blue-500/10">
                        {key}: <span className="text-white/80">{String(value)}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {history.length === 0 && <div className="text-center py-10 text-slate-600 text-xs">No events recorded yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
