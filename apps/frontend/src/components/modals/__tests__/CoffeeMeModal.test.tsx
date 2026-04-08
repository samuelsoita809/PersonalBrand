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

  it('renders Step 1: Consultancy Options by default when open', () => {
    render(<CoffeeMeModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByRole('heading', { name: /Coffee With Me: Get Clarity Fast/i })).toBeDefined();
    expect(screen.getByText('15-Minute Quick Chat')).toBeDefined();
    expect(screen.getByText('Audit My Website')).toBeDefined();
    expect(screen.getByText('Tech Catch-Up')).toBeDefined();
  });

  it('transitions through the 4-step state machine correctly', async () => {
    render(<CoffeeMeModal isOpen={true} onClose={mockOnClose} />);
    
    // Step 1: Options
    fireEvent.click(screen.getByText('15-Minute Quick Chat'));
    expect(mockTrackEvent).toHaveBeenCalledWith('coffee_option_selected', { optionId: '15_min_chat' });

    // Step 2: Plans
    expect(await screen.findByRole('heading', { name: /Choose Your Consultancy Plan/i })).toBeDefined();
    fireEvent.click(screen.getByText('Growth'));
    expect(mockTrackEvent).toHaveBeenCalledWith('coffee_plan_selected', { planId: 'growth' });

    // Step 3: Form
    expect(await screen.findByRole('heading', { name: /Define Your Quick Wins/i })).toBeDefined();
    fireEvent.change(screen.getByPlaceholderText(/Your name/i), { target: { value: 'Tester' } });
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Describe your challenge/i), { 
      target: { value: 'I need help with React performance optimization.' } 
    });

    fireEvent.click(screen.getByText(/Submit Request/i));

    // Step 4: Success
    await waitFor(() => {
      expect(screen.getByText(/Consultancy Request Received!/i)).toBeDefined();
    }, { timeout: 3000 });

    expect(mockTrackEvent).toHaveBeenCalledWith('coffee_submitted', expect.objectContaining({
      option: '15_min_chat',
      plan: 'growth'
    }));
  });

  it('allows going back through the journey', async () => {
    render(<CoffeeMeModal isOpen={true} onClose={mockOnClose} />);
    
    // To Step 2
    fireEvent.click(screen.getByText('15-Minute Quick Chat'));
    expect(await screen.findByRole('heading', { name: /Choose Your Consultancy Plan/i })).toBeDefined();

    // Back to Step 1
    fireEvent.click(screen.getByText(/Change Consultancy Option/i));
    expect(await screen.findByRole('heading', { name: /Coffee With Me: Get Clarity Fast/i })).toBeDefined();

    // To Step 2 again
    fireEvent.click(screen.getByText('Audit My Website'));
    
    // To Step 3
    fireEvent.click(screen.getByText('Growth'));
    expect(await screen.findByRole('heading', { name: /Define Your Quick Wins/i })).toBeDefined();

    // Back to Step 2
    fireEvent.click(screen.getByLabelText(/Back to Plans/i));
    expect(await screen.findByRole('heading', { name: /Choose Your Consultancy Plan/i })).toBeDefined();
  });
});
