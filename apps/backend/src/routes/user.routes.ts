import { FastifyInstance } from 'fastify';
import { db } from '../config/database';

export default async function userRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', fastify.authenticate);

  // Get all users (admin only)
  fastify.get('/', async (request, reply) => {
    try {
      const currentUser = request.user as any;

      if (currentUser.role !== 'admin') {
        return reply.code(403).send({ error: 'Forbidden' });
      }

      const result = await db.query(
        `SELECT id, username, email, first_name, last_name, role, is_active, created_at
         FROM users
         ORDER BY created_at DESC`
      );

      return result.rows.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
      }));
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get user by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const result = await db.query(
        `SELECT id, username, email, first_name, last_name, role, avatar_url, is_active, created_at
         FROM users
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'User not found' });
      }

      const user = result.rows[0];
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        avatarUrl: user.avatar_url,
        isActive: user.is_active,
        createdAt: user.created_at,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
