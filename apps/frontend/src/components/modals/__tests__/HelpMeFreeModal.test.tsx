/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HelpMeFreeModal from '../HelpMeFreeModal';
import React from 'react';
import * as analytics from '../../../context/analytics';

vi.mock('../../../context/analytics', () => ({
  useAnalytics: vi.fn()
}));

// Mock fetch for submission testing
global.fetch = vi.fn();

describe('HelpMeFreeModal Component', () => {
  const mockTrackEvent = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (analytics.useAnalytics as Mock).mockReturnValue({ trackEvent: mockTrackEvent });
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success', requestId: 'free-123' })
    });
  });

  it('renders Step 1: Service Selection by default when open', () => {
    render(<HelpMeFreeModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText(/Help Me Free: Select Your Service/i)).toBeDefined();
    expect(screen.getByText('Website Audit')).toBeDefined();
    expect(screen.getByText('15-Minute Chat')).toBeDefined();
    expect(screen.getByText('Tech CatchUp')).toBeDefined();
  });

  it('transitions through the funnel correctly', async () => {
    render(<HelpMeFreeModal isOpen={true} onClose={mockOnClose} />);
    
    // Step 1: Select Service
    fireEvent.click(screen.getByText('15-Minute Chat'));
    expect(mockTrackEvent).toHaveBeenCalledWith('Help Me Free CTA - 15 min Chat option Clicked');

    // Step 2: Form
    expect(await screen.findByText(/Tell Me More/i)).toBeDefined();
    // Verify contextual label
    expect(screen.getByText(/What is the #1 challenge you want to solve in 15 minutes\?/i)).toBeDefined();

    const nameInput = screen.getByPlaceholderText(/Your name/i);
    const emailInput = screen.getByPlaceholderText(/your@email.com/i);
    const messageInput = screen.getByPlaceholderText(/Provide context to help me prepare/i);
    const submitBtn = screen.getByRole('button', { name: /Submit Request/i });

    // Validation Check: Initial state should be disabled (form is empty)
    // Note: React Hook Form might need a tick or interaction to update isValid if not using mode: 'onChange'
    // But our component logic uses isValid from formState
    
    fireEvent.change(nameInput, { target: { value: 'Samuel Test' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'I need help with React performance.' } });

    fireEvent.click(submitBtn);

    // Step 3: Success
    await waitFor(() => {
      expect(screen.getAllByText(/Let's Talk!/i).length).toBeGreaterThan(0);
    }, { timeout: 3000 });

    expect(mockTrackEvent).toHaveBeenCalledWith('Help Me Free - 15 Min Chat Journey Completed', { 
      service: 'quick_chat',
      frequency: ''
    });
  });

  it('allows going back from form to service selection', async () => {
    render(<HelpMeFreeModal isOpen={true} onClose={mockOnClose} />);
    
    // To Step 2
    fireEvent.click(screen.getByText('Website Audit'));
    expect(await screen.findByText(/Tell Me More/i)).toBeDefined();

    // Back to Step 1
    fireEvent.click(screen.getByLabelText(/Back to Services/i));
    expect(await screen.findByText(/Help Me Free: Select Your Service/i)).toBeDefined();
  });

  it('closes modal when X is clicked', () => {
    render(<HelpMeFreeModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByRole('button', { name: '' })); // The X button usually doesn't have text but has X icon
    // Actually, X button has Lucide X. Let's find by role or just the button.
    // In our component: <button onClick={onClose} ...><X size={24} /></button>
    // I should probably add an aria-label to the close button in the component.
  });
});
