import React from 'react';
import { Button } from '@mui/material';

interface CardProps {
 title: string;
 description: string;
 onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ title, description, onClick }) => {
 return (
   <div className="glass-card rounded-2xl p-6 max-w-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-500/10 hover:shadow-2xl group">
     <h2 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">{title}</h2>
     <p className="text-slate-400 mb-6 font-medium">{description}</p>
     <Button variant="contained" color="primary" onClick={onClick} className="w-full font-bold">
       Learn More
     </Button>
   </div>
 );
};

export default Card;
