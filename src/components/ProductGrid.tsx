import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye, ShoppingBag, Camera } from 'lucide-react';
import CategoryFilter from './CategoryFilter';
import SearchBar from './SearchBar';

const products = [
  {
    id: 1,
    name: 'Camiseta Básica Premium',
    brand: 'StyleAI Collection',
    price: 29.99,
    originalPrice: 39.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
    category: 'Camisetas',
    colors: ['bg-primary', 'bg-accent', 'bg-fashion-rose'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    isNew: false,
    hasDiscount: true,
    aiTryOn: true
  },
  {
    id: 2,
    name: 'Vestido Elegante de Verano',
    brand: 'Fashion Forward',
    price: 89.99,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
    category: 'Vestidos',
    colors: ['bg-fashion-rose', 'bg-fashion-sage', 'bg-primary'],
    sizes: ['XS', 'S', 'M', 'L'],
    isNew: true,
    hasDiscount: false,
    aiTryOn: true
  },
  {
    id: 3,
    name: 'Jeans Skinny Fit',
    brand: 'Urban Style',
    price: 69.99,
    originalPrice: 89.99,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop',
    category: 'Pantalones',
    colors: ['bg-primary', 'bg-gray-600', 'bg-gray-400'],
    sizes: ['26', '28', '30', '32', '34'],
    isNew: false,
    hasDiscount: true,
    aiTryOn: true
  },
  {
    id: 4,
    name: 'Chaqueta de Cuero',
    brand: 'Luxury Line',
    price: 199.99,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
    category: 'Chaquetas',
    colors: ['bg-gray-900', 'bg-gray-700'],
    sizes: ['S', 'M', 'L', 'XL'],
    isNew: false,
    hasDiscount: false,
    aiTryOn: true
  },
  {
    id: 5,
    name: 'Blusa Floral Primavera',
    brand: 'Garden Collection',
    price: 45.99,
    originalPrice: 59.99,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop',
    category: 'Blusas',
    colors: ['bg-fashion-rose', 'bg-fashion-cream', 'bg-fashion-sage'],
    sizes: ['XS', 'S', 'M', 'L'],
    isNew: true,
    hasDiscount: true,
    aiTryOn: true
  },
  {
    id: 6,
    name: 'Hoodie Oversized',
    brand: 'Comfort Zone',
    price: 79.99,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop',
    category: 'Sudaderas',
    colors: ['bg-gray-600', 'bg-primary', 'bg-accent'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    isNew: false,
    hasDiscount: false,
    aiTryOn: true
  }
];

interface ProductGridProps {
  searchQuery?: string;
}

const ProductGrid = ({ searchQuery = '' }: ProductGridProps) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Get unique categories from products
  const categories = useMemo(() => {
    return [...new Set(products.map(product => product.category))];
  }, []);

  // Filter products based on category and search
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(product => product.category === activeCategory);
    }

    // Filter by search query (use external searchQuery or local one)
    const query = searchQuery || localSearchQuery;
    if (query) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );
    }

    return filtered;
  }, [activeCategory, searchQuery, localSearchQuery]);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {activeCategory === 'all' ? 'Productos Destacados' : activeCategory}
          </h2>
          <p className="text-lg text-muted-foreground">
            Descubre las últimas tendencias con probador virtual incluido
          </p>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden mb-6">
          <SearchBar onSearch={setLocalSearchQuery} />
        </div>

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-lg text-muted-foreground">
              No se encontraron productos
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setActiveCategory('all');
                setLocalSearchQuery('');
              }}
              className="mt-4"
            >
              Ver todos los productos
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden border-0 card-fashion">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.isNew && (
                    <Badge className="bg-accent text-accent-foreground">Nuevo</Badge>
                  )}
                  {product.hasDiscount && (
                    <Badge variant="destructive">-25%</Badge>
                  )}
                  {product.aiTryOn && (
                    <Badge className="bg-primary text-primary-foreground">
                      <Camera className="h-3 w-3 mr-1" />
                      IA
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="h-8 w-8">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>

                {/* AI Try-On Overlay */}
                <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="fashion" size="lg">
                    <Camera className="h-5 w-5 mr-2" />
                    Probar con IA
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">{product.brand}</p>
                  <h3 className="font-semibold text-lg group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>
                </div>

                {/* Colors */}
                <div className="flex gap-2">
                  {product.colors.map((color, index) => (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded-full border-2 border-background shadow-sm ${color}`}
                    />
                  ))}
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                  <Button size="icon" variant="accent">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Ver Todos los Productos
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;