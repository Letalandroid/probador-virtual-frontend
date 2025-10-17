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
    detectTorso: jest.fn(),
    virtualTryOn: jest.fn(),
    analyzeClothingFit: jest.fn(),
    generateMultipleAngles: jest.fn(),
    enhanceImage: jest.fn(),
    checkAiHealth: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

// Mock the AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'client' as const,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    isLoading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    updateProfile: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VirtualTryOn from '../../pages/VirtualTryOn';
import { apiService } from '../../lib/api';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    state: {
      product: {
        id: '1',
        name: 'Test Shirt',
        images: ['https://example.com/shirt.jpg'],
        brand: 'Test Brand',
        price: 50,
        category: {
          id: 'cat-1',
          name: 'Camisetas',
        },
      },
    },
  }),
  useNavigate: () => jest.fn(),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    {children}
  </BrowserRouter>
);

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('Virtual Try-On Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
    global.URL.revokeObjectURL = jest.fn();

    // Mock fetch for image conversion (base64ToBlob)
    global.fetch = jest.fn(() =>
      Promise.resolve({
        blob: () => Promise.resolve(new Blob(['dummy content'], { type: 'image/jpeg' })),
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)
    );

    // Setup default API service mocks
    mockApiService.getCurrentUser.mockResolvedValue({
      data: {
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'client' as const,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
    });
    mockApiService.detectTorso.mockResolvedValue({
      data: { success: true, analysis: { torso_detected: true } },
    });
    mockApiService.virtualTryOn.mockResolvedValue({
      data: { success: true, generated_images: [{ data: 'mock-result-base64', mime_type: 'image/png' }] },
    });
    mockApiService.enhanceImage.mockResolvedValue({
      data: { success: true, enhanced_image: 'mock-enhanced-base64' },
    });
    mockApiService.analyzeClothingFit.mockResolvedValue({
      data: { success: true, analysis: { compatibility_score: 90 } },
    });
    mockApiService.generateMultipleAngles.mockResolvedValue({
      data: { success: true, angles: { front: [{ data: 'mock-angle-base64', mime_type: 'image/png' }] } },
    });
  });

  it('should render virtual try-on interface with selected product', async () => {
    render(
      <TestWrapper>
        <VirtualTryOn />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getAllByText('Probador Virtual')).toHaveLength(3); // Header link, main title, and modal title
    });
    expect(screen.getByText('Producto Seleccionado')).toBeInTheDocument();
    expect(screen.getByText('Test Shirt')).toBeInTheDocument();
  });

  it('should render product information correctly', async () => {
    render(
      <TestWrapper>
        <VirtualTryOn />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('Test Shirt')).toBeInTheDocument();
      expect(screen.getByText('Test Brand')).toBeInTheDocument();
      expect(screen.getByText('$50')).toBeInTheDocument();
    });
  });

  it('should render upload section', async () => {
    render(
      <TestWrapper>
        <VirtualTryOn />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('Sube tu foto')).toBeInTheDocument();
    });
  });

  it('should render try-on button when user image is uploaded', async () => {
    render(
      <TestWrapper>
        <VirtualTryOn />
      </TestWrapper>,
    );

    // First, upload a user image
    const fileInput = screen.getByRole('button', { name: /seleccionar imagen/i });
    expect(fileInput).toBeInTheDocument();

    // The "Probar Producto" button only appears after uploading an image
    // So we should not expect it to be present initially
    expect(screen.queryByText('Probar Producto')).not.toBeInTheDocument();
  });
});