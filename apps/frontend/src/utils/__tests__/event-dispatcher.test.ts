import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { eventDispatcher } from '../event-dispatcher';

describe('EventDispatcher', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    eventDispatcher.reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces rapid clicks and only triggers once within the window', () => {
    const callback = vi.fn();
    const sessionId = 'test-session';

    // Fire 3 clicks rapidly
    eventDispatcher.captureClick('deliver_project', sessionId, callback);
    eventDispatcher.captureClick('deliver_project', sessionId, callback);
    eventDispatcher.captureClick('deliver_project', sessionId, callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.objectContaining({
      ctaType: 'deliver_project',
      sessionId: 'test-session'
    }));
  });

  it('allows a second click after the debounce window expires', () => {
    const callback = vi.fn();
    const sessionId = 'test-session';

    // First click
    eventDispatcher.captureClick('mentor_me', sessionId, callback);
    expect(callback).toHaveBeenCalledTimes(1);

    // Advance time beyond 300ms
    vi.advanceTimersByTime(301);

    // Second click
    eventDispatcher.captureClick('mentor_me', sessionId, callback);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('treats different CTA types with independent debounce timers', () => {
    const callback = vi.fn();
    const sessionId = 'test-session';

    // Click A
    eventDispatcher.captureClick('coffee_with_me', sessionId, callback);
    // Click B immediately
    eventDispatcher.captureClick('deliver_project', sessionId, callback);

    expect(callback).toHaveBeenCalledTimes(2);
  });
});
