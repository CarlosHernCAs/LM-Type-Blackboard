import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config';
import { db } from './config/database';
import { redis } from './config/redis';
import routes from './routes';
import { authenticate } from './middleware/auth';
import { setupSocketIO } from './socket';

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
  // CORS
  await fastify.register(cors, {
    origin: config.corsOrigins,
    credentials: true,
  });

  // JWT
  await fastify.register(jwt, {
    secret: config.jwtSecret,
  });

  // Multipart (file uploads)
  await fastify.register(multipart);

  // Swagger documentation
  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'EduVerse API',
        description: 'Sistema de Gestión de Aprendizaje - API Documentation',
        version: '1.0.0',
      },
      host: `localhost:${config.port}`,
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'users', description: 'User management' },
        { name: 'courses', description: 'Course management' },
        { name: 'assignments', description: 'Assignment management' },
        { name: 'grades', description: 'Grade management' },
      ],
      securityDefinitions: {
        Bearer: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
        },
      },
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });
}

// Register routes
async function registerRoutes() {
  fastify.register(routes, { prefix: '/api/v1' });
}

// Health check
fastify.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: db ? 'connected' : 'disconnected',
    redis: redis ? 'connected' : 'disconnected',
  };
});

// Start server
async function start() {
  try {
    // Test database connection
    await db.query('SELECT NOW()');
    fastify.log.info('✅ Database connected');

    // Test Redis connection
    await redis.ping();
    fastify.log.info('✅ Redis connected');

    // Register plugins and routes
    await registerPlugins();
    await registerRoutes();

    // Setup Socket.IO
    setupSocketIO(fastify);
    fastify.log.info('✅ Socket.IO initialized');

    // Start listening
    await fastify.listen({
      port: config.port,
      host: '0.0.0.0',
    });

    console.log('');
    console.log('🚀 EduVerse Backend is running!');
    console.log('');
    console.log(`📡 API Server: http://localhost:${config.port}`);
    console.log(`📚 API Docs: http://localhost:${config.port}/docs`);
    console.log(`🏥 Health Check: http://localhost:${config.port}/health`);
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
