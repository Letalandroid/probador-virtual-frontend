// Mock the env module before importing anything else
jest.mock('@/config/env', () => ({
  config: {
    apiBaseUrl: 'http://localhost:3000',
    pythonApiUrl: 'http://localhost:8000',
    supabaseUrl: 'https://schbbdodgajmbzeeriwd.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGJiZG9kZ2FqbWJ6ZWVyaXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjMxNjMsImV4cCI6MjA3NDI5OTE2M30.AfrB3ZcQTqGkQzoMPIlINhmkcVvSq8ew29oVwypgKD0',
  },
}));

// Mock the hero image import
// jest.mock('@/assets/hero-fashion.jpg', () => 'test-file-stub');

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';
import { apiService } from '../../lib/api';
import { createMockProducts, createMockProduct, createMockUser } from '../../test-helpers/productMocks';

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
      const mockProducts = createMockProducts(2);
      mockApiService.getProducts.mockResolvedValue({
        data: mockProducts,
      });

      // Act
      render(
        <AppWrapper>
          <App />
        </AppWrapper>
      );

      // Navigate to products page
      const productsLink = screen.getByText('Productos');
      await userEvent.click(productsLink);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.getByText('Test Product 2')).toBeInTheDocument();
      });

      expect(mockApiService.getProducts).toHaveBeenCalledTimes(1);
    });

    it('should handle product loading error', async () => {
      // Arrange
      mockApiService.getProducts.mockRejectedValue(new Error('Failed to fetch products'));

      // Act
      render(
        <AppWrapper>
          <App />
        </AppWrapper>
      );

      // Navigate to products page
      const productsLink = screen.getByText('Productos');
      await userEvent.click(productsLink);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Error: Failed to fetch products')).toBeInTheDocument();
      });
    });

    it('should filter products by gender', async () => {
      // Arrange
      const mockProducts = createMockProducts(4);
      mockApiService.getProducts.mockResolvedValue({
        data: mockProducts,
      });

      // Act
      render(
        <AppWrapper>
          <App />
        </AppWrapper>
      );

      // Navigate to products page
      const productsLink = screen.getByText('Productos');
      await userEvent.click(productsLink);

      // Click on women filter
      const womenFilter = screen.getByText('Mujeres');
      await userEvent.click(womenFilter);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Test Product 2')).toBeInTheDocument();
        expect(screen.getByText('Test Product 4')).toBeInTheDocument();
      });
    });

    it('should search products', async () => {
      // Arrange
      const mockProducts = createMockProducts(4);
      mockApiService.getProducts.mockResolvedValue({
        data: mockProducts,
      });

      // Act
      render(
        <AppWrapper>
          <App />
        </AppWrapper>
      );

      // Navigate to products page
      const productsLink = screen.getByText('Productos');
      await userEvent.click(productsLink);

      // Search for specific product
      const searchInput = screen.getByPlaceholderText('Buscar productos...');
      await userEvent.type(searchInput, 'Test Product 1');

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      });
    });
  });

  describe('Product Detail Integration', () => {
    it('should load and display product details', async () => {
      // Arrange
      const mockProduct = createMockProduct({
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
      });
      
      mockApiService.getProduct.mockResolvedValue({
        data: mockProduct,
      });

      // Act
      render(
        <AppWrapper>
          <App />
        </AppWrapper>
      );

      // Navigate to product detail page
      window.history.pushState({}, '', '/productos/1');

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByText('$100')).toBeInTheDocument();
      });

      expect(mockApiService.getProduct).toHaveBeenCalledWith('1');
    });

    it('should handle product not found', async () => {
      // Arrange
      mockApiService.getProduct.mockRejectedValue(new Error('Product not found'));

      // Act
      render(
        <AppWrapper>
          <App />
        </AppWrapper>
      );

      // Navigate to non-existent product
      window.history.pushState({}, '', '/productos/999');

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Producto no encontrado')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Integration', () => {
    it('should handle user login', async () => {
      // Arrange
      const mockUser = createMockUser();
      const mockLoginResponse = {
        user: mockUser,
        token: 'mock-token',
      };

      mockApiService.login.mockResolvedValue({
        data: mockLoginResponse,
      });
      mockApiService.getCurrentUser.mockResolvedValue({
        data: mockUser,
      });

      // Act
      render(
        <AppWrapper>
          <App />
        </AppWrapper>
      );

      // Navigate to login page
      const loginLink = screen.getByText('Iniciar Sesión');
      await userEvent.click(loginLink);

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
      mockApiService.login.mockRejectedValue(new Error('Invalid credentials'));

      // Act
      render(
        <AppWrapper>
          <App />
        </AppWrapper>
      );

      // Navigate to login page
      const loginLink = screen.getByText('Iniciar Sesión');
      await userEvent.click(loginLink);

      // Fill login form with invalid credentials
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Contraseña');
      const loginButton = screen.getByText('Iniciar Sesión');

      await userEvent.type(emailInput, 'invalid@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Error en el inicio de sesión')).toBeInTheDocument();
      });
    });

    it('should handle user registration', async () => {
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
      render(
        <AppWrapper>
          <App />
        </AppWrapper>
      );

      // Navigate to register page
      const registerLink = screen.getByText('Registrarse');
      await userEvent.click(registerLink);

      // Fill registration form
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Contraseña');
      const nameInput = screen.getByPlaceholderText('Nombre completo');
      const registerButton = screen.getByText('Registrarse');

      await userEvent.type(emailInput, 'newuser@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(nameInput, 'New User');
      await userEvent.click(registerButton);

      // Assert
      await waitFor(() => {
        expect(mockApiService.register).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'password123',
          full_name: 'New User',
        });
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors gracefully', async () => {
      // Arrange
      mockApiService.getProducts.mockRejectedValue(new Error('Network error'));

      // Act
      render(
        <AppWrapper>
          <App />
        </AppWrapper>
      );

      // Navigate to products page
      const productsLink = screen.getByText('Productos');
      await userEvent.click(productsLink);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Error: Network error')).toBeInTheDocument();
      });
    });

    it('should handle timeout errors', async () => {
      // Arrange
      mockApiService.getProducts.mockRejectedValue(new Error('Request timeout'));

      // Act
      render(
        <AppWrapper>
          <App />
        </AppWrapper>
      );

      // Navigate to products page
      const productsLink = screen.getByText('Productos');
      await userEvent.click(productsLink);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Error: Request timeout')).toBeInTheDocument();
      });
    });
  });
});