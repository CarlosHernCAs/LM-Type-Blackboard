import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config';
import { configValidado } from './config/env';
import { db } from './config/database';
import { redis } from './config/redis';
import routes from './routes';
import { authenticate } from './middleware/auth';
import { setupSocketIO } from './socket';
import { errorHandler, notFoundHandler } from './middleware/error-handler';

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Register auth middleware
fastify.decorate('authenticate', authenticate);

// Register plugins
async function registerPlugins() {
  // Helmet - Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false, // Para permitir uploads
  });

  // Rate Limiting
  await fastify.register(rateLimit, {
    max: 100, // 100 requests
    timeWindow: '1 minute',
    cache: 10000,
    allowList: ['127.0.0.1'], // Whitelist localhost
    redis: redis, // Usar Redis para almacenar los límites
    skipOnError: true, // Si Redis falla, no bloquear requests
    keyGenerator: (request) => {
      return request.user ? (request.user as any).id : request.ip;
    },
  });

  // CORS
  await fastify.register(cors, {
    origin: configValidado.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // JWT
  await fastify.register(jwt, {
    secret: configValidado.jwtSecret,
  });

  // Multipart (file uploads)
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 5,
    },
  });

  // Swagger documentation
  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'EduVerse API',
        description: 'Sistema de Gestión de Aprendizaje - API REST completa',
        version: '1.0.0',
        contact: {
          name: 'EduVerse Team',
          email: 'api@eduverse.com',
        },
      },
      host: `localhost:${configValidado.port}`,
      schemes: configValidado.isProduction ? ['https'] : ['http'],
      consumes: ['application/json', 'multipart/form-data'],
      produces: ['application/json'],
      tags: [
        { name: 'auth', description: 'Autenticación y autorización' },
        { name: 'users', description: 'Gestión de usuarios' },
        { name: 'courses', description: 'Gestión de cursos' },
        { name: 'assignments', description: 'Gestión de tareas' },
        { name: 'enrollments', description: 'Inscripciones a cursos' },
        { name: 'messages', description: 'Sistema de mensajería' },
        { name: 'forums', description: 'Foros de discusión' },
        { name: 'calendar', description: 'Calendario de eventos' },
        { name: 'notifications', description: 'Notificaciones' },
        { name: 'uploads', description: 'Carga de archivos' },
      ],
      securityDefinitions: {
        Bearer: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: 'JWT token - Formato: Bearer {token}',
        },
      },
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      displayRequestDuration: true,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });
}

// Register routes
async function registerRoutes() {
  fastify.register(routes, { prefix: '/api/v1' });
}

// Register error handlers
function registerErrorHandlers() {
  // Manejador de errores global
  fastify.setErrorHandler(errorHandler);

  // Manejador para rutas no encontradas
  fastify.setNotFoundHandler(notFoundHandler);
}

// Health check
fastify.get('/health', async () => {
  try {
    await db.query('SELECT 1');
    await redis.ping();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: configValidado.nodeEnv,
      services: {
        database: 'up',
        redis: 'up',
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: configValidado.nodeEnv,
      services: {
        database: error.message.includes('postgres') ? 'down' : 'up',
        redis: error.message.includes('redis') ? 'down' : 'up',
      },
    };
  }
});

// Start server
async function start() {
  try {
    // Mostrar configuración
    fastify.log.info(`🌍 Environment: ${configValidado.nodeEnv}`);

    // Test database connection
    await db.query('SELECT NOW()');
    fastify.log.info('✅ Database connected');

    // Test Redis connection
    await redis.ping();
    fastify.log.info('✅ Redis connected');

    // Register plugins and routes
    await registerPlugins();
    fastify.log.info('✅ Plugins registered');

    await registerRoutes();
    fastify.log.info('✅ Routes registered');

    // Register error handlers (debe ser después de las rutas)
    registerErrorHandlers();
    fastify.log.info('✅ Error handlers registered');

    // Setup Socket.IO
    setupSocketIO(fastify);
    fastify.log.info('✅ Socket.IO initialized');

    // Start listening
    await fastify.listen({
      port: configValidado.port,
      host: '0.0.0.0',
    });

    console.log('');
    console.log('🚀 EduVerse Backend is running!');
    console.log('');
    console.log(`📡 API Server: http://localhost:${configValidado.port}`);
    console.log(`📚 API Docs: http://localhost:${configValidado.port}/docs`);
    console.log(`🏥 Health Check: http://localhost:${configValidado.port}/health`);
    console.log(`🔒 CORS Origins: ${configValidado.corsOrigins.join(', ')}`);
    console.log(`⚡ Rate Limit: 100 req/min`);
    console.log('');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Handle shutdown gracefully
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach(signal => {
  process.on(signal, async () => {
    fastify.log.info(`Received ${signal}, closing server...`);
    await fastify.close();
    await db.end();
    await redis.quit();
    process.exit(0);
  });
});

start();
