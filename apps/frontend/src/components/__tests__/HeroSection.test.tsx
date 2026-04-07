import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import HeroSection from '../HeroSection';
import React from 'react';
import * as analytics from '../../context/analytics';

vi.mock('../../context/analytics', () => ({
  useAnalytics: vi.fn()
}));

// Mock the heavy/complex modals to keep unit tests fast and focused
vi.mock('../modals/ServiceSelectionModal', () => ({
  default: ({ isOpen, onSelectService }: any) => isOpen ? (
    <div data-testid="service-selection-modal">
      <button onClick={() => onSelectService('deliver_project')}>Select Project</button>
    </div>
  ) : null
}));

vi.mock('../modals/DeliverProjectModal', () => ({
  default: ({ isOpen }: any) => isOpen ? <div data-testid="project-modal" /> : null
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

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (analytics.useAnalytics as Mock).mockReturnValue({ trackEvent: mockTrackEvent });
  });

  it('renders "Work with Me" CTA correctly', () => {
    render(<HeroSection />);
    expect(screen.getByText('Work with Me')).toBeDefined();
  });

  it('opens ServiceSelectionModal after clicking Work with Me CTA (after 300ms delay)', () => {
    render(<HeroSection />);
    const cta = screen.getByText('Work with Me');
    
    fireEvent.click(cta);
    
    // Should NOT be open immediately due to timeout
    expect(screen.queryByTestId('service-selection-modal')).toBeNull();

    // Advance time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should be open now
    expect(screen.getByTestId('service-selection-modal')).toBeDefined();
    expect(mockTrackEvent).toHaveBeenCalledWith('cta_click_work_with_me', expect.any(Object));
  });

  it('triggers DeliverProjectModal when service is selected', () => {
    render(<HeroSection />);
    const cta = screen.getByText('Work with Me');
    
    fireEvent.click(cta);
    act(() => {
      vi.advanceTimersByTime(300);
    });

    const selectBtn = screen.getByText('Select Project');
    fireEvent.click(selectBtn);

    // Project Modal should trigger
    expect(screen.getByTestId('project-modal')).toBeDefined();
  });
});
