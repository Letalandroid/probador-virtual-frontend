import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCategories } from '../useCategories';
import { apiService } from '@/lib/api';
import { createMockCategories } from '../../utils/testData';

// Mock the API service
jest.mock('@/lib/api', () => ({
  apiService: {
    getCategories: jest.fn(),
  },
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
      {children}
    </QueryClientProvider>
  );
};

describe('useCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch categories successfully', async () => {
    // Arrange
    const mockCategories = createMockCategories(3);
    mockApiService.getCategories.mockResolvedValue({
      data: mockCategories,
    });

    // Act
    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.categories).toEqual(mockCategories);
    expect(result.current.error).toBeNull();
    expect(mockApiService.getCategories).toHaveBeenCalledTimes(1);
  });

  it('should handle API errors', async () => {
    // Arrange
    const errorMessage = 'Failed to fetch categories';
    mockApiService.getCategories.mockRejectedValue(new Error(errorMessage));

    // Act
    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.categories).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should handle empty response', async () => {
    // Arrange
    mockApiService.getCategories.mockResolvedValue({
      data: [],
    });

    // Act
    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.categories).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle null response data', async () => {
    // Arrange
    mockApiService.getCategories.mockResolvedValue({
      data: null,
    });

    // Act
    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.categories).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should provide refetch function', async () => {
    // Arrange
    const mockCategories = createMockCategories(2);
    mockApiService.getCategories.mockResolvedValue({
      data: mockCategories,
    });

    // Act
    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Assert
    expect(typeof result.current.refetch).toBe('function');
    
    // Test refetch
    const newCategories = createMockCategories(3);
    mockApiService.getCategories.mockResolvedValue({
      data: newCategories,
    });

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.categories).toEqual(newCategories);
    });

    expect(mockApiService.getCategories).toHaveBeenCalledTimes(2);
  });
});