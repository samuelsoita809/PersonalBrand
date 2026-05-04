/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfileCard from '../ProfileCard';
import React from 'react';

describe('ProfileCard Component', () => {
  const mockProps = {
    name: "Samuel Soita",
    role: "Senior Staff Engineer",
    image: "/profile.jpg"
  };

  it('should render name correctly', () => {
    render(<ProfileCard {...mockProps} />);
    expect(screen.getByText(mockProps.name)).toBeDefined();
  });

  it('should render profile image with correct alt text', () => {
    render(<ProfileCard {...mockProps} />);
    const img = screen.getByAltText(mockProps.name);
    expect(img).toBeDefined();
  });
});
