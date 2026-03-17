import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HeroSection from '../HeroSection';
import React from 'react';
import * as shared from '@monorepo/shared';
import * as analytics from '../../context/analytics';

// Mock dependencies
vi.mock('@monorepo/shared', () => ({
  isFeatureEnabled: vi.fn()
}));

vi.mock('../../context/analytics', () => ({
  useAnalytics: vi.fn()
}));

// Mock lazy-loaded modals
vi.mock('../WorkWithMeModal', () => ({
  default: vi.fn(({ isOpen }) => isOpen ? <div data-testid="work-modal">Work Modal</div> : null)
}));

vi.mock('../ConnectWithMeModal', () => ({
  default: vi.fn(({ isOpen }) => isOpen ? <div data-testid="connect-modal">Connect Modal</div> : null)
}));

describe('HeroSection Component', () => {
  const mockTrackEvent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (analytics.useAnalytics as Mock).mockReturnValue({ trackEvent: mockTrackEvent });
  });

  it('should not render when feature flag is disabled', () => {
    (shared.isFeatureEnabled as Mock).mockReturnValue(false);
    const { container } = render(<HeroSection />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when feature flag is enabled', () => {
    (shared.isFeatureEnabled as Mock).mockReturnValue(true);
    render(<HeroSection />);
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
  });

  it('should show Work modal when Work button is clicked', async () => {
    (shared.isFeatureEnabled as Mock).mockReturnValue(true);
    render(<HeroSection />);
    
    const workButton = screen.getByText(/Work With Me/i);
    fireEvent.click(workButton);
    
    // Check if trackEvent was called
    expect(mockTrackEvent).toHaveBeenCalledWith('cta_work_click', expect.anything());
    expect(mockTrackEvent).toHaveBeenCalledWith('modal_open', { type: 'work_with_me' });

    // Wait for the modal (which is lazy/mocked)
    const modal = await screen.findByTestId('work-modal');
    expect(modal).toBeDefined();
  });
});
