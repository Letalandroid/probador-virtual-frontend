import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye, ShoppingBag, Camera } from 'lucide-react';
import CategoryFilter from './CategoryFilter';
import SearchBar from './SearchBar';
import { useProducts } from '@/hooks/useProducts';
import ProductPreview from './ProductPreview';
// import productPlaceholder from '@/assets/product-placeholder.jpg';
const productPlaceholder = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
import { Product } from '@/lib/api';

interface ProductGridProps {
  searchQuery?: string;
  genderFilter?: string;
}

const ProductGrid = ({ searchQuery = '', genderFilter = 'all' }: ProductGridProps) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { products, isLoading, error, trackProductView, getProductsByGender, getProductsByCategory, searchProducts } = useProducts();

  // Get unique categories from products based on current gender filter
  const categories = useMemo(() => {
    let productsToFilter = products;
    
    if (genderFilter !== 'all') {
      productsToFilter = getProductsByGender(genderFilter);
    }
    
    // Ensure productsToFilter is always an array
    if (!Array.isArray(productsToFilter)) {
      console.warn('productsToFilter is not an array:', productsToFilter);
      return [];
    }
    
    return [...new Set(productsToFilter.map(product => product.category?.name || 'Sin categoría'))];
  }, [products, genderFilter, getProductsByGender]);

  // Filter products based on gender, category and search
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Ensure products is an array
    if (!Array.isArray(filtered)) {
      console.warn('products is not an array:', filtered);
      return [];
    }

    // Filter by gender first
    if (genderFilter !== 'all') {
      filtered = getProductsByGender(genderFilter);
    }

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(product => product.category?.name === activeCategory);
    }

    // Filter by search query (use external searchQuery or local one)
    const query = searchQuery || localSearchQuery;
    if (query) {
      filtered = searchProducts(query);
    }

    return filtered;
  }, [products, activeCategory, searchQuery, localSearchQuery, genderFilter, getProductsByGender, searchProducts]);

  // Reset category when gender filter changes
  React.useEffect(() => {
    setActiveCategory('all');
  }, [genderFilter]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsPreviewOpen(true);
    trackProductView(product.id);
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {genderFilter === 'women' ? 'Mujeres' : 
             genderFilter === 'men' ? 'Hombres' :
             genderFilter !== 'all' ? genderFilter : 
             (activeCategory === 'all' ? 'Productos Destacados' : activeCategory)}
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
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-lg text-muted-foreground">
              Cargando productos...
            </p>
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <p className="text-lg text-destructive">
              Error: {error}
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
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
            <Card key={product.id} className="group overflow-hidden border-0 card-fashion cursor-pointer" onClick={() => navigate(`/productos/${product.id}`)}>
              <div className="relative">
                <img
                  src={product.images && product.images.length > 0 ? product.images[0] : productPlaceholder}
                  alt={product.name}
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    trackProductView(product.id);
                    navigate(`/productos/${product.id}`);
                  }}
                  onError={(e) => {
                    console.log('Image failed to load for product:', product.name, 'URL:', e.currentTarget.src);
                    e.currentTarget.src = productPlaceholder;
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully for product:', product.name);
                  }}
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.stockQuantity > 0 ? (
                    <Badge className="bg-accent text-accent-foreground">Disponible</Badge>
                  ) : (
                    <Badge variant="destructive">Agotado</Badge>
                  )}
                  <Badge className="bg-primary text-primary-foreground">
                    <Camera className="h-3 w-3 mr-1" />
                    IA
                  </Badge>
                </div>

                {/* Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle favorite
                    }}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-8 w-8" 
                    onClick={(e) => {
                      e.stopPropagation();
                      trackProductView(product.id);
                      navigate(`/productos/${product.id}`);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>

                {/* AI Try-On Overlay */}
                <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    variant="fashion" 
                    size="lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/probador-virtual', {
                        state: {
                          product: {
                            id: product.id,
                            name: product.name,
                            images: product.images,
                            brand: product.brand,
                            price: product.price,
                          }
                        }
                      });
                    }}
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Probar con IA
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">{product.brand || 'Marca'}</p>
                  <h3 className="font-semibold text-lg group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>
                </div>

                {/* Color indicator */}
                {product.color && (
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-muted-foreground">Color:</span>
                    <span className="text-sm font-medium">{product.color}</span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">${product.price}</span>
                </div>

                {/* Stock */}
                <div className="text-sm text-muted-foreground">
                  Stock: {product.stockQuantity} unidades
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    disabled={product.stockQuantity === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle add to cart
                    }}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    {product.stockQuantity > 0 ? 'Agregar' : 'Agotado'}
                  </Button>
                  <Button 
                    size="icon" 
                    variant="accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/probador-virtual', {
                        state: {
                          product: {
                            id: product.id,
                            name: product.name,
                            images: product.images,
                            brand: product.brand,
                            price: product.price,
                          }
                        }
                      });
                    }}
                  >
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

        {/* Product Preview Modal */}
        <ProductPreview
          product={selectedProduct}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      </div>
    </section>
  );
};

export default ProductGrid;