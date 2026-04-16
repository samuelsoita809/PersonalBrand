import React, { useEffect, useState, useCallback } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { createLogger } from '@monorepo/shared';
import { MousePointer2, TrendingUp, Filter, RefreshCcw } from 'lucide-react';
import type { ChartData, ChartOptions } from 'chart.js';

const logger = createLogger('CtaAnalyticsDashboard');

// Register ChartJS modules
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend
);

interface CtaStats {
  deliver_project: number;
  mentor_me: number;
  coffee_with_me: number;
  [key: string]: number;
}

interface TimeSeriesData {
  date: string;
  clicks: number;
  deliver: number;
  mentor: number;
  coffee: number;
}

interface AnalyticsResponse {
  counts: CtaStats;
  conversions: CtaStats;
  timeSeries: TimeSeriesData[];
  totalViews: number;
}

const CtaAnalyticsDashboard: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/analytics/featured-cta', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      logger.error('Failed to fetch CTA analytics', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCcw className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  // Branding Colors
  const colors = {
    blue: '#60a5fa',
    purple: '#a855f7',
    white: '#ffffff',
    dark: '#0f172a',
    grid: 'rgba(255, 255, 255, 0.05)'
  };

  const commonOptions: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: colors.white, font: { family: 'Outfit', weight: 'bold' } }
      },
      tooltip: {
        backgroundColor: colors.dark,
        titleFont: { family: 'Outfit', weight: 'bold' },
        bodyFont: { family: 'Outfit' },
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }
    },
    scales: {
      y: {
        grid: { color: colors.grid },
        ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { family: 'Outfit' } }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { family: 'Outfit' } }
      }
    }
  };

  // 1. Bar Chart Data: Total Clicks
  const barData: ChartData<'bar'> = {
    labels: ['Deliver Project', 'Mentor Me', 'Coffee With Me'],
    datasets: [
      {
        label: 'Total CTA Clicks',
        data: [
          data.counts.deliver_project,
          data.counts.mentor_me,
          data.counts.coffee_with_me
        ],
        backgroundColor: [
          'rgba(96, 165, 250, 0.6)', 
          'rgba(168, 85, 247, 0.6)', 
          'rgba(96, 165, 250, 0.4)'
        ],
        borderColor: colors.blue,
        borderWidth: 1,
        borderRadius: 8,
      }
    ]
  };

  // 2. Trend Chart Data: Daily Hits
  const lineData: ChartData<'line'> = {
    labels: data.timeSeries.map((t: TimeSeriesData) => t.date.split('-').slice(1).join('/')),
    datasets: [
      {
        label: 'Total Clicks',
        data: data.timeSeries.map((t: TimeSeriesData) => t.clicks),
        borderColor: colors.blue,
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors.blue,
      },
      {
        label: 'Deliver Project',
        data: data.timeSeries.map((t: TimeSeriesData) => t.deliver),
        borderColor: colors.purple,
        borderWidth: 2,
        tension: 0.4,
        hidden: true,
      }
    ]
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white italic tracking-tight">Work With Me Analytics</h2>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Total Clicks Breakdown */}
        <div className="glass-card p-8 min-h-[400px] flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
              <MousePointer2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Click Distribution</h3>
              <p className="text-sm text-slate-400">Total volume per service type</p>
            </div>
          </div>
          <div className="flex-1">
            <Bar data={barData} options={commonOptions} />
          </div>
        </div>

        {/* Engagement Trend */}
        <div className="glass-card p-8 min-h-[400px] flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Conversion Trends</h3>
              <p className="text-sm text-slate-400">Daily interaction performance</p>
            </div>
          </div>
          <div className="flex-1">
            <Line data={lineData} options={commonOptions} />
          </div>
        </div>

        {/* Funnel Metrics */}
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
              <Filter size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Service Funnel Performance</h3>
              <p className="text-sm text-slate-400">From intent click target to form submission</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['deliver_project', 'mentor_me', 'coffee_with_me'].map(type => {
              const clicks = data.counts[type] || 0;
              const converted = data.conversions[type] || 0;
              const totalViews = data.totalViews || 1;
              const conversionRate = clicks > 0 ? ((converted / clicks) * 100).toFixed(1) : '0';
              const ctr = ((clicks / totalViews) * 100).toFixed(1);
              
              return (
                <div key={type} className="flex flex-col items-center bg-white/5 p-6 rounded-3xl border border-white/5">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">{type.replace('_', ' ')}</span>
                  
                  <div className="flex flex-col items-center gap-1 mb-6">
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-white">{conversionRate}%</span>
                      <span className="text-[10px] text-purple-400 font-bold mb-1 uppercase tracking-tighter">Conv. Rate</span>
                    </div>
                  </div>

                  <div className="w-full space-y-4">
                    {/* CTR Metric */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-slate-500">Click-Through (CTR)</span>
                        <span className="text-blue-400">{ctr}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-1000" 
                          style={{ width: `${Math.min(parseFloat(ctr) * 5, 100)}%` }} // Scaled for visibility
                        />
                      </div>
                    </div>

                    {/* Conversion Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-slate-500">Lead Conversion</span>
                        <span className="text-purple-400">{conversionRate}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 transition-all duration-1000" 
                          style={{ width: `${conversionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between w-full mt-6 text-[10px] font-bold text-slate-500 border-t border-white/5 pt-4">
                    <span>{clicks} Clicks</span>
                    <span>{converted} Leads</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>


    </div>
  );
};

export default CtaAnalyticsDashboard;
