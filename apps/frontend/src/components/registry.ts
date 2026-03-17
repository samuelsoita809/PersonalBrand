import { lazy } from 'react';

export const componentRegistry: Record<string, React.LazyExoticComponent<any>> = {
 Card: lazy(() => import('./Card')),
 Modal: lazy(() => import('./Modal')),
 InfoPanel: lazy(() => import('./InfoPanel')),
 ContactForm: lazy(() => import('./ContactForm')),
 AnalyticsDashboard: lazy(() => import('./AnalyticsDashboard')),
};


