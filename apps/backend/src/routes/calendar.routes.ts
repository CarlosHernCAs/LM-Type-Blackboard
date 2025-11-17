import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../config/database';

const createEventSchema = z.object({
  courseId: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  eventType: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string().optional(),
});

export default async function calendarRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  // Get events
  fastify.get('/', async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { start, end, courseId } = request.query as any;

      let query = `
        SELECT ce.*, c.title as course_title, c.code as course_code
        FROM calendar_events ce
        LEFT JOIN courses c ON ce.course_id = c.id
        WHERE (ce.created_by = $1 OR ce.course_id IN (
          SELECT course_id FROM enrollments WHERE user_id = $1 AND status = 'active'
        ))
      `;

      const params: any[] = [userId];

      if (start && end) {
        query += ` AND ce.start_time >= $2 AND ce.end_time <= $3`;
        params.push(start, end);
      }

      if (courseId) {
        query += ` AND ce.course_id = $${params.length + 1}`;
        params.push(courseId);
      }

      query += ` ORDER BY ce.start_time ASC`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Create event
  fastify.post('/', async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const body = createEventSchema.parse(request.body);

      const result = await db.query(
        `INSERT INTO calendar_events
         (course_id, title, description, event_type, start_time, end_time, location, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          body.courseId || null,
          body.title,
          body.description || null,
          body.eventType,
          body.startTime,
          body.endTime,
          body.location || null,
          userId,
        ]
      );

      return reply.code(201).send(result.rows[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Update event
  fastify.patch('/:id', async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { id } = request.params as { id: string };
      const body = request.body as any;

      const result = await db.query(
        `UPDATE calendar_events
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             event_type = COALESCE($3, event_type),
             start_time = COALESCE($4, start_time),
             end_time = COALESCE($5, end_time),
             location = COALESCE($6, location),
             updated_at = NOW()
         WHERE id = $7 AND created_by = $8
         RETURNING *`,
        [body.title, body.description, body.eventType, body.startTime, body.endTime, body.location, id, userId]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Event not found or unauthorized' });
      }

      return result.rows[0];
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Delete event
  fastify.delete('/:id', async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { id } = request.params as { id: string };

      const result = await db.query(
        'DELETE FROM calendar_events WHERE id = $1 AND created_by = $2 RETURNING id',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Event not found or unauthorized' });
      }

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
