import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, ShoppingBag, Camera, Star, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiService, Product } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import productPlaceholder from '@/assets/product-placeholder.jpg';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await apiService.getProduct(id);
        
        if (response.error) {
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          });
          navigate('/productos');
          return;
        }
        
        if (response.data) {
          setProduct(response.data);
          // Set default values
          if (response.data.sizes.length > 0) {
            setSelectedSize(response.data.sizes[0]);
          }
          if (response.data.color) {
            setSelectedColor(response.data.color);
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar el producto",
          variant: "destructive",
        });
        navigate('/productos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, toast]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Selecciona una talla",
        description: "Por favor, elige una talla antes de agregar al carrito",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Agregado al carrito",
      description: `${product?.name} (${selectedSize}) agregado al carrito`,
    });
  };

  const handleVirtualTryOn = () => {
    if (!product) return;
    
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
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: `Mira este producto: ${product?.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Enlace copiado",
        description: "El enlace del producto se ha copiado al portapapeles",
      });
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Eliminado de favoritos" : "Agregado a favoritos",
      description: isFavorite ? "El producto se eliminó de tus favoritos" : "El producto se agregó a tus favoritos",
    });
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="grid grid-cols-4 gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="aspect-square bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
                  <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  if (!product) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto text-center">
              <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
              <p className="text-muted-foreground mb-6">
                El producto que buscas no existe o ha sido eliminado.
              </p>
              <Button onClick={() => navigate('/productos')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a productos
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" size="sm" onClick={() => navigate('/productos')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a productos
              </Button>
              <span className="text-muted-foreground">/</span>
              <Link to="/productos" className="text-muted-foreground hover:text-foreground">
                Productos
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium">{product.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src={product.images[selectedImageIndex] ''}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src '';
                    }}
                  />
                </div>
                
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 ${
                          selectedImageIndex === index 
                            ? 'border-primary' 
                            : 'border-transparent hover:border-muted-foreground'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src '';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {product.brand && (
                      <Badge variant="outline">{product.brand}</Badge>
                    )}
                    <Badge className="bg-primary text-primary-foreground">
                      <Camera className="h-3 w-3 mr-1" />
                      IA
                    </Badge>
                    {product.stockQuantity > 0 ? (
                      <Badge className="bg-green-100 text-green-800">Disponible</Badge>
                    ) : (
                      <Badge variant="destructive">Agotado</Badge>
                    )}
                  </div>
                  
                  <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-sm text-muted-foreground ml-2">(4.8)</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product.stockQuantity} unidades disponibles
                    </span>
                  </div>
                  
                  <p className="text-3xl font-bold text-primary">
                    ${product.price.toLocaleString()}
                  </p>
                </div>

                {product.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Descripción</h3>
                    <p className="text-muted-foreground">{product.description}</p>
                  </div>
                )}

                {/* Size Selection */}
                {product.sizes.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Talla</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <Button
                          key={size}
                          variant={selectedSize === size ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedSize(size)}
                          className="min-w-[60px]"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {product.color && (
                  <div>
                    <h3 className="font-semibold mb-3">Color</h3>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: product.color.toLowerCase() }}
                      ></div>
                      <span className="capitalize">{product.color}</span>
                    </div>
                  </div>
                )}

                {/* Quantity Selection */}
                <div>
                  <h3 className="font-semibold mb-3">Cantidad</h3>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                      disabled={quantity >= product.stockQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1" 
                      onClick={handleAddToCart}
                      disabled={product.stockQuantity === 0 || !selectedSize}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      {product.stockQuantity > 0 ? 'Agregar al carrito' : 'Agotado'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleFavorite}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    onClick={handleVirtualTryOn}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Probar con IA
                  </Button>
                </div>

                {/* Product Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Detalles del producto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Género:</span>
                      <span className="capitalize">{product.gender}</span>
                    </div>
                    {product.category && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Categoría:</span>
                        <span>{product.category.name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stock:</span>
                      <span>{product.stockQuantity} unidades</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Disponibilidad:</span>
                      <span className={product.isActive ? 'text-green-600' : 'text-red-600'}>
                        {product.isActive ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default ProductDetail;

