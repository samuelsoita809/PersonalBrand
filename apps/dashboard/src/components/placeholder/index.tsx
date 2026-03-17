import React from 'react';

const Placeholder: React.FC<{ name: string }> = ({ name }) => (
  <div className="glass-card p-6 h-48 flex flex-col items-center justify-center text-slate-500 italic">
    <div className="text-lg font-bold not-italic mb-2 text-slate-300">{name}</div>
    <div>Component interface coming soon...</div>
  </div>
);

export const Listings = () => <Placeholder name="Listings Management" />;
export const Leads = () => <Placeholder name="Leads & Engagement" />;
export const Bookings = () => <Placeholder name="Bookings Overview" />;
export const Feedback = () => <Placeholder name="User Feedback" />;
export const Finances = () => <Placeholder name="Financial Reports" />;

export default Placeholder;
