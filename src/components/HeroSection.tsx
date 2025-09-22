import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Camera, ShoppingBag } from 'lucide-react';
import heroImage from '@/assets/hero-fashion.jpg';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background to-secondary">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Nuevo: Probador Virtual con IA
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Pruébate la ropa
                <span className="text-gradient block">
                  antes de comprar
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Experimenta el futuro de las compras online con nuestro probador virtual impulsado por IA. Ve cómo te queda cualquier prenda antes de realizar tu compra.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group">
                <Camera className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                Probar Ahora
              </Button>
              <Button variant="outline" size="lg">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Ver Catálogo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t">
              <div>
                <div className="text-2xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">Precisión IA</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">Productos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">5★</div>
                <div className="text-sm text-muted-foreground">Valoración</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-strong">
              <img
                src={heroImage}
                alt="Fashion Model showcasing virtual try-on technology"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              
              {/* Floating AI Badge */}
              <div className="absolute top-6 right-6 bg-background/90 backdrop-blur rounded-lg px-3 py-2 shadow-medium">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  IA Activa
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/20 rounded-full blur-xl" />
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-fashion-rose/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;