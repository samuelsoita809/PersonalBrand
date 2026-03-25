import React, { useEffect } from 'react';
import HeroText from './HeroText';
import ProfileCard from './ProfileCard';
import CTAButtons from './CTAButtons';
import { useAnalytics } from '../context/analytics';
import heroConfig from '../config/hero-content.json';

const HeroSection: React.FC = () => {
  const { heading, subheading, paragraph } = heroConfig;
  const ctas = (heroConfig as any).ctas || [];
  const { trackEvent } = useAnalytics();

  // Unified Scroll Tracking Logic
  useEffect(() => {
    // Initial Impression
    trackEvent('hero_view', {
      heading,
      timestamp: new Date().toISOString(),
      version: '2.0.0-slice2'
    });

    // Milestone Tracking
    const milestones = [25, 50, 75, 100];
    const tracked = new Set<number>();

    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      milestones.forEach(m => {
        if (scrollPercent >= m && !tracked.has(m)) {
          trackEvent('scroll_depth_milestone', {
            milestone_percent: m,
            timestamp: new Date().toISOString()
          });
          tracked.add(m);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackEvent, heading]);

  const handleCtaClick = (id: string, label: string) => {
    trackEvent('cta_click', { ctaId: id, ctaLabel: label });
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center py-24 px-6 overflow-hidden">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center z-10">
        
        {/* Left Column: Context-Rich Content */}
        <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-left-10 duration-1000">
          <HeroText
            heading={heading}
            subheading={subheading}
            paragraph={paragraph}
          />

          <CTAButtons 
            ctas={ctas as any} 
            onCtaClick={handleCtaClick} 
          />
        </div>

        {/* Right Column: Experience Visualization (Reserved Space for Profile Card) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-10 duration-1000 delay-200">
          <ProfileCard />
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
