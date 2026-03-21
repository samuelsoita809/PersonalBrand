/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';
import { createLogger } from '@monorepo/shared';

const logger = createLogger('Analytics');

export const useAnalytics = () => {
  const trackEvent = useCallback((eventName: string, data?: any) => {
    logger.info(`Tracking Event: ${eventName}`, data);
    
    // Send to backend
    fetch('/api/v1/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        metadata: {
          ...data,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }
      })
    }).catch(err => logger.error('Failed to send analytics to backend', err));

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, data);
    }
  }, []);

  return { trackEvent };
};
