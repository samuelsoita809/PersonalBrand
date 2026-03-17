import { useCallback } from 'react';
import { createLogger } from '@monorepo/shared';

const logger = createLogger('Analytics');

export const useAnalytics = () => {
  const trackEvent = useCallback((eventName: string, data?: any) => {
    // In a real app, this would send to GA/PostHog/etc.
    // For now, we use our shared logger which is already instrumented.
    logger.info(`Tracking Event: ${eventName}`, data);
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, data);
    }
  }, []);

  return { trackEvent };
};
