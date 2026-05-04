/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CoffeeMeModal from '../CoffeeMeModal';
import React from 'react';
import * as analytics from '../../../context/analytics';

vi.mock('../../../context/analytics', () => ({
  useAnalytics: vi.fn()
}));

// Mock fetch for submission testing
global.fetch = vi.fn();

describe('CoffeeMeModal Component (Consultancy Journey Integration)', () => {
  const mockTrackEvent = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (analytics.useAnalytics as Mock).mockReturnValue({ trackEvent: mockTrackEvent });
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success', requestId: 'coffee-123' })
    });
  });

  it('renders Step 1: Pricing Tiers by default when open', () => {
    render(<CoffeeMeModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText(/Coffee With Me: Choose Your Plan/i)).toBeDefined();
    expect(screen.getByText('Starter')).toBeDefined();
    expect(screen.getByText('Growth')).toBeDefined();
    expect(screen.getByText('Pro')).toBeDefined();
  });

  it('transitions through the 3-step state machine correctly', async () => {
    render(<CoffeeMeModal isOpen={true} onClose={mockOnClose} />);
    
    // Step 1: Plans
    fireEvent.click(screen.getByText('Growth'));
    expect(mockTrackEvent).toHaveBeenCalledWith('coffee_plan_selected', { planId: 'growth' });

    // Step 2: Form
    expect(await screen.findByText(/Define Your Idea & Urgency/i)).toBeDefined();
    fireEvent.change(screen.getByPlaceholderText(/Your name/i), { target: { value: 'Tester' } });
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), { target: { value: 'test@example.com' } });
    
    // Select Urgency
    fireEvent.click(screen.getByText(/High/i));

    fireEvent.change(screen.getByPlaceholderText(/Describe your challenge in detail/i), { 
      target: { value: 'I need help with React performance optimization and high-scale SSR challenges with Drizzle.' } 
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }));

    // Step 3: Success
    await waitFor(() => {
      expect(screen.getByText(/Consultancy Request Received!/i)).toBeDefined();
    }, { timeout: 3000 });

    expect(mockTrackEvent).toHaveBeenCalledWith('Work With Me - Coffee With Me Journey Completed', expect.objectContaining({
      plan: 'growth',
      urgency: 'high'
    }));
  });

  it('allows going back through the journey', async () => {
    render(<CoffeeMeModal isOpen={true} onClose={mockOnClose} />);
    
    // To Step 2
    fireEvent.click(screen.getByText('Growth'));
    expect(await screen.findByText(/Define Your Idea & Urgency/i)).toBeDefined();

    // Back to Step 1
    fireEvent.click(screen.getByLabelText(/Back to Plans/i));
    expect(await screen.findByText(/Coffee With Me: Choose Your Plan/i)).toBeDefined();
  });
});
