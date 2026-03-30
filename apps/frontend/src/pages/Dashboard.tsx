import React, { useEffect, useState } from 'react';
import DynamicRenderer from '../components/DynamicRenderer';
interface DashboardConfig {
  id: number;
  componentType: string;
  title?: string;
  description?: string;
  content?: string;
  onClickType?: string;
}

const Dashboard: React.FC = () => {
  const [sections, setSections] = useState<DashboardConfig[]>([]);

  useEffect(() => {
    import('../config/dashboard.json').then((data) => setSections(data.default));
  }, []);

  const handleSectionClick = (section: DashboardConfig) => {
    // Modal-based interactions removed as per CTA cleanup (redundant things)
    console.log('Section clicked:', section.title);
  };

  return (
    <div className="min-h-screen p-6 md:p-12 relative overflow-hidden bg-[#030712]">
      {/* Premium Background Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-200 to-white">
              Full Dynamic Dashboard
            </span>
          </h1>
          <p className="text-slate-400 text-lg">Manage your interactive components and analytics in real-time.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start">
          {sections.map((section) => (
            <div key={section.id} className={section.componentType === 'AnalyticsDashboard' || section.componentType === 'ContactForm' ? 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4' : ''}>
              <DynamicRenderer
                componentName={section.componentType}
                props={{
                  ...section,
                  onClick: () => handleSectionClick(section),
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
