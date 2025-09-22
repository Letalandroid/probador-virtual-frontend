export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  gender: 'Mujeres' | 'Hombres' | 'Niños' | 'Unisex';
  colors: string[];
  sizes: string[];
  isNew: boolean;
  hasDiscount: boolean;
  aiTryOn: boolean;
  description?: string;
}

export const mockProducts: Product[] = [
  // Mujeres - Vestidos
  {
    id: 1,
    name: 'Vestido Elegante de Verano',
    brand: 'Fashion Forward',
    price: 89.99,
    originalPrice: 119.99,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
    category: 'Vestidos',
    gender: 'Mujeres',
    colors: ['bg-fashion-rose', 'bg-fashion-sage', 'bg-primary'],
    sizes: ['XS', 'S', 'M', 'L'],
    isNew: true,
    hasDiscount: true,
    aiTryOn: true,
    description: 'Vestido elegante perfecto para ocasiones especiales'
  },
  {
    id: 2,
    name: 'Vestido Casual Floral',
    brand: 'Garden Collection',
    price: 65.99,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop',
    category: 'Vestidos',
    gender: 'Mujeres',
    colors: ['bg-fashion-rose', 'bg-fashion-cream'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    isNew: false,
    hasDiscount: false,
    aiTryOn: true
  },
  
  // Mujeres - Blusas
  {
    id: 3,
    name: 'Blusa Floral Primavera',
    brand: 'Garden Collection',
    price: 45.99,
    originalPrice: 59.99,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop',
    category: 'Blusas',
    gender: 'Mujeres',
    colors: ['bg-fashion-rose', 'bg-fashion-cream', 'bg-fashion-sage'],
    sizes: ['XS', 'S', 'M', 'L'],
    isNew: true,
    hasDiscount: true,
    aiTryOn: true
  },
  {
    id: 4,
    name: 'Blusa Ejecutiva',
    brand: 'Professional Line',
    price: 55.99,
    image: 'https://images.unsplash.com/photo-1551048632-6ac23ef1a7e9?w=400&h=500&fit=crop',
    category: 'Blusas',
    gender: 'Mujeres',
    colors: ['bg-background', 'bg-primary', 'bg-fashion-sage'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    isNew: false,
    hasDiscount: false,
    aiTryOn: true
  },

  // Mujeres - Pantalones
  {
    id: 5,
    name: 'Jeans Skinny Fit Mujer',
    brand: 'Urban Style',
    price: 69.99,
    originalPrice: 89.99,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop',
    category: 'Pantalones',
    gender: 'Mujeres',
    colors: ['bg-primary', 'bg-gray-600', 'bg-gray-400'],
    sizes: ['26', '28', '30', '32', '34'],
    isNew: false,
    hasDiscount: true,
    aiTryOn: true
  },

  // Hombres - Camisetas
  {
    id: 6,
    name: 'Camiseta Básica Premium',
    brand: 'StyleAI Collection',
    price: 29.99,
    originalPrice: 39.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
    category: 'Camisetas',
    gender: 'Hombres',
    colors: ['bg-primary', 'bg-accent', 'bg-fashion-rose'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    isNew: false,
    hasDiscount: true,
    aiTryOn: true
  },
  {
    id: 7,
    name: 'Camiseta Deportiva',
    brand: 'Active Wear',
    price: 35.99,
    image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=500&fit=crop',
    category: 'Camisetas',
    gender: 'Hombres',
    colors: ['bg-primary', 'bg-accent', 'bg-gray-600'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    isNew: true,
    hasDiscount: false,
    aiTryOn: true
  },

  // Hombres - Chaquetas
  {
    id: 8,
    name: 'Chaqueta de Cuero',
    brand: 'Luxury Line',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
    category: 'Chaquetas',
    gender: 'Hombres',
    colors: ['bg-gray-900', 'bg-gray-700'],
    sizes: ['S', 'M', 'L', 'XL'],
    isNew: false,
    hasDiscount: false,
    aiTryOn: true
  },
  {
    id: 9,
    name: 'Hoodie Oversized',
    brand: 'Comfort Zone',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop',
    category: 'Sudaderas',
    gender: 'Hombres',
    colors: ['bg-gray-600', 'bg-primary', 'bg-accent'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    isNew: false,
    hasDiscount: false,
    aiTryOn: true
  },

  // Niños
  {
    id: 10,
    name: 'Camiseta Infantil Colorida',
    brand: 'Kids Collection',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&h=500&fit=crop',
    category: 'Camisetas',
    gender: 'Niños',
    colors: ['bg-accent', 'bg-fashion-rose', 'bg-primary'],
    sizes: ['2T', '3T', '4T', '5T', '6T'],
    isNew: true,
    hasDiscount: false,
    aiTryOn: true
  },
  {
    id: 11,
    name: 'Vestido Infantil Princesa',
    brand: 'Little Dreams',
    price: 39.99,
    originalPrice: 49.99,
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=500&fit=crop',
    category: 'Vestidos',
    gender: 'Niños',
    colors: ['bg-fashion-rose', 'bg-accent', 'bg-fashion-cream'],
    sizes: ['2T', '3T', '4T', '5T', '6T'],
    isNew: false,
    hasDiscount: true,
    aiTryOn: true
  },

  // Accesorios
  {
    id: 12,
    name: 'Bolso de Mano Elegante',
    brand: 'Luxury Accessories',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop',
    category: 'Bolsos',
    gender: 'Mujeres',
    colors: ['bg-gray-900', 'bg-gray-700', 'bg-fashion-rose'],
    sizes: ['Único'],
    isNew: true,
    hasDiscount: false,
    aiTryOn: false
  },
  {
    id: 13,
    name: 'Reloj Deportivo',
    brand: 'Tech Watch',
    price: 89.99,
    originalPrice: 119.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop',
    category: 'Relojes',
    gender: 'Unisex',
    colors: ['bg-gray-900', 'bg-primary', 'bg-accent'],
    sizes: ['S', 'M', 'L'],
    isNew: false,
    hasDiscount: true,
    aiTryOn: false
  },
  {
    id: 14,
    name: 'Gafas de Sol Aviador',
    brand: 'Sun Protection',
    price: 45.99,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=500&fit=crop',
    category: 'Gafas',
    gender: 'Unisex',
    colors: ['bg-gray-900', 'bg-gray-700', 'bg-accent'],
    sizes: ['Único'],
    isNew: false,
    hasDiscount: false,
    aiTryOn: false
  },
  {
    id: 15,
    name: 'Collar de Perlas',
    brand: 'Elegant Jewelry',
    price: 75.99,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=500&fit=crop',
    category: 'Joyas',
    gender: 'Mujeres',
    colors: ['bg-fashion-cream', 'bg-accent'],
    sizes: ['Único'],
    isNew: true,
    hasDiscount: false,
    aiTryOn: false
  }
];

// Helper functions
export const getUniqueCategories = () => {
  return [...new Set(mockProducts.map(product => product.category))];
};

export const getProductsByGender = (gender: string) => {
  if (gender === 'all') return mockProducts;
  return mockProducts.filter(product => product.gender === gender || product.gender === 'Unisex');
};

export const getProductsByCategory = (category: string) => {
  if (category === 'all') return mockProducts;
  return mockProducts.filter(product => product.category === category);
};

export const searchProducts = (query: string) => {
  if (!query) return mockProducts;
  return mockProducts.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase()) ||
    product.brand.toLowerCase().includes(query.toLowerCase()) ||
    product.category.toLowerCase().includes(query.toLowerCase()) ||
    product.gender.toLowerCase().includes(query.toLowerCase())
  );
};