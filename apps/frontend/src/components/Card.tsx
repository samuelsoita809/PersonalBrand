import React from 'react';
import { Button } from '@mui/material';

interface CardProps {
 title: string;
 description: string;
 onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ title, description, onClick }) => {
 return (
   <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm">
     <h2 className="text-xl font-bold mb-2">{title}</h2>
     <p className="text-gray-700 mb-4">{description}</p>
     <Button variant="contained" color="primary" onClick={onClick}>
       Learn More
     </Button>
   </div>
 );
};

export default Card;
