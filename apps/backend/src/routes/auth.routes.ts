import { FastifyInstance } from 'fastify';
import { db } from '../config/database';
import { AuthController } from '../controllers';
import { AuthService } from '../services';
import { loginSchema, registerSchema, changePasswordSchema } from '../utils/validation';
import { z } from 'zod';

export default async function authRoutes(fastify: FastifyInstance) {
  // Initialize service and controller
  const authService = new AuthService(db);
  const authController = new AuthController(authService);

  // Login
  fastify.post('/login', async (request, reply) => {
    try {
      loginSchema.parse(request.body);
      return authController.login(request, reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
      throw error;
    }
  });

  // Register
  fastify.post('/register', async (request, reply) => {
    try {
      registerSchema.parse(request.body);
      return authController.register(request, reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
      throw error;
    }
  });

  // Get current user profile
  fastify.get('/me', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    return authController.getProfile(request, reply);
  });

  // Change password
  fastify.post('/change-password', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      changePasswordSchema.parse(request.body);
      return authController.changePassword(request, reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
      throw error;
    }
  });
}
