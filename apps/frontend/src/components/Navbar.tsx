import React from 'react';
import { useAnalytics } from '../context/analytics';
import navConfig from '../config/nav-config.json';

const Navbar: React.FC = () => {
  const { trackEvent } = useAnalytics();
  const { homeRoute, logo } = navConfig;

  const handleLogoClick = (e: React.MouseEvent) => {
    trackEvent('navbar_logo_click', {
      page_url: window.location.href,
      timestamp: new Date().toISOString()
    });
    // Allow default link behavior for navigation
  };

  return (
    <nav 
      className="fixed top-0 left-0 right-0 w-full z-[100] backdrop-blur-md bg-background/80 border-b border-white/5 h-20 flex items-center"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
        <div className="flex items-center gap-12">
          {/* Main Logo & Home Link */}
          <a 
            href={homeRoute}
            onClick={handleLogoClick}
            className="flex items-center gap-3 group transition-transform active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-1"
            aria-label={logo.ariaLabel}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 group-hover:bg-blue-500 transition-colors">
              {logo.text}
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
              Samuel <span className="text-blue-500">Soita</span>
            </span>
          </a>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 border-l border-white/5 pl-12 h-10">
            <a 
              href={navConfig.aboutRoute} 
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              About
            </a>
            <a 
              href={navConfig.dashboardRoute} 
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-4 py-2 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10"
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
