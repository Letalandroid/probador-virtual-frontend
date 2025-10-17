import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../AuthContext';
import { apiService } from '@/lib/api';
import { createMockUser } from '../../utils/testData';

// Mock the API service
jest.mock('@/lib/api', () => ({
  apiService: {
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
}));

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  it('should initialize with no user when no token is present', async () => {
    // Arrange
    mockApiService.getCurrentUser.mockResolvedValue({
      data: null,
    });

    // Act
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should fetch current user when token is present', async () => {
    // Arrange
    const mockUser = createMockUser();
    (window.localStorage.getItem as jest.Mock).mockReturnValue('mock-token');
    mockApiService.getCurrentUser.mockResolvedValue({
      data: mockUser,
    });

    // Act
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(mockApiService.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('should handle sign in successfully', async () => {
    // Arrange
    const mockUser = createMockUser();
    const mockLoginResponse = {
      user: mockUser,
      token: 'mock-token',
    };

    mockApiService.login.mockResolvedValue({
      data: mockLoginResponse,
    });

    // Act
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const signInResult = await act(async () => {
      return await result.current.signIn('test@example.com', 'password123');
    });

    // Assert
    expect(signInResult.error).toBeNull();
    expect(mockApiService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should handle sign in error', async () => {
    // Arrange
    mockApiService.login.mockResolvedValue({
      error: 'Invalid credentials',
    });

    // Act
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const signInResult = await act(async () => {
      return await result.current.signIn('invalid@example.com', 'wrongpassword');
    });

    // Assert
    expect(signInResult.error).toBe('Invalid credentials');
  });

  it('should handle sign up successfully', async () => {
    // Arrange
    const mockUser = createMockUser();
    const mockRegisterResponse = {
      user: mockUser,
      token: 'mock-token',
    };

    mockApiService.register.mockResolvedValue({
      data: mockRegisterResponse,
    });

    // Act
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const signUpResult = await act(async () => {
      return await result.current.signUp('newuser@example.com', 'password123', 'New User');
    });

    // Assert
    expect(signUpResult.error).toBeNull();
    expect(mockApiService.register).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      password: 'password123',
      full_name: 'New User',
    });
  });

  it('should handle sign up error', async () => {
    // Arrange
    mockApiService.register.mockResolvedValue({
      error: 'Email already exists',
    });

    // Act
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const signUpResult = await act(async () => {
      return await result.current.signUp('existing@example.com', 'password123', 'Existing User');
    });

    // Assert
    expect(signUpResult.error).toBe('Email already exists');
  });

  it('should handle sign out', async () => {
    // Arrange
    const mockUser = createMockUser();
    (window.localStorage.getItem as jest.Mock).mockReturnValue('mock-token');
    mockApiService.getCurrentUser.mockResolvedValue({
      data: mockUser,
    });
    mockApiService.logout.mockResolvedValue();

    // Act
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);

    await act(async () => {
      await result.current.signOut();
    });

    // Assert
    expect(result.current.user).toBeNull();
    expect(mockApiService.logout).toHaveBeenCalledTimes(1);
  });

  it('should update profile successfully', async () => {
    // Arrange
    const mockUser = createMockUser();
    (window.localStorage.getItem as jest.Mock).mockReturnValue('mock-token');
    mockApiService.getCurrentUser.mockResolvedValue({
      data: mockUser,
    });

    // Act
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const updateResult = await act(async () => {
      return await result.current.updateProfile({
        full_name: 'Updated Name',
        phone: '+1234567890',
      });
    });

    // Assert
    expect(updateResult.error).toBeNull();
    expect(result.current.user?.full_name).toBe('Updated Name');
    expect(result.current.user?.phone).toBe('+1234567890');
  });

  it('should handle profile update when no user is logged in', async () => {
    // Arrange
    mockApiService.getCurrentUser.mockResolvedValue({
      data: null,
    });

    // Act
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const updateResult = await act(async () => {
      return await result.current.updateProfile({
        full_name: 'Updated Name',
      });
    });

    // Assert
    expect(updateResult.error).toBeInstanceOf(Error);
    expect(updateResult.error?.message).toBe('No user logged in');
  });
});