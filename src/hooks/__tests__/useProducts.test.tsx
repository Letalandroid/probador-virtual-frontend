import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts } from '../useProducts';
import { apiService } from '@/lib/api';
import { createMockProducts, createMockProduct } from '../../test-helpers/productMocks';

// Mock del apiService
jest.mock('@/lib/api', () => ({
  apiService: {
    getProducts: jest.fn(),
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

describe('useProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetching products', () => {
    it('should fetch products successfully', async () => {
      // Arrange
      const mockProducts = createMockProducts(2);
      mockApiService.getProducts.mockResolvedValue({
        data: mockProducts,
      });

      // Act
      const { result } = renderHook(() => useProducts(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toEqual(mockProducts);
      expect(result.current.error).toBeNull();
      expect(mockApiService.getProducts).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch error', async () => {
      // Arrange
      const errorMessage = 'Failed to fetch products';
      mockApiService.getProducts.mockRejectedValue(new Error(errorMessage));

      // Act
      const { result } = renderHook(() => useProducts(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toEqual([]);
      expect(result.current.error).toBe(errorMessage);
      expect(mockApiService.getProducts).toHaveBeenCalledTimes(1);
    });

    it('should show loading state initially', () => {
      // Arrange
      mockApiService.getProducts.mockImplementation(() => new Promise(() => {}));

      // Act
      const { result } = renderHook(() => useProducts(), { wrapper });

      // Assert
      expect(result.current.isLoading).toBe(true);
      expect(result.current.products).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('filtering products', () => {
    it('should filter products by gender', async () => {
      // Arrange
      const mockProducts = createMockProducts(4);
      mockApiService.getProducts.mockResolvedValue({
        data: mockProducts,
      });

      // Act
      const { result } = renderHook(() => useProducts(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const menProducts = result.current.getProductsByGender('men');
      const expectedMenProducts = mockProducts.filter(p => p.gender === 'men');
      expect(menProducts).toEqual(expectedMenProducts);
    });

    it('should filter products by category', async () => {
      // Arrange
      const mockProducts = createMockProducts(4);
      mockApiService.getProducts.mockResolvedValue({
        data: mockProducts,
      });

      // Act
      const { result } = renderHook(() => useProducts(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const categoryProducts = result.current.getProductsByCategory('Shirts');
      const expectedCategoryProducts = mockProducts.filter(p => p.category?.name === 'Shirts');
      expect(categoryProducts).toEqual(expectedCategoryProducts);
    });

    it('should filter products by both gender and category', async () => {
      // Arrange
      const mockProducts = createMockProducts(4);
      mockApiService.getProducts.mockResolvedValue({
        data: mockProducts,
      });

      // Act
      const { result } = renderHook(() => useProducts(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const womenProducts = result.current.getProductsByGender('women');
      const filteredProducts = womenProducts.filter(p => p.category?.name === 'Dresses');
      const expectedFilteredProducts = mockProducts.filter(p => 
        p.gender === 'women' && p.category?.name === 'Dresses'
      );
      expect(filteredProducts).toEqual(expectedFilteredProducts);
    });
  });

  describe('searching products', () => {
    it('should search products by name', async () => {
      // Arrange
      const mockProducts = createMockProducts(3);
      mockApiService.getProducts.mockResolvedValue({
        data: mockProducts,
      });

      // Act
      const { result } = renderHook(() => useProducts(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchedProducts = result.current.searchProducts('Test');
      const expectedSearchedProducts = mockProducts.filter(p => 
        p.name.toLowerCase().includes('test')
      );
      expect(searchedProducts).toEqual(expectedSearchedProducts);
    });

    it('should search products by brand', async () => {
      // Arrange
      const mockProducts = createMockProducts(3);
      mockApiService.getProducts.mockResolvedValue({
        data: mockProducts,
      });

      // Act
      const { result } = renderHook(() => useProducts(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchedProducts = result.current.searchProducts('Brand');
      const expectedSearchedProducts = mockProducts.filter(p => 
        p.brand?.toLowerCase().includes('brand')
      );
      expect(searchedProducts).toEqual(expectedSearchedProducts);
    });

    it('should handle empty search query', async () => {
      // Arrange
      const mockProducts = createMockProducts(2);
      mockApiService.getProducts.mockResolvedValue({
        data: mockProducts,
      });

      // Act
      const { result } = renderHook(() => useProducts(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchedProducts = result.current.searchProducts('');
      expect(searchedProducts).toEqual(mockProducts);
    });
  });

  describe('combined filtering and searching', () => {
    it('should combine gender filter and search', async () => {
      // Arrange
      const mockProducts = createMockProducts(4);
      mockApiService.getProducts.mockResolvedValue({
        data: mockProducts,
      });

      // Act
      const { result } = renderHook(() => useProducts(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const menProducts = result.current.getProductsByGender('men');
      const filteredProducts = menProducts.filter(p => 
        p.name.toLowerCase().includes('test')
      );
      const expectedFilteredProducts = mockProducts.filter(p => 
        p.gender === 'men' && p.name.toLowerCase().includes('test')
      );
      expect(filteredProducts).toEqual(expectedFilteredProducts);
    });

    it('should combine all filters and search', async () => {
      // Arrange
      const mockProducts = createMockProducts(6);
      mockApiService.getProducts.mockResolvedValue({
        data: mockProducts,
      });

      // Act
      const { result } = renderHook(() => useProducts(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const womenProducts = result.current.getProductsByGender('women');
      const categoryProducts = womenProducts.filter(p => p.category?.name === 'Dresses');
      const filteredProducts = categoryProducts.filter(p => 
        p.name.toLowerCase().includes('test')
      );
      const expectedFilteredProducts = mockProducts.filter(p => 
        p.gender === 'women' && 
        p.category?.name === 'Dresses' && 
        p.name.toLowerCase().includes('test')
      );
      expect(filteredProducts).toEqual(expectedFilteredProducts);
    });
  });

  describe('edge cases', () => {
    it('should handle empty products array', async () => {
      // Arrange
      mockApiService.getProducts.mockResolvedValue({
        data: [],
      });

      // Act
      const { result } = renderHook(() => useProducts(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle null response data', async () => {
      // Arrange
      mockApiService.getProducts.mockResolvedValue({
        data: null,
      });

      // Act
      const { result } = renderHook(() => useProducts(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle undefined response data', async () => {
      // Arrange
      mockApiService.getProducts.mockResolvedValue({
        data: undefined,
      });

      // Act
      const { result } = renderHook(() => useProducts(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });
});