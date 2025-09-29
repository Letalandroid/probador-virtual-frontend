import { apiService } from '../api';

// Mock fetch
global.fetch = jest.fn();

describe('ApiService', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', email: 'test@example.com' },
          token: 'mock-token',
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );
    });

    it('should handle login error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid credentials' }),
      });

      const result = await apiService.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('getProducts', () => {
    it('should fetch products successfully', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          price: 100,
          images: ['image1.jpg'],
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockProducts }),
      });

      const result = await apiService.getProducts();

      expect(result.data).toEqual(mockProducts);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/products'),
        expect.objectContaining({
          method: 'GET',
        }),
      );
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

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.virtualTryOn(
        'personBase64',
        'clothingBase64',
        'shirt',
        { fit: 'regular' },
      );

      expect(result.data).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/virtual-try-on'),
        expect.objectContaining({
          method: 'POST',
        }),
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

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.detectTorso('personBase64');

      expect(result.data).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/detect-torso'),
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });
  });

  describe('checkAiHealth', () => {
    it('should check AI service health', async () => {
      const mockResponse = {
        status: 'healthy',
        message: 'AI service is running',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.checkAiHealth();

      expect(result.data).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({
          method: 'GET',
        }),
      );
    });
  });
});
