# Conexión Frontend-Backend - Probador Virtual

Este documento explica cómo se ha configurado la conexión entre el frontend (React + Vite) y el backend (NestJS + Prisma + PostgreSQL).

## 🏗️ Arquitectura

```
Frontend (React + Vite)     Backend (NestJS + Prisma)
     Port: 8080                    Port: 3000
     ↓                            ↓
  API Service ←→ HTTP Requests ←→ Controllers
     ↓                            ↓
  Auth Context                 Auth Service
     ↓                            ↓
  Product Hooks              Product Service
     ↓                            ↓
  UI Components              Database (PostgreSQL)
```

## 🔧 Configuración del Backend

### Endpoints Disponibles

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| POST | `/auth/login` | Iniciar sesión | No |
| POST | `/auth/register` | Registrarse | No |
| GET | `/auth/me` | Usuario actual | Sí |
| GET | `/products` | Listar productos | No |
| GET | `/products/:id` | Obtener producto | No |
| POST | `/products` | Crear producto | Admin |
| PUT | `/products/:id` | Actualizar producto | Admin |
| DELETE | `/products/:id` | Eliminar producto | Admin |
| GET | `/categories` | Listar categorías | No |
| POST | `/categories` | Crear categoría | Admin |
| PUT | `/categories/:id` | Actualizar categoría | Admin |
| DELETE | `/categories/:id` | Eliminar categoría | Admin |
| GET | `/users` | Listar usuarios | Admin |
| PUT | `/users/:id/role` | Actualizar rol | Admin |
| DELETE | `/users/:id` | Eliminar usuario | Admin |

### CORS Configurado

El backend tiene CORS habilitado para permitir peticiones desde el frontend:

```typescript
app.enableCors({
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
});
```

## 🎨 Configuración del Frontend

### Archivos Principales Modificados

1. **`src/lib/api.ts`** - Servicio centralizado para llamadas al backend
2. **`src/contexts/AuthContext.tsx`** - Contexto de autenticación usando JWT
3. **`src/hooks/useProducts.ts`** - Hook para manejo de productos
4. **`src/hooks/useCategories.ts`** - Hook para manejo de categorías
5. **`src/components/CategoryFilter.tsx`** - Componente actualizado
6. **`src/components/ProductGrid.tsx`** - Componente actualizado
7. **`src/config/env.ts`** - Configuración de variables de entorno

### Variables de Entorno

Crear archivo `.env.local` en `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_SUPABASE_URL=https://schbbdodgajmbzeeriwd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGJiZG9kZ2FqbWJ6ZWVyaXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjMxNjMsImV4cCI6MjA3NDI5OTE2M30.AfrB3ZcQTqGkQzoMPIlINhmkcVvSq8ew29oVwypgKD0
```

## 🚀 Instalación y Ejecución

### 1. Configurar el Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run start:dev
```

### 2. Configurar el Frontend

```bash
cd frontend
npm install
# Crear archivo .env.local con las variables de entorno
npm run dev
```

### 3. Script de Configuración Automática

```bash
cd frontend
chmod +x setup-backend-connection.sh
./setup-backend-connection.sh
```

## 📊 Flujo de Datos

### Autenticación

1. Usuario inicia sesión en el frontend
2. Frontend envía credenciales a `POST /auth/login`
3. Backend valida credenciales y devuelve JWT token
4. Frontend almacena token en localStorage
5. Token se incluye en todas las peticiones autenticadas

### Productos

1. Frontend carga productos con `GET /products`
2. Backend consulta base de datos y devuelve productos con categorías
3. Frontend filtra y muestra productos en la UI
4. Usuario puede filtrar por categoría, género, búsqueda

### Categorías

1. Frontend carga categorías con `GET /categories`
2. Backend devuelve categorías activas
3. Frontend muestra filtros de categoría
4. Usuario puede filtrar productos por categoría

## 🔐 Autenticación y Autorización

### JWT Tokens

- Los tokens se almacenan en `localStorage`
- Se incluyen en el header `Authorization: Bearer <token>`
- El backend valida tokens en rutas protegidas

### Roles

- **Admin**: Acceso completo a todas las funcionalidades
- **Client**: Acceso limitado a productos y perfil

### Rutas Protegidas

- Gestión de usuarios (solo admin)
- CRUD de productos (solo admin)
- CRUD de categorías (solo admin)

## 🛠️ Desarrollo

### Estructura de Datos

#### Producto
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

#### Usuario
```typescript
interface User {
  id: string;
  email: string;
  fullName?: string;
  role: 'admin' | 'client';
  createdAt: string;
  updatedAt: string;
}
```

### Manejo de Errores

- Errores de API se capturan en el servicio `apiService`
- Se muestran toasts al usuario para errores
- Estados de carga se manejan en los hooks

### Estado de la Aplicación

- **AuthContext**: Maneja autenticación global
- **useProducts**: Maneja estado de productos
- **useCategories**: Maneja estado de categorías
- **React Query**: Cache y sincronización de datos

## 🧪 Testing

### Backend
```bash
cd backend
npm run test
npm run test:e2e
```

### Frontend
```bash
cd frontend
npm run test
```

## 📝 Notas Importantes

1. **CORS**: El backend permite todas las orígenes en desarrollo
2. **Variables de Entorno**: El frontend usa `VITE_` prefix
3. **Base de Datos**: PostgreSQL con Prisma ORM
4. **Validación**: DTOs con class-validator en el backend
5. **Tipos**: TypeScript en ambos frontend y backend
6. **UI**: Tailwind CSS + shadcn/ui components

## 🔄 Próximos Pasos

1. Implementar probador virtual con IA
2. Agregar carrito de compras
3. Implementar sistema de pedidos
4. Agregar notificaciones en tiempo real
5. Implementar sistema de reviews
6. Agregar analytics y reportes avanzados
