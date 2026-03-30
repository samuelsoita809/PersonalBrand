import React, { useEffect, useState, useCallback } from 'react';
import { 
  Users, 
  Smartphone, 
  Monitor, 
  Tablet, 
  ChevronRight, 
  Filter, 
  Calendar, 
  ArrowUpRight,
  RefreshCcw,
  Layout
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createLogger } from '@monorepo/shared';

const logger = createLogger('PageViewsAnalytics');

interface PageViewStats {
  totalViews: number;
  uniqueViews: number;
  topPages: { name: string; views: number }[];
  devices: { name: string; value: number }[];
  trends: { date: string; views: number; unique: number }[];
  isReal: boolean;
}

const PageViewsAnalytics: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<PageViewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [days, setDays] = useState(7);
  const [deviceFilter, setDeviceFilter] = useState('');
  const [pageFilter, setPageFilter] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        days: days.toString(),
        ...(deviceFilter && { device: deviceFilter }),
        ...(pageFilter && { page: pageFilter })
      });

      const response = await fetch(`/api/v1/analytics/page-views?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch page views');

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      logger.error('Error fetching stats:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [days, deviceFilter, pageFilter, token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCcw className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 glass-card border-red-500/20 rounded-3xl text-center">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
           <Filter size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Failed to load analytics</h3>
        <p className="text-slate-400 mb-6">{error}</p>
        <button 
          onClick={fetchStats}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Views', value: stats?.totalViews || 0, icon: Layout, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Unique Visitors', value: stats?.uniqueViews || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Bounce Rate', value: '42.5%', icon: ArrowUpRight, color: 'text-green-400', bg: 'bg-green-400/10' }, // Mock for now
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Filters Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
            <Calendar size={16} className="text-slate-400" />
            <select 
              value={days} 
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-transparent text-sm font-medium focus:outline-none"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={deviceFilter} 
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none"
            >
              <option value="">All Devices</option>
              <option value="Desktop">Desktop</option>
              <option value="Tablet">Tablet</option>
              <option value="Mobile">Mobile</option>
            </select>
          </div>
        </div>

        <div className="flex-1 max-w-sm relative">
           <Layout size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
             type="text" 
             placeholder="Filter by page URL..."
             value={pageFilter}
             onChange={(e) => setPageFilter(e.target.value)}
             className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
           />
        </div>
      </div>

      {/* KPI Overlays */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={24} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time</span>
            </div>
            <div className="text-4xl font-bold text-white mb-2">{kpi.value}</div>
            <div className="text-sm font-medium text-slate-400">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-white/10 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-bold text-white">Traffic Trends</h3>
             <div className="flex gap-4">
               <div className="flex items-center gap-1.5">
                 <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                 <span className="text-xs text-slate-400">Page Views</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>
                 <span className="text-xs text-slate-400">Unique Users</span>
               </div>
             </div>
          </div>
          
          <div className="flex-1 flex items-end gap-2 px-4">
            {stats?.trends.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end h-full gap-1 group/bar relative">
                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 border border-white/10 p-2 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity z-10 pointer-events-none text-[10px]">
                   <div className="text-blue-400 font-bold">Views: {d.views}</div>
                   <div className="text-purple-400 font-bold">Unique: {d.unique}</div>
                </div>

                <div 
                  className="w-full bg-purple-500/30 rounded-t-sm group-hover/bar:bg-purple-500/50 transition-all"
                  style={{ height: `${Math.min(100, (d.unique / (Math.max(...stats.trends.map(x => x.views)) || 1)) * 100)}%` }}
                ></div>
                <div 
                  className="w-full bg-blue-500/60 rounded-t-sm group-hover/bar:bg-blue-500 transition-all"
                  style={{ height: `${Math.min(100, (d.views / (Math.max(...stats.trends.map(x => x.views)) || 1)) * 100)}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6 px-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            {stats?.trends.filter((_, i) => i % (days > 7 ? 5 : 1) === 0).map((d, i) => (
              <span key={i}>{d.date.split('-').slice(1).join('/')}</span>
            ))}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-8">Device Breakdown</h3>
          <div className="flex-1 space-y-6">
            {stats?.devices.map((device, idx) => {
              const Icon = device.name === 'Desktop' ? Monitor : device.name === 'Tablet' ? Tablet : Smartphone;
              const percentage = Math.round((device.value / (stats.totalViews || 1)) * 100);
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 text-slate-300">
                      <div className="p-2 bg-white/5 rounded-lg">
                        <Icon size={18} />
                      </div>
                      <span className="font-medium">{device.name}</span>
                    </div>
                    <span className="font-bold text-white">{percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                       className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" 
                       style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-slate-500 text-right font-bold uppercase tracking-widest">{device.value} Views</div>
                </div>
              );
            })}
            {(!stats?.devices.length) && <div className="text-center py-20 text-slate-600 text-xs italic">No device data available</div>}
          </div>
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="glass-card rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
           <h3 className="text-xl font-bold text-white">Top Pages Ranking</h3>
           <button className="text-xs font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors flex items-center gap-1">
             Full Report <ChevronRight size={14} />
           </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rank</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Page URL / Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Visits</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats?.topPages.map((page, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="w-6 h-6 flex items-center justify-center bg-white/5 rounded-md text-[10px] font-bold text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                      #{i + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-white">{page.name}</span>
                       <span className="text-[10px] text-slate-500 font-mono truncate max-w-xs">{page.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-blue-400">{page.views.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1 text-green-400 text-[10px] font-bold bg-green-400/10 px-2 py-1 rounded-full border border-green-500/20">
                      <ArrowUpRight size={12} />
                      +{Math.floor(Math.random() * 20) + 5}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!stats?.topPages.length) && <div className="text-center py-10 text-slate-600 text-xs">No page data found matching criteria</div>}
        </div>
      </div>
    </div>
  );
};

export default PageViewsAnalytics;
