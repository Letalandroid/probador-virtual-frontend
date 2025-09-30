#!/bin/bash

# Script para configurar la conexión del frontend con el backend

echo "🔧 Configurando conexión del frontend con el backend..."

# Crear archivo .env.local si no existe
if [ ! -f .env.local ]; then
    echo "📝 Creando archivo .env.local..."
    cat > .env.local << EOF
VITE_API_BASE_URL=http://localhost:3000
VITE_SUPABASE_URL=https://schbbdodgajmbzeeriwd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGJiZG9kZ2FqbWJ6ZWVyaXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjMxNjMsImV4cCI6MjA3NDI5OTE2M30.AfrB3ZcQTqGkQzoMPIlINhmkcVvSq8ew29oVwypgKD0
EOF
    echo "✅ Archivo .env.local creado"
else
    echo "⚠️  El archivo .env.local ya existe"
fi

# Verificar que el backend esté ejecutándose
echo "🔍 Verificando conexión con el backend..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend está ejecutándose en http://localhost:3000"
else
    echo "⚠️  Backend no está ejecutándose. Asegúrate de iniciarlo con:"
    echo "   cd ../backend && npm run start:dev"
fi

echo "🚀 Configuración completada!"
echo ""
echo "Para ejecutar el frontend:"
echo "  npm run dev"
echo ""
echo "Para ejecutar el backend:"
echo "  cd ../backend && npm run start:dev"


