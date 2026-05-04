/** @vitest-environment jsdom */
/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import HeroSection from '../HeroSection';
import React from 'react';
import * as analytics from '../../context/analytics';
import * as ModalContext from '../../context/ModalContext';

vi.mock('../../context/analytics', () => ({
  useAnalytics: vi.fn()
}));

vi.mock('../../context/ModalContext', () => ({
  ModalProvider: ({ children }: any) => <div>{children}</div>,
  useModals: vi.fn()
}));

vi.mock('../../config/hero-content.json', () => ({
  default: {
    heading: "Test Heading",
    subheading: "Test Subheading",
    paragraph: "Test Paragraph",
    profile: { name: "Test User", image: "/test.png" },
    ctas: [
      { id: "work_with_me", label: "Work with Me", variant: "primary" }
    ],
    badges: ["Badge 1", "Badge 2", "Badge 3", "Badge 4"]
  }
}));

describe('HeroSection Component (Hardening - Service Selection Flow)', () => {
  const mockTrackEvent = vi.fn();
  const mockOpenModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (analytics.useAnalytics as Mock).mockReturnValue({ trackEvent: mockTrackEvent });
    (ModalContext.useModals as Mock).mockReturnValue({ openModal: mockOpenModal });
  });

  it('renders "Work with Me" CTA correctly', () => {
    render(<HeroSection />);
    expect(screen.getByText('Work with Me')).toBeDefined();
  });

  it('triggers openModal("service_selection") after clicking Work with Me CTA (after 300ms delay)', () => {
    render(<HeroSection />);
    const cta = screen.getAllByText('Work with Me')[0];
    
    fireEvent.click(cta);
    
    // Should NOT be called immediately due to timeout
    expect(mockOpenModal).not.toHaveBeenCalled();

    // Advance time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should be called now
    expect(mockOpenModal).toHaveBeenCalledWith('service_selection');
    expect(mockTrackEvent).toHaveBeenCalledWith('Work with me CTA Clicked', expect.any(Object));
  });

  it('does not trigger openModal if unmounted before timeout', () => {
    const { unmount } = render(<HeroSection />);
    const cta = screen.getAllByText('Work with Me')[0];
    
    fireEvent.click(cta);
    unmount();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockOpenModal).not.toHaveBeenCalled();
  });
});
