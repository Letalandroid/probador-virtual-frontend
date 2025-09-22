import React from 'react';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';

const Accessories = () => {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    navigate(`/productos?search=${encodeURIComponent(query)}&category=accesorios`);
  };

  const handleGenderFilter = (gender: string) => {
    navigate(`/productos?category=${gender.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSearch={handleSearch} 
        onGenderFilter={handleGenderFilter}
      />
      <main className="pt-8">
        <ProductGrid 
          genderFilter="Accesorios"
        />
      </main>
      <Footer />
    </div>
  );
};

export default Accessories;