import React, { useState, useEffect, useRef } from 'react';
import HeroText from './HeroText';
import ProfileCard from './ProfileCard';
import CTAButtons from './CTAButtons';
import DeliverProjectModal from './modals/DeliverProjectModal';
import MentorMeModal from './modals/MentorMeModal';
import CoffeeMeModal from './modals/CoffeeMeModal';
import ServiceSelectionModal from './modals/ServiceSelectionModal';
import { useAnalytics } from '../context/analytics';
import heroConfig from '../config/hero-content.json';
import Badge from './Badge';

const HeroSection: React.FC = () => {
  const { heading, subheading, paragraph, profile, badges = [] } = heroConfig as any;
  const { trackEvent } = useAnalytics();
  
  // Modal States
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const [isCoffeeModalOpen, setIsCoffeeModalOpen] = useState(false);
  
  const ctaTimeoutRef = useRef<number | undefined>(undefined);

  // Unified Tracking
  useEffect(() => {
    trackEvent('hero_view', {
      heading,
      timestamp: new Date().toISOString(),
      version: '2.5.0-slice7-hardened'
    });

    trackEvent('profile_card_view', {
      timestamp: new Date().toISOString()
    });

    const milestones = [25, 50, 75, 100];
    const tracked = new Set<number>();
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      milestones.forEach(m => {
        if (scrollPercent >= m && !tracked.has(m)) {
          trackEvent('scroll_depth_milestone', { milestone_percent: m, timestamp: new Date().toISOString() });
          tracked.add(m);
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (ctaTimeoutRef.current) window.clearTimeout(ctaTimeoutRef.current);
    };
  }, [trackEvent, heading]);

  const handleCtaClick = (id: string, label: string) => {
    if (ctaTimeoutRef.current) window.clearTimeout(ctaTimeoutRef.current);
    
    ctaTimeoutRef.current = window.setTimeout(() => {
      const eventName = id === 'work_with_me' ? 'cta_click_work_with_me' : 'cta_click';
      trackEvent(eventName, { ctaId: id, ctaLabel: label });
      
      if (id === 'work_with_me') {
        setIsSelectionModalOpen(true);
      }
      ctaTimeoutRef.current = undefined;
    }, 300);
  };

  const handleServiceSelect = (serviceId: string) => {
    setIsSelectionModalOpen(false);
    if (serviceId === 'deliver_project') {
      setIsProjectModalOpen(true);
    } else if (serviceId === 'mentor_me') {
      setIsMentorModalOpen(true);
    } else if (serviceId === 'coffee_with_me') {
      setIsCoffeeModalOpen(true);
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center py-24 px-6 overflow-visible">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center z-10">
        
        {/* Left Column: Context-Rich Content */}
        <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-left-10 duration-1000">
          <HeroText
            heading={heading}
            subheading={subheading}
            paragraph={paragraph}
          />

          <CTAButtons 
            ctas={(heroConfig as any).ctas || []} 
            onCtaClick={handleCtaClick} 
          />
        </div>

        {/* Right Column: Trust Anchor */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-10 duration-1000 delay-200">
          <div className="relative w-fit flex flex-col items-center">

            {/* Top Badges Row */}
            <div className="grid grid-cols-2 gap-4 mb-8 lg:mb-0 lg:absolute lg:-top-14 lg:-inset-x-16 lg:flex lg:justify-between lg:px-0">
              {badges[0] && <Badge text={badges[0]} delay="delay-300" />}
              {badges[2] && <Badge text={badges[2]} delay="delay-500" />}
            </div>

            {/* Profile Card */}
            <ProfileCard 
              name={profile?.name} 
              image={profile?.image} 
            />

            {/* Bottom Badges Row */}
            <div className="grid grid-cols-2 gap-4 mt-8 lg:mt-0 lg:absolute lg:-bottom-14 lg:-inset-x-16 lg:flex lg:justify-between lg:px-0">
              {badges[1] && <Badge text={badges[1]} delay="delay-700" />}
              {badges[3] && <Badge text={badges[3]} delay="delay-1000" />}
            </div>
          </div>
        </div>
      </div>

      {/* Entry Step 1: Selection */}
      <ServiceSelectionModal 
        isOpen={isSelectionModalOpen} 
        onClose={() => setIsSelectionModalOpen(false)} 
        onSelectService={handleServiceSelect}
      />

      {/* Entry Step 3: Slice 4 Journey */}
      <DeliverProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
      />

      {/* Entry Step 4: Slice 5 Journey */}
      <MentorMeModal 
        isOpen={isMentorModalOpen} 
        onClose={() => setIsMentorModalOpen(false)} 
      />

      <CoffeeMeModal
        isOpen={isCoffeeModalOpen}
        onClose={() => setIsCoffeeModalOpen(false)}
      />
    </section>
  );
};

export default HeroSection;
