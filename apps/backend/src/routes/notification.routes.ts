import { FastifyInstance } from 'fastify';
import { db } from '../config/database';

export default async function notificationRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  // Get my notifications
  fastify.get('/', async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { unreadOnly } = request.query as any;

      let query = `
        SELECT * FROM notifications
        WHERE user_id = $1
      `;

      if (unreadOnly === 'true') {
        query += ` AND is_read = false`;
      }

      query += ` ORDER BY created_at DESC LIMIT 50`;

      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Mark as read
  fastify.patch('/:id/read', async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { id } = request.params as { id: string };

      await db.query(
        `UPDATE notifications
         SET is_read = true, read_at = NOW()
         WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Mark all as read
  fastify.post('/read-all', async (request, reply) => {
    try {
      const userId = (request.user as any).id;

      await db.query(
        `UPDATE notifications
         SET is_read = true, read_at = NOW()
         WHERE user_id = $1 AND is_read = false`,
        [userId]
      );

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get unread count
  fastify.get('/unread-count', async (request, reply) => {
    try {
      const userId = (request.user as any).id;

      const result = await db.query(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
        [userId]
      );

      return { count: parseInt(result.rows[0].count) };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
