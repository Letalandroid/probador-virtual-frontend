import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  brand?: string;
  color?: string;
  sizes: string[];
  images: string[];
  stock_quantity: number;
  is_active: boolean;
  gender: string;
  created_at: string;
  categories?: { name: string };
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProducts(data || []);
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
      await supabase
        .from('product_views')
        .insert({
          product_id: productId,
          view_type: 'catalog'
        });
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
      product.categories?.name.toLowerCase() === categoryName.toLowerCase()
    );
  };

  const searchProducts = (query: string) => {
    if (!query) return products;
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      (product.brand && product.brand.toLowerCase().includes(lowercaseQuery)) ||
      (product.categories?.name && product.categories.name.toLowerCase().includes(lowercaseQuery)) ||
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
    searchProducts
  };
};