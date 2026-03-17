import { lazy } from 'react';

export const componentRegistry: Record<string, React.LazyExoticComponent<any>> = {
  AnalyticsDashboard: lazy(() => import('./AnalyticsDashboard')),
  Listings: lazy(() => import('./placeholder/index').then(m => ({ default: m.Listings }))),
  Leads: lazy(() => import('./placeholder/index').then(m => ({ default: m.Leads }))),
  Bookings: lazy(() => import('./placeholder/index').then(m => ({ default: m.Bookings }))),
  Feedback: lazy(() => import('./placeholder/index').then(m => ({ default: m.Feedback }))),
  Finances: lazy(() => import('./placeholder/index').then(m => ({ default: m.Finances }))),
};
