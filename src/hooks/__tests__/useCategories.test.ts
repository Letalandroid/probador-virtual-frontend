import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCategories } from '../useCategories';
import { apiService } from '@/lib/api';

// Mock del apiService
jest.mock('@/lib/api', () => ({
  apiService: {
    getCategories: jest.fn(),
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Helper para crear QueryClient para testing
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Wrapper para QueryClient
const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchCategories', () => {
    it('should fetch categories successfully', async () => {
      // Arrange
      const mockCategories = [
        {
          id: '1',
          name: 'Shirts',
          description: 'All types of shirts',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Dresses',
          description: 'All types of dresses',
          isActive: true,
          createdAt: '2023-01-02T00:00:00Z',
        },
        {
          id: '3',
          name: 'Pants',
          description: 'All types of pants',
          isActive: false,
          createdAt: '2023-01-03T00:00:00Z',
        },
      ];

      mockApiService.getCategories.mockResolvedValue({
        data: mockCategories,
      });

      // Act
      const { result } = renderHook(() => useCategories(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.categories).toEqual(mockCategories);
      expect(result.current.error).toBeNull();
      expect(mockApiService.getCategories).toHaveBeenCalledTimes(1);
    });

    it('should handle API error', async () => {
      // Arrange
      const errorMessage = 'Failed to fetch categories';
      mockApiService.getCategories.mockResolvedValue({
        error: errorMessage,
      });

      // Act
      const { result } = renderHook(() => useCategories(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.categories).toEqual([]);
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle network error', async () => {
      // Arrange
      const networkError = new Error('Network error');
      mockApiService.getCategories.mockRejectedValue(networkError);

      // Act
      const { result } = renderHook(() => useCategories(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.categories).toEqual([]);
      expect(result.current.error).toBe('Network error');
    });

    it('should handle empty response', async () => {
      // Arrange
      mockApiService.getCategories.mockResolvedValue({
        data: [],
      });

      // Act
      const { result } = renderHook(() => useCategories(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.categories).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle null data response', async () => {
      // Arrange
      mockApiService.getCategories.mockResolvedValue({
        data: null,
      });

      // Act
      const { result } = renderHook(() => useCategories(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.categories).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('refetch', () => {
    it('should refetch categories when called', async () => {
      // Arrange
      const mockCategories = [
        {
          id: '1',
          name: 'Shirts',
          description: 'All types of shirts',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
        },
      ];

      mockApiService.getCategories.mockResolvedValue({
        data: mockCategories,
      });

      const { result } = renderHook(() => useCategories(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      await result.current.refetch();

      // Assert
      expect(mockApiService.getCategories).toHaveBeenCalledTimes(2);
    });

    it('should handle refetch error', async () => {
      // Arrange
      mockApiService.getCategories
        .mockResolvedValueOnce({
          data: [
            {
              id: '1',
              name: 'Shirts',
              description: 'All types of shirts',
              isActive: true,
              createdAt: '2023-01-01T00:00:00Z',
            },
          ],
        })
        .mockRejectedValueOnce(new Error('Refetch error'));

      const { result } = renderHook(() => useCategories(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      await result.current.refetch();

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe('Refetch error');
      });
    });
  });

  describe('loading states', () => {
    it('should start with loading true', () => {
      // Arrange
      mockApiService.getCategories.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      // Act
      const { result } = renderHook(() => useCategories(), { wrapper });

      // Assert
      expect(result.current.isLoading).toBe(true);
      expect(result.current.categories).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should set loading to false after successful fetch', async () => {
      // Arrange
      const mockCategories = [
        {
          id: '1',
          name: 'Shirts',
          description: 'All types of shirts',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
        },
      ];

      mockApiService.getCategories.mockResolvedValue({
        data: mockCategories,
      });

      // Act
      const { result } = renderHook(() => useCategories(), { wrapper });

      // Assert
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.categories).toEqual(mockCategories);
    });

    it('should set loading to false after error', async () => {
      // Arrange
      const errorMessage = 'API Error';
      mockApiService.getCategories.mockResolvedValue({
        error: errorMessage,
      });

      // Act
      const { result } = renderHook(() => useCategories(), { wrapper });

      // Assert
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('error handling', () => {
    it('should handle different error types', async () => {
      // Test case: TypeError
      const typeError = new TypeError('Type error');
      mockApiService.getCategories.mockRejectedValue(typeError);

      const { result } = renderHook(() => useCategories(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Type error');
    });

    it('should handle error without message', async () => {
      // Test case: Error without message
      const errorWithoutMessage = new Error();
      mockApiService.getCategories.mockRejectedValue(errorWithoutMessage);

      const { result } = renderHook(() => useCategories(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('');
    });
  });
});
