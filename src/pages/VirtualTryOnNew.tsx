import React, { useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Upload, Camera, Download, RotateCcw, Loader2, Sparkles, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [torsoAnalysis, setTorsoAnalysis] = useState<any>(null);
  const [fitAnalysis, setFitAnalysis] = useState<any>(null);
  const [multipleAngles, setMultipleAngles] = useState<any>(null);
  const [currentAngle, setCurrentAngle] = useState<string>('front');
  const [activeTab, setActiveTab] = useState('try-on');
  
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
      // Convertir imagen de usuario a base64
      const response = await fetch(userImage);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onload = async () => {
        const base64Image = reader.result as string;
        const base64Data = base64Image.split(',')[1];

        // Convertir imagen del producto a base64
        const productResponse = await fetch(product.images[0]);
        const productBlob = await productResponse.blob();
        const productReader = new FileReader();
        
        productReader.onload = async () => {
          const productBase64Image = productReader.result as string;
          const productBase64Data = productBase64Image.split(',')[1];

          try {
            // 1. Detectar torso
            toast({
              title: "Analizando...",
              description: "Detectando torso y analizando pose",
            });
            
            const torsoResponse = await apiService.detectTorso(base64Data);
            if (torsoResponse.data) {
              setTorsoAnalysis(torsoResponse.data.analysis);
            }

            // 2. Analizar ajuste de la prenda
            toast({
              title: "Analizando ajuste...",
              description: "Evaluando cómo quedaría la prenda",
            });
            
            const fitResponse = await apiService.analyzeClothingFit(base64Data, productBase64Data);
            if (fitResponse.data) {
              setFitAnalysis(fitResponse.data.analysis);
            }

            // 3. Generar try-on virtual
            toast({
              title: "Generando probador virtual...",
              description: "Creando imagen con la prenda superpuesta",
            });
            
            const tryOnResponse = await apiService.virtualTryOn(
              base64Data,
              productBase64Data,
              'shirt', // Tipo de prenda
              {
                fit: 'fitted',
                occasion: 'casual',
                mood: 'modern'
              }
            );

            if (tryOnResponse.data && tryOnResponse.data.generated_images.length > 0) {
              const resultImageData = tryOnResponse.data.generated_images[0].data;
              setResultImage(`data:${tryOnResponse.data.generated_images[0].mime_type};base64,${resultImageData}`);
              
              toast({
                title: "¡Listo!",
                description: "Tu probador virtual está listo. ¡Mira el resultado!",
              });
            }

            // 4. Generar múltiples ángulos
            toast({
              title: "Generando múltiples ángulos...",
              description: "Creando vistas desde diferentes perspectivas",
            });
            
            const anglesResponse = await apiService.generateMultipleAngles(
              base64Data,
              productBase64Data,
              ['front', 'side', 'back']
            );

            if (anglesResponse.data) {
              setMultipleAngles(anglesResponse.data.angles);
            }

            setActiveTab('results');

          } catch (error) {
            console.error('Error processing virtual try-on:', error);
            toast({
              title: "Error",
              description: "No se pudo procesar el probador virtual. Inténtalo de nuevo.",
              variant: "destructive",
            });
          }
        };

        productReader.readAsDataURL(productBlob);
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la imagen. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultImage) return;

    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `virtual-try-on-${product.name}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTryOn = () => {
    setUserImage(null);
    setResultImage(null);
    setTorsoAnalysis(null);
    setFitAnalysis(null);
    setMultipleAngles(null);
    setCurrentAngle('front');
    setActiveTab('try-on');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Camera className="h-8 w-8" />
                Probador Virtual con IA
              </h1>
              <p className="text-muted-foreground">
                Pruébate {product.name} virtualmente usando inteligencia artificial
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="try-on">Probar Ropa</TabsTrigger>
                <TabsTrigger value="results">Resultados</TabsTrigger>
                <TabsTrigger value="analysis">Análisis</TabsTrigger>
              </TabsList>

              <TabsContent value="try-on">
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

                  {/* Upload Interface */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Sube tu foto</CardTitle>
                      <CardDescription>
                        Sube una foto tuya para probar la prenda virtualmente
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!userImage ? (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground mb-4">
                            Haz clic para subir tu foto
                          </p>
                          <Button onClick={() => fileInputRef.current?.click()}>
                            Seleccionar Imagen
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                            <img 
                              src={userImage} 
                              alt="Tu foto"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => fileInputRef.current?.click()}
                              variant="outline"
                              className="flex-1"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Cambiar Foto
                            </Button>
                            <Button 
                              onClick={processVirtualTryOn}
                              disabled={isProcessing}
                              className="flex-1"
                            >
                              {isProcessing ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Camera className="h-4 w-4 mr-2" />
                              )}
                              {isProcessing ? 'Procesando...' : 'Probar con IA'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="results">
                <div className="space-y-6">
                  {resultImage && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Resultado del Probador Virtual</CardTitle>
                            <CardDescription>
                              Cómo te verías con {product.name}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={downloadResult} variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Descargar
                            </Button>
                            <Button onClick={resetTryOn} variant="outline">
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Probar Otra
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                          <img 
                            src={resultImage} 
                            alt="Resultado del probador virtual"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {multipleAngles && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Múltiples Ángulos</CardTitle>
                        <CardDescription>
                          Ve cómo te ves desde diferentes perspectivas
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {Object.entries(multipleAngles).map(([angle, images]: [string, any]) => (
                            <div key={angle} className="space-y-2">
                              <h4 className="font-medium capitalize">{angle}</h4>
                              {images.map((img: any, index: number) => (
                                <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                                  <img 
                                    src={`data:${img.mime_type};base64,${img.data}`}
                                    alt={`${angle} view`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analysis">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {torsoAnalysis && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Análisis de Torso</CardTitle>
                        <CardDescription>
                          Información detectada sobre tu pose y cuerpo
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Dirección</p>
                            <p className="font-medium capitalize">
                              {torsoAnalysis.pose_analysis?.facing_direction || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Ancho de hombros</p>
                            <p className="font-medium capitalize">
                              {torsoAnalysis.pose_analysis?.shoulder_width || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Ángulo del torso</p>
                            <p className="font-medium capitalize">
                              {torsoAnalysis.pose_analysis?.torso_angle || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Posición de brazos</p>
                            <p className="font-medium capitalize">
                              {torsoAnalysis.pose_analysis?.arms_position || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {fitAnalysis && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Análisis de Ajuste</CardTitle>
                        <CardDescription>
                          Evaluación de cómo quedaría la prenda
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Puntuación de compatibilidad</span>
                            <Badge variant="outline">
                              {fitAnalysis.compatibility_score || 0}/100
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Ajuste de talla</span>
                            <Badge variant="outline" className="capitalize">
                              {fitAnalysis.size_match || 'N/A'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Estilo</span>
                            <Badge variant="outline" className="capitalize">
                              {fitAnalysis.style_match || 'N/A'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Armonía de colores</span>
                            <Badge variant="outline" className="capitalize">
                              {fitAnalysis.color_harmony || 'N/A'}
                            </Badge>
                          </div>
                        </div>
                        
                        {fitAnalysis.recommendations && (
                          <div className="pt-4 border-t">
                            <h4 className="font-medium mb-2">Recomendaciones</h4>
                            <p className="text-sm text-muted-foreground">
                              {fitAnalysis.recommendations.overall_verdict || 'Sin recomendaciones disponibles'}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
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

export default VirtualTryOn;
