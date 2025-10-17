import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/lib/api';
import { Camera, ShoppingBag, Heart, Star, Package, Palette, Ruler, Tag } from 'lucide-react';
// import productPlaceholder from '@/assets/product-placeholder.jpg';

interface ProductPreviewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductPreview = ({ product, isOpen, onClose }: ProductPreviewProps) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
          <DialogDescription>
            Vista previa del producto {product.name} - {product.brand || 'Marca no especificada'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Imagen del producto */}
          <div className="relative">
            <img
              src={product.images && product.images.length > 0 ? product.images[0] : ''}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.src = '';
              }}
            />
            
            {/* Badges sobre la imagen */}
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
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Precio y marca */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">{product.brand || 'Marca'}</p>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold">${product.price}</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-muted-foreground">4.5 (23 reseñas)</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Descripción */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Descripción
              </h3>
              <p className="text-muted-foreground">
                {product.description || 'Prenda de alta calidad con diseño moderno y materiales premium. Perfecta para cualquier ocasión, combina estilo y comodidad de manera excepcional.'}
              </p>
            </div>

            <Separator />

            {/* Detalles del producto */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Detalles del Producto
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* Color */}
                {product.color && (
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Color:</span>
                    <span className="font-medium">{product.color}</span>
                  </div>
                )}

                {/* Género */}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Género:</span>
                  <span className="font-medium capitalize">{product.gender || 'Unisex'}</span>
                </div>

                {/* Categoría */}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Categoría:</span>
                  <span className="font-medium">{product.category?.name || 'General'}</span>
                </div>

                {/* Stock */}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Stock:</span>
                  <span className="font-medium">{product.stockQuantity} unidades</span>
                </div>
              </div>

              {/* Tallas disponibles */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Tallas disponibles:</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((size, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Botones de acción */}
            <div className="space-y-3">
              {/* Probador Virtual - Deshabilitado */}
              <Button 
                size="lg" 
                className="w-full" 
                variant="fashion"
                disabled
              >
                <Camera className="h-5 w-5 mr-2" />
                Probar con IA (Próximamente)
              </Button>

              {/* Botones secundarios */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  disabled={product.stockQuantity === 0}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {product.stockQuantity > 0 ? 'Agregar al Carrito' : 'Agotado'}
                </Button>
                
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Información adicional */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Envío gratis en compras superiores a $150.000</p>
              <p>• Cambios y devoluciones en 30 días</p>
              <p>• Probador virtual con tecnología IA</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductPreview;