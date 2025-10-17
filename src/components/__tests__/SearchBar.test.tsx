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
    // Act
    render(<SearchBar onSearch={mockOnSearch} />);

    // Assert
    const input = screen.getByPlaceholderText('Buscar productos...');
    expect(input).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    // Arrange
    const customPlaceholder = 'Search for items...';

    // Act
    render(<SearchBar onSearch={mockOnSearch} placeholder={customPlaceholder} />);

    // Assert
    const input = screen.getByPlaceholderText(customPlaceholder);
    expect(input).toBeInTheDocument();
  });

  it('should call onSearch when user types', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText('Buscar productos...');

    // Act
    await user.type(input, 'test search');

    // Assert
    expect(mockOnSearch).toHaveBeenCalledWith('test search');
  });

  it('should call onSearch on every keystroke', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText('Buscar productos...');

    // Act
    await user.type(input, 'abc');

    // Assert
    expect(mockOnSearch).toHaveBeenCalledTimes(3);
    expect(mockOnSearch).toHaveBeenNthCalledWith(1, 'a');
    expect(mockOnSearch).toHaveBeenNthCalledWith(2, 'ab');
    expect(mockOnSearch).toHaveBeenNthCalledWith(3, 'abc');
  });

  it('should show clear button when there is text', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText('Buscar productos...');

    // Act
    await user.type(input, 'test');

    // Assert
    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();
  });

  it('should not show clear button when input is empty', () => {
    // Act
    render(<SearchBar onSearch={mockOnSearch} />);

    // Assert
    const clearButton = screen.queryByRole('button');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('should clear input and call onSearch with empty string when clear button is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText('Buscar productos...');

    // Act
    await user.type(input, 'test');
    const clearButton = screen.getByRole('button');
    await user.click(clearButton);

    // Assert
    expect(input).toHaveValue('');
    expect(mockOnSearch).toHaveBeenLastCalledWith('');
  });

  it('should hide clear button after clearing input', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText('Buscar productos...');

    // Act
    await user.type(input, 'test');
    const clearButton = screen.getByRole('button');
    await user.click(clearButton);

    // Assert
    const clearButtonAfterClear = screen.queryByRole('button');
    expect(clearButtonAfterClear).not.toBeInTheDocument();
  });

  it('should have correct input attributes', () => {
    // Act
    render(<SearchBar onSearch={mockOnSearch} />);

    // Assert
    const input = screen.getByPlaceholderText('Buscar productos...');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveClass('pl-10', 'pr-10', 'bg-muted/50', 'border-0', 'focus-visible:ring-accent');
  });

  it('should have search icon', () => {
    // Act
    render(<SearchBar onSearch={mockOnSearch} />);

    // Assert
    // The search icon is rendered as an SVG, we can check for its presence
    const searchIcon = document.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  it('should have clear icon when input has text', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText('Buscar productos...');

    // Act
    await user.type(input, 'test');

    // Assert
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements).toHaveLength(2); // Search icon + Clear icon
  });

  it('should handle rapid typing', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText('Buscar productos...');

    // Act
    await user.type(input, 'hello world', { delay: 0 });

    // Assert
    expect(mockOnSearch).toHaveBeenCalledTimes(11); // 11 characters
    expect(mockOnSearch).toHaveBeenLastCalledWith('hello world');
  });

  it('should handle backspace and deletion', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText('Buscar productos...');

    // Act
    await user.type(input, 'test');
    await user.keyboard('{Backspace}{Backspace}');

    // Assert
    expect(input).toHaveValue('te');
    expect(mockOnSearch).toHaveBeenLastCalledWith('te');
  });

  it('should handle paste operation', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText('Buscar productos...');

    // Act
    await user.click(input);
    await user.paste('pasted text');

    // Assert
    expect(input).toHaveValue('pasted text');
    expect(mockOnSearch).toHaveBeenLastCalledWith('pasted text');
  });

  it('should be accessible', () => {
    // Act
    render(<SearchBar onSearch={mockOnSearch} />);

    // Assert
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Buscar productos...');
  });

  it('should handle empty string input', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText('Buscar productos...');

    // Act
    await user.type(input, 'test');
    await user.clear(input);

    // Assert
    expect(input).toHaveValue('');
    expect(mockOnSearch).toHaveBeenLastCalledWith('');
  });
});
