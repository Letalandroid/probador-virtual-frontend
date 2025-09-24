import React from 'react';
import { Search, Heart, User, ShoppingBag, Menu, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onGenderFilter?: (gender: string) => void;
}

const Header = ({ onSearch, onGenderFilter }: HeaderProps) => {
  const { user, userRole, signOut } = useAuth();

  const handleGenderClick = (gender: string) => {
    if (onGenderFilter) {
      onGenderFilter(gender);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-gradient">
            StyleAI
          </h1>
          <span className="text-xs text-muted-foreground hidden sm:block">Virtual Try-On</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/mujeres"
            className="text-sm font-medium hover:text-accent transition-colors"
          >
            Mujeres
          </Link>
          <Link 
            to="/hombres"
            className="text-sm font-medium hover:text-accent transition-colors"
          >
            Hombres
          </Link>
          <Link 
            to="/probador-virtual"
            className="text-sm font-medium hover:text-accent transition-colors"
          >
            Probador Virtual
          </Link>
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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/perfil" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Mi Perfil
                  </Link>
                </DropdownMenuItem>
                {userRole === 'admin' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Productos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/gestion-usuarios" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Usuarios
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/reportes" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Reportes
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" asChild>
              <Link to="/auth">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          )}
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