import React from 'react';
import { ShoppingBag, Search, User, Heart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from './SearchBar';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

const Header = ({ onSearch }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-gradient">
            StyleAI
          </h1>
          <span className="text-xs text-muted-foreground hidden sm:block">Virtual Try-On</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-sm font-medium hover:text-accent transition-colors">
            Mujeres
          </a>
          <a href="#" className="text-sm font-medium hover:text-accent transition-colors">
            Hombres
          </a>
          <a href="#" className="text-sm font-medium hover:text-accent transition-colors">
            Niños
          </a>
          <a href="#" className="text-sm font-medium hover:text-accent transition-colors">
            Accesorios
          </a>
          <a href="#" className="text-sm font-medium hover:text-accent transition-colors">
            Ofertas
          </a>
        </nav>

        {/* Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-sm mx-8">
          <SearchBar onSearch={onSearch || (() => {})} />
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-accent text-xs flex items-center justify-center text-accent-foreground">
              3
            </span>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;