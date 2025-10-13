import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { apiService } from '@/lib/api';

// Mock the API service
jest.mock('@/lib/api', () => ({
  apiService: {
    login: jest.fn(),
    register: jest.fn(),
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
}));

const TestComponent = () => {
  const { user, signIn, signOut, signUp } = useAuth();

  return (
    <div>
      <div data-testid="user-email">{user?.email || 'No user'}</div>
      <button
        data-testid="signin-btn"
        onClick={() => signIn('test@example.com', 'password')}
      >
        Sign In
      </button>
      <button
        data-testid="signup-btn"
        onClick={() => signUp('test@example.com', 'password', 'Test User')}
      >
        Sign Up
      </button>
      <button data-testid="signout-btn" onClick={signOut}>
        Sign Out
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  it('should provide initial state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
  });

  it('should handle successful login', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      full_name: 'Test User',
    };

    (apiService.login as jest.Mock).mockResolvedValue({
      data: {
        user: mockUser,
        token: 'mock-token',
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByTestId('signin-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    expect(apiService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('should handle login error', async () => {
    (apiService.login as jest.Mock).mockResolvedValue({
      error: 'Invalid credentials',
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByTestId('signin-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    });
  });

  it('should handle successful registration', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      full_name: 'Test User',
    };

    (apiService.register as jest.Mock).mockResolvedValue({
      data: {
        user: mockUser,
        token: 'mock-token',
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByTestId('signup-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    expect(apiService.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
      full_name: 'Test User',
    });
  });

  it('should handle logout', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      full_name: 'Test User',
    };

    // First login
    (apiService.login as jest.Mock).mockResolvedValue({
      data: {
        user: mockUser,
        token: 'mock-token',
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByTestId('signin-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    // Then logout
    fireEvent.click(screen.getByTestId('signout-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    });

    expect(apiService.logout).toHaveBeenCalled();
  });

  it('should load user from localStorage on mount', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      full_name: 'Test User',
    };

    // Set token in localStorage
    localStorage.setItem('auth_token', 'mock-token');

    (apiService.getCurrentUser as jest.Mock).mockResolvedValue({
      data: mockUser,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    expect(apiService.getCurrentUser).toHaveBeenCalled();
  });
});




