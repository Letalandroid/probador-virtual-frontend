import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const categories = [
  {
    id: 1,
    name: 'Camisetas',
    description: 'Estilos casuales y formales',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    color: 'bg-fashion-sage/20',
    count: '250+ productos'
  },
  {
    id: 2,
    name: 'Vestidos',
    description: 'Elegancia para cada ocasión',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop',
    color: 'bg-fashion-rose/20',
    count: '180+ productos'
  },
  {
    id: 3,
    name: 'Pantalones',
    description: 'Comodidad y estilo',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
    color: 'bg-accent/20',
    count: '320+ productos'
  },
  {
    id: 4,
    name: 'Chaquetas',
    description: 'Para todas las temporadas',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
    color: 'bg-fashion-cream/40',
    count: '150+ productos'
  }
];

const CategoryGrid = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName: string) => {
    // Mapear nombres de categorías a rutas o filtros
    const categoryMap: { [key: string]: string } = {
      'Camisetas': '/productos?category=camisetas',
      'Vestidos': '/productos?category=vestidos',
      'Pantalones': '/productos?category=pantalones',
      'Chaquetas': '/productos?category=chaquetas',
    };
    
    const route = categoryMap[categoryName] || '/productos';
    navigate(route);
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Explora por Categorías
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre nuestra colección curada de prendas de moda para cada estilo y ocasión
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card 
              key={category.id} 
              className="group overflow-hidden border-0 shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer"
              onClick={() => handleCategoryClick(category.name)}
            >
              <div className="relative">
                <div className={`absolute inset-0 ${category.color} z-10`} />
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent z-20" />
                
                <div className="absolute bottom-4 left-4 right-4 z-30 text-white">
                  <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                  <p className="text-sm opacity-90 mb-2">{category.description}</p>
                  <span className="text-xs bg-white/20 backdrop-blur px-2 py-1 rounded">
                    {category.count}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick(category.name);
                  }}
                >
                  Explorar {category.name}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;