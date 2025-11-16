import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService, User } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCurrentUser = async () => {
    try {
      const response = await apiService.getCurrentUser();
      if (response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetchCurrentUser();
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const response = await apiService.register({
        email,
        password,
        full_name: fullName,
      });

      if (response.error) {
        toast({
          title: "Error en el registro",
          description: response.error,
          variant: "destructive",
        });
        return { error: response.error };
      }

      if (response.data) {
        setUser(response.data.user);
        toast({
          title: "¡Registro exitoso!",
          description: "Tu cuenta ha sido creada correctamente.",
        });
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error en el registro",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiService.login({
        email,
        password,
      });

      if (response.error) {
        toast({
          title: "Error en el inicio de sesión",
          description: response.error,
          variant: "destructive",
        });
        return { error: response.error };
      }

      if (response.data) {
        setUser(response.data.user);
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión exitosamente.",
        });
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error en el inicio de sesión",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await apiService.logout();
      setUser(null);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const response = await apiService.updateProfile(data);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Actualizar el usuario local con los datos actualizados
      if (response.data?.profile) {
        setUser({ ...user, ...response.data.profile });
      } else {
        setUser({ ...user, ...data });
      }
      
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil se ha actualizado exitosamente y guardado en la base de datos.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error al actualizar perfil",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};