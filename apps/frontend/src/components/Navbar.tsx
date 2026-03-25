import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
          S
        </div>
        <span className="text-xl font-bold tracking-tight text-white hover:text-blue-400 transition-colors cursor-default">
          Samuel <span className="text-blue-500">Soita</span>
        </span>
      </div>
      

    </nav>
  );
};

export default Navbar;
