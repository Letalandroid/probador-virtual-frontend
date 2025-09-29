import React, { useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Upload, Camera, Download, RotateCcw, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';

interface LocationState {
  product?: {
    id: string;
    name: string;
    images: string[];
    brand?: string;
    price: number;
  };
}

const VirtualTryOn = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const { product } = (location.state as LocationState) || {};
  
  const [userImage, setUserImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [torsoAnalysis, setTorsoAnalysis] = useState<any>(null);
  const [fitAnalysis, setFitAnalysis] = useState<any>(null);
  const [multipleAngles, setMultipleAngles] = useState<any>(null);
  const [currentAngle, setCurrentAngle] = useState<string>('front');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect if no product is provided
  if (!product) {
    return <Navigate to="/productos" replace />;
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "La imagen no debe superar los 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUserImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processVirtualTryOn = async () => {
    if (!userImage || !product) return;

    setIsProcessing(true);
    
    try {
      // Create a session record
      const { data: session, error: sessionError } = await supabase
        .from('virtual_try_on_sessions')
        .insert([
          {
            user_id: user.id,
            product_id: product.id,
            user_image_url: userImage,
            session_data: {
              product_name: product.name,
              product_brand: product.brand,
              timestamp: new Date().toISOString(),
            }
          }
        ])
        .select()
        .single();

      if (sessionError) {
        throw sessionError;
      }

      setSessionId(session.id);

      // Simulate AI processing (in real implementation, this would call an AI service)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // For demo purposes, we'll just use a placeholder result
      // In a real implementation, this would be the processed image from AI
      setResultImage(userImage); // Placeholder - would be the AI-processed result
      
      // Update session with result
      const currentSessionData = (session.session_data as any) || {};
      await supabase
        .from('virtual_try_on_sessions')
        .update({
          result_image_url: userImage, // Would be the actual AI result
          session_data: {
            ...currentSessionData,
            processed_at: new Date().toISOString(),
            status: 'completed'
          }
        })
        .eq('id', session.id);

      // Record product view for analytics
      await supabase
        .from('product_views')
        .insert([
          {
            product_id: product.id,
            user_id: user.id,
            view_type: 'virtual_try_on'
          }
        ]);

      toast({
        title: "¡Probador completado!",
        description: "Tu imagen ha sido procesada exitosamente",
      });

    } catch (error: any) {
      console.error('Error processing virtual try-on:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la imagen. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetSession = () => {
    setUserImage(null);
    setResultImage(null);
    setSessionId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadResult = () => {
    if (!resultImage) return;

    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `virtual-try-on-${product.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Probador Virtual</h1>
              <p className="text-muted-foreground">
                Pruébate {product.name} virtualmente usando inteligencia artificial
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Producto Seleccionado</CardTitle>
                  <CardDescription>
                    Información del producto que vas a probar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {product.images && product.images.length > 0 && (
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      {product.brand && (
                        <p className="text-muted-foreground">{product.brand}</p>
                      )}
                      <p className="text-xl font-bold text-primary">
                        ${product.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Virtual Try-On Interface */}
              <Card>
                <CardHeader>
                  <CardTitle>Probador Virtual</CardTitle>
                  <CardDescription>
                    Sube tu foto para ver cómo te queda el producto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!userImage ? (
                    <div className="space-y-4">
                      <div 
                        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="font-semibold mb-2">Sube tu foto</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Arrastra y suelta tu imagen aquí o haz clic para seleccionar
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Formatos: JPG, PNG, WEBP (máx. 5MB)
                        </p>
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                        variant="outline"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Seleccionar Imagen
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {!resultImage ? (
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                          <img 
                            src={userImage} 
                            alt="Tu foto"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Original</p>
                            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                              <img 
                                src={userImage} 
                                alt="Original"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Con el producto</p>
                            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                              <img 
                                src={resultImage} 
                                alt="Resultado"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        {!resultImage ? (
                          <>
                            <Button 
                              onClick={processVirtualTryOn}
                              disabled={isProcessing}
                              className="flex-1"
                            >
                              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              {isProcessing ? 'Procesando...' : 'Probar Producto'}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={resetSession}
                              disabled={isProcessing}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              onClick={downloadResult}
                              className="flex-1"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Descargar
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={resetSession}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                      
                      {isProcessing && (
                        <div className="text-center text-sm text-muted-foreground">
                          <p>Procesando tu imagen con IA...</p>
                          <p>Esto puede tomar unos segundos</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Instructions */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Consejos para mejores resultados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Camera className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Buena iluminación</h3>
                    <p className="text-sm text-muted-foreground">
                      Usa luz natural o buena iluminación artificial
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Foto de cuerpo completo</h3>
                    <p className="text-sm text-muted-foreground">
                      Incluye tu torso completo para mejores resultados
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <RotateCcw className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Fondo simple</h3>
                    <p className="text-sm text-muted-foreground">
                      Usa un fondo liso y de color sólido
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default VirtualTryOn;