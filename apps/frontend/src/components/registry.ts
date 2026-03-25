import { lazy } from 'react';

import HeroSection from './HeroSection';

export const componentRegistry: Record<string, React.LazyExoticComponent<any> | React.FC<any>> = {
  Card: lazy(() => import('./Card')),
  InfoPanel: lazy(() => import('./InfoPanel')),
  ContactForm: lazy(() => import('./ContactForm')),
  HeroSection,
  AnalyticsDashboard: lazy(() => import('./AnalyticsDashboard')),
};

