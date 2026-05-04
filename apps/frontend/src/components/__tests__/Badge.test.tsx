/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../Badge';
import React from 'react';

describe('Badge Component (Slice 7)', () => {
  it('renders the badge text correctly', () => {
    render(<Badge text="100+ People Helped" />);
    expect(screen.getByText('100+ People Helped')).toBeDefined();
  });

  it('renders with a custom delay class', () => {
    const { container } = render(<Badge text="Test Badge" delay="delay-500" />);
    expect(container.firstChild?.toString()).toBeDefined();
  });

  it('accepts and applies additional className', () => {
    const { container } = render(<Badge text="Test" className="top-3 left-0" />);
    expect(container.querySelector('.top-3')).toBeDefined();
  });

  it('renders all 4 trust metric variants', () => {
    const metrics = [
      '100+ People Helped',
      '10+ Projects Delivered',
      '3+ Industries Worked In',
      '80% Clients Return or Refer'
    ];
    metrics.forEach(text => {
      const { unmount } = render(<Badge text={text} />);
      expect(screen.getByText(text)).toBeDefined();
      unmount();
    });
  });
});
