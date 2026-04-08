import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MentorMeModal from '../MentorMeModal';
import React from 'react';
import * as analytics from '../../../context/analytics';

vi.mock('../../../context/analytics', () => ({
  useAnalytics: vi.fn()
}));

// Mock fetch for submission testing
global.fetch = vi.fn();

describe('MentorMeModal Component (Mentor Journey Integration)', () => {
  const mockTrackEvent = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (analytics.useAnalytics as Mock).mockReturnValue({ trackEvent: mockTrackEvent });
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success', requestId: 'mentor-123' })
    });
  });

  it('renders Step 1: Mentorship Plans by default when open', () => {
    render(<MentorMeModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByRole('heading', { name: /Choose Your Mentorship Path/i })).toBeDefined();
    expect(screen.getByText('Starter Mentorship')).toBeDefined();
    expect(screen.getByText('Growth Mentorship')).toBeDefined();
    expect(screen.getByText('Pro Mentorship')).toBeDefined();
  });

  it('transitions to Step 2: Details after selecting a plan', async () => {
    render(<MentorMeModal isOpen={true} onClose={mockOnClose} />);
    
    const starterPlan = screen.getByText('Starter Mentorship');
    fireEvent.click(starterPlan);
    
    expect(await screen.findByRole('heading', { name: /Learning Goals & Details/i })).toBeDefined();
    expect(mockTrackEvent).toHaveBeenCalledWith('mentor_plan_selected', { planId: 'starter_mentor' });
  });

  it('transitions through to Success screen on valid submission', async () => {
    render(<MentorMeModal isOpen={true} onClose={mockOnClose} />);
    
    // Step 1: Plan
    fireEvent.click(screen.getByText('Growth Mentorship'));
    
    // Step 2: Form Details
    fireEvent.change(screen.getByPlaceholderText(/Your name/i), { target: { value: 'Jane Mentee' } });
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), { target: { value: 'jane@example.com' } });
    
    // Level & Goal Selects
    const levelSelect = screen.getByLabelText(/Current Level/i);
    fireEvent.change(levelSelect, { target: { value: 'Intermediate' } });
    
    const goalSelect = screen.getByLabelText(/Primary Goal/i);
    fireEvent.change(goalSelect, { target: { value: 'Improve skills' } });
    
    fireEvent.change(screen.getByPlaceholderText(/Tell me more about what you want to achieve/i), { 
      target: { value: 'I want to master advanced React patterns and system design.' } 
    });
    
    const submitBtn = screen.getByText(/Submit Request/i);
    fireEvent.click(submitBtn);
    
    // Step 3: Success Screen
    await waitFor(() => {
      expect(screen.getByText(/Mentorship Request Received!/i)).toBeDefined();
    }, { timeout: 3000 });
    
    expect(mockTrackEvent).toHaveBeenCalledWith('mentor_submitted', expect.objectContaining({
      plan: 'growth_mentor',
      goal: 'Improve skills'
    }));

    expect(global.fetch).toHaveBeenCalledWith('/api/v1/mentor-requests', expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('Jane Mentee')
    }));
  });

  it('allows going back from form to plan selection', async () => {
    render(<MentorMeModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByText('Starter Mentorship'));
    expect(await screen.findByRole('heading', { name: /Learning Goals & Details/i })).toBeDefined();
    
    fireEvent.click(screen.getByText(/Back to Plans/i));
    expect(await screen.findByRole('heading', { name: /Choose Your Mentorship Path/i })).toBeDefined();
  });
});
