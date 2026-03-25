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

// No more modals required for now as per CTA cleanup (Slices 3-6)

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
});
