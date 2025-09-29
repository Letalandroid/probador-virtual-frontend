# Conexión Frontend con Backend

Este documento explica cómo configurar la conexión entre el frontend y el backend.

## Configuración

### Variables de Entorno

Crea un archivo `.env.local` en la carpeta `frontend/` con las siguientes variables:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_SUPABASE_URL=https://schbbdodgajmbzeeriwd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGJiZG9kZ2FqbWJ6ZWVyaXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjMxNjMsImV4cCI6MjA3NDI5OTE2M30.AfrB3ZcQTqGkQzoMPIlINhmkcVvSq8ew29oVwypgKD0
```

### Archivos Modificados

1. **`src/lib/api.ts`** - Servicio de API para comunicarse con el backend
2. **`src/contexts/AuthContext.tsx`** - Actualizado para usar el backend en lugar de Supabase
3. **`src/hooks/useProducts.ts`** - Actualizado para usar el backend
4. **`src/hooks/useCategories.ts`** - Nuevo hook para categorías
5. **`src/components/CategoryFilter.tsx`** - Actualizado para usar el nuevo hook
6. **`src/components/ProductGrid.tsx`** - Actualizado para usar la nueva estructura de datos
7. **`src/config/env.ts`** - Configuración centralizada de variables de entorno

### Cambios Principales

1. **Autenticación**: Ahora usa JWT tokens del backend en lugar de Supabase Auth
2. **Productos**: Los datos vienen del backend con la estructura definida en `api.ts`
3. **Categorías**: Se obtienen del backend a través del hook `useCategories`
4. **API Service**: Servicio centralizado para todas las llamadas al backend

### Estructura de Datos

Los productos ahora tienen esta estructura:
```typescript
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  brand?: string;
  color?: string;
  sizes: string[];
  images: string[];
  stockQuantity: number;
  isActive: boolean;
  gender: string;
  createdAt: string;
  category?: {
    id: string;
    name: string;
  };
}
```

### Endpoints del Backend

El frontend se conecta a estos endpoints:
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrarse
- `GET /auth/me` - Obtener usuario actual
- `GET /products` - Obtener productos
- `GET /categories` - Obtener categorías
- `GET /users` - Obtener usuarios (admin)
- `PUT /users/:id/role` - Actualizar rol de usuario (admin)

### Instalación y Ejecución

1. Instala las dependencias:
```bash
npm install
```

2. Crea el archivo `.env.local` con las variables de entorno

3. Ejecuta el frontend:
```bash
npm run dev
```

4. Asegúrate de que el backend esté ejecutándose en `http://localhost:3000`

### Notas

- El frontend ahora está completamente desconectado de Supabase para autenticación y datos
- Se mantiene la integración con Supabase solo para el probador virtual (si es necesario)
- Todos los datos de productos y categorías vienen del backend
- La autenticación usa JWT tokens almacenados en localStorage

