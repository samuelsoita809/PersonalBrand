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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Full Dynamic Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <DynamicRenderer
            key={section.id}
            componentName={section.componentType}
            props={{
              ...section,
              onClick: () => handleSectionClick(section),
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
