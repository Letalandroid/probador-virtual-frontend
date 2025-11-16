import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Zap,
  BarChart3,
  UserX,
  Download,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { apiService } from '@/lib/api';

interface ProductStats {
  id: string;
  name: string;
  brand: string;
  price: number;
  gender: string;
  category_name?: string;
  total_views: number;
  try_on_sessions: number;
}

interface OrderStats {
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  orders_this_month: number;
  revenue_this_month: number;
}

const Reports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [productStats, setProductStats] = useState<ProductStats[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats>({
    total_orders: 0,
    total_revenue: 0,
    avg_order_value: 0,
    orders_this_month: 0,
    revenue_this_month: 0
  });
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    if (user?.role !== 'admin') {
      return;
    }
    fetchReports();
  }, [user?.role, timeFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchProductStats(),
        fetchOrderStats()
      ]);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Error al cargar los reportes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProductStats = async () => {
    try {
      // Get most viewed products
      const { data: viewsData, error: viewsError } = await supabase
        .from('product_views')
        .select(`
          product_id,
          products!inner (
            id,
            name,
            brand,
            price,
            gender,
            categories (name)
          )
        `)
        .limit(1000);

      if (viewsError) throw viewsError;

      // Get virtual try-on sessions
      const { data: tryOnData, error: tryOnError } = await supabase
        .from('virtual_try_on_sessions')
        .select('product_id')
        .limit(1000);

      if (tryOnError) throw tryOnError;

      // Aggregate the data
      const productViewCounts: { [key: string]: number } = {};
      const productTryOnCounts: { [key: string]: number } = {};
      const productDetails: { [key: string]: any } = {};

      viewsData?.forEach(view => {
        const productId = view.product_id;
        productViewCounts[productId] = (productViewCounts[productId] || 0) + 1;
        if (view.products) {
          productDetails[productId] = view.products;
        }
      });

      tryOnData?.forEach(session => {
        const productId = session.product_id;
        productTryOnCounts[productId] = (productTryOnCounts[productId] || 0) + 1;
      });

      // Combine data and create stats
      const stats: ProductStats[] = Object.keys(productDetails).map(productId => ({
        id: productId,
        name: productDetails[productId].name,
        brand: productDetails[productId].brand,
        price: productDetails[productId].price,
        gender: productDetails[productId].gender,
        category_name: productDetails[productId].categories?.name,
        total_views: productViewCounts[productId] || 0,
        try_on_sessions: productTryOnCounts[productId] || 0
      }));

      // Sort by total views
      stats.sort((a, b) => b.total_views - a.total_views);

      setProductStats(stats.slice(0, 20)); // Top 20 products
    } catch (error) {
      console.error('Error fetching product stats:', error);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount, created_at, status');

      if (error) throw error;

      if (orders) {
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // This month stats
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const thisMonthOrders = orders.filter(order => 
          new Date(order.created_at) >= thisMonth
        );
        const ordersThisMonth = thisMonthOrders.length;
        const revenueThisMonth = thisMonthOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);

        setOrderStats({
          total_orders: totalOrders,
          total_revenue: totalRevenue,
          avg_order_value: avgOrderValue,
          orders_this_month: ordersThisMonth,
          revenue_this_month: revenueThisMonth
        });
      }
    } catch (error) {
      console.error('Error fetching order stats:', error);
    }
  };

  const handleDownloadReport = async (reportType: 'product-views' | 'virtual-try-on' | 'product-movements', format: 'pdf' | 'csv') => {
    try {
      setDownloading(`${reportType}-${format}`);
      await apiService.downloadReport(reportType, format);
      toast({
        title: "Éxito",
        description: `Reporte ${format.toUpperCase()} descargado exitosamente`,
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

  if (user?.role !== 'admin') {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center">
                <UserX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
                <p className="text-muted-foreground">
                  Solo los administradores pueden acceder a los reportes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gradient mb-2">
              Reportes y Estadísticas
            </h1>
            <p className="text-muted-foreground">
              Análisis de rendimiento y métricas del negocio
            </p>
          </div>

          {/* Time Filter */}
          <div className="mb-6">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el tiempo</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sales Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <ShoppingCart className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Órdenes</p>
                    <p className="text-2xl font-bold">{orderStats.total_orders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-accent" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                    <p className="text-2xl font-bold">${orderStats.total_revenue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-fashion-sage" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Valor Promedio Orden</p>
                    <p className="text-2xl font-bold">${orderStats.avg_order_value.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Zap className="h-8 w-8 text-fashion-rose" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Órdenes Este Mes</p>
                    <p className="text-2xl font-bold">{orderStats.orders_this_month}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reporte de Movimientos */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Movimientos de Productos
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadReport('product-movements', 'pdf')}
                    disabled={downloading === 'product-movements-pdf'}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadReport('product-movements', 'csv')}
                    disabled={downloading === 'product-movements-csv'}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Descarga el reporte completo de movimientos de productos incluyendo actualizaciones de stock, 
                últimas visualizaciones y pruebas virtuales.
              </p>
            </CardContent>
          </Card>

          {/* Product Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Productos Más Vistos
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadReport('product-views', 'pdf')}
                      disabled={downloading === 'product-views-pdf'}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadReport('product-views', 'csv')}
                      disabled={downloading === 'product-views-csv'}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Cargando estadísticas...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Visualizaciones</TableHead>
                        <TableHead>Pruebas Virtuales</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productStats.slice(0, 10).map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{product.brand}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {product.category_name || 'Sin categoría'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {product.total_views}
                          </TableCell>
                          <TableCell className="font-medium">
                            {product.try_on_sessions}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Productos Más Probados Virtualmente
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadReport('virtual-try-on', 'pdf')}
                      disabled={downloading === 'virtual-try-on-pdf'}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadReport('virtual-try-on', 'csv')}
                      disabled={downloading === 'virtual-try-on-csv'}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Cargando estadísticas...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Género</TableHead>
                        <TableHead>Pruebas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productStats
                        .sort((a, b) => b.try_on_sessions - a.try_on_sessions)
                        .slice(0, 10)
                        .map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{product.brand}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${product.price}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {product.gender}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {product.try_on_sessions}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Reports;