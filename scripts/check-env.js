#!/usr/bin/env node

/**
 * EduVerse LMS - Environment Checker
 * Verifica que todas las variables de entorno necesarias estén configuradas
 */

const fs = require('fs');
const path = require('path');

const requiredVars = {
  DATABASE_URL: 'URL de conexión a PostgreSQL',
  REDIS_URL: 'URL de conexión a Redis',
  JWT_SECRET: 'Secret para JWT (cambiar en producción)',
};

const optionalVars = {
  OPENAI_API_KEY: 'API Key de OpenAI (para funciones IA)',
  S3_BUCKET: 'Bucket de S3 para almacenamiento de archivos',
  SMTP_HOST: 'Servidor SMTP para envío de emails',
  STRIPE_SECRET_KEY: 'API Key de Stripe para pagos',
};

console.log('🔍 EduVerse - Verificación de Variables de Entorno\n');

// Cargar .env
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Archivo .env no encontrado');
  console.log('💡 Ejecuta: cp .env.example .env');
  process.exit(1);
}

require('dotenv').config({ path: envPath });

let hasErrors = false;
let hasWarnings = false;

// Verificar variables requeridas
console.log('Variables Requeridas:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

for (const [key, description] of Object.entries(requiredVars)) {
  const value = process.env[key];
  if (!value || value === '') {
    console.log(`❌ ${key}`);
    console.log(`   ${description}`);
    console.log(`   Estado: NO CONFIGURADA\n`);
    hasErrors = true;
  } else {
    // Verificar valores de ejemplo que no deben usarse en producción
    const isProduction = process.env.NODE_ENV === 'production';
    const isDevelopmentValue =
      value.includes('example') ||
      value.includes('change-this') ||
      (key === 'JWT_SECRET' && value.length < 32);

    if (isProduction && isDevelopmentValue) {
      console.log(`⚠️  ${key}`);
      console.log(`   ${description}`);
      console.log(`   Estado: VALOR DE DESARROLLO EN PRODUCCIÓN\n`);
      hasWarnings = true;
    } else {
      console.log(`✅ ${key}`);
      console.log(`   ${description}`);
      console.log(`   Estado: Configurada\n`);
    }
  }
}

// Verificar variables opcionales
console.log('\nVariables Opcionales:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

for (const [key, description] of Object.entries(optionalVars)) {
  const value = process.env[key];
  if (!value || value === '') {
    console.log(`ℹ️  ${key}`);
    console.log(`   ${description}`);
    console.log(`   Estado: No configurada (opcional)\n`);
  } else {
    console.log(`✅ ${key}`);
    console.log(`   ${description}`);
    console.log(`   Estado: Configurada\n`);
  }
}

// Resultado
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (hasErrors) {
  console.log('❌ Hay variables requeridas sin configurar');
  console.log('💡 Edita el archivo .env con las configuraciones correctas\n');
  process.exit(1);
}

if (hasWarnings) {
  console.log('⚠️  Advertencias encontradas');
  console.log('💡 Revisa las variables marcadas con ⚠️\n');
  process.exit(0);
}

console.log('✅ Todas las variables requeridas están configuradas');
console.log('🚀 El proyecto está listo para ejecutarse\n');
