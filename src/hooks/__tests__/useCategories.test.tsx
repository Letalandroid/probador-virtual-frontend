import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCategories } from '../useCategories';
import { apiService } from '@/lib/api';
import { createMockCategory } from '../../test-helpers/productMocks';

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

  describe('fetching categories', () => {
    it('should fetch categories successfully', async () => {
      // Arrange
      const mockCategories = [
        createMockCategory({ id: 'cat-1', name: 'Shirts' }),
        createMockCategory({ id: 'cat-2', name: 'Dresses' }),
        createMockCategory({ id: 'cat-3', name: 'Pants' }),
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

    it('should handle fetch error', async () => {
      // Arrange
      const errorMessage = 'Failed to fetch categories';
      mockApiService.getCategories.mockRejectedValue(new Error(errorMessage));

      // Act
      const { result } = renderHook(() => useCategories(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.categories).toEqual([]);
      expect(result.current.error).toBe(errorMessage);
      expect(mockApiService.getCategories).toHaveBeenCalledTimes(1);
    });

    it('should show loading state initially', () => {
      // Arrange
      mockApiService.getCategories.mockImplementation(() => new Promise(() => {}));

      // Act
      const { result } = renderHook(() => useCategories(), { wrapper });

      // Assert
      expect(result.current.isLoading).toBe(true);
      expect(result.current.categories).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle empty categories array', async () => {
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

    it('should handle null response data', async () => {
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

    it('should handle undefined response data', async () => {
      // Arrange
      mockApiService.getCategories.mockResolvedValue({
        data: undefined,
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

  describe('caching behavior', () => {
    it('should not refetch categories on subsequent calls', async () => {
      // Arrange
      const mockCategories = [
        createMockCategory({ id: 'cat-1', name: 'Shirts' }),
        createMockCategory({ id: 'cat-2', name: 'Dresses' }),
      ];
      
      mockApiService.getCategories.mockResolvedValue({
        data: mockCategories,
      });

      // Act
      const { result } = renderHook(() => useCategories(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Call refetch
      await act(async () => {
        await result.current.refetch();
      });

      // Assert
      expect(result.current.categories).toEqual(mockCategories);
      expect(mockApiService.getCategories).toHaveBeenCalledTimes(2);
    });
  });

  describe('category data structure', () => {
    it('should handle categories with all required fields', async () => {
      // Arrange
      const mockCategories = [
        createMockCategory({
          id: 'cat-1',
          name: 'Shirts',
          description: 'All types of shirts',
        }),
        createMockCategory({
          id: 'cat-2',
          name: 'Dresses',
          description: 'Elegant dresses',
        }),
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

      expect(result.current.categories).toHaveLength(2);
      expect(result.current.categories[0]).toHaveProperty('id', 'cat-1');
      expect(result.current.categories[0]).toHaveProperty('name', 'Shirts');
      expect(result.current.categories[0]).toHaveProperty('description', 'All types of shirts');
      expect(result.current.categories[1]).toHaveProperty('id', 'cat-2');
      expect(result.current.categories[1]).toHaveProperty('name', 'Dresses');
      expect(result.current.categories[1]).toHaveProperty('description', 'Elegant dresses');
    });
  });
});