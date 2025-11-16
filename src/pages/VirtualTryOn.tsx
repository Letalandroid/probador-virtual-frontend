import React, { useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Upload, Camera, Download, RotateCcw, Loader2, Sparkles, Lightbulb, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import personaExample from '@/assets/persona.jpg';

interface LocationState {
  product?: {
    id: string;
    name: string;
    images: string[];
    brand?: string;
    price: number;
    category?: {
      id: string;
      name: string;
    };
    sizes?: string[];
    color?: string;
    gender?: string;
    description?: string;
    stockQuantity?: number;
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
      // Generate a temporary session ID for tracking
      const tempSessionId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(tempSessionId);

      // Call the Python AI API for virtual try-on
      const clothingType = getClothingType(product.category?.name || 'camisetas');
      
      console.log('Calling Python AI API with:', {
        clothingType,
        productName: product.name,
        productCategory: product.category?.name,
        hasUserImage: !!userImage,
        hasProductImage: !!product.images[0],
        productImageUrl: product.images[0]
      });

      // Convert product image URL to base64
      console.log('Converting product image to base64...');
      let productImageBase64: string;
      try {
        productImageBase64 = await urlToBase64(product.images[0]);
        console.log('Product image converted to base64 successfully');
      } catch (error) {
        console.error('Error converting product image:', error);
        throw new Error('No se pudo cargar la imagen del producto. Inténtalo de nuevo.');
      }

      // Preparar todos los datos del producto para el probador virtual
      const productData = {
        style: 'realistic',
        quality: 'high',
        product_name: product.name,
        product_brand: product.brand,
        product_category: product.category?.name,
        product_id: product.id,
        sizes: product.sizes || [],
        color: product.color,
        gender: product.gender,
        description: product.description,
        stock_quantity: product.stockQuantity,
        price: product.price,
      };

      const response = await apiService.virtualTryOn(
        userImage,
        productImageBase64, // Now using base64 instead of URL
        clothingType, // Dynamic clothing type based on product category
        productData
      );

      console.log('Python AI API response:', response);

      if (response.error) {
        console.error('API Error:', response.error);
        throw new Error(`Error calling AI service: ${response.error}`);
      }

      // Extract the generated image from the API response
      const resultData = response.data;
      console.log('Result data:', resultData);
      console.log('Result data type:', typeof resultData);
      console.log('Result data keys:', resultData ? Object.keys(resultData) : 'null');

      // Check if the response has the expected structure
      if (!resultData) {
        throw new Error('No data received from AI service');
      }

      let resultImageUrl: string;

      // Handle different response structures
      if (resultData.success === false) {
        throw new Error(resultData.message || 'AI service returned error');
      }

      if (resultData.success === true) {
        // Get the first generated image (API returns an array of images)
        const generatedImages = resultData.generated_images || [];
        console.log('Generated images:', generatedImages);
        
        if (generatedImages.length === 0) {
          throw new Error('No images were generated by the AI');
        }

      // Use the first generated image as result
      const firstImage = generatedImages[0];
      console.log('First generated image:', firstImage);
      
      resultImageUrl = firstImage.url || firstImage.image_url || firstImage;
      if (!resultImageUrl) {
        console.error('Generated images structure:', firstImage);
        throw new Error('Generated image URL not found in response');
      }

      console.log('Generated image URL:', resultImageUrl);
      
      // Set the image URL directly (no need to convert from base64)
      setResultImage(resultImageUrl);
      } else {
        // If success is not explicitly true, check for other possible structures
        console.log('Unexpected response structure, trying to extract image...');
        
        // Try to find any image data in the response
        const possibleImages = resultData.images || resultData.generated_images || resultData.result || [];
        if (Array.isArray(possibleImages) && possibleImages.length > 0) {
          resultImageUrl = possibleImages[0].url || possibleImages[0] || possibleImages[0].image_url;
          if (resultImageUrl) {
            console.log('Found image in alternative structure:', resultImageUrl);
            setResultImage(resultImageUrl);
          } else {
            throw new Error('Could not extract image from response');
          }
        } else {
          throw new Error(`Unexpected response format: ${JSON.stringify(resultData)}`);
        }
      }
      
      // Save session to Supabase after successful image generation
      await saveSessionToSupabase(resultImageUrl);

      toast({
        title: "¡Probador completado!",
        description: "Tu imagen ha sido procesada exitosamente",
      });

    } catch (error: any) {
      console.error('Error processing virtual try-on:', error);
      
      // Try to test the API with sample data to debug
      try {
        console.log('Attempting to test API with sample data...');
        await testPythonAPI();
      } catch (testError) {
        console.error('API test also failed:', testError);
      }
      
      toast({
        title: "Error",
        description: `No se pudo procesar la imagen: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Test function to debug API response
  const testPythonAPI = async () => {
    try {
      console.log('Testing Python API with sample data...');
      
      // Create a simple test image (1x1 pixel PNG in base64)
      const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const response = await apiService.virtualTryOn(
        testImageBase64,
        testImageBase64,
        'shirt',
        { style: 'realistic', quality: 'high' }
      );
      
      console.log('Test API response:', response);
      return response;
    } catch (error) {
      console.error('Test API error:', error);
      throw error;
    }
  };

  // Function to convert image URL to base64
  const urlToBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert image to base64'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting URL to base64:', error);
      throw new Error('Failed to load product image');
    }
  };

  // Function to determine clothing type based on product category
  const getClothingType = (categoryName: string): string => {
    const categoryMap: { [key: string]: string } = {
      'camisetas': 'shirt',
      'vestidos': 'dress',
      'chaquetas': 'jacket',
      'pantalones': 'pants',
      'sudaderas': 'hoodie',
      'blusas': 'blouse',
      'relojes': 'accessory',
      'bolsos': 'bag',
      'zapatos': 'shoes'
    };
    
    return categoryMap[categoryName.toLowerCase()] || 'shirt';
  };

  // Function to save session to Supabase after successful image generation
  const saveSessionToSupabase = async (resultImageUrl: string) => {
    if (!user || !product || !sessionId) return;

    try {
      // Create a session record
      const { data: session, error: sessionError } = await supabase
        .from('virtual_try_on_sessions')
        .insert([
          {
            user_id: user.id,
            product_id: product.id,
            user_image_url: userImage,
            result_image_url: resultImageUrl,
            session_data: {
              product_name: product.name,
              product_brand: product.brand,
              timestamp: new Date().toISOString(),
              processed_at: new Date().toISOString(),
              status: 'completed'
            }
          }
        ])
        .select()
        .single();

      if (sessionError) {
        console.error('Error saving session to Supabase:', sessionError);
        return;
      }

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

      console.log('Session saved to Supabase successfully:', session.id);
    } catch (error) {
      console.error('Error saving session to Supabase:', error);
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
                    <div className="space-y-6">
                      {/* Instrucciones y Avisos */}
                      <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 sm:p-6 space-y-4">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base mb-3">Instrucciones para mejores resultados</h3>
                            <ul className="space-y-2.5 text-xs sm:text-sm">
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span className="flex-1">
                                  <strong className="text-foreground">Iluminación adecuada:</strong> La foto debe ser tomada en un área bien iluminada para que la IA pueda detectar correctamente tu figura.
                                </span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span className="flex-1">
                                  <strong className="text-foreground">Encuadre correcto:</strong> La foto debe ser tomada de la mitad del cuerpo hacia arriba (torso completo), mostrando desde la cintura hasta la cabeza.
                                </span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span className="flex-1">
                                  <strong className="text-foreground">Posición frontal:</strong> El usuario de la foto debe estar con el rostro y cuerpo mirando hacia el frente, directamente hacia la cámara.
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 pt-3 border-t border-accent/20">
                          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-muted-foreground flex-1">
                            <strong className="text-amber-600 dark:text-amber-400">Importante:</strong> Si alguno de estos requisitos no se cumple correctamente, el resultado puede no ser el esperado. Para obtener los mejores resultados, sigue todas las instrucciones.
                          </p>
                        </div>
                      </div>

                      {/* Imagen de ejemplo */}
                      <div className="bg-muted/50 border border-muted rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold text-sm">Ejemplo de foto correcta</h4>
                        </div>
                        <div className="relative rounded-lg overflow-hidden border-2 border-primary/20 bg-background">
                          <img 
                            src={personaExample} 
                            alt="Ejemplo de foto correcta para el probador virtual"
                            className="w-full h-auto object-contain"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          Esta es un ejemplo de cómo debe verse tu foto: bien iluminada, encuadre de torso completo y posición frontal
                        </p>
                      </div>

                      {/* Área de carga */}
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