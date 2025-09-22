import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import PageTransition from '@/components/PageTransition';
import Footer from '@/components/Footer';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';

  const handleSearch = (query: string) => {
    if (query) {
      searchParams.set('search', query);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const handleGenderFilter = (gender: string) => {
    if (gender !== 'all') {
      searchParams.set('category', gender.toLowerCase());
    } else {
      searchParams.delete('category');
    }
    searchParams.delete('search');
    setSearchParams(searchParams);
  };

  // Convert category back to display format
  const getDisplayCategory = (cat: string) => {
    if (cat === 'all') return 'all';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
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
            searchQuery={search} 
            genderFilter={getDisplayCategory(category)}
          />
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Products;