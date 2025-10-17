import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts } from '../useProducts';
import { apiService } from '@/lib/api';
import { createMockProducts } from '../../utils/testData';

// Mock the API service
jest.mock('@/lib/api', () => ({
  apiService: {
    getProducts: jest.fn(),
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

describe('useProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch products successfully', async () => {
    // Arrange
    const mockProducts = createMockProducts(2);
    mockApiService.getProducts.mockResolvedValue({
      data: mockProducts,
    });

    // Act
    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.error).toBeNull();
    expect(mockApiService.getProducts).toHaveBeenCalledTimes(1);
  });

  it('should handle API errors', async () => {
    // Arrange
    const errorMessage = 'Failed to fetch products';
    mockApiService.getProducts.mockRejectedValue(new Error(errorMessage));

    // Act
    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should filter products by gender', async () => {
    // Arrange
    const mockProducts = createMockProducts(4);
    mockApiService.getProducts.mockResolvedValue({
      data: mockProducts,
    });

    // Act
    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const womenProducts = result.current.getProductsByGender('women');
    const menProducts = result.current.getProductsByGender('men');

    // Assert
    expect(womenProducts).toHaveLength(2); // Products with even indices (0, 2)
    expect(menProducts).toHaveLength(2); // Products with odd indices (1, 3)
    expect(womenProducts.every(p => p.gender === 'women')).toBe(true);
    expect(menProducts.every(p => p.gender === 'men')).toBe(true);
  });

  it('should filter products by category', async () => {
    // Arrange
    const mockProducts = createMockProducts(4);
    mockApiService.getProducts.mockResolvedValue({
      data: mockProducts,
    });

    // Act
    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const topsProducts = result.current.getProductsByCategory('Tops');
    const bottomsProducts = result.current.getProductsByCategory('Bottoms');

    // Assert
    expect(topsProducts).toHaveLength(2); // Products with even indices (0, 2)
    expect(bottomsProducts).toHaveLength(2); // Products with odd indices (1, 3)
    expect(topsProducts.every(p => p.category?.name === 'Tops')).toBe(true);
    expect(bottomsProducts.every(p => p.category?.name === 'Bottoms')).toBe(true);
  });

  it('should search products by name', async () => {
    // Arrange
    const mockProducts = createMockProducts(4);
    mockApiService.getProducts.mockResolvedValue({
      data: mockProducts,
    });

    // Act
    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const searchResults = result.current.searchProducts('Test Product 1');

    // Assert
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].name).toBe('Test Product 1');
  });

  it('should search products by brand', async () => {
    // Arrange
    const mockProducts = createMockProducts(4);
    mockApiService.getProducts.mockResolvedValue({
      data: mockProducts,
    });

    // Act
    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const searchResults = result.current.searchProducts('Test Brand');

    // Assert
    expect(searchResults).toHaveLength(4); // All products have the same brand
  });

  it('should return all products when search query is empty', async () => {
    // Arrange
    const mockProducts = createMockProducts(4);
    mockApiService.getProducts.mockResolvedValue({
      data: mockProducts,
    });

    // Act
    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const searchResults = result.current.searchProducts('');

    // Assert
    expect(searchResults).toEqual(mockProducts);
  });

  it('should return all products when gender filter is "all"', async () => {
    // Arrange
    const mockProducts = createMockProducts(4);
    mockApiService.getProducts.mockResolvedValue({
      data: mockProducts,
    });

    // Act
    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const allProducts = result.current.getProductsByGender('all');

    // Assert
    expect(allProducts).toEqual(mockProducts);
  });

  it('should return all products when category filter is "all"', async () => {
    // Arrange
    const mockProducts = createMockProducts(4);
    mockApiService.getProducts.mockResolvedValue({
      data: mockProducts,
    });

    // Act
    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const allProducts = result.current.getProductsByCategory('all');

    // Assert
    expect(allProducts).toEqual(mockProducts);
  });
});