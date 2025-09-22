import React from 'react';
import { Card } from '@/components/ui/card';
import { Camera, Shield, Truck, Sparkles, Users, Award } from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: 'Probador Virtual IA',
    description: 'Ve cómo te queda cualquier prenda usando inteligencia artificial avanzada. Precisión del 95% en ajuste virtual.',
    color: 'bg-accent/10 text-accent'
  },
  {
    icon: Shield,
    title: 'Compra Segura',
    description: 'Protección completa en todas tus transacciones con encriptación de nivel bancario y garantía de devolución.',
    color: 'bg-primary/10 text-primary'
  },
  {
    icon: Truck,
    title: 'Envío Gratis',
    description: 'Envío gratuito en compras superiores a $50. Entrega rápida en 2-5 días hábiles a nivel nacional.',
    color: 'bg-fashion-sage/30 text-fashion-sage'
  },
  {
    icon: Sparkles,
    title: 'Recomendaciones IA',
    description: 'Sugerencias personalizadas basadas en tu estilo, talla y preferencias. Descubre nuevos looks perfectos para ti.',
    color: 'bg-fashion-rose/30 text-fashion-rose'
  },
  {
    icon: Users,
    title: 'Comunidad Fashion',
    description: 'Únete a miles de usuarios que comparten outfits, reseñas y consejos de estilo en nuestra comunidad.',
    color: 'bg-fashion-cream/60 text-primary'
  },
  {
    icon: Award,
    title: 'Calidad Premium',
    description: 'Materiales de alta calidad seleccionados cuidadosamente. Cada prenda pasa por estrictos controles de calidad.',
    color: 'bg-accent/20 text-accent'
  }
];

const FeatureSection = () => {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            ¿Por qué elegir StyleAI?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Revolucionamos la experiencia de compra online con tecnología de vanguardia y un servicio excepcional
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 card-fashion group hover:scale-105 transition-all duration-300">
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;