import { useCallback, useEffect } from 'react';
import { createLogger } from '@monorepo/shared';
import { eventDispatcher } from '../utils/event-dispatcher';

const logger = createLogger('Analytics');

// --- Storage Constants ---
const QUEUE_KEY = 'pending_analytics_events';

// --- Session & Device Helpers ---
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

interface QueuedEvent {
  url: string;
  payload: any; // The payload can vary based on the endpoint, keeping any here is acceptable or we could use Record<string, unknown>
  timestamp: string;
}

// --- Queue Management ---
const getQueue = (): QueuedEvent[] => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
};

const saveQueue = (queue: QueuedEvent[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

// --- Sync & Retry Logic ---
let isSyncing = false;
let syncRetryTimeout: number | undefined;
let backoffMultiplier = 1;
const BASE_RETRY_MS = 3000;
const MAX_RETRY_MS = 60000;

const syncOfflineEvents = async () => {
  if (isSyncing || typeof window === 'undefined') return;
  
  const queue = getQueue();
  if (queue.length === 0) {
    backoffMultiplier = 1;
    return;
  }

  try {
    isSyncing = true;
    if (syncRetryTimeout) {
      clearTimeout(syncRetryTimeout);
      syncRetryTimeout = undefined;
    }

    logger.info(`[Offline Sync] Attempting to sync ${queue.length} pending events...`);

    const remainingQueue: QueuedEvent[] = [];
    let hasFailures = false;

    for (const event of queue) {
      if (hasFailures) {
        remainingQueue.push(event);
        continue;
      }

      try {
        const response = await fetch(event.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event.payload),
        });

        if (!response.ok && response.status >= 500) {
          throw new Error(`Server status ${response.status}`);
        }
      } catch (err) {
        logger.warn(`[Offline Sync] Failed to sync event. Reason: ${err instanceof Error ? err.message : 'Unknown'}`);
        remainingQueue.push(event);
        hasFailures = true;
      }
    }

    saveQueue(remainingQueue);

    if (hasFailures) {
      const delay = Math.min(BASE_RETRY_MS * backoffMultiplier, MAX_RETRY_MS);
      backoffMultiplier *= 2;
      syncRetryTimeout = window.setTimeout(syncOfflineEvents, delay);
    } else {
      backoffMultiplier = 1;
    }
  } finally {
    isSyncing = false;
  }
};

// Global state
let globalSessionId: string | null = null;
let lastPageView: Record<string, number> = {};

const getSessionIdCached = () => {
  if (!globalSessionId) globalSessionId = getSessionId();
  return globalSessionId;
};

export const useAnalytics = () => {
  // Sync on mount and network restoration
  useEffect(() => {
    syncOfflineEvents();
    const handleOnline = () => syncOfflineEvents();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const dispatch = async (url: string, payload: Record<string, unknown>) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.warn(`[Analytics] Failed dispatch to ${url}. Reason: ${message}. Queuing...`);
      const queue = getQueue();
      queue.push({ url, payload, timestamp: new Date().toISOString() });
      saveQueue(queue);
      backoffMultiplier = 1; // Reset backoff for fresh failure
      syncOfflineEvents(); // Start the sync loop if not already running
    }
  };

  const trackEvent = useCallback((eventName: string, data?: any) => {
    const sid = getSessionIdCached();
    const now = new Date().toISOString();

    const isFeaturedCta = ['deliver_project', 'mentor_me', 'coffee_with_me'].includes(eventName);
    const isStandardCta = eventName === 'cta_click' || eventName === 'cta_click_work_with_me';
    const isPageView = eventName === 'page_view';

    // 1. Featured CTA (Slice 8 - Debounced)
    if (isFeaturedCta) {
      eventDispatcher.captureClick(eventName as any, sid, (event) => {
        dispatch('/api/events', event as any);
      });
      return;
    }

    // 2. Page View (1s Debounce)
    if (isPageView) {
      const path = window.location.pathname;
      const nowMs = Date.now();
      if (lastPageView[path] && nowMs - lastPageView[path] < 1000) return;
      lastPageView[path] = nowMs;

      dispatch('/api/v1/events/page-view', {
        url: window.location.href,
        path,
        session_id: sid,
        device_type: getDeviceType(),
        metadata: { ...data, timestamp: now }
      });
      return;
    }

    // 3. Standard CTA
    if (isStandardCta) {
      dispatch('/api/v1/events/cta-click', {
        cta_name: data?.ctaLabel || data?.label || 'unknown',
        cta_id: data?.ctaId || data?.id || 'unknown',
        page_path: window.location.pathname,
        session_id: sid,
        device_type: getDeviceType(),
        metadata: { ...data, timestamp: now }
      });
      return;
    }

    // 4. Default
    dispatch('/api/v1/analytics/events', {
      event_name: eventName,
      metadata: { ...data, session_id: sid, timestamp: now }
    });
  }, []);

  return { trackEvent };
};

// --- Test Exports ---
export const __resetAnalyticsCacheForTesting = () => {
  globalSessionId = null;
  lastPageView = {};
};

export const __resetAnalyticsQueueForTesting = () => {
  isSyncing = false;
  backoffMultiplier = 1;
  if (typeof window !== 'undefined') localStorage.removeItem(QUEUE_KEY);
  if (syncRetryTimeout) {
    clearTimeout(syncRetryTimeout);
    syncRetryTimeout = undefined;
  }
};

export const __runQueueProcessorForTesting = () => {
  syncOfflineEvents();
};
