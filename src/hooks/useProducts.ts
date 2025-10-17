import { useState, useEffect } from 'react';
import { apiService, Product, ProductsResponse } from '@/lib/api';

// Product interface is now imported from api.ts

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getProducts();

      if (response.error) {
        throw new Error(response.error);
      }

      // The API returns {products: Product[], pagination: {...}}
      const productsData = response.data?.products || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Track product views
  const trackProductView = async (productId: string) => {
    try {
      // For now, we'll just log the view
      // In a real app, you'd call an API endpoint to track views
      console.log('Product view tracked:', productId);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const getProductsByGender = (gender: string) => {
    if (gender === 'all') return products;
    // Only show men and women products, exclude kids
    if (gender === 'women') {
      return products.filter(product => product.gender.toLowerCase() === 'women');
    }
    if (gender === 'men') {
      return products.filter(product => product.gender.toLowerCase() === 'men');
    }
    return products.filter(product => 
      product.gender.toLowerCase() === gender.toLowerCase() || 
      product.gender.toLowerCase() === 'unisex'
    );
  };

  const getProductsByCategory = (categoryName: string) => {
    if (categoryName === 'all') return products;
    return products.filter(product => 
      product.category?.name.toLowerCase() === categoryName.toLowerCase()
    );
  };

  const searchProducts = (query: string) => {
    if (!query) return products;
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      (product.brand && product.brand.toLowerCase().includes(lowercaseQuery)) ||
      (product.category?.name && product.category.name.toLowerCase().includes(lowercaseQuery)) ||
      product.gender.toLowerCase().includes(lowercaseQuery)
    );
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    isLoading,
    error,
    refetch: fetchProducts,
    trackProductView,
    getProductsByGender,
    getProductsByCategory,
    searchProducts,
  };
};