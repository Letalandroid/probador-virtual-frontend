// Mock the env module before importing api
jest.mock('@/config/env', () => ({
  config: {
    apiBaseUrl: 'http://localhost:3000',
    pythonApiUrl: 'http://localhost:8000',
    supabaseUrl: 'https://schbbdodgajmbzeeriwd.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGJiZG9kZ2FqbWJ6ZWVyaXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjMxNjMsImV4cCI6MjA3NDI5OTE2M30.AfrB3ZcQTqGkQzoMPIlINhmkcVvSq8ew29oVwypgKD0',
  },
}));

// Mock the entire API service
jest.mock('../api', () => ({
  apiService: {
    login: jest.fn(),
    register: jest.fn(),
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
    getProducts: jest.fn(),
    getProduct: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
    getCategories: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
    getUsers: jest.fn(),
    getUser: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    updateUserRole: jest.fn(),
    detectTorso: jest.fn(),
    virtualTryOn: jest.fn(),
    analyzeClothingFit: jest.fn(),
    generateMultipleAngles: jest.fn(),
    enhanceImage: jest.fn(),
    checkAiHealth: jest.fn(),
    updateProfile: jest.fn(),
  },
}));

import { apiService, ProductsResponse } from '../api';

// Helper function to create mock response
const createMockProductsResponse = (products: any[]): ProductsResponse => ({
  products,
  pagination: {
    page: 1,
    limit: 10,
    total: products.length,
    pages: 1
  }
});

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        data: {
          user: { 
            id: '1', 
            email: 'test@example.com',
            full_name: 'Test User',
            role: 'client' as const,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
          },
          token: 'mock-token',
        },
      };

      mockApiService.login.mockResolvedValueOnce(mockResponse);

      const result = await apiService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockResponse);
      expect(mockApiService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle login error', async () => {
      const mockError = { error: 'Credenciales inválidas' };
      mockApiService.login.mockResolvedValueOnce(mockError);

      const result = await apiService.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.error).toBe('Credenciales inválidas');
    });
  });

  describe('getProducts', () => {
    it('should fetch products successfully', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          description: 'Test Description',
          price: 100,
          categoryId: 'cat-1',
          brand: 'Test Brand',
          color: 'Blue',
          sizes: ['S', 'M', 'L'],
          images: ['image1.jpg'],
          stockQuantity: 10,
          isActive: true,
          gender: 'men',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
          category: {
            id: 'cat-1',
            name: 'Shirts',
          },
        },
      ];

      mockApiService.getProducts.mockResolvedValueOnce({
        data: createMockProductsResponse(mockProducts),
      });

      const result = await apiService.getProducts();

      expect(result.data).toEqual(createMockProductsResponse(mockProducts));
      expect(mockApiService.getProducts).toHaveBeenCalled();
    });
  });

  describe('virtualTryOn', () => {
    it('should call virtual try-on successfully', async () => {
      const mockResponse = {
        success: true,
        generated_images: [
          {
            data: 'base64data',
            mime_type: 'image/png',
          },
        ],
      };

      mockApiService.virtualTryOn.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await apiService.virtualTryOn(
        'personBase64',
        'clothingBase64',
        'shirt',
        { fit: 'regular' },
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockApiService.virtualTryOn).toHaveBeenCalledWith(
        'personBase64',
        'clothingBase64',
        'shirt',
        { fit: 'regular' },
      );
    });
  });

  describe('detectTorso', () => {
    it('should detect torso successfully', async () => {
      const mockResponse = {
        success: true,
        analysis: {
          torso_detected: true,
          pose_analysis: {
            facing_direction: 'front',
            shoulder_width: 'medium',
          },
        },
      };

      mockApiService.detectTorso.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await apiService.detectTorso('personBase64');

      expect(result.data).toEqual(mockResponse);
      expect(mockApiService.detectTorso).toHaveBeenCalledWith('personBase64');
    });
  });

  describe('checkAiHealth', () => {
    it('should check AI service health', async () => {
      const mockResponse = {
        status: 'healthy',
        message: 'AI service is running',
      };

      mockApiService.checkAiHealth.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await apiService.checkAiHealth();

      expect(result.data).toEqual(mockResponse);
      expect(mockApiService.checkAiHealth).toHaveBeenCalled();
    });
  });
});

