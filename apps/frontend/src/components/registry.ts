import { lazy } from 'react';

import HeroSection from './HeroSection';

export const componentRegistry: Record<string, React.LazyExoticComponent<any> | React.FC<any>> = {
  Card: lazy(() => import('./Card')),
  Modal: lazy(() => import('./Modal')),
  InfoPanel: lazy(() => import('./InfoPanel')),
  ContactForm: lazy(() => import('./ContactForm')),
  HeroSection,
};

