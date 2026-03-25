import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import HeroSection from '../HeroSection';
import React from 'react';
import * as analytics from '../../context/analytics';

// Mock dependencies
vi.mock('../../context/analytics', () => ({
  useAnalytics: vi.fn()
}));

vi.mock('../../config/hero-content.json', () => ({
  default: {
    heading: "Test Heading",
    subheading: "Test Subheading",
    paragraph: "Test Paragraph",
    profile: { name: "Test User", image: "/test.png" },
    badges: ["Badge 1", "Badge 2", "Badge 3", "Badge 4"]
  }
}));

describe('HeroSection Component (Slice 7)', () => {
  const mockTrackEvent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (analytics.useAnalytics as Mock).mockReturnValue({ trackEvent: mockTrackEvent });
  });

  it('renders all 4 fun fact badges', () => {
    render(<HeroSection />);
    expect(screen.getByText('Badge 1')).toBeDefined();
    expect(screen.getByText('Badge 2')).toBeDefined();
    expect(screen.getByText('Badge 3')).toBeDefined();
    expect(screen.getByText('Badge 4')).toBeDefined();
  });

  it('triggers profile_card_view analytics event on mount', () => {
    render(<HeroSection />);
    expect(mockTrackEvent).toHaveBeenCalledWith('profile_card_view', expect.any(Object));
  });

  it('renders the profile card with dynamic name', () => {
    render(<HeroSection />);
    expect(screen.getByText('Test User')).toBeDefined();
  });
});
