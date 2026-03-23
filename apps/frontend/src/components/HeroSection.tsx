import React, { useEffect, useState, Suspense, lazy } from 'react';
import HeroText from './HeroText';
import ProfileCard from './ProfileCard';
import CTAButtons from './CTAButtons';
import { useAnalytics } from '../context/analytics';
import { isFeatureEnabled } from '@monorepo/shared';

// Lazy load modals for performance optimization (DevSecOps requirement)
const WorkModal = lazy(() => import('./WorkModal'));
const ConnectModal = lazy(() => import('./ConnectModal'));

const HERO_CONFIG = {
  heading: "Samuel Soita",
  subheading: "Engineering the Future of Digital Innovation",
  intro: "Specialized in crafting secure, high-performance systems and visually refined digital experiences. Building scalable, premium web applications that align advanced technology with distinct brand identity.",
  profile: {
    name: "Samuel Soita",
    role: "Founder & Lead Engineer",
    image: "/profile.png"
  },
  ctas: [
    {
      id: "work",
      label: "Work With Me",
      type: "primary" as const
    },
    {
      id: "help",
      label: "Help Me Free (Coming Soon)",
      type: "secondary" as const,
      disabled: true
    }
  ]
};

const HeroSection: React.FC = () => {
  const { heading, subheading, intro, profile, ctas } = HERO_CONFIG;
  const { trackEvent } = useAnalytics();
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

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
    if (id === 'work') {
      trackEvent('cta_work_click', { label });
      setIsWorkModalOpen(true);
      trackEvent('modal_open', { type: 'work' });
    } else if (id === 'help') {
      trackEvent('cta_help_click', { label });
      // For now, let's open the work modal but we could create a specialized one later
      setIsWorkModalOpen(true); 
      trackEvent('modal_open', { type: 'help' });
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
          <ProfileCard
            name={profile.name}
            role={profile.role}
            image={profile.image}
          />
        </div>

      </div>

      {/* Modals with Suspense for optimized building */}
      <Suspense fallback={null}>
        <WorkModal
          isOpen={isWorkModalOpen}
          onClose={() => setIsWorkModalOpen(false)}
        />
        <ConnectModal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
        />
      </Suspense>
    </section>
  );
};

export default HeroSection;
