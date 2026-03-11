import React, { useEffect, useState } from 'react';
import DynamicRenderer from '../components/DynamicRenderer';
import Modal from '../components/Modal';

interface DashboardConfig {
 id: number;
 componentType: string;
 title: string;
 description?: string;
 content?: string;
 onClickType?: string;
}

const Dashboard: React.FC = () => {
 const [sections, setSections] = useState<DashboardConfig[]>([]);
 const [modalOpen, setModalOpen] = useState(false);
 const [modalContent, setModalContent] = useState({ title: '', content: '' });

 useEffect(() => {
   import('../config/dashboard.json').then((data) => setSections(data.default));
 }, []);

 const handleSectionClick = (section: DashboardConfig) => {
   if (section.onClickType === 'modal') {
     setModalContent({ title: section.title, content: section.description || '' });
     setModalOpen(true);
   }
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

     <Modal
       open={modalOpen}
       onClose={() => setModalOpen(false)}
       title={modalContent.title}
       content={modalContent.content}
     />
   </div>
 );
};

export default Dashboard;
