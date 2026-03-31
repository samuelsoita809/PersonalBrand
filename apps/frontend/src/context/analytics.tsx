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

// Global retry queue for failed requests
const failedRequestsQueue: Array<{url: string, payload: any, retriesRemaining: number}> = [];

const processQueue = () => {
  if (failedRequestsQueue.length === 0) return;
  
  const req = failedRequestsQueue.shift();
  if (req) {
    fetch(req.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.payload),
    }).then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res;
    }).catch(() => {
      if (req.retriesRemaining > 0) {
        failedRequestsQueue.push({ ...req, retriesRemaining: req.retriesRemaining - 1 });
      } else {
        logger.error('Failed to send analytics event after max retries', req.url);
      }
    });
  }
};

// Process the queue periodically
if (typeof window !== 'undefined') {
  setInterval(processQueue, 5000);
}

// Global state for analytics to prevent issues with React StrictMode and multiple hook instances
let globalSessionId: string | null = null;
let globalDeviceType: string | null = null;
let globalLastPageView: { path: string, time: number } | null = null;

const getSessionIdCached = () => {
  if (!globalSessionId) globalSessionId = getSessionId();
  return globalSessionId;
};

const getDeviceTypeCached = () => {
  if (!globalDeviceType) globalDeviceType = getDeviceType();
  return globalDeviceType;
};

export const useAnalytics = () => {
  const trackEvent = useCallback((eventName: string, data?: any) => {
    const sid = getSessionIdCached();
    logger.info(`Tracking Event: ${eventName}`, { sid, ...data });
    
    // Prevent duplicate rapid page views (within 1 second)
    const now = Date.now();
    if (eventName === 'page_view') {
      const currentPath = window.location.pathname;
      if (globalLastPageView && 
          globalLastPageView.path === currentPath && 
          (now - globalLastPageView.time) < 1000) {
        logger.info('Skipping rapid duplicate page view');
        return;
      }
      globalLastPageView = { path: currentPath, time: now };
    }

    const isPageView = eventName === 'page_view';
    const isCtaClick = eventName === 'cta_click' || eventName === 'cta_click_work_with_me';
    
    let endpoint = '/api/v1/analytics/events';
    if (isPageView) endpoint = '/api/v1/events/page-view';
    if (isCtaClick) endpoint = '/api/v1/events/cta-click';
    
    const baseMetadata = {
      event_name: eventName,
      ...data,
      session_id: sid,
      device_type: getDeviceTypeCached(),
      url: window.location.href,
      path: window.location.pathname,
      timestamp: new Date().toISOString(),
      screen_resolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'unknown',
    };

    let payload: any;
    if (isPageView) {
      payload = {
        url: baseMetadata.url,
        path: baseMetadata.path,
        session_id: baseMetadata.session_id,
        device_type: baseMetadata.device_type,
        metadata: baseMetadata
      };
    } else if (isCtaClick) {
      payload = {
        cta_name: data?.ctaLabel || data?.label || 'unknown',
        cta_id: data?.ctaId || data?.id || 'unknown',
        page_path: baseMetadata.path,
        session_id: baseMetadata.session_id,
        device_type: baseMetadata.device_type,
        metadata: baseMetadata
      };
    } else {
      payload = {
        event_name: eventName,
        metadata: baseMetadata
      };
    }

    // Send to backend
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res;
    }).catch(() => {
      logger.warn(`Failed to send event to ${endpoint}, adding to retry queue`);
      failedRequestsQueue.push({ url: endpoint, payload, retriesRemaining: 3 });
    });

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, { ...data, session_id: sid });
    }
  }, []);

  return { trackEvent };
};

export const __resetAnalyticsCacheForTesting = () => {
  globalSessionId = null;
  globalDeviceType = null;
  globalLastPageView = null;
};

export const __resetAnalyticsQueueForTesting = () => {
  failedRequestsQueue.length = 0;
};

export const __runQueueProcessorForTesting = () => {
  processQueue();
};
