import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default placeholder', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Buscar productos...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should render with custom placeholder', () => {
    render(<SearchBar onSearch={mockOnSearch} placeholder="Custom placeholder" />);
    
    const input = screen.getByPlaceholderText('Custom placeholder');
    expect(input).toBeInTheDocument();
  });

  it('should call onSearch when user types', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Buscar productos...');
    
    await user.type(input, 'test query');
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('should clear search when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Buscar productos...');
    
    // Type something first
    await user.type(input, 'test query');
    
    // Clear button should appear
    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();
    
    // Click clear button
    await user.click(clearButton);
    
    // Input should be cleared and onSearch called with empty string
    expect(input).toHaveValue('');
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('should not show clear button when input is empty', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Buscar productos...');
    expect(input).toHaveValue('');
    
    // Clear button should not be visible
    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });

  it('should show clear button when input has content', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Buscar productos...');
    
    await user.type(input, 'test');
    
    // Clear button should be visible
    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();
  });

  it('should handle multiple search calls', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Buscar productos...');
    
    await user.type(input, 'test');
    await user.type(input, ' query');
    
    // The component calls onSearch on every character change
    // 'test' = 4 characters + ' query' = 6 characters = 10 total calls
    expect(mockOnSearch).toHaveBeenCalledTimes(10);
    expect(mockOnSearch).toHaveBeenLastCalledWith('test query');
  });

  it('should handle backspace and deletion', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Buscar productos...');
    
    await user.type(input, 'test');
    await user.keyboard('{Backspace}');
    
    expect(mockOnSearch).toHaveBeenCalledWith('tes');
  });
});