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

const getDeviceType = () => {
    if (typeof window === 'undefined') return 'unknown';
    const width = window.innerWidth;
    if (width < 768) return 'Mobile';
    if (width < 1024) return 'Tablet';
    return 'Desktop';
};

export const useAnalytics = () => {
  const sessionId = useRef(getSessionId());
  const deviceType = useRef(getDeviceType());

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
          device_type: deviceType.current,
          url: window.location.href,
          path: window.location.pathname,
          timestamp: new Date().toISOString(),
          screen_resolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'unknown',
        }
      })
    }).catch(err => logger.error('Failed to send analytics to backend', err));

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, { ...data, session_id: sessionId.current });
    }
  }, []);

  return { trackEvent };
};
