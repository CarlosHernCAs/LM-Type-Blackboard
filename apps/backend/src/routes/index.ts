import { FastifyInstance } from 'fastify';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import courseRoutes from './course.routes';
import assignmentRoutes from './assignment.routes';
import enrollmentRoutes from './enrollment.routes';
import messageRoutes from './message.routes';
import forumRoutes from './forum.routes';
import calendarRoutes from './calendar.routes';
import notificationRoutes from './notification.routes';
import uploadRoutes from './upload.routes';

export default async function routes(fastify: FastifyInstance) {
  // Public routes
  fastify.register(authRoutes, { prefix: '/auth' });

  // Protected routes (require authentication)
  fastify.register(userRoutes, { prefix: '/users' });
  fastify.register(courseRoutes, { prefix: '/courses' });
  fastify.register(assignmentRoutes, { prefix: '/assignments' });
  fastify.register(enrollmentRoutes, { prefix: '/enrollments' });
  fastify.register(messageRoutes, { prefix: '/messages' });
  fastify.register(forumRoutes, { prefix: '/forums' });
  fastify.register(calendarRoutes, { prefix: '/calendar' });
  fastify.register(notificationRoutes, { prefix: '/notifications' });
  fastify.register(uploadRoutes, { prefix: '/upload' });

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
