import React, { useEffect, useState, Suspense, lazy } from 'react';
import HeroText from './HeroText';
import ProfileCard from './ProfileCard';
import CTAButtons from './CTAButtons';
import { useAnalytics } from '../context/analytics';
import { isFeatureEnabled } from '@monorepo/shared';

// Lazy load modals for performance optimization (DevSecOps requirement)
const WorkModal = lazy(() => import('./WorkModal'));

const HERO_CONFIG = {
  heading: "Build Better Digital Experiences",
  subheading: "Simple, fast, and beautiful platforms that win and get real results",
  intro: "Websites and apps that are easy to use, look great, and work fast. Get more customers with ease. No stress, no confusion — just simple, reliable solutions that help you grow.",
  profile: {
    name: "Samuel Soita",
    image: "/profile.png"
  },
  ctas: [
    {
      id: "work",
      label: "Work With Me",
      type: "primary" as const,
      disabled: true
    },
    {
      id: "help",
      label: "Help Me Free",
      type: "secondary" as const,
      disabled: true
    }
  ]
};

const HeroSection: React.FC = () => {
  const { heading, subheading, intro, profile, ctas } = HERO_CONFIG;
  const { trackEvent } = useAnalytics();
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [journeyType, setJourneyType] = useState<'work' | 'help'>('work');

  // Feature Flag Check
  if (!isFeatureEnabled('NEW_HERO_SECTION')) {
    return null;
  }

  useEffect(() => {
    trackEvent('hero_view', {
      heading,
      timestamp: new Date().toISOString()
    });
  }, [trackEvent, heading]);

  const handleCtaClick = (id: string, label: string) => {
    trackEvent('cta_click', { ctaId: id, ctaLabel: label });
    
    if (id === 'work' || id === 'help') {
      setJourneyType(id as 'work' | 'help');
      setIsWorkModalOpen(true);
      trackEvent('modal_open', { type: id });
    }
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center py-20 px-6 overflow-hidden">
      {/* Background elements inherited from layout */}
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

        {/* Left Column: Text & CTAs */}
        <div className="lg:col-span-7 space-y-10 order-2 lg:order-1">
          <HeroText
            heading={heading}
            subheading={subheading}
            intro={intro}
          />

          <CTAButtons 
            ctas={ctas} 
            onCtaClick={handleCtaClick} 
          />
        </div>

        {/* Right Column: Profile Card */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2">
          <ProfileCard />
        </div>

      </div>

      {/* Modals with Suspense for optimized building */}
      <Suspense fallback={null}>
        {isWorkModalOpen && (
          <WorkModal
            isOpen={isWorkModalOpen}
            onClose={() => setIsWorkModalOpen(false)}
            journeyType={journeyType}
          />
        )}
      </Suspense>
    </section>
  );
};

export default HeroSection;
