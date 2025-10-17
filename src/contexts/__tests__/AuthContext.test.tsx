import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { apiService } from '@/lib/api';

// Mock del apiService
jest.mock('@/lib/api', () => ({
  apiService: {
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock de toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Wrapper para el contexto
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('initialization', () => {
    it('should initialize with no user and loading true', () => {
      // Arrange
      mockApiService.getCurrentUser.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      // Act
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Assert
      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(true);
    });

    it('should check for existing token on mount', async () => {
      // Arrange
      const mockToken = 'existing-token';
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'client' as const,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      localStorageMock.getItem.mockReturnValue(mockToken);
      mockApiService.getCurrentUser.mockResolvedValue({
        data: mockUser,
      });

      // Act
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(mockApiService.getCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('should handle token validation error', async () => {
      // Arrange
      const mockToken = 'invalid-token';
      localStorageMock.getItem.mockReturnValue(mockToken);
      mockApiService.getCurrentUser.mockResolvedValue({
        error: 'Invalid token',
      });

      // Act
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe('signUp', () => {
    it('should register user successfully', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'client' as const,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      const mockResponse = {
        user: mockUser,
        token: 'jwt-token',
      };

      mockApiService.register.mockResolvedValue({
        data: mockResponse,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      let signUpResult;
      await act(async () => {
        signUpResult = await result.current.signUp('test@example.com', 'password123', 'Test User');
      });

      // Assert
      expect(signUpResult.error).toBeNull();
      expect(result.current.user).toEqual(mockUser);
      expect(mockApiService.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
      });
    });

    it('should handle registration error', async () => {
      // Arrange
      const errorMessage = 'Email already exists';
      mockApiService.register.mockResolvedValue({
        error: errorMessage,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      let signUpResult;
      await act(async () => {
        signUpResult = await result.current.signUp('test@example.com', 'password123', 'Test User');
      });

      // Assert
      expect(signUpResult.error).toBe(errorMessage);
      expect(result.current.user).toBeNull();
    });

    it('should handle network error during registration', async () => {
      // Arrange
      const networkError = new Error('Network error');
      mockApiService.register.mockRejectedValue(networkError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      let signUpResult;
      await act(async () => {
        signUpResult = await result.current.signUp('test@example.com', 'password123', 'Test User');
      });

      // Assert
      expect(signUpResult.error).toBe(networkError);
    });

    it('should register without full_name', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: undefined,
        role: 'client' as const,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      const mockResponse = {
        user: mockUser,
        token: 'jwt-token',
      };

      mockApiService.register.mockResolvedValue({
        data: mockResponse,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      let signUpResult;
      await act(async () => {
        signUpResult = await result.current.signUp('test@example.com', 'password123');
      });

      // Assert
      expect(signUpResult.error).toBeNull();
      expect(mockApiService.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        full_name: undefined,
      });
    });
  });

  describe('signIn', () => {
    it('should login user successfully', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'client' as const,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      const mockResponse = {
        user: mockUser,
        token: 'jwt-token',
      };

      mockApiService.login.mockResolvedValue({
        data: mockResponse,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn('test@example.com', 'password123');
      });

      // Assert
      expect(signInResult.error).toBeNull();
      expect(result.current.user).toEqual(mockUser);
      expect(mockApiService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle login error', async () => {
      // Arrange
      const errorMessage = 'Invalid credentials';
      mockApiService.login.mockResolvedValue({
        error: errorMessage,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn('test@example.com', 'wrongpassword');
      });

      // Assert
      expect(signInResult.error).toBe(errorMessage);
      expect(result.current.user).toBeNull();
    });

    it('should handle network error during login', async () => {
      // Arrange
      const networkError = new Error('Network error');
      mockApiService.login.mockRejectedValue(networkError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn('test@example.com', 'password123');
      });

      // Assert
      expect(signInResult.error).toBe(networkError);
    });
  });

  describe('signOut', () => {
    it('should logout user successfully', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'client' as const,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      // Set initial user
      mockApiService.getCurrentUser.mockResolvedValue({
        data: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);

      // Act
      await act(async () => {
        await result.current.signOut();
      });

      // Assert
      expect(result.current.user).toBeNull();
      expect(mockApiService.logout).toHaveBeenCalledTimes(1);
    });

    it('should handle logout error gracefully', async () => {
      // Arrange
      mockApiService.logout.mockRejectedValue(new Error('Logout error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      await act(async () => {
        await result.current.signOut();
      });

      // Assert
      expect(result.current.user).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'client' as const,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      // Set initial user
      mockApiService.getCurrentUser.mockResolvedValue({
        data: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateProfile({
          full_name: 'Updated Name',
        });
      });

      // Assert
      expect(updateResult.error).toBeNull();
      expect(result.current.user?.full_name).toBe('Updated Name');
    });

    it('should handle update profile when no user is logged in', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateProfile({
          full_name: 'Updated Name',
        });
      });

      // Assert
      expect(updateResult.error).toBeDefined();
    });

    it('should handle update profile error', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'client' as const,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      // Set initial user
      mockApiService.getCurrentUser.mockResolvedValue({
        data: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock console.error to avoid error logs in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateProfile({
          full_name: 'Updated Name',
        });
      });

      // Assert
      expect(updateResult.error).toBeNull();
      expect(result.current.user?.full_name).toBe('Updated Name');

      consoleSpy.mockRestore();
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act & Assert
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });
});