import { FastifyInstance } from 'fastify';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import courseRoutes from './course.routes';
import assignmentRoutes from './assignment.routes';

export default async function routes(fastify: FastifyInstance) {
  // Public routes
  fastify.register(authRoutes, { prefix: '/auth' });

  // Protected routes (require authentication)
  fastify.register(userRoutes, { prefix: '/users' });
  fastify.register(courseRoutes, { prefix: '/courses' });
  fastify.register(assignmentRoutes, { prefix: '/assignments' });

  // Root route
  fastify.get('/', async () => {
    return {
      name: 'EduVerse API',
      version: '1.0.0',
      status: 'running',
      documentation: '/docs',
    };
  });
}
