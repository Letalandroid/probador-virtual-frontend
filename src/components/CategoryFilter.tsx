import React from 'react';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/hooks/useCategories';

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ activeCategory, onCategoryChange }: CategoryFilterProps) => {
  const { categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="h-10 w-20 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-10 w-28 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={activeCategory === 'all' ? 'default' : 'outline'}
        onClick={() => onCategoryChange('all')}
        className="rounded-full"
      >
        Todos
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={activeCategory === category.name ? 'default' : 'outline'}
          onClick={() => onCategoryChange(category.name)}
          className="rounded-full"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;