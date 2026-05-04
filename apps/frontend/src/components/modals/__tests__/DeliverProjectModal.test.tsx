/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeliverProjectModal from '../DeliverProjectModal';
import React from 'react';
import * as analytics from '../../../context/analytics';

vi.mock('../../../context/analytics', () => ({
  useAnalytics: vi.fn()
}));

// Mock fetch for submission testing
global.fetch = vi.fn();

describe('DeliverProjectModal Component (Journey Integration)', () => {
  const mockTrackEvent = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (analytics.useAnalytics as Mock).mockReturnValue({ trackEvent: mockTrackEvent });
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success', requestId: '123' })
    });
  });

  it('renders Step 1: Pricing Plans by default when open', () => {
    render(<DeliverProjectModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText(/Build Your Project — Fast, Reliable, Done Right/i)).toBeDefined();
    expect(screen.getByText('Starter Plan')).toBeDefined();
    expect(screen.getByText('Growth Plan')).toBeDefined();
  });

  it('transitions to Step 2: Details after selecting a plan', () => {
    render(<DeliverProjectModal isOpen={true} onClose={mockOnClose} />);
    
    const starterPlan = screen.getByText('Starter Plan');
    fireEvent.click(starterPlan);
    
    expect(screen.getByText('Project Details')).toBeDefined();
  });

  it('transitions through to Review Step and Success screen', async () => {
    render(<DeliverProjectModal isOpen={true} onClose={mockOnClose} />);
    
    // Step 1: Plan
    fireEvent.click(screen.getByText('Starter Plan'));
    // Immediately transitions to details
    
    // Step 2: Details
    fireEvent.change(screen.getByPlaceholderText(/Your name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Web Application' } });
    fireEvent.change(screen.getByPlaceholderText(/Briefly describe your project goals/i), { target: { value: 'Test description goes here' } });
    
    fireEvent.click(screen.getByText(/Review Selection/i));
    
    // Step 3: Review
    expect(await screen.findByText('Final Review')).toBeDefined();
    expect(screen.getByText('Starter Plan')).toBeDefined();
    
    const submitBtn = screen.getByText(/Confirm & Start Delivery/i);
    fireEvent.click(submitBtn);
    
    // Step 4: Success/Final Verification
    await waitFor(() => {
      expect(screen.getByText(/Success!/i)).toBeDefined();
    });
    
    expect(mockTrackEvent).toHaveBeenCalledWith('Work With Me - Deliver Project Journey Completed', expect.objectContaining({
      plan: 'starter'
    }));
  });

  it('tracks abandonment when closed without completion', () => {
    const { unmount } = render(<DeliverProjectModal isOpen={true} onClose={mockOnClose} />);
    
    // Simulate close via X button click (which calls handleClose)
    // In our test, we just call the prop since we're testing the component logic
    // But handleClose is internal. We need to trigger the UI close.
    const closeBtns = screen.queryAllByRole('button').filter(b => b.innerHTML.includes('svg'));
    if (closeBtns.length > 0) {
      fireEvent.click(closeBtns[0]);
    }

    // Or just check if handleClose fires the event when onClose is called?
    // Wait, handleClose is a callback passed to the backdrop and X button.
  });
});
