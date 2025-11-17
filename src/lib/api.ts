// API service for backend communication
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from '@/config/env';

const API_BASE_URL = config.apiBaseUrl;

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: PaginationInfo;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'client';
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  brand?: string;
  color?: string;
  sizes: string[];
  images: string[];
  stockQuantity: number;
  isActive: boolean;
  gender: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export class ApiService {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.token = localStorage.getItem('auth_token');
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Leer el token del localStorage en cada petición para asegurar que esté actualizado
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.setToken(null);
          // Solo redirigir si no estamos ya en la página de auth
          if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.request({
        method,
        url: endpoint,
        data,
      });

      return { data: response.data };
    } catch (error: any) {
      return {
        error: error.response?.data?.message || error.message || 'Network error',
      };
    }
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('POST', '/auth/login', credentials);

    if (response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('POST', '/auth/register', userData);

    if (response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    this.setToken(null);
  }

  getToken(): string | null {
    // Leer siempre del localStorage para asegurar que esté sincronizado
    this.token = localStorage.getItem('auth_token');
    return this.token;
  }

  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('GET', '/auth/me');
  }

  // Product methods
  async getProducts(): Promise<ApiResponse<ProductsResponse>> {
    return this.request<ProductsResponse>('GET', '/products');
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request<Product>('GET', `/products/${id}`);
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<ApiResponse<Product>> {
    return this.request<Product>('POST', '/products', product);
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.request<Product>('PUT', `/products/${id}`, product);
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/products/${id}`);
  }

  // Category methods
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request<Category[]>('GET', '/categories');
  }

  async createCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<ApiResponse<Category>> {
    return this.request<Category>('POST', '/categories', category);
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<ApiResponse<Category>> {
    return this.request<Category>('PUT', `/categories/${id}`, category);
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/categories/${id}`);
  }

  // User management methods (admin only)
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('GET', '/users');
  }

  async updateUserRole(id: string, role: 'admin' | 'client'): Promise<ApiResponse<User>> {
    return this.request<User>('PUT', `/users/${id}/role`, { role });
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/users/${id}`);
  }

  async updateProfile(profileData: Partial<{
    full_name?: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    avatar_url?: string;
  }>): Promise<ApiResponse<any>> {
    return this.request<any>('PUT', '/users/profile/me', profileData);
  }

  async getMyProfile(): Promise<ApiResponse<any>> {
    return this.request<any>('GET', '/users/profile/me');
  }

  // AI/Virtual Try-On methods - Direct to Python API
  private async callPythonApi<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    const pythonApiUrl = config.pythonApiUrl || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${pythonApiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { data: result };
    } catch (error: any) {
      return {
        error: error.message || 'Error connecting to AI service',
      };
    }
  }

  async detectTorso(personImage: string): Promise<ApiResponse<any>> {
    // Convert base64 to FormData for Python API
    const formData = new FormData();
    const blob = await this.base64ToBlob(personImage, 'image/jpeg');
    formData.append('person_image', blob, 'person.jpg');

    const pythonApiUrl = config.pythonApiUrl || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${pythonApiUrl}/detect-torso`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { data: result };
    } catch (error: any) {
      return {
        error: error.message || 'Error connecting to AI service',
      };
    }
  }

  async virtualTryOn(
    personImage: string,
    clothingImage: string,
    clothingType: string,
    stylePreferences?: any
  ): Promise<ApiResponse<any>> {
    const formData = new FormData();
    const personBlob = await this.base64ToBlob(personImage, 'image/jpeg');
    const clothingBlob = await this.base64ToBlob(clothingImage, 'image/jpeg');
    
    formData.append('person_image', personBlob, 'person.jpg');
    formData.append('clothing_image', clothingBlob, 'clothing.jpg');
    formData.append('clothing_type', clothingType);
    
    if (stylePreferences) {
      formData.append('style_preferences', JSON.stringify(stylePreferences));
    }

    const pythonApiUrl = config.pythonApiUrl || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${pythonApiUrl}/virtual-try-on`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { data: result };
    } catch (error: any) {
      return {
        error: error.message || 'Error connecting to AI service',
      };
    }
  }

  async analyzeClothingFit(
    personImage: string,
    clothingImage: string
  ): Promise<ApiResponse<any>> {
    const formData = new FormData();
    const personBlob = await this.base64ToBlob(personImage, 'image/jpeg');
    const clothingBlob = await this.base64ToBlob(clothingImage, 'image/jpeg');
    
    formData.append('person_image', personBlob, 'person.jpg');
    formData.append('clothing_image', clothingBlob, 'clothing.jpg');

    const pythonApiUrl = config.pythonApiUrl || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${pythonApiUrl}/analyze-clothing-fit`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { data: result };
    } catch (error: any) {
      return {
        error: error.message || 'Error connecting to AI service',
      };
    }
  }

  async generateMultipleAngles(
    personImage: string,
    clothingImage: string,
    angles?: string[]
  ): Promise<ApiResponse<any>> {
    const formData = new FormData();
    const personBlob = await this.base64ToBlob(personImage, 'image/jpeg');
    const clothingBlob = await this.base64ToBlob(clothingImage, 'image/jpeg');
    
    formData.append('person_image', personBlob, 'person.jpg');
    formData.append('clothing_image', clothingBlob, 'clothing.jpg');
    formData.append('angles', (angles || ['front', 'side', 'back']).join(','));

    const pythonApiUrl = config.pythonApiUrl || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${pythonApiUrl}/multiple-angles`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { data: result };
    } catch (error: any) {
      return {
        error: error.message || 'Error connecting to AI service',
      };
    }
  }

  async enhanceImage(
    image: string,
    enhancementType?: string
  ): Promise<ApiResponse<any>> {
    const formData = new FormData();
    const imageBlob = await this.base64ToBlob(image, 'image/jpeg');
    
    formData.append('image', imageBlob, 'image.jpg');
    formData.append('enhancement_type', enhancementType || 'realistic');

    const pythonApiUrl = config.pythonApiUrl || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${pythonApiUrl}/enhance-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { data: result };
    } catch (error: any) {
      return {
        error: error.message || 'Error connecting to AI service',
      };
    }
  }

  async checkAiHealth(): Promise<ApiResponse<any>> {
    const pythonApiUrl = config.pythonApiUrl || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${pythonApiUrl}/health`);
      const result = await response.json();
      return { data: result };
    } catch (error: any) {
      return {
        error: error.message || 'AI service not available',
      };
    }
  }

  private async base64ToBlob(base64: string, mimeType: string): Promise<Blob> {
    const base64Data = base64.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  // Health check methods
  async checkServiceStatus(): Promise<ApiResponse<{
    status: 'active' | 'degraded' | 'timeout';
    services: {
      backend: boolean;
      database: boolean;
      aiService: boolean;
    };
    responseTime: number;
    timestamp: string;
    error?: string;
  }>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos timeout

    try {
      const response = await fetch(`${this.axiosInstance.defaults.baseURL}/health/status`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        return {
          error: 'Timeout: Los servicios no respondieron en 3 segundos',
          data: {
            status: 'timeout' as const,
            services: {
              backend: false,
              database: false,
              aiService: false,
            },
            responseTime: 3000,
            timestamp: new Date().toISOString(),
            error: 'La verificación de servicios tardó más de 3 segundos',
          },
        };
      }

      return {
        error: error.message || 'Error al verificar el estado de los servicios',
        data: {
          status: 'timeout' as const,
          services: {
            backend: false,
            database: false,
            aiService: false,
          },
          responseTime: 3000,
          timestamp: new Date().toISOString(),
          error: error.message,
        },
      };
    }
  }

  async downloadReport(
    reportType: 'product-views' | 'virtual-try-on' | 'product-movements' | 'sales' | 'top-selling' | 'sales-trends' | 'conversion-metrics',
    format: 'pdf' | 'csv'
  ): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No autenticado');
    }

    const url = `${this.axiosInstance.defaults.baseURL}/reports/${reportType}/${format}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al descargar reporte: ${response.statusText}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${reportType}_${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

export const apiService = new ApiService();
