import React, { useState } from 'react';
import DynamicRenderer from '../components/DynamicRenderer';
import { 
  LayoutDashboard, 
  Menu, 
  X, 
  BarChart2, 
  ChevronDown, 
  ChevronUp, 
  PieChart,
  Filter
} from 'lucide-react';

export interface DashboardSection {
  id: string;
  componentType: string;
  title: string;
  description: string;
  props?: Record<string, unknown>;
}

const ALL_SECTIONS: Record<string, DashboardSection> = {
  overview: {
    id: "overview",
    componentType: "AnalyticsDashboard",
    title: "Engagement Overview",
    description: "Real-time performance metrics and engagement data.",
    props: {}
  },
  page_views: {
    id: "page_views",
    componentType: "PageViewsAnalytics",
    title: "Page Views Analytics",
    description: "Detailed breakdown of page traffic, trends, and user devices.",
    props: {}
  },
  cta_performance: {
    id: "cta_performance",
    componentType: "CtaAnalyticsDashboard",
    title: "CTA Funnel Performance",
    description: "Measuring intent, interaction, and conversion for Work With Me services.",
    props: {}
  }
};

const DashboardPage: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analyticsOpen, setAnalyticsOpen] = useState(true);

  const activeSection = ALL_SECTIONS[activeSectionId] || ALL_SECTIONS.overview;

  return (
    <div className="flex h-screen bg-background text-slate-200">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white/[0.02] border-r border-white/10 transition-all duration-300 flex flex-col z-20`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">S</div>
          {sidebarOpen && <span className="font-bold tracking-tight text-white">Admin Console</span>}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {/* Main Dashboard Link */}
          <button 
            onClick={() => setActiveSectionId('overview')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeSectionId === 'overview' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            {sidebarOpen && <span className="font-medium">Dashboard</span>}
          </button>

          {/* Analytics Menu Group */}
          <div className="space-y-1">
            <button 
              onClick={() => sidebarOpen && setAnalyticsOpen(!analyticsOpen)}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all`}
            >
              <div className="flex items-center gap-3">
                <BarChart2 size={20} />
                {sidebarOpen && <span className="font-medium">Analytics</span>}
              </div>
              {sidebarOpen && (analyticsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
            </button>

            {sidebarOpen && analyticsOpen && (
              <div className="pl-9 space-y-1 animate-in slide-in-from-top-2 duration-200">
                <button 
                  onClick={() => setActiveSectionId('page_views')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-all ${activeSectionId === 'page_views' ? 'text-blue-400 bg-blue-500/5' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <PieChart size={14} />
                  Page Views
                </button>
                <button 
                  onClick={() => setActiveSectionId('cta_performance')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-all ${activeSectionId === 'cta_performance' ? 'text-blue-400 bg-blue-500/5' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Filter size={14} />
                  CTA Performance
                </button>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#0a0a0c] relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
        
        <div className="p-10 relative z-10">
          <header className="mb-10 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">Admin</span>
                <span className="text-[10px] text-slate-600">/</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">{activeSectionId.replace('_', ' ')}</span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">{activeSection.title}</h1>
              <p className="text-slate-400 mt-2 text-sm">{activeSection.description}</p>
            </div>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-xl"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </header>

          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <DynamicRenderer
              componentName={activeSection.componentType}
              props={activeSection.props}
            />
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
