import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Schema de validación para variables de entorno
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('4000'),

  // Database
  DATABASE_URL: z.string().url().min(1),

  // Redis
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // S3/MinIO
  S3_BUCKET: z.string().default('eduverse-files'),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  // OpenAI (opcional)
  OPENAI_API_KEY: z.string().optional(),

  // Email (opcional para desarrollo)
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),

  // Agora (opcional)
  AGORA_APP_ID: z.string().optional(),
  AGORA_APP_CERTIFICATE: z.string().optional(),

  // Stripe (opcional)
  STRIPE_PUBLIC_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
});

// Validar y parsear
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Error en variables de entorno:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\nRevisa tu archivo .env');
      process.exit(1);
    }
    throw error;
  }
};

const env = parseEnv();

// Exportar configuración validada
export const configValidado = {
  // Server
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  // Database
  databaseUrl: env.DATABASE_URL,

  // Redis
  redisUrl: env.REDIS_URL,

  // JWT
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,

  // CORS
  corsOrigins: env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),

  // S3
  s3: {
    bucket: env.S3_BUCKET,
    region: env.S3_REGION,
    accessKey: env.S3_ACCESS_KEY || 'eduverse',
    secretKey: env.S3_SECRET_KEY || 'eduverse123',
  },

  // OpenAI
  openai: {
    apiKey: env.OPENAI_API_KEY || '',
  },

  // Email
  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER || '',
    password: env.SMTP_PASSWORD || '',
  },

  // Agora
  agora: {
    appId: env.AGORA_APP_ID || '',
    appCertificate: env.AGORA_APP_CERTIFICATE || '',
  },

  // Stripe
  stripe: {
    publicKey: env.STRIPE_PUBLIC_KEY || '',
    secretKey: env.STRIPE_SECRET_KEY || '',
  },
};

// Tipo inferido de la configuración
export type Config = typeof configValidado;
