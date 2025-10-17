import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserX, Shield, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import PageTransition from '@/components/PageTransition';

interface User {
  id: string;
  email: string;
  created_at: string;
  profile?: {
    full_name?: string;
    phone?: string;
    city?: string;
  };
  role?: 'admin' | 'client';
}

const UserManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    clients: 0,
    newThisMonth: 0
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      return;
    }
    fetchUsers();
    fetchUserStats();
  }, [user?.role]);

  const fetchUsers = async () => {
    try {
      // Get profiles and roles from our database
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      const { data: roles } = await supabase
        .from('user_roles')
        .select('*');

      // Combine the data - we'll use the profiles as the main source since auth.admin requires service role
      const usersWithData = profiles?.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        
        return {
          id: profile.user_id,
          email: profile.full_name ? `${profile.full_name.toLowerCase().replace(' ', '.')}@email.com` : 'Usuario',
          created_at: profile.created_at,
          profile,
          role: userRole?.role || 'client'
        };
      }) || [];

      setUsers(usersWithData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Error al cargar usuarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: roles } = await supabase.from('user_roles').select('*');
      
      if (profiles) {
        const totalUsers = profiles.length;
        const admins = roles?.filter(r => r.role === 'admin').length || 0;
        const clients = totalUsers - admins;
        
        // Calculate new users this month
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const newThisMonth = profiles.filter(p => 
          new Date(p.created_at) >= thisMonth
        ).length;

        setStats({
          totalUsers,
          admins,
          clients,
          newThisMonth
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: 'admin' | 'client') => {
    try {
      const newRole = currentRole === 'admin' ? 'client' : 'admin';
      
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: newRole });

      if (error) throw error;

      toast({
        title: "Rol actualizado",
        description: `Usuario actualizado a ${newRole}`,
      });

      fetchUsers();
      fetchUserStats();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol",
        variant: "destructive",
      });
    }
  };

  if (user?.role !== 'admin') {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center">
                <UserX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
                <p className="text-muted-foreground">
                  Solo los administradores pueden acceder a la gestión de usuarios.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gradient mb-2">
              Gestión de Usuarios
            </h1>
            <p className="text-muted-foreground">
              Administra usuarios del sistema y sus roles
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Usuarios</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-accent" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Administradores</p>
                    <p className="text-2xl font-bold">{stats.admins}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <UserIcon className="h-8 w-8 text-fashion-sage" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Clientes</p>
                    <p className="text-2xl font-bold">{stats.clients}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <UserCheck className="h-8 w-8 text-fashion-rose" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Nuevos este mes</p>
                    <p className="text-2xl font-bold">{stats.newThisMonth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Cargando usuarios...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Ciudad</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Fecha Registro</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((userItem) => (
                      <TableRow key={userItem.id}>
                        <TableCell className="font-medium">
                          {userItem.profile?.full_name || 'Sin nombre'}
                        </TableCell>
                        <TableCell>{userItem.email}</TableCell>
                        <TableCell>{userItem.profile?.phone || '-'}</TableCell>
                        <TableCell>{userItem.profile?.city || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={userItem.role === 'admin' ? 'default' : 'secondary'}>
                            {userItem.role === 'admin' ? 'Admin' : 'Cliente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(userItem.created_at).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell>
                          {userItem.id !== user?.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleUserRole(userItem.id, userItem.role!)}
                            >
                              {userItem.role === 'admin' ? 'Hacer Cliente' : 'Hacer Admin'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </PageTransition>
  );
};

export default UserManagement;