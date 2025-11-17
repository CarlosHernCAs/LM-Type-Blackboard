import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../config/database';

const sendMessageSchema = z.object({
  recipientId: z.string().uuid(),
  subject: z.string().optional(),
  content: z.string().min(1),
});

export default async function messageRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  // Get conversations
  fastify.get('/conversations', async (request, reply) => {
    try {
      const userId = (request.user as any).id;

      const result = await db.query(
        `SELECT DISTINCT ON (other_user_id)
                other_user_id,
                u.first_name,
                u.last_name,
                u.avatar_url,
                u.role,
                last_message,
                last_message_time,
                unread_count
         FROM (
           SELECT
             CASE WHEN sender_id = $1 THEN recipient_id ELSE sender_id END as other_user_id,
             content as last_message,
             created_at as last_message_time,
             (SELECT COUNT(*) FROM messages WHERE sender_id = other_user_id AND recipient_id = $1 AND is_read = false) as unread_count
           FROM messages
           WHERE sender_id = $1 OR recipient_id = $1
           ORDER BY created_at DESC
         ) conversations
         JOIN users u ON u.id = other_user_id
         ORDER BY other_user_id, last_message_time DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get messages with user
  fastify.get('/:userId', async (request, reply) => {
    try {
      const currentUserId = (request.user as any).id;
      const { userId } = request.params as { userId: string };

      const result = await db.query(
        `SELECT m.*,
                sender.first_name as sender_first_name,
                sender.last_name as sender_last_name,
                sender.avatar_url as sender_avatar
         FROM messages m
         JOIN users sender ON m.sender_id = sender.id
         WHERE (m.sender_id = $1 AND m.recipient_id = $2)
            OR (m.sender_id = $2 AND m.recipient_id = $1)
         ORDER BY m.created_at ASC`,
        [currentUserId, userId]
      );

      // Mark as read
      await db.query(
        `UPDATE messages
         SET is_read = true, read_at = NOW()
         WHERE sender_id = $1 AND recipient_id = $2 AND is_read = false`,
        [userId, currentUserId]
      );

      return result.rows;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Send message
  fastify.post('/', async (request, reply) => {
    try {
      const senderId = (request.user as any).id;
      const body = sendMessageSchema.parse(request.body);

      const result = await db.query(
        `INSERT INTO messages (sender_id, recipient_id, subject, content)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [senderId, body.recipientId, body.subject || null, body.content]
      );

      // Emit socket event
      if (fastify.io) {
        fastify.io.to(`user-${body.recipientId}`).emit('new-message', result.rows[0]);
      }

      return reply.code(201).send(result.rows[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
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
        `UPDATE messages
         SET is_read = true, read_at = NOW()
         WHERE id = $1 AND recipient_id = $2`,
        [id, userId]
      );

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
