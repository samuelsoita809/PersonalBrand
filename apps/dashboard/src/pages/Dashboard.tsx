import React, { useState } from 'react';
import DynamicRenderer from '../components/DynamicRenderer';
import { LayoutDashboard, Menu, X } from 'lucide-react';

export interface DashboardSection {
  id: number;
  componentType: string;
  title: string;
  props?: Record<string, unknown>;
}

const DASHBOARD_SECTIONS: DashboardSection[] = [
  {
    id: 1,
    componentType: "AnalyticsDashboard",
    title: "Admin Engagement Analytics",
    props: {}
  }
];

const DashboardPage: React.FC = () => {
  const [sections] = useState<DashboardSection[]>(DASHBOARD_SECTIONS);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white/5 border-r border-white/10 transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center font-bold">S</div>
          {sidebarOpen && <span className="font-bold tracking-tight">Admin Console</span>}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { name: 'Dashboard', icon: LayoutDashboard, active: true },
            { name: 'Analytics', icon: Menu, active: false }
          ].map((item, idx) => (
            <button key={idx} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${item.active ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <item.icon size={20} />
              {sidebarOpen && <span className="font-medium">{item.name}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold gradient-text">System Intelligence</h1>
            <p className="text-slate-400 mt-2">Real-time performance metrics and engagement data.</p>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 glass-card rounded-xl text-slate-400 hover:text-white"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {sections.map((section) => (
            <section key={section.id}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                <h2 className="text-xl font-bold tracking-tight">{section.title}</h2>
              </div>
              <DynamicRenderer
                componentName={section.componentType}
                props={section.props}
              />
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
