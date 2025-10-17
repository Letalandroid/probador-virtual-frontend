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
    login: jest.fn(),
    logout: jest.fn(),
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
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('Virtual Try-On Integration', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'client' as const,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

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

    // Mock fetch for image conversion
    global.fetch = jest.fn();

    // Setup default API service mocks
    mockApiService.getCurrentUser.mockResolvedValue({
      data: mockUser,
    });
    mockApiService.detectTorso.mockResolvedValue({
      data: { success: true, analysis: { torso_detected: true } },
    });
    mockApiService.virtualTryOn.mockResolvedValue({
      data: { success: true, result_image: 'mock-result' },
    });
    mockApiService.enhanceImage.mockResolvedValue({
      data: { success: true, enhanced_image: 'mock-enhanced' },
    });
  });

  // it('should render virtual try-on interface', async () => {
  //   render(
  //     <TestWrapper>
  //       <VirtualTryOn />
  //     </TestWrapper>,
  //   );

  //   // Wait for the component to load and render
  //   await waitFor(() => {
  //     expect(screen.getByText('Producto Seleccionado')).toBeInTheDocument();
  //   });

  //   expect(screen.getByText('Sube tu foto')).toBeInTheDocument();
  //   expect(screen.getByText('Probador Virtual')).toBeInTheDocument();
  // });

  // it('should handle file upload', async () => {
  //   render(
  //     <TestWrapper>
  //       <VirtualTryOn />
  //     </TestWrapper>,
  //   );

  //   const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
  //   const input = screen.getByText('Sube tu foto');
    
  //   fireEvent.click(input);
    
  //   // Simulate file selection
  //   const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  //   fireEvent.change(fileInput, { target: { files: [file] } });

  //   await waitFor(() => {
  //     expect(screen.getByAltText('Tu foto')).toBeInTheDocument();
  //   });
  // });

  // it('should process virtual try-on successfully', async () => {
  //   const mockTorsoAnalysis = {
  //     success: true,
  //     analysis: {
  //       torso_detected: true,
  //       pose_analysis: {
  //         facing_direction: 'front',
  //         shoulder_width: 'medium',
  //       },
  //     },
  //   };

  //   const mockFitAnalysis = {
  //     success: true,
  //     analysis: {
  //       compatibility_score: 85,
  //       size_match: 'good',
  //       style_match: 'excellent',
  //     },
  //   };

  //   const mockTryOnResult = {
  //     success: true,
  //     generated_images: [
  //       {
  //         data: 'base64data',
  //         mime_type: 'image/png',
  //       },
  //     ],
  //   };

  //   const mockAnglesResult = {
  //     success: true,
  //     angles: {
  //       front: [{ data: 'base64data1', mime_type: 'image/png' }],
  //       side: [{ data: 'base64data2', mime_type: 'image/png' }],
  //       back: [{ data: 'base64data3', mime_type: 'image/png' }],
  //     },
  //   };

  //   (apiService.detectTorso as jest.Mock).mockResolvedValue({
  //     data: mockTorsoAnalysis,
  //   });

  //   (apiService.analyzeClothingFit as jest.Mock).mockResolvedValue({
  //     data: mockFitAnalysis,
  //   });

  //   (apiService.virtualTryOn as jest.Mock).mockResolvedValue({
  //     data: mockTryOnResult,
  //   });

  //   (apiService.generateMultipleAngles as jest.Mock).mockResolvedValue({
  //     data: mockAnglesResult,
  //   });

  //   // Mock fetch for image conversion
  //   (global.fetch as jest.Mock)
  //     .mockResolvedValueOnce({
  //       blob: () => Promise.resolve(new Blob(['test'], { type: 'image/jpeg' })),
  //     })
  //     .mockResolvedValueOnce({
  //       blob: () => Promise.resolve(new Blob(['test'], { type: 'image/jpeg' })),
  //     });

  //   render(
  //     <TestWrapper>
  //       <VirtualTryOn />
  //     </TestWrapper>,
  //   );

  //   // Upload a file
  //   const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
  //   const input = screen.getByText('Sube tu foto');
    
  //   fireEvent.click(input);
    
  //   const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  //   fireEvent.change(fileInput, { target: { files: [file] } });

  //   await waitFor(() => {
  //     expect(screen.getByText('Probar Producto')).toBeInTheDocument();
  //   });

  //   // Click process button
  //   fireEvent.click(screen.getByText('Probar Producto'));

  //   await waitFor(() => {
  //     expect(apiService.detectTorso).toHaveBeenCalled();
  //     expect(apiService.analyzeClothingFit).toHaveBeenCalled();
  //     expect(apiService.virtualTryOn).toHaveBeenCalled();
  //     expect(apiService.generateMultipleAngles).toHaveBeenCalled();
  //   });
  // });

  // it('should handle AI service errors gracefully', async () => {
  //   (apiService.detectTorso as jest.Mock).mockRejectedValue(
  //     new Error('AI service unavailable'),
  //   );

  //   render(
  //     <TestWrapper>
  //       <VirtualTryOn />
  //     </TestWrapper>,
  //   );

  //   const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
  //   const input = screen.getByText('Sube tu foto');
    
  //   fireEvent.click(input);
    
  //   const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  //   fireEvent.change(fileInput, { target: { files: [file] } });

  //   await waitFor(() => {
  //     expect(screen.getByText('Probar Producto')).toBeInTheDocument();
  //   });

  //   fireEvent.click(screen.getByText('Probar Producto'));

  //   await waitFor(() => {
  //     expect(apiService.detectTorso).toHaveBeenCalled();
  //   });
  // });

  // Note: Analysis tab functionality not yet implemented in VirtualTryOn component
  // This test is skipped until the feature is added
  it.skip('should display analysis results in analysis tab', async () => {
    // Test will be implemented when analysis tab is added to VirtualTryOn component
  });
});




