/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import PageTracker from '../PageTracker';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import { useAnalytics } from '../../context/analytics';
import React from 'react';

// Mock behavior for analytics
vi.mock('../../context/analytics', () => ({
  useAnalytics: vi.fn()
}));

const TestApp = () => (
  <MemoryRouter initialEntries={['/']}>
    <nav>
      <Link to="/about">About</Link>
    </nav>
    <Routes>
      <Route path="/" element={<PageTracker />} />
      <Route path="/about" element={<PageTracker />} />
    </Routes>
  </MemoryRouter>
);

describe('PageTracker Component', () => {
  const mockTrackEvent = vi.fn();

  beforeEach(() => {
    (useAnalytics as Mock).mockReturnValue({ trackEvent: mockTrackEvent });
    mockTrackEvent.mockClear();
  });

  it('tracks a page_view on initial mount', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PageTracker />
      </MemoryRouter>
    );

    expect(mockTrackEvent).toHaveBeenCalledWith('page_view', expect.objectContaining({
      path: '/'
    }));
  });

  it('tracks multiple page_views on navigation', () => {
    render(<TestApp />);
    
    // Initial mount on '/'
    expect(mockTrackEvent).toHaveBeenCalledWith('page_view', expect.objectContaining({ path: '/' }));
    
    // Perform navigation
    const link = screen.getByText('About');
    fireEvent.click(link);
    
    // After navigation to '/about'
    expect(mockTrackEvent).toHaveBeenCalledTimes(2);
    expect(mockTrackEvent).toHaveBeenLastCalledWith('page_view', expect.objectContaining({ path: '/about' }));
  });
});
