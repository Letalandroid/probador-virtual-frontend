import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts } from '../useProducts';
import { apiService } from '@/lib/api';

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

  describe('fetchProducts', () => {
    it('should fetch products successfully', async () => {
      // Arrange
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product 1',
          price: 100,
          gender: 'men',
          category: { id: 'cat-1', name: 'Shirts' },
          brand: 'Test Brand',
          color: 'Blue',
          sizes: ['S', 'M', 'L'],
          images: ['image1.jpg'],
          stockQuantity: 10,
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Test Product 2',
          price: 200,
          gender: 'women',
          category: { id: 'cat-2', name: 'Dresses' },
          brand: 'Test Brand 2',
          color: 'Red',
          sizes: ['XS', 'S', 'M'],
          images: ['image2.jpg'],
          stockQuantity: 5,
          isActive: true,
          createdAt: '2023-01-02T00:00:00Z',
        },
      ];

      mockApiService.getProducts.mockResolvedValue({
        data: { products: mockProducts },
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

    it('should handle API error', async () => {
      // Arrange
      const errorMessage = 'Failed to fetch products';
      mockApiService.getProducts.mockResolvedValue({
        error: errorMessage,
      });

      // Act
      const { result } = renderHook(() => useProducts(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toEqual([]);
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle network error', async () => {
      // Arrange
      const networkError = new Error('Network error');
      mockApiService.getProducts.mockRejectedValue(networkError);

      // Act
      const { result } = renderHook(() => useProducts(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toEqual([]);
      expect(result.current.error).toBe('Network error');
    });

    it('should handle empty response', async () => {
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
  });

  describe('getProductsByGender', () => {
    it('should return all products when gender is "all"', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Product 1', gender: 'men' },
        { id: '2', name: 'Product 2', gender: 'women' },
        { id: '3', name: 'Product 3', gender: 'unisex' },
      ];

      mockApiService.getProducts.mockResolvedValue({
        data: { products: mockProducts },
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      const menProducts = result.current.getProductsByGender('all');

      // Assert
      expect(menProducts).toEqual(mockProducts);
    });

    it('should filter products by men gender', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Product 1', gender: 'men' },
        { id: '2', name: 'Product 2', gender: 'women' },
        { id: '3', name: 'Product 3', gender: 'unisex' },
      ];

      mockApiService.getProducts.mockResolvedValue({
        data: { products: mockProducts },
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      const menProducts = result.current.getProductsByGender('men');

      // Assert
      expect(menProducts).toEqual([
        { id: '1', name: 'Product 1', gender: 'men' },
      ]);
    });

    it('should filter products by women gender', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Product 1', gender: 'men' },
        { id: '2', name: 'Product 2', gender: 'women' },
        { id: '3', name: 'Product 3', gender: 'unisex' },
      ];

      mockApiService.getProducts.mockResolvedValue({
        data: { products: mockProducts },
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      const womenProducts = result.current.getProductsByGender('women');

      // Assert
      expect(womenProducts).toEqual([
        { id: '2', name: 'Product 2', gender: 'women' },
      ]);
    });

    it('should include unisex products for any gender', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Product 1', gender: 'men' },
        { id: '2', name: 'Product 2', gender: 'women' },
        { id: '3', name: 'Product 3', gender: 'unisex' },
      ];

      mockApiService.getProducts.mockResolvedValue({
        data: { products: mockProducts },
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      const unisexProducts = result.current.getProductsByGender('unisex');

      // Assert
      expect(unisexProducts).toEqual([
        { id: '3', name: 'Product 3', gender: 'unisex' },
      ]);
    });
  });

  describe('getProductsByCategory', () => {
    it('should return all products when category is "all"', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Product 1', category: { name: 'Shirts' } },
        { id: '2', name: 'Product 2', category: { name: 'Dresses' } },
      ];

      mockApiService.getProducts.mockResolvedValue({
        data: { products: mockProducts },
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      const allProducts = result.current.getProductsByCategory('all');

      // Assert
      expect(allProducts).toEqual(mockProducts);
    });

    it('should filter products by category name', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Product 1', category: { name: 'Shirts' } },
        { id: '2', name: 'Product 2', category: { name: 'Dresses' } },
        { id: '3', name: 'Product 3', category: { name: 'Shirts' } },
      ];

      mockApiService.getProducts.mockResolvedValue({
        data: { products: mockProducts },
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      const shirtProducts = result.current.getProductsByCategory('Shirts');

      // Assert
      expect(shirtProducts).toEqual([
        { id: '1', name: 'Product 1', category: { name: 'Shirts' } },
        { id: '3', name: 'Product 3', category: { name: 'Shirts' } },
      ]);
    });

    it('should handle products without category', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Product 1', category: { name: 'Shirts' } },
        { id: '2', name: 'Product 2', category: null },
      ];

      mockApiService.getProducts.mockResolvedValue({
        data: { products: mockProducts },
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      const shirtProducts = result.current.getProductsByCategory('Shirts');

      // Assert
      expect(shirtProducts).toEqual([
        { id: '1', name: 'Product 1', category: { name: 'Shirts' } },
      ]);
    });
  });

  describe('searchProducts', () => {
    it('should return all products when query is empty', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Blue Shirt', brand: 'Nike' },
        { id: '2', name: 'Red Dress', brand: 'Adidas' },
      ];

      mockApiService.getProducts.mockResolvedValue({
        data: { products: mockProducts },
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      const allProducts = result.current.searchProducts('');

      // Assert
      expect(allProducts).toEqual(mockProducts);
    });

    it('should search by product name', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Blue Shirt', brand: 'Nike', gender: 'men' },
        { id: '2', name: 'Red Dress', brand: 'Adidas', gender: 'women' },
        { id: '3', name: 'Green Shirt', brand: 'Puma', gender: 'men' },
      ];

      mockApiService.getProducts.mockResolvedValue({
        data: { products: mockProducts },
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      const shirtProducts = result.current.searchProducts('shirt');

      // Assert
      expect(shirtProducts).toEqual([
        { id: '1', name: 'Blue Shirt', brand: 'Nike', gender: 'men' },
        { id: '3', name: 'Green Shirt', brand: 'Puma', gender: 'men' },
      ]);
    });

    it('should search by brand', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Blue Shirt', brand: 'Nike', gender: 'men' },
        { id: '2', name: 'Red Dress', brand: 'Adidas', gender: 'women' },
        { id: '3', name: 'Green Shirt', brand: 'Nike', gender: 'men' },
      ];

      mockApiService.getProducts.mockResolvedValue({
        data: { products: mockProducts },
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      const nikeProducts = result.current.searchProducts('nike');

      // Assert
      expect(nikeProducts).toEqual([
        { id: '1', name: 'Blue Shirt', brand: 'Nike', gender: 'men' },
        { id: '3', name: 'Green Shirt', brand: 'Nike', gender: 'men' },
      ]);
    });

    it('should search by category name', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Blue Shirt', category: { name: 'Shirts' }, gender: 'men' },
        { id: '2', name: 'Red Dress', category: { name: 'Dresses' }, gender: 'women' },
        { id: '3', name: 'Green Shirt', category: { name: 'Shirts' }, gender: 'men' },
      ];

      mockApiService.getProducts.mockResolvedValue({
        data: { products: mockProducts },
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      const shirtProducts = result.current.searchProducts('shirts');

      // Assert
      expect(shirtProducts).toEqual([
        { id: '1', name: 'Blue Shirt', category: { name: 'Shirts' }, gender: 'men' },
        { id: '3', name: 'Green Shirt', category: { name: 'Shirts' }, gender: 'men' },
      ]);
    });

    it('should search by gender', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Blue Shirt', gender: 'men' },
        { id: '2', name: 'Red Dress', gender: 'women' },
        { id: '3', name: 'Green Shirt', gender: 'men' },
      ];

      mockApiService.getProducts.mockResolvedValue({
        data: { products: mockProducts },
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      const menProducts = result.current.searchProducts('men');

      // Assert
      expect(menProducts).toEqual([
        { id: '1', name: 'Blue Shirt', gender: 'men' },
        { id: '3', name: 'Green Shirt', gender: 'men' },
      ]);
    });

    it('should be case insensitive', async () => {
      // Arrange
      const mockProducts = [
        { id: '1', name: 'Blue Shirt', brand: 'Nike', gender: 'men' },
        { id: '2', name: 'Red Dress', brand: 'Adidas', gender: 'women' },
      ];

      mockApiService.getProducts.mockResolvedValue({
        data: { products: mockProducts },
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      const upperCaseResults = result.current.searchProducts('NIKE');
      const lowerCaseResults = result.current.searchProducts('nike');

      // Assert
      expect(upperCaseResults).toEqual(lowerCaseResults);
    });
  });

  describe('trackProductView', () => {
    it('should call trackProductView without errors', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockApiService.getProducts.mockResolvedValue({
        data: { products: [] },
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      await result.current.trackProductView('product-id');

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Product view tracked:', 'product-id');
      
      consoleSpy.mockRestore();
    });
  });

  describe('refetch', () => {
    it('should refetch products when called', async () => {
      // Arrange
      mockApiService.getProducts.mockResolvedValue({
        data: { products: [] },
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      await result.current.refetch();

      // Assert
      expect(mockApiService.getProducts).toHaveBeenCalledTimes(2);
    });
  });
});
