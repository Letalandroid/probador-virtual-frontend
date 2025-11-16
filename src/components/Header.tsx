import React, { useState } from 'react';
import { Search, Heart, User, ShoppingBag, Menu, LogOut, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onGenderFilter?: (gender: string) => void;
}

const Header = ({ onSearch, onGenderFilter }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGenderClick = (gender: string) => {
    if (onGenderFilter) {
      onGenderFilter(gender);
    }
    setMobileMenuOpen(false);
  };

  const handleMobileNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-1 sm:space-x-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gradient">
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
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex h-9 w-9 sm:h-10 sm:w-10">
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
            <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/perfil" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Mi Perfil
                  </Link>
                </DropdownMenuItem>
                {user?.role === 'admin' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Panel de Administración
                      </Link>
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem asChild>
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
                    </DropdownMenuItem> */}
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
            <Button variant="ghost" size="icon" asChild className="h-9 w-9 sm:h-10 sm:w-10">
              <Link to="/auth">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-9 w-9 sm:h-10 sm:w-10"
            onClick={() => navigate('/productos')}
          >
            <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-accent text-[10px] sm:text-xs flex items-center justify-center text-accent-foreground">
              3
            </span>
          </Button>
          
          {/* Menú móvil */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menú</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-8">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleMobileNavClick('/mujeres')}
                >
                  Mujeres
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleMobileNavClick('/hombres')}
                >
                  Hombres
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleMobileNavClick('/probador-virtual')}
                >
                  Probador Virtual
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleMobileNavClick('/productos')}
                >
                  Ver Catálogo
                </Button>
                {user && (
                  <>
                    <div className="border-t my-4" />
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        handleMobileNavClick('/perfil');
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </Button>
                    {user.role === 'admin' && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          handleMobileNavClick('/admin');
                        }}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Panel de Administración
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive"
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </Button>
                  </>
                )}
                {!user && (
                  <>
                    <div className="border-t my-4" />
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        handleMobileNavClick('/auth');
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Iniciar Sesión
                    </Button>
                  </>
                )}
              </nav>
              {/* Search Bar móvil */}
              <div className="mt-8">
                <SearchBar onSearch={(query) => {
                  if (onSearch) {
                    onSearch(query);
                  }
                  setMobileMenuOpen(false);
                }} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;