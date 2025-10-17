import { Product, User, Category } from '@/lib/api';

export const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: '1',
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  categoryId: 'cat-1',
  brand: 'Test Brand',
  color: 'Black',
  sizes: ['S', 'M', 'L'],
  images: ['https://example.com/image1.jpg'],
  stockQuantity: 10,
  isActive: true,
  gender: 'women',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  category: {
    id: 'cat-1',
    name: 'Tops',
  },
  ...overrides,
});

export const createMockProducts = (count: number): Product[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockProduct({
      id: `${index + 1}`,
      name: `Test Product ${index + 1}`,
      price: 100 + (index * 50),
      gender: index % 2 === 0 ? 'women' : 'men',
      category: {
        id: `cat-${index + 1}`,
        name: index % 2 === 0 ? 'Tops' : 'Bottoms',
      },
    })
  );
};

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'client',
  phone: '+1234567890',
  address: '123 Test St',
  city: 'Test City',
  postal_code: '12345',
  country: 'Test Country',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockCategory = (overrides: Partial<Category> = {}): Category => ({
  id: '1',
  name: 'Test Category',
  description: 'Test Category Description',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockCategories = (count: number): Category[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockCategory({
      id: `${index + 1}`,
      name: `Category ${index + 1}`,
    })
  );
};

