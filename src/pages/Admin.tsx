import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit2, Trash2, Loader2, Package, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';

const productSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  price: z.number().min(0, 'El precio debe ser mayor a 0'),
  category_id: z.string().min(1, 'Selecciona una categoría'),
  brand: z.string().optional(),
  color: z.string().optional(),
  sizes: z.string().optional(),
  stock_quantity: z.number().min(0, 'El stock debe ser mayor o igual a 0'),
  gender: z.enum(['men', 'women', 'kids', 'unisex']),
});

type ProductForm = z.infer<typeof productSchema>;

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  brand?: string;
  color?: string;
  sizes: string[];
  stock_quantity: number;
  is_active: boolean;
  gender: string;
  created_at: string;
  categories?: { name: string };
}

interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category_id: '',
      brand: '',
      color: '',
      sizes: '',
      stock_quantity: 0,
      gender: 'unisex',
    },
  });

  // Redirect if not authenticated or not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([fetchProducts(), fetchCategories()]);
    setIsLoading(false);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } else {
      setProducts(data || []);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      });
    } else {
      setCategories(data || []);
    }
  };

  const onSubmit = async (data: ProductForm) => {
    setIsSubmitting(true);

    try {
      const productData = {
        ...data,
        sizes: data.sizes ? data.sizes.split(',').map(s => s.trim()) : [],
        created_by: user?.id,
      };

      let result;
      if (editingProduct) {
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
      } else {
        result = await supabase
          .from('products')
          .insert([productData]);
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Éxito",
        description: `Producto ${editingProduct ? 'actualizado' : 'creado'} exitosamente`,
      });

      form.reset();
      setEditingProduct(null);
      setIsDialogOpen(false);
      await fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category_id: product.category_id,
      brand: product.brand || '',
      color: product.color || '',
      sizes: product.sizes.join(', '),
      stock_quantity: product.stock_quantity,
      gender: product.gender as any,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', productId);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Éxito",
        description: "Producto eliminado exitosamente",
      });
      await fetchProducts();
    }
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    form.reset();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Panel de Administración</h1>
              <p className="text-muted-foreground">
                Gestiona productos, categorías y usuarios de la tienda
              </p>
            </div>

            <Tabs defaultValue="products" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Productos
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Usuarios
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Reportes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="products">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Gestión de Productos</CardTitle>
                      <CardDescription>
                        Administra el catálogo de productos de la tienda
                      </CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={handleNewProduct}>
                          <Plus className="h-4 w-4 mr-2" />
                          Nuevo Producto
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {editingProduct ? 'Editar' : 'Crear'} Producto
                          </DialogTitle>
                          <DialogDescription>
                            {editingProduct 
                              ? 'Modifica la información del producto'
                              : 'Completa la información para crear un nuevo producto'
                            }
                          </DialogDescription>
                        </DialogHeader>

                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nombre *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Nombre del producto" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Precio *</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        placeholder="0.00" 
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="category_id"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Categoría *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecciona una categoría" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {categories.map((category) => (
                                          <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Género *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecciona el género" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="women">Mujeres</SelectItem>
                                        <SelectItem value="men">Hombres</SelectItem>
                                        <SelectItem value="kids">Niños</SelectItem>
                                        <SelectItem value="unisex">Unisex</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="brand"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Marca</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Marca del producto" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Color del producto" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="sizes"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tallas</FormLabel>
                                    <FormControl>
                                      <Input placeholder="S, M, L, XL" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="stock_quantity"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Stock *</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        placeholder="0" 
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Descripción</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Descripción del producto"
                                      className="min-h-[100px]"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-end gap-2">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsDialogOpen(false)}
                              >
                                Cancelar
                              </Button>
                              <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingProduct ? 'Actualizar' : 'Crear'}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {products.length === 0 ? (
                        <div className="text-center py-8">
                          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No hay productos</h3>
                          <p className="text-muted-foreground">
                            Crea tu primer producto para comenzar
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {products.map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold">{product.name}</h4>
                                  <Badge variant={product.is_active ? "default" : "secondary"}>
                                    {product.is_active ? 'Activo' : 'Inactivo'}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <p>Categoría: {product.categories?.name}</p>
                                  <p>Precio: ${product.price.toLocaleString()}</p>
                                  <p>Stock: {product.stock_quantity} unidades</p>
                                  {product.brand && <p>Marca: {product.brand}</p>}
                                  {product.color && <p>Color: {product.color}</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(product)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>Gestión de Usuarios</CardTitle>
                    <CardDescription>
                      Administra los usuarios registrados en la plataforma
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Próximamente</h3>
                      <p className="text-muted-foreground">
                        La gestión de usuarios estará disponible pronto
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports">
                <Card>
                  <CardHeader>
                    <CardTitle>Reportes y Estadísticas</CardTitle>
                    <CardDescription>
                      Visualiza estadísticas de productos y ventas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Próximamente</h3>
                      <p className="text-muted-foreground">
                        Los reportes estarán disponibles pronto
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Admin;