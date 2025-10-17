import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { App } from '../../App';
import { apiService } from '../../lib/api';

// Mock del apiService
jest.mock('../../lib/api', () => ({
  apiService: {
    getProducts: jest.fn(),
    getCategories: jest.fn(),
    getProduct: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
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

// Wrapper para la aplicación completa
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Frontend-Backend Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Product Catalog Integration', () => {
    it('should load and display products from backend', async () => {
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

      const mockCategories = [
        { id: 'cat-1', name: 'Shirts', description: 'All shirts', isActive: true, createdAt: '2023-01-01T00:00:00Z' },
        { id: 'cat-2', name: 'Dresses', description: 'All dresses', isActive: true, createdAt: '2023-01-02T00:00:00Z' },
      ];

      mockApiService.getProducts.mockResolvedValue({
        data: { products: mockProducts },
      });
      mockApiService.getCategories.mockResolvedValue({
        data: mockCategories,
      });
      mockApiService.getCurrentUser.mockResolvedValue({
        error: 'Not authenticated',
      });

      // Act
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.getByText('Test Product 2')).toBeInTheDocument();
      });

      expect(mockApiService.getProducts).toHaveBeenCalledTimes(1);
      expect(mockApiService.getCategories).toHaveBeenCalledTimes(1);
    });

    it('should handle product loading error', async () => {
      // Arrange
      mockApiService.getProducts.mockResolvedValue({
        error: 'Failed to fetch products',
      });
      mockApiService.getCategories.mockResolvedValue({
        data: [],
      });
      mockApiService.getCurrentUser.mockResolvedValue({
        error: 'Not authenticated',
      });

      // Act
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Error: Failed to fetch products')).toBeInTheDocument();
      });
    });

    it('should filter products by gender', async () => {
      // Arrange
      const mockProducts = [
        {
          id: '1',
          name: 'Men Shirt',
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
          name: 'Women Dress',
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
      mockApiService.getCategories.mockResolvedValue({
        data: [],
      });
      mockApiService.getCurrentUser.mockResolvedValue({
        error: 'Not authenticated',
      });

      // Act
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Wait for products to load
      await waitFor(() => {
        expect(screen.getByText('Men Shirt')).toBeInTheDocument();
        expect(screen.getByText('Women Dress')).toBeInTheDocument();
      });

      // Click on women filter
      const womenFilter = screen.getByText('Mujeres');
      await userEvent.click(womenFilter);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Women Dress')).toBeInTheDocument();
        expect(screen.queryByText('Men Shirt')).not.toBeInTheDocument();
      });
    });

    it('should search products', async () => {
      // Arrange
      const mockProducts = [
        {
          id: '1',
          name: 'Blue Shirt',
          price: 100,
          gender: 'men',
          category: { id: 'cat-1', name: 'Shirts' },
          brand: 'Nike',
          color: 'Blue',
          sizes: ['S', 'M', 'L'],
          images: ['image1.jpg'],
          stockQuantity: 10,
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Red Dress',
          price: 200,
          gender: 'women',
          category: { id: 'cat-2', name: 'Dresses' },
          brand: 'Adidas',
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
      mockApiService.getCategories.mockResolvedValue({
        data: [],
      });
      mockApiService.getCurrentUser.mockResolvedValue({
        error: 'Not authenticated',
      });

      // Act
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Wait for products to load
      await waitFor(() => {
        expect(screen.getByText('Blue Shirt')).toBeInTheDocument();
        expect(screen.getByText('Red Dress')).toBeInTheDocument();
      });

      // Search for "shirt"
      const searchInput = screen.getByPlaceholderText('Buscar productos...');
      await userEvent.type(searchInput, 'shirt');

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Blue Shirt')).toBeInTheDocument();
        expect(screen.queryByText('Red Dress')).not.toBeInTheDocument();
      });
    });
  });

  describe('Product Detail Integration', () => {
    it('should load product detail from backend', async () => {
      // Arrange
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        gender: 'men',
        category: { id: 'cat-1', name: 'Shirts' },
        brand: 'Test Brand',
        color: 'Blue',
        sizes: ['S', 'M', 'L'],
        images: ['image1.jpg', 'image2.jpg'],
        stockQuantity: 10,
        isActive: true,
        createdAt: '2023-01-01T00:00:00Z',
      };

      mockApiService.getProduct.mockResolvedValue({
        data: mockProduct,
      });
      mockApiService.getCurrentUser.mockResolvedValue({
        error: 'Not authenticated',
      });

      // Act
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to product detail
      window.history.pushState({}, '', '/productos/1');

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByText('$100')).toBeInTheDocument();
      });

      expect(mockApiService.getProduct).toHaveBeenCalledWith('1');
    });

    it('should handle product not found error', async () => {
      // Arrange
      mockApiService.getProduct.mockResolvedValue({
        error: 'Product not found',
      });
      mockApiService.getCurrentUser.mockResolvedValue({
        error: 'Not authenticated',
      });

      // Act
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to non-existent product
      window.history.pushState({}, '', '/productos/non-existent');

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Producto no encontrado')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Integration', () => {
    it('should login user successfully', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'client',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      const mockLoginResponse = {
        user: mockUser,
        token: 'jwt-token',
      };

      mockApiService.login.mockResolvedValue({
        data: mockLoginResponse,
      });
      mockApiService.getCurrentUser.mockResolvedValue({
        data: mockUser,
      });
      mockApiService.getProducts.mockResolvedValue({
        data: { products: [] },
      });
      mockApiService.getCategories.mockResolvedValue({
        data: [],
      });

      // Act
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to auth page
      window.history.pushState({}, '', '/auth');

      // Fill login form
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Contraseña');
      const loginButton = screen.getByText('Iniciar Sesión');

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(mockApiService.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should handle login error', async () => {
      // Arrange
      mockApiService.login.mockResolvedValue({
        error: 'Invalid credentials',
      });
      mockApiService.getCurrentUser.mockResolvedValue({
        error: 'Not authenticated',
      });
      mockApiService.getProducts.mockResolvedValue({
        data: { products: [] },
      });
      mockApiService.getCategories.mockResolvedValue({
        data: [],
      });

      // Act
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to auth page
      window.history.pushState({}, '', '/auth');

      // Fill login form
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Contraseña');
      const loginButton = screen.getByText('Iniciar Sesión');

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Error en el inicio de sesión')).toBeInTheDocument();
      });
    });

    it('should register user successfully', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'client',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      const mockRegisterResponse = {
        user: mockUser,
        token: 'jwt-token',
      };

      mockApiService.register.mockResolvedValue({
        data: mockRegisterResponse,
      });
      mockApiService.getCurrentUser.mockResolvedValue({
        data: mockUser,
      });
      mockApiService.getProducts.mockResolvedValue({
        data: { products: [] },
      });
      mockApiService.getCategories.mockResolvedValue({
        data: [],
      });

      // Act
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to auth page
      window.history.pushState({}, '', '/auth');

      // Switch to register tab
      const registerTab = screen.getByText('Registrarse');
      await userEvent.click(registerTab);

      // Fill register form
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Contraseña');
      const fullNameInput = screen.getByPlaceholderText('Nombre completo');
      const registerButton = screen.getByText('Registrarse');

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(fullNameInput, 'Test User');
      await userEvent.click(registerButton);

      // Assert
      await waitFor(() => {
        expect(mockApiService.register).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          full_name: 'Test User',
        });
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors gracefully', async () => {
      // Arrange
      mockApiService.getProducts.mockRejectedValue(new Error('Network error'));
      mockApiService.getCategories.mockResolvedValue({
        data: [],
      });
      mockApiService.getCurrentUser.mockResolvedValue({
        error: 'Not authenticated',
      });

      // Act
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Error: Network error')).toBeInTheDocument();
      });
    });

    it('should handle API timeout', async () => {
      // Arrange
      mockApiService.getProducts.mockImplementation(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );
      mockApiService.getCategories.mockResolvedValue({
        data: [],
      });
      mockApiService.getCurrentUser.mockResolvedValue({
        error: 'Not authenticated',
      });

      // Act
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Error: Request timeout')).toBeInTheDocument();
      }, { timeout: 200 });
    });
  });

  describe('Navigation Integration', () => {
    it('should navigate between pages correctly', async () => {
      // Arrange
      mockApiService.getProducts.mockResolvedValue({
        data: { products: [] },
      });
      mockApiService.getCategories.mockResolvedValue({
        data: [],
      });
      mockApiService.getCurrentUser.mockResolvedValue({
        error: 'Not authenticated',
      });

      // Act
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to products page
      const productsLink = screen.getByText('Productos');
      await userEvent.click(productsLink);

      // Assert
      await waitFor(() => {
        expect(window.location.pathname).toBe('/productos');
      });

      // Navigate to women page
      const womenLink = screen.getByText('Mujeres');
      await userEvent.click(womenLink);

      // Assert
      await waitFor(() => {
        expect(window.location.pathname).toBe('/mujeres');
      });
    });
  });
});
