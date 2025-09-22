import React, { useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CategoryGrid from '@/components/CategoryGrid';
import ProductGrid from '@/components/ProductGrid';
import FeatureSection from '@/components/FeatureSection';
import Footer from '@/components/Footer';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSearch={setSearchQuery} 
        onGenderFilter={setGenderFilter}
      />
      <main>
        <HeroSection />
        <CategoryGrid />
        <ProductGrid 
          searchQuery={searchQuery} 
          genderFilter={genderFilter}
        />
        <FeatureSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
