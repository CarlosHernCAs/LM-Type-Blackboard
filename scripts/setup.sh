#!/bin/bash

# EduVerse LMS - Setup Script
# Este script configura el proyecto completo

set -e

echo "🎓 EduVerse LMS - Setup Inicial"
echo "================================"
echo ""

# Verificar Node.js
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "Por favor instala Node.js >= 20.0.0 desde https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version $NODE_VERSION es muy antigua"
    echo "Por favor instala Node.js >= 20.0.0"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Verificar npm
echo "📦 Verificando npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi
echo "✅ npm $(npm -v) encontrado"

# Verificar Docker
echo "🐳 Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker no está instalado"
    echo "Instala Docker Desktop desde https://www.docker.com/products/docker-desktop"
    echo "El proyecto puede funcionar sin Docker, pero necesitarás PostgreSQL y Redis locales"
    read -p "¿Continuar sin Docker? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Docker encontrado"
fi

# Instalar dependencias
echo ""
echo "📥 Instalando dependencias..."
npm install

# Copiar .env
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    echo "✅ .env creado"
    echo "⚠️  Por favor revisa y edita .env con tus configuraciones"
else
    echo "✅ .env ya existe"
fi

# Docker Compose
if command -v docker &> /dev/null; then
    echo ""
    read -p "¿Iniciar servicios con Docker Compose? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🐳 Iniciando Docker Compose..."
        docker-compose up -d

        echo ""
        echo "⏳ Esperando que los servicios estén listos (30s)..."
        sleep 30

        echo ""
        echo "🗄️  Ejecutando migraciones de base de datos..."
        npm run db:migrate || echo "⚠️  Error en migraciones. Revisa la configuración de base de datos."

        echo ""
        echo "✅ Servicios Docker iniciados:"
        echo "  - PostgreSQL: localhost:5432"
        echo "  - Redis: localhost:6379"
        echo "  - MongoDB: localhost:27017"
        echo "  - MinIO: localhost:9000 (console: localhost:9001)"
        echo "  - Elasticsearch: localhost:9200"
    fi
fi

echo ""
echo "✅ Setup completado!"
echo ""
echo "📚 Próximos pasos:"
echo ""
echo "1. Revisa y edita el archivo .env"
echo "2. Ejecuta: npm run dev"
echo "3. Abre http://localhost:3000 en tu navegador"
echo ""
echo "📖 Documentación:"
echo "  - README.md - Información general"
echo "  - docs/DEVELOPMENT.md - Guía de desarrollo"
echo "  - docs/ARCHITECTURE.md - Arquitectura del sistema"
echo ""
echo "¡Feliz desarrollo! 🚀"
