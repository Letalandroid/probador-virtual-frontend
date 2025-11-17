import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit2, Trash2, Loader2, Package, Users, BarChart3, UserCheck, UserX, Shield, Mail, Calendar, Download, FileText, TrendingUp, ShoppingCart, Zap } from 'lucide-react';
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
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import ServiceStatus from '@/components/ServiceStatus';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'El precio debe ser mayor a 0').multipleOf(0.01, 'El precio debe tener máximo 2 decimales'),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  brand: z.string().optional(),
  color: z.string().optional(),
  sizes: z.string().optional(),
  stockQuantity: z.coerce.number().min(0, 'El stock debe ser mayor o igual a 0').int('El stock debe ser un número entero'),
  gender: z.enum(['men', 'women', 'unisex']), // No se incluye 'kids' según RF02
});

type ProductForm = z.infer<typeof productSchema>;

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  brand?: string;
  color?: string;
  sizes: string[];
  stockQuantity: number;
  isActive: boolean;
  gender: string;
  createdAt: string;
  category?: { name: string };
}

interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'client';
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
  is_active?: boolean;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  clientUsers: number;
  newUsersThisMonth: number;
}

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  totalCategories: number;
}

const Admin = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      brand: '',
      color: '',
      sizes: '',
      stockQuantity: 0,
      gender: 'unisex',
    },
  });

  const fetchProducts = useCallback(async () => {
    const response = await apiService.getProducts();

    if (response.error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } else {
      // Mapear productos del backend (category_id, stock_quantity) al formato del frontend (categoryId, stockQuantity)
      const productList = (response.data?.products || []).map((product: any) => ({
        ...product,
        categoryId: product.category_id || product.categoryId,
        stockQuantity: product.stock_quantity ?? product.stockQuantity ?? 0,
        isActive: product.is_active ?? product.isActive ?? true,
        createdAt: product.created_at || product.createdAt,
        updatedAt: product.updated_at || product.updatedAt,
      }));
      setProducts(productList);
      // Calculate product stats
      const stats = {
        totalProducts: productList.length,
        activeProducts: productList.filter(product => product.isActive).length,
        lowStockProducts: productList.filter(product => product.stockQuantity < 10).length,
        totalCategories: categories.length,
      };
      setProductStats(stats);
    }
  }, [toast, categories.length]);

  const fetchCategories = useCallback(async () => {
    const response = await apiService.getCategories();

    if (response.error) {
      console.error('Error cargando categorías:', response.error);
      toast({
        title: "Error",
        description: response.error || "No se pudieron cargar las categorías",
        variant: "destructive",
      });
      setCategories([]);
    } else {
      // Mapear categorías del backend (is_active) al formato del frontend (isActive)
      const categoryList = (response.data || []).map((cat: any) => ({
        ...cat,
        isActive: cat.is_active !== undefined ? cat.is_active : true,
        createdAt: cat.created_at || cat.createdAt,
        updatedAt: cat.updated_at || cat.updatedAt,
      }));
      // Filter active categories
      const activeCategories = categoryList.filter(cat => cat.isActive);
      setCategories(activeCategories);
      
      if (activeCategories.length === 0) {
        console.warn('No hay categorías activas en la base de datos');
      }
    }
  }, [toast]);

  const fetchUsers = useCallback(async () => {
    const response = await apiService.getUsers();

    if (response.error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } else {
      // Mapear usuarios del backend (created_at) al formato del frontend (createdAt)
      const userList = (response.data || []).map((user: any) => ({
        ...user,
        createdAt: user.created_at || user.createdAt || new Date().toISOString(),
        updatedAt: user.updated_at || user.updatedAt || new Date().toISOString(),
        is_active: user.is_active !== undefined ? user.is_active : true,
        role: user.role || (user.roles && user.roles[0]?.role) || 'client',
      }));
      setUsers(userList);
      // Calculate user stats usando los datos mapeados
      const stats = calculateUserStats(userList);
      setUserStats(stats);
    }
  }, [toast]);

  const calculateUserStats = (userList: User[]): UserStats => {
    const totalUsers = userList.length;
    const activeUsers = userList.filter(user => user.is_active !== false).length;
    const adminUsers = userList.filter(user => user.role === 'admin').length;
    const clientUsers = userList.filter(user => user.role === 'client').length;
    
    // Calculate new users this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newUsersThisMonth = userList.filter(user => {
      const userDate = new Date(user.createdAt);
      return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
    }).length;

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      clientUsers,
      newUsersThisMonth,
    };
  };


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchProducts(), fetchCategories(), fetchUsers()]);
    setIsLoading(false);
  }, [fetchProducts, fetchCategories, fetchUsers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Asegurar que las categorías se carguen antes de abrir el formulario
  useEffect(() => {
    if (isDialogOpen && categories.length === 0) {
      fetchCategories();
    }
  }, [isDialogOpen, categories.length, fetchCategories]);


  const onSubmit = async (data: ProductForm) => {
    setIsSubmitting(true);

    try {
      // Mapear los campos del frontend a los que espera el backend
      const productData = {
        name: data.name,
        description: data.description || undefined,
        price: Number(data.price.toFixed(2)), // Asegurar 2 decimales
        category_id: data.categoryId, // Backend espera category_id
        brand: data.brand || undefined,
        color: data.color || undefined,
        sizes: data.sizes ? data.sizes.split(',').map(s => s.trim()).filter(s => s.length > 0) : [],
        stock_quantity: Number(data.stockQuantity), // Backend espera stock_quantity
        gender: data.gender,
        is_active: true,
        images: productImages, // Usar las imágenes subidas
      };

      let response;
      if (editingProduct) {
        response = await apiService.updateProduct(editingProduct.id, productData);
      } else {
        response = await apiService.createProduct(productData);
      }

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Éxito",
        description: `Producto ${editingProduct ? 'actualizado' : 'creado'} exitosamente`,
      });

      form.reset();
      setEditingProduct(null);
      setProductImages([]);
      setIsDialogOpen(false);
      await fetchProducts();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    // Asegurar que categoryId existe y es válido
    const categoryId = product.categoryId || (product as any).category_id || '';
    const images = (product.images && Array.isArray(product.images)) ? product.images : [];
    form.reset({
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      categoryId: categoryId,
      brand: product.brand || '',
      color: product.color || '',
      sizes: (product.sizes && Array.isArray(product.sizes)) ? product.sizes.join(', ') : '',
      stockQuantity: product.stockQuantity || (product as any).stock_quantity || 0,
      gender: (product.gender && ['men', 'women', 'unisex'].includes(product.gender)) 
        ? product.gender as 'men' | 'women' | 'unisex' 
        : 'unisex', // No se incluye 'kids' según RF02
    });
    setProductImages(images);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `prendas/${fileName}`;

        const { data, error } = await supabase.storage
          .from('prendas')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('prendas')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setProductImages([...productImages, ...uploadedUrls]);
      toast({
        title: "Éxito",
        description: "Imágenes subidas correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al subir las imágenes",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const imageUrl = productImages[index];
    // Extraer el path del bucket desde la URL
    const urlParts = imageUrl.split('/prendas/');
    if (urlParts.length > 1) {
      const filePath = `prendas/${urlParts[1]}`;
      supabase.storage
        .from('prendas')
        .remove([filePath])
        .catch((error) => {
          console.error('Error al eliminar imagen:', error);
        });
    }
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    form.reset({
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      brand: '',
      color: '',
      sizes: '',
      stockQuantity: 0,
      gender: 'unisex',
    });
    setProductImages([]);
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    const response = await apiService.deleteProduct(productId);

    if (response.error) {
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

  const handleDownloadReport = async (reportType: 'sales' | 'top-selling' | 'sales-trends' | 'conversion-metrics', format: 'pdf' | 'csv') => {
    const key = `${reportType}-${format}`;
    setDownloading(key);
    try {
      await apiService.downloadReport(reportType, format);
      toast({
        title: "Éxito",
        description: `Reporte descargado exitosamente`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al descargar el reporte",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    const response = await apiService.deleteUser(userId);

    if (response.error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Éxito",
        description: "Usuario eliminado exitosamente",
      });
      await fetchUsers();
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: 'admin' | 'client') => {
    const response = await apiService.updateUserRole(userId, newRole);

    if (response.error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el rol del usuario",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Éxito",
        description: `Rol cambiado a ${newRole === 'admin' ? 'Administrador' : 'Cliente'}`,
      });
      await fetchUsers();
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    // This would need to be implemented in the API service
    // For now, we'll show a message that this feature is not yet implemented
    toast({
      title: "Información",
      description: "La funcionalidad de cambio de estado está en desarrollo",
    });
  };

  // Wait for auth to finish loading before checking
  if (authLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageTransition>
    );
  }

  // Redirect if not authenticated or not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/auth?from=/admin" replace />;
  }

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
              <TabsList className="grid w-full grid-cols-4">
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
                <TabsTrigger value="status" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Estado
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
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) {
                        setProductImages([]);
                        setEditingProduct(null);
                      }
                    }}>
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
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00" 
                                        {...field}
                                        value={field.value === 0 ? '' : field.value || ''}
                                        onChange={(e) => {
                                          const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                          field.onChange(isNaN(value) ? 0 : Number(value.toFixed(2)));
                                        }}
                                        onBlur={(e) => {
                                          const value = parseFloat(e.target.value);
                                          if (!isNaN(value)) {
                                            field.onChange(Number(value.toFixed(2)));
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Categoría *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecciona una categoría" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {categories.length === 0 ? (
                                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                            No hay categorías disponibles
                                          </div>
                                        ) : (
                                          categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                              {category.name}
                                            </SelectItem>
                                          ))
                                        )}
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
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecciona el género" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="women">Mujeres</SelectItem>
                                        <SelectItem value="men">Hombres</SelectItem>
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
                                name="stockQuantity"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Stock *</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="0"
                                        step="1"
                                        placeholder="0" 
                                        {...field}
                                        value={field.value === 0 ? '' : field.value || ''}
                                        onChange={(e) => {
                                          const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                                          field.onChange(isNaN(value) ? 0 : value);
                                        }}
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

                            <div className="space-y-2">
                              <FormLabel>Imágenes del Producto</FormLabel>
                              <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    disabled={uploadingImages}
                                    className="hidden"
                                    id="image-upload"
                                  />
                                  <label
                                    htmlFor="image-upload"
                                    className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
                                  >
                                    <Upload className="h-4 w-4" />
                                    {uploadingImages ? 'Subiendo...' : 'Subir Imágenes'}
                                  </label>
                                </div>
                                {productImages.length > 0 && (
                                  <div className="grid grid-cols-3 gap-4">
                                    {productImages.map((imageUrl, index) => (
                                      <div key={index} className="relative group">
                                        <img
                                          src={imageUrl}
                                          alt={`Imagen ${index + 1}`}
                                          className="w-full h-32 object-cover rounded-lg border"
                                        />
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="sm"
                                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={() => handleRemoveImage(index)}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

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
                                  <Badge variant={product.isActive ? "default" : "secondary"}>
                                    {product.isActive ? 'Activo' : 'Inactivo'}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <p>Categoría: {product.category?.name}</p>
                                  <p>Precio: ${product.price.toLocaleString()}</p>
                                  <p>Stock: {product.stockQuantity} unidades</p>
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
                    <div className="space-y-4">
                      {users.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No hay usuarios</h3>
                          <p className="text-muted-foreground">
                            No se encontraron usuarios registrados
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {users.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold">{user.full_name || 'Usuario sin nombre'}</h4>
                                  <Badge variant={user.is_active !== false ? "default" : "secondary"}>
                                    {user.is_active !== false ? 'Activo' : 'Inactivo'}
                                  </Badge>
                                  <Badge variant={user.role === 'admin' ? "destructive" : "outline"}>
                                    {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    <span>{user.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Registrado: {new Date(user.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  {user.phone && (
                                    <div className="flex items-center gap-2">
                                      <span>Teléfono: {user.phone}</span>
                                    </div>
                                  )}
                                  {user.city && (
                                    <div className="flex items-center gap-2">
                                      <span>Ciudad: {user.city}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleChangeUserRole(user.id, user.role === 'admin' ? 'client' : 'admin')}
                                >
                                  {user.role === 'admin' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
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

              <TabsContent value="reports">
                <div className="space-y-6">
                  {/* User Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Estadísticas de Usuarios
                      </CardTitle>
                      <CardDescription>
                        Resumen de usuarios registrados en la plataforma
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {userStats ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">Total Usuarios</span>
                            </div>
                            <p className="text-2xl font-bold">{userStats.totalUsers}</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <UserCheck className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">Usuarios Activos</span>
                            </div>
                            <p className="text-2xl font-bold">{userStats.activeUsers}</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="h-4 w-4 text-red-600" />
                              <span className="text-sm font-medium">Administradores</span>
                            </div>
                            <p className="text-2xl font-bold">{userStats.adminUsers}</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <UserX className="h-4 w-4 text-orange-600" />
                              <span className="text-sm font-medium">Clientes</span>
                            </div>
                            <p className="text-2xl font-bold">{userStats.clientUsers}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                          <p className="text-muted-foreground">Cargando estadísticas de usuarios...</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Product Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Estadísticas de Productos
                      </CardTitle>
                      <CardDescription>
                        Resumen del catálogo de productos
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {productStats ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">Total Productos</span>
                            </div>
                            <p className="text-2xl font-bold">{productStats.totalProducts}</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">Productos Activos</span>
                            </div>
                            <p className="text-2xl font-bold">{productStats.activeProducts}</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="h-4 w-4 text-orange-600" />
                              <span className="text-sm font-medium">Stock Bajo</span>
                            </div>
                            <p className="text-2xl font-bold">{productStats.lowStockProducts}</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-medium">Categorías</span>
                            </div>
                            <p className="text-2xl font-bold">{productStats.totalCategories}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                          <p className="text-muted-foreground">Cargando estadísticas de productos...</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Sales Analysis Reports */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <TrendingUp className="h-5 w-5" />
                              Análisis de Ventas
                            </CardTitle>
                            <CardDescription>
                              Reporte detallado de todas las ventas realizadas
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadReport('sales', 'pdf')}
                              disabled={downloading === 'sales-pdf'}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              PDF
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadReport('sales', 'csv')}
                              disabled={downloading === 'sales-csv'}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              CSV
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Incluye información completa de órdenes, clientes, montos y estados de pago.
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <ShoppingCart className="h-5 w-5" />
                              Productos Más Vendidos
                            </CardTitle>
                            <CardDescription>
                              Top productos con mayor volumen de ventas
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadReport('top-selling', 'pdf')}
                              disabled={downloading === 'top-selling-pdf'}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              PDF
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadReport('top-selling', 'csv')}
                              disabled={downloading === 'top-selling-csv'}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              CSV
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Productos ordenados por cantidad vendida e ingresos generados.
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <BarChart3 className="h-5 w-5" />
                              Tendencias de Ventas
                            </CardTitle>
                            <CardDescription>
                              Análisis mensual de ventas y tendencias
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadReport('sales-trends', 'pdf')}
                              disabled={downloading === 'sales-trends-pdf'}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              PDF
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadReport('sales-trends', 'csv')}
                              disabled={downloading === 'sales-trends-csv'}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              CSV
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Análisis de ventas por mes con ingresos, número de órdenes y valor promedio.
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Zap className="h-5 w-5" />
                              Métricas de Conversión
                            </CardTitle>
                            <CardDescription>
                              Análisis de conversión: vistas → pruebas → ventas
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadReport('conversion-metrics', 'pdf')}
                              disabled={downloading === 'conversion-metrics-pdf'}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              PDF
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadReport('conversion-metrics', 'csv')}
                              disabled={downloading === 'conversion-metrics-csv'}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              CSV
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Tasas de conversión desde visualizaciones hasta ventas finales por producto.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="status">
                <div className="space-y-6">
                  <ServiceStatus />
                </div>
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