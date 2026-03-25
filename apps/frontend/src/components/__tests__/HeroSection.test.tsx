import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import HeroSection from '../HeroSection';
import React from 'react';
import * as analytics from '../../context/analytics';

vi.mock('../../context/analytics', () => ({
  useAnalytics: vi.fn()
}));

vi.mock('../../config/hero-content.json', () => ({
  default: {
    heading: "Test Heading",
    subheading: "Test Subheading",
    paragraph: "Test Paragraph",
    profile: { name: "Test User", image: "/test.png" },
    badges: [
      "100+ People Helped",
      "10+ Projects Delivered",
      "3+ Industries Worked In",
      "80% Clients Return or Refer"
    ]
  }
}));

describe('HeroSection Component (Slice 7 — Layout + Accessibility)', () => {
  const mockTrackEvent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (analytics.useAnalytics as Mock).mockReturnValue({ trackEvent: mockTrackEvent });
  });

  it('renders all 4 fun fact badges', () => {
    render(<HeroSection />);
    expect(screen.getByText('100+ People Helped')).toBeDefined();
    expect(screen.getByText('10+ Projects Delivered')).toBeDefined();
    expect(screen.getByText('3+ Industries Worked In')).toBeDefined();
    expect(screen.getByText('80% Clients Return or Refer')).toBeDefined();
  });

  it('triggers profile_card_view analytics event on mount', () => {
    render(<HeroSection />);
    expect(mockTrackEvent).toHaveBeenCalledWith('profile_card_view', expect.any(Object));
  });

  it('triggers hero_view analytics event on mount', () => {
    render(<HeroSection />);
    expect(mockTrackEvent).toHaveBeenCalledWith('hero_view', expect.objectContaining({
      version: '2.5.0-slice7'
    }));
  });

  it('renders the profile card with dynamic name', () => {
    render(<HeroSection />);
    expect(screen.getByText('Test User')).toBeDefined();
  });

  it('renders the Hero heading', () => {
    render(<HeroSection />);
    expect(screen.getByText('Test Heading')).toBeDefined();
  });
});
