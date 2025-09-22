import React from 'react';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { useNavigate } from 'react-router-dom';

const Kids = () => {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    navigate(`/productos?search=${encodeURIComponent(query)}&category=ninos`);
  };

  const handleGenderFilter = (gender: string) => {
    navigate(`/productos?category=${gender.toLowerCase()}`);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header 
          onSearch={handleSearch} 
          onGenderFilter={handleGenderFilter}
        />
        <main className="pt-8">
          <ProductGrid 
            genderFilter="Niños"
          />
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Kids;