import React, { useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CategoryGrid from '@/components/CategoryGrid';
import ProductGrid from '@/components/ProductGrid';
import FeatureSection from '@/components/FeatureSection';
import Footer from '@/components/Footer';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={setSearchQuery} />
      <main>
        <HeroSection />
        <CategoryGrid />
        <ProductGrid searchQuery={searchQuery} />
        <FeatureSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
