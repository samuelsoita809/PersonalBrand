import React, { useEffect } from 'react';
import HeroText from './HeroText';
import ProfileCard from './ProfileCard';
import CTAButtons from './CTAButtons';
import { useAnalytics } from '../context/analytics';
import heroConfig from '../config/hero-content.json';
import Badge from './Badge';

const HeroSection: React.FC = () => {
  const { heading, subheading, paragraph, profile, badges = [] } = heroConfig;
  const { trackEvent } = useAnalytics();

  // Unified Tracking
  useEffect(() => {
    // Hero Impression
    trackEvent('hero_view', {
      heading,
      timestamp: new Date().toISOString(),
      version: '2.5.0-slice7'
    });

    // Profile Card Impression
    trackEvent('profile_card_view', {
      timestamp: new Date().toISOString()
    });

    // Milestone Tracking
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
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackEvent, heading]);

  const handleCtaClick = (id: string, label: string) => {
    trackEvent('cta_click', { ctaId: id, ctaLabel: label });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center py-24 px-6 overflow-hidden">
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

        {/* Right Column: Trust Anchor (Profile + Badges) */}
        <div className="lg:col-span-5 relative flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-10 duration-1000 delay-200">
          
          {/* Badge 1: Top-Left */}
          {badges[0] && (
            <Badge 
              text={badges[0]} 
              className="-top-8 -left-12 lg:-left-16" 
              delay="delay-300" 
            />
          )}

          {/* Badge 3: Top-Right */}
          {badges[2] && (
            <Badge 
              text={badges[2]} 
              className="-top-14 -right-4 lg:-right-8" 
              delay="delay-500" 
            />
          )}

          {/* Profile Card Center Anchor */}
          <ProfileCard 
            name={profile?.name} 
            image={profile?.image} 
          />

          {/* Badge 2: Bottom-Left */}
          {badges[1] && (
            <Badge 
              text={badges[1]} 
              className="-bottom-6 -left-14 lg:-left-20" 
              delay="delay-700" 
            />
          )}

          {/* Badge 4: Bottom-Right */}
          {badges[3] && (
            <Badge 
              text={badges[3]} 
              className="-bottom-12 -right-6 lg:-right-10" 
              delay="delay-1000" 
            />
          )}
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
