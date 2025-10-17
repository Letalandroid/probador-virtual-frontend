import { Product } from '@/lib/api';

export const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: '1',
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  gender: 'men',
  categoryId: 'cat-1',
  category: { id: 'cat-1', name: 'Shirts' },
  brand: 'Test Brand',
  color: 'Blue',
  sizes: ['S', 'M', 'L'],
  images: ['image1.jpg'],
  stockQuantity: 10,
  isActive: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ...overrides,
});

export const createMockProducts = (count: number = 2): Product[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockProduct({
      id: `${index + 1}`,
      name: `Test Product ${index + 1}`,
      price: 100 + (index * 50),
      gender: index % 2 === 0 ? 'men' : 'women',
      categoryId: `cat-${index + 1}`,
      category: { id: `cat-${index + 1}`, name: index % 2 === 0 ? 'Shirts' : 'Dresses' },
    })
  );
};

export const createMockCategory = (overrides: any = {}) => ({
  id: 'cat-1',
  name: 'Shirts',
  description: 'Test category',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ...overrides,
});

export const createMockUser = (overrides: any = {}) => ({
  id: 'user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'client' as const,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ...overrides,
});