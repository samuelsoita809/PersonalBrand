type CtaType = 'deliver_project' | 'mentor_me' | 'coffee_with_me';

interface CtaEvent {
  ctaType: CtaType;
  sessionId: string;
  timestamp: string;
}

class EventDispatcher {
  private debounceMap: Map<string, number> = new Map();
  private readonly DEBOUNCE_MS = 300;

  /**
   * Captures a CTA click with debounce logic
   */
  public captureClick(ctaType: CtaType, sessionId: string, onValid: (event: CtaEvent) => void) {
    const now = Date.now();
    const lastClick = this.debounceMap.get(ctaType) || 0;

    if (now - lastClick < this.DEBOUNCE_MS) {
      console.warn(`[EventDispatcher] Debouncing rapid click for: ${ctaType}`);
      return;
    }

    this.debounceMap.set(ctaType, now);

    const event: CtaEvent = {
      ctaType,
      sessionId,
      timestamp: new Date().toISOString()
    };

    onValid(event);
  }

  /**
   * Resets the debounce map (Used for testing)
   */
  public reset() {
    this.debounceMap.clear();
  }
}

export const eventDispatcher = new EventDispatcher();
