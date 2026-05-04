import React, { useState, useEffect, useRef } from 'react';
import HeroText from './HeroText';
import ProfileCard from './ProfileCard';
import CTAButtons from './CTAButtons';
import DeliverProjectModal from './modals/DeliverProjectModal';
import MentorMeModal from './modals/MentorMeModal';
import CoffeeMeModal from './modals/CoffeeMeModal';
import ServiceSelectionModal from './modals/ServiceSelectionModal';
import HelpMeFreeModal from './modals/HelpMeFreeModal';
import { useAnalytics } from '../context/analytics';
import { useModals } from '../context/ModalContext';
import heroConfig from '../config/hero-content.json';
import Badge from './Badge';

const HeroSection: React.FC = () => {
  const { heading, subheading, paragraph, profile, badges = [] } = heroConfig as any;
  const { trackEvent } = useAnalytics();
  const { openModal } = useModals();
  
  const ctaTimeoutRef = useRef<number | undefined>(undefined);

  // Unified Tracking
  useEffect(() => {
    trackEvent('hero section viewed', {
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
      const eventName = id === 'work_with_me' ? 'Work with me CTA Clicked' : 'Help Me Free CTA Clicked';
      trackEvent(eventName, { ctaId: id, ctaLabel: label });
      
      if (id === 'work_with_me') {
        openModal('service_selection');
      } else if (id === 'help_me_free') {
        openModal('help_me_free');
      }
      ctaTimeoutRef.current = undefined;
    }, 300);
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
    </section>
  );
};

export default HeroSection;
