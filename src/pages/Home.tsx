import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CategoryGrid from '@/components/CategoryGrid';
import FeatureSection from '@/components/FeatureSection';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    navigate(`/productos?search=${encodeURIComponent(query)}`);
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
        <main>
          <HeroSection />
          <CategoryGrid />
          <FeatureSection />
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Home;