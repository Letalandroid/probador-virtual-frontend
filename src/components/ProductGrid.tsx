import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye, ShoppingBag, Camera } from 'lucide-react';
import CategoryFilter from './CategoryFilter';
import SearchBar from './SearchBar';
import { mockProducts, getUniqueCategories, Product } from '@/data/mockProducts';

interface ProductGridProps {
  searchQuery?: string;
  genderFilter?: string;
}

const ProductGrid = ({ searchQuery = '', genderFilter = 'all' }: ProductGridProps) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Get unique categories from products based on current gender filter
  const categories = useMemo(() => {
    let productsToFilter = mockProducts;
    
    if (genderFilter !== 'all') {
      productsToFilter = mockProducts.filter(product => 
        product.gender === genderFilter || product.gender === 'Unisex'
      );
    }
    
    return [...new Set(productsToFilter.map(product => product.category))];
  }, [genderFilter]);

  // Filter products based on gender, category and search
  const filteredProducts = useMemo(() => {
    let filtered = mockProducts;

    // Filter by gender first
    if (genderFilter !== 'all') {
      if (genderFilter === 'Accesorios') {
        // Show accessories for all genders
        filtered = filtered.filter(product => 
          ['Bolsos', 'Relojes', 'Gafas', 'Joyas'].includes(product.category)
        );
      } else if (genderFilter === 'Ofertas') {
        // Show only products with discounts
        filtered = filtered.filter(product => product.hasDiscount);
      } else {
        filtered = filtered.filter(product => 
          product.gender === genderFilter || product.gender === 'Unisex'
        );
      }
    }

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
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        product.gender.toLowerCase().includes(query.toLowerCase())
      );
    }

    return filtered;
  }, [activeCategory, searchQuery, localSearchQuery, genderFilter]);

  // Reset category when gender filter changes
  React.useEffect(() => {
    setActiveCategory('all');
  }, [genderFilter]);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {genderFilter !== 'all' ? genderFilter : (activeCategory === 'all' ? 'Productos Destacados' : activeCategory)}
          </h2>
          <p className="text-lg text-muted-foreground">
            {genderFilter === 'Ofertas' ? 'Las mejores ofertas con descuentos especiales' :
             genderFilter === 'Accesorios' ? 'Complementa tu estilo con nuestros accesorios' :
             'Descubre las últimas tendencias con probador virtual incluido'}
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