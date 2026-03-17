import React, { useEffect, useState } from 'react';
import HeroText from './HeroText';
import ProfileCard from './ProfileCard';
import heroConfig from '../config/hero.json';
import { useAnalytics } from '../context/analytics';
import WorkWithMeModal from './WorkWithMeModal';
import ConnectWithMeModal from './ConnectWithMeModal';

const HeroSection: React.FC = () => {
  const { heading, subheading, intro, profile, ctas } = heroConfig;
  const { trackEvent } = useAnalytics();
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  useEffect(() => {
    trackEvent('hero_view', {
      heading,
      timestamp: new Date().toISOString()
    });
  }, [trackEvent, heading]);

  const handleCtaClick = (id: string, label: string) => {
    trackEvent(`cta_${id}_click`, { label });
    
    if (id === 'work') {
      setIsWorkModalOpen(true);
      trackEvent('modal_open', { type: 'work_with_me' });
    } else if (id === 'connect') {
      setIsConnectModalOpen(true);
      trackEvent('modal_open', { type: 'connect_with_me' });
    }
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center py-20 px-6 overflow-hidden">
      {/* Background elements would be inherited or localized here */}
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Text & CTAs */}
        <div className="lg:col-span-7 space-y-10 order-2 lg:order-1">
          <HeroText 
            heading={heading}
            subheading={subheading}
            intro={intro}
          />
          
          <div className="flex flex-wrap gap-4">
            {ctas.map((cta) => (
              <button 
                key={cta.id}
                id={cta.id}
                className={`px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 ${
                  cta.type === 'primary' 
                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-slate-200' 
                    : 'bg-transparent border border-white/20 text-white hover:bg-white/5'
                }`}
                onClick={() => handleCtaClick(cta.id, cta.label)}
              >
                {cta.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Profile Card */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2">
          <ProfileCard 
            name={profile.name}
            role={profile.role}
            image={profile.image}
          />
        </div>

      </div>

      {/* Modals */}
      <WorkWithMeModal 
        isOpen={isWorkModalOpen} 
        onClose={() => setIsWorkModalOpen(false)} 
      />
      <ConnectWithMeModal 
        isOpen={isConnectModalOpen} 
        onClose={() => setIsConnectModalOpen(false)} 
      />
    </section>
  );
};

export default HeroSection;
