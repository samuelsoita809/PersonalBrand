import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { 
  useAnalytics, 
  __resetAnalyticsCacheForTesting, 
  __resetAnalyticsQueueForTesting,
  __runQueueProcessorForTesting 
} from '../analytics';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock crypto.randomUUID
if (!global.crypto) {
  (global as any).crypto = { randomUUID: vi.fn(() => 'test-uuid-123') };
} else {
  (global.crypto as any).randomUUID = vi.fn(() => 'test-uuid-123');
}

describe('useAnalytics Hook', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, status: 204 })));
    localStorageMock.clear();
    __resetAnalyticsCacheForTesting();
    __resetAnalyticsQueueForTesting();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('generates and persists a session ID on first event attempt', () => {
    // Clear any previous state
    localStorageMock.clear();
    
    // Render the hook
    const { result } = renderHook(() => useAnalytics());
    
    // Trigger an event to lazy-initialize the session ID
    result.current.trackEvent('test_event');
    
    const sid = localStorageMock.getItem('analytics_session_id');
    expect(sid).toBe('test-uuid-123');
  });

  it('routes page_view events to the specialized endpoint', async () => {
    const { result } = renderHook(() => useAnalytics());
    
    result.current.trackEvent('page_view', { path: '/' });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/events/page-view',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"path":"/"')
      })
    );
  });

  it('routes other events to the standard analytics endpoint', async () => {
    const { result } = renderHook(() => useAnalytics());
    
    result.current.trackEvent('button_click', { id: 'btn-1' });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/analytics/events',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"event_name":"button_click"')
      })
    );
  });

  it('prevents rapid duplicate page view tracking', async () => {
    const { result } = renderHook(() => useAnalytics());
    
    // First call
    result.current.trackEvent('page_view');
    // Second call immediately
    result.current.trackEvent('page_view');

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('allows page view tracking after 1 second debounce', async () => {
    const { result } = renderHook(() => useAnalytics());
    
    // First call
    result.current.trackEvent('page_view');
    
    // Advance time
    vi.advanceTimersByTime(1100);
    
    // Second call
    result.current.trackEvent('page_view');

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('retries failed requests periodically', async () => {
    // Switch to real timers for this async test to avoid fake timer timeout issues
    vi.useRealTimers();
    let callCount = 0;
    
    // Mock fetch to fail first, then succeed
    vi.stubGlobal('fetch', vi.fn(async () => {
      callCount++;
      if (callCount === 1) {
        throw new Error('Network failure');
      }
      return { ok: true, status: 204 };
    }));

    const { result } = renderHook(() => useAnalytics());
    
    // 1. Initial attempt fails
    result.current.trackEvent('test_retry');
    
    // Wait for the initial failure
    await vi.waitFor(() => {
      if (callCount < 1) throw new Error('First call not yet made');
    }, { timeout: 2000 });

    // Yield to microtasks to let the .catch() block of trackEvent run and push to the queue
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // 2. Trigger the processor explicitly
    __runQueueProcessorForTesting();
    
    // 3. Verify it was called again
    await vi.waitFor(() => {
      if (callCount < 2) throw new Error('Retry call not yet made');
    }, { timeout: 2000 });
  });
});
