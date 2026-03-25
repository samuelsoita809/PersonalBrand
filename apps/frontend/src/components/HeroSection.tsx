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

        {/* Right Column: Trust Anchor — padded wrapper keeps badges clear of the card */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-10 duration-1000 delay-200">

          {/* Padded wrapper: padding = buffer between card and badge positions */}
          <div className="relative py-14 px-10">

            {/* ↖ Top-Left — 100+ People Helped */}
            {badges[0] && (
              <div className="absolute top-3 left-0 animate-in fade-in duration-700 delay-300">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl shadow-lg hover:scale-105 transition-transform cursor-default whitespace-nowrap">
                  <span className="text-[10px] font-bold text-white/75 uppercase tracking-wider">{badges[0]}</span>
                </div>
              </div>
            )}

            {/* ↗ Top-Right — 3+ Industries Worked In */}
            {badges[2] && (
              <div className="absolute top-3 right-0 animate-in fade-in duration-700 delay-500">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl shadow-lg hover:scale-105 transition-transform cursor-default whitespace-nowrap">
                  <span className="text-[10px] font-bold text-white/75 uppercase tracking-wider">{badges[2]}</span>
                </div>
              </div>
            )}

            {/* Profile Card — center anchor */}
            <ProfileCard 
              name={profile?.name} 
              image={profile?.image} 
            />

            {/* ↙ Bottom-Left — 10+ Projects Delivered */}
            {badges[1] && (
              <div className="absolute bottom-3 left-0 animate-in fade-in duration-700 delay-700">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl shadow-lg hover:scale-105 transition-transform cursor-default whitespace-nowrap">
                  <span className="text-[10px] font-bold text-white/75 uppercase tracking-wider">{badges[1]}</span>
                </div>
              </div>
            )}

            {/* ↘ Bottom-Right — 80% Clients Return or Refer */}
            {badges[3] && (
              <div className="absolute bottom-3 right-0 animate-in fade-in duration-700 delay-1000">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl shadow-lg hover:scale-105 transition-transform cursor-default whitespace-nowrap">
                  <span className="text-[10px] font-bold text-white/75 uppercase tracking-wider">{badges[3]}</span>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
