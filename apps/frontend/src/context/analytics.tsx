import { useCallback, useEffect, useRef } from 'react';
import { createLogger } from '@monorepo/shared';

const logger = createLogger('Analytics');

// Generate a simple session ID
const getSessionId = () => {
  if (typeof window === 'undefined') return 'ssr';
  let sid = localStorage.getItem('analytics_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem('analytics_session_id', sid);
  }
  return sid;
};

export const useAnalytics = () => {
  const sessionId = useRef(getSessionId());

  const trackEvent = useCallback((eventName: string, data?: any) => {
    logger.info(`Tracking Event: ${eventName}`, { sid: sessionId.current, ...data });
    
    // Send to backend
    fetch('/api/v1/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        metadata: {
          ...data,
          session_id: sessionId.current,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }
      })
    }).catch(err => logger.error('Failed to send analytics to backend', err));

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, { ...data, session_id: sessionId.current });
    }
  }, []);

  return { trackEvent };
};
