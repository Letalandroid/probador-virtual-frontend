// Mock the env module before importing anything else
jest.mock('@/config/env', () => ({
  config: {
    apiBaseUrl: 'http://localhost:3000',
    pythonApiUrl: 'http://localhost:8000',
    supabaseUrl: 'https://schbbdodgajmbzeeriwd.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGJiZG9kZ2FqbWJ6ZWVyaXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjMxNjMsImV4cCI6MjA3NDI5OTE2M30.AfrB3ZcQTqGkQzoMPIlINhmkcVvSq8ew29oVwypgKD0',
  },
}));

// Mock the API service
jest.mock('../../lib/api', () => ({
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
    updateUserRole: jest.fn(),
    deleteUser: jest.fn(),
    detectTorso: jest.fn(),
    virtualTryOn: jest.fn(),
    analyzeClothingFit: jest.fn(),
    generateMultipleAngles: jest.fn(),
    enhanceImage: jest.fn(),
    checkAiHealth: jest.fn(),
    updateProfile: jest.fn(),
  },
}));

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../../App';
import { apiService, ProductsResponse } from '../../lib/api';

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

// Helper para crear QueryClient para testing
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Wrapper para la aplicación
const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Frontend-Backend Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations
    mockApiService.getProducts.mockResolvedValue({
      data: createMockProductsResponse([]),
    });
    mockApiService.getProduct.mockResolvedValue({
      data: null,
    });
    mockApiService.getCurrentUser.mockResolvedValue({
      data: null,
    });
    mockApiService.login.mockResolvedValue({
      data: null,
    });
    mockApiService.register.mockResolvedValue({
      data: null,
    });
    mockApiService.getCategories.mockResolvedValue({
      data: [],
    });
  });

  describe('Basic App Integration', () => {
    it('should render the app without crashing', async () => {
      // Arrange
      mockApiService.getProducts.mockResolvedValue({
        data: createMockProductsResponse([]),
      });
      mockApiService.getCategories.mockResolvedValue({
        data: [],
      });

      // Act
      render(
        <AppWrapper>
          <App />
        </AppWrapper>
      );

      // Assert - Check for the first StyleAI element (header)
      await waitFor(() => {
        expect(screen.getAllByText('StyleAI')[0]).toBeInTheDocument();
      });
    });

    it('should render the header with navigation links', async () => {
      // Arrange
      mockApiService.getProducts.mockResolvedValue({
        data: createMockProductsResponse([]),
      });
      mockApiService.getCategories.mockResolvedValue({
        data: [],
      });

      // Act
      render(
        <AppWrapper>
          <App />
        </AppWrapper>
      );

      // Assert - Check for navigation links
      await waitFor(() => {
        expect(screen.getByText('Mujeres')).toBeInTheDocument();
        expect(screen.getByText('Hombres')).toBeInTheDocument();
        expect(screen.getByText('Probador Virtual')).toBeInTheDocument();
      });
    });

    it('should render the search bar', async () => {
      // Arrange
      mockApiService.getProducts.mockResolvedValue({
        data: createMockProductsResponse([]),
      });
      mockApiService.getCategories.mockResolvedValue({
        data: [],
      });

      // Act
      render(
        <AppWrapper>
          <App />
        </AppWrapper>
      );

      // Assert - Check for search bar
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Buscar productos...')).toBeInTheDocument();
      });
    });
  });

  describe('Component Integration', () => {
    it('should render hero section with correct content', async () => {
      // Arrange
      mockApiService.getCurrentUser.mockResolvedValue({
        data: null,
      });

      // Act
      render(
        <AppWrapper>
          <App />
        </AppWrapper>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Pruébate la ropa')).toBeInTheDocument();
        expect(screen.getByText('antes de comprar')).toBeInTheDocument();
        expect(screen.getByText('Probar Ahora')).toBeInTheDocument();
        expect(screen.getByText('Ver Catálogo')).toBeInTheDocument();
      });
    });

    it('should render category grid with correct categories', async () => {
      // Arrange
      mockApiService.getCurrentUser.mockResolvedValue({
        data: null,
      });

      // Act
      render(
        <AppWrapper>
          <App />
        </AppWrapper>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Explora por Categorías')).toBeInTheDocument();
        expect(screen.getByText('Camisetas')).toBeInTheDocument();
        expect(screen.getByText('Vestidos')).toBeInTheDocument();
        expect(screen.getByText('Pantalones')).toBeInTheDocument();
        expect(screen.getByText('Chaquetas')).toBeInTheDocument();
      });
    });

    it('should render feature section with correct content', async () => {
      // Arrange
      mockApiService.getCurrentUser.mockResolvedValue({
        data: null,
      });

      // Act
      render(
        <AppWrapper>
          <App />
        </AppWrapper>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText('¿Por qué elegir StyleAI?')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle authentication errors gracefully', async () => {
      // Arrange
      mockApiService.getCurrentUser.mockResolvedValue({ error: 'Authentication failed' });

      // Act
      render(
        <AppWrapper>
          <App />
        </AppWrapper>
      );

      // Assert - App should still render even with auth errors
      await waitFor(() => {
        expect(screen.getAllByText('StyleAI')[0]).toBeInTheDocument();
      });
    });

    it('should render footer with correct content', async () => {
      // Arrange
      mockApiService.getCurrentUser.mockResolvedValue({
        data: null,
      });

      // Act
      render(
        <AppWrapper>
          <App />
        </AppWrapper>
      );

      // Assert - Check for footer content (use getAllByText to handle multiple instances)
      await waitFor(() => {
        expect(screen.getAllByText('StyleAI')).toHaveLength(2); // Header and footer
      });
    });
  });
});