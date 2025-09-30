import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VirtualTryOn from '../../pages/VirtualTryOnNew';
import { AuthProvider } from '../../contexts/AuthContext';
import { apiService } from '../../lib/api';

// Mock the API service
jest.mock('../../lib/api', () => ({
  apiService: {
    detectTorso: jest.fn(),
    virtualTryOn: jest.fn(),
    analyzeClothingFit: jest.fn(),
    generateMultipleAngles: jest.fn(),
    enhanceImage: jest.fn(),
    checkAiHealth: jest.fn(),
  },
}));

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
      },
    },
  }),
  useNavigate: () => jest.fn(),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('Virtual Try-On Integration', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    full_name: 'Test User',
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
  });

  it('should render virtual try-on interface', () => {
    render(
      <TestWrapper>
        <VirtualTryOn />
      </TestWrapper>,
    );

    expect(screen.getByText('Probador Virtual con IA')).toBeInTheDocument();
    expect(screen.getByText('Producto Seleccionado')).toBeInTheDocument();
    expect(screen.getByText('Sube tu foto')).toBeInTheDocument();
  });

  it('should handle file upload', async () => {
    render(
      <TestWrapper>
        <VirtualTryOn />
      </TestWrapper>,
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /seleccionar imagen/i });
    
    fireEvent.click(input);
    
    // Simulate file selection
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Cambiar Foto')).toBeInTheDocument();
    });
  });

  it('should process virtual try-on successfully', async () => {
    const mockTorsoAnalysis = {
      success: true,
      analysis: {
        torso_detected: true,
        pose_analysis: {
          facing_direction: 'front',
          shoulder_width: 'medium',
        },
      },
    };

    const mockFitAnalysis = {
      success: true,
      analysis: {
        compatibility_score: 85,
        size_match: 'good',
        style_match: 'excellent',
      },
    };

    const mockTryOnResult = {
      success: true,
      generated_images: [
        {
          data: 'base64data',
          mime_type: 'image/png',
        },
      ],
    };

    const mockAnglesResult = {
      success: true,
      angles: {
        front: [{ data: 'base64data1', mime_type: 'image/png' }],
        side: [{ data: 'base64data2', mime_type: 'image/png' }],
        back: [{ data: 'base64data3', mime_type: 'image/png' }],
      },
    };

    (apiService.detectTorso as jest.Mock).mockResolvedValue({
      data: mockTorsoAnalysis,
    });

    (apiService.analyzeClothingFit as jest.Mock).mockResolvedValue({
      data: mockFitAnalysis,
    });

    (apiService.virtualTryOn as jest.Mock).mockResolvedValue({
      data: mockTryOnResult,
    });

    (apiService.generateMultipleAngles as jest.Mock).mockResolvedValue({
      data: mockAnglesResult,
    });

    // Mock fetch for image conversion
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        blob: () => Promise.resolve(new Blob(['test'], { type: 'image/jpeg' })),
      })
      .mockResolvedValueOnce({
        blob: () => Promise.resolve(new Blob(['test'], { type: 'image/jpeg' })),
      });

    render(
      <TestWrapper>
        <VirtualTryOn />
      </TestWrapper>,
    );

    // Upload a file
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /seleccionar imagen/i });
    
    fireEvent.click(input);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Probar con IA')).toBeInTheDocument();
    });

    // Click process button
    fireEvent.click(screen.getByText('Probar con IA'));

    await waitFor(() => {
      expect(apiService.detectTorso).toHaveBeenCalled();
      expect(apiService.analyzeClothingFit).toHaveBeenCalled();
      expect(apiService.virtualTryOn).toHaveBeenCalled();
      expect(apiService.generateMultipleAngles).toHaveBeenCalled();
    });
  });

  it('should handle AI service errors gracefully', async () => {
    (apiService.detectTorso as jest.Mock).mockRejectedValue(
      new Error('AI service unavailable'),
    );

    render(
      <TestWrapper>
        <VirtualTryOn />
      </TestWrapper>,
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /seleccionar imagen/i });
    
    fireEvent.click(input);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Probar con IA')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Probar con IA'));

    await waitFor(() => {
      expect(apiService.detectTorso).toHaveBeenCalled();
    });
  });

  it('should display analysis results in analysis tab', async () => {
    const mockTorsoAnalysis = {
      success: true,
      analysis: {
        torso_detected: true,
        pose_analysis: {
          facing_direction: 'front',
          shoulder_width: 'medium',
          torso_angle: 'straight',
          arms_position: 'down',
        },
      },
    };

    const mockFitAnalysis = {
      success: true,
      analysis: {
        compatibility_score: 85,
        size_match: 'good',
        style_match: 'excellent',
        color_harmony: 'good',
        recommendations: {
          overall_verdict: 'recommended',
        },
      },
    };

    (apiService.detectTorso as jest.Mock).mockResolvedValue({
      data: mockTorsoAnalysis,
    });

    (apiService.analyzeClothingFit as jest.Mock).mockResolvedValue({
      data: mockFitAnalysis,
    });

    render(
      <TestWrapper>
        <VirtualTryOn />
      </TestWrapper>,
    );

    // Click on analysis tab
    fireEvent.click(screen.getByText('Análisis'));

    expect(screen.getByText('Análisis de Torso')).toBeInTheDocument();
    expect(screen.getByText('Análisis de Ajuste')).toBeInTheDocument();
  });
});


