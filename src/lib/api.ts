// API service for backend communication
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from '@/config/env';

const API_BASE_URL = config.apiBaseUrl;

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  role: 'admin' | 'client';
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

class ApiService {
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
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
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
          this.token = null;
          localStorage.removeItem('auth_token');
          window.location.href = '/auth';
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
      this.token = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('POST', '/auth/register', userData);

    if (response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('GET', '/auth/me');
  }

  // Product methods
  async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>('GET', '/products');
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
}

export const apiService = new ApiService();
