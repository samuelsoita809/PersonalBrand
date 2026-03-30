import { describe, it, expect, vi, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../Navbar';
import * as analytics from '../../context/analytics';
import React from 'react';

// Mock the hooks
vi.mock('../../context/analytics', () => ({
  useAnalytics: vi.fn()
}));

describe('Navbar Component (Slice 1)', () => {
  const mockTrackEvent = vi.fn();

  it('renders the logo with correct text', () => {
    (analytics.useAnalytics as Mock).mockReturnValue({ trackEvent: mockTrackEvent });
    render(<Navbar />);
    expect(screen.getByText('S')).toBeDefined();
    expect(screen.getByText(/Samuel/)).toBeDefined();
  });

  it('has correct accessibility attributes', () => {
    (analytics.useAnalytics as Mock).mockReturnValue({ trackEvent: mockTrackEvent });
    render(<Navbar />);
    const link = screen.getByRole('link', { name: /Go to homepage/i });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/');
  });

  it('triggers analytics event on logo click', () => {
    (analytics.useAnalytics as Mock).mockReturnValue({ trackEvent: mockTrackEvent });
    
    render(<Navbar />);
    const logoLink = screen.getByRole('link', { name: /Go to homepage/i });
    fireEvent.click(logoLink);
    
    expect(mockTrackEvent).toHaveBeenCalledWith('navbar_logo_click', expect.anything());
  });
});
