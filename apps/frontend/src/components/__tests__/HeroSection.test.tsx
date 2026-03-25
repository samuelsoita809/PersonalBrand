import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import HeroSection from '../HeroSection';
import React from 'react';
import * as analytics from '../../context/analytics';
import heroConfig from '../../config/hero-content.json';

// Mock dependencies
vi.mock('../../context/analytics', () => ({
  useAnalytics: vi.fn()
}));

// Mock the config for stability in tests
vi.mock('../../config/hero-content.json', () => ({
  default: {
    heading: "Test Heading",
    subheading: "Test Subheading",
    paragraph: "Test Paragraph",
    ctas: []
  }
}));

describe('HeroSection Component (Slice 2)', () => {
  const mockTrackEvent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (analytics.useAnalytics as Mock).mockReturnValue({ trackEvent: mockTrackEvent });
  });

  it('renders the heading from config', () => {
    render(<HeroSection />);
    expect(screen.getByText('Test Heading')).toBeDefined();
  });

  it('renders the subheading from config', () => {
    render(<HeroSection />);
    expect(screen.getByText('Test Subheading')).toBeDefined();
  });

  it('renders the paragraph from config', () => {
    render(<HeroSection />);
    expect(screen.getByText('Test Paragraph')).toBeDefined();
  });

  it('triggers hero_view analytics event on mount', () => {
    render(<HeroSection />);
    expect(mockTrackEvent).toHaveBeenCalledWith('hero_view', expect.objectContaining({
      heading: 'Test Heading'
    }));
  });
});
