import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DynamicLayout } from './DynamicLayout';

// Mock ResizeObserver for Jest environment
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));


describe('DynamicLayout', () => {
  const mockConfiguration = {
    settings: {
      theme: 'dark',
      notifications: true,
    },
    user: {
      name: 'Test User'
    }
  };

  test('renders the object navigator and tabs correctly', () => {
    render(<DynamicLayout configuration={mockConfiguration} />);

    // Check for the main card title
    expect(screen.getByText(/Object Navigator/i)).toBeInTheDocument();
    
    // Check for the tabs
    expect(screen.getByRole('tab', { name: /tree editor/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /json editor/i })).toBeInTheDocument();
  });

  test('shows empty state when no item is selected', () => {
    render(<DynamicLayout configuration={mockConfiguration} />);
    
    // Check for the placeholder text
    const emptyText = 'Select an item from the navigator to begin editing.';
    expect(screen.getByText(emptyText)).toBeInTheDocument();
  });
});
