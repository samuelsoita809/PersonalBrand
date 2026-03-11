import React, { useState, useEffect } from 'react';
import DynamicRenderer from '../components/DynamicRenderer';
import Modal from '../components/Modal';

interface CardConfig {
 id: number;
 title: string;
 description: string;
}

const HomePage: React.FC = () => {
 const [cards, setCards] = useState<CardConfig[]>([]);
 const [modalOpen, setModalOpen] = useState(false);
 const [modalContent, setModalContent] = useState({ title: '', content: '' });

 useEffect(() => {
   // Load cards dynamically from JSON (placeholder for now)
   import('../config/cards.json').then((data) => setCards(data.default)).catch(() => {
     setCards([
       { id: 1, title: 'Project 1', description: 'Description for project 1' },
       { id: 2, title: 'Project 2', description: 'Description for project 2' },
       { id: 3, title: 'Project 3', description: 'Description for project 3' }
     ]);
   });
 }, []);

 const handleCardClick = (title: string, description: string) => {
   setModalContent({ title, content: description });
   setModalOpen(true);
 };

 return (
   <div className="p-6">
     <h1 className="text-3xl font-bold mb-6 text-center">My Personal Brand Dashboard</h1>
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {cards.map((card) => (
         <DynamicRenderer
           key={card.id}
           componentName="Card"
           props={{
             title: card.title,
             description: card.description,
             onClick: () => handleCardClick(card.title, card.description),
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

export default HomePage;
