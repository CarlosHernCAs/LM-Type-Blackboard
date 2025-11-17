import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../config/database';

const enrollSchema = z.object({
  courseId: z.string().uuid(),
});

export default async function enrollmentRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  // Get my enrollments
  fastify.get('/my', async (request, reply) => {
    try {
      const userId = (request.user as any).id;

      const result = await db.query(
        `SELECT e.*, c.title, c.code, c.description, c.thumbnail_url,
                u.first_name, u.last_name
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         LEFT JOIN users u ON c.instructor_id = u.id
         WHERE e.user_id = $1 AND e.status = 'active'
         ORDER BY e.enrollment_date DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Enroll in course
  fastify.post('/', async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const body = enrollSchema.parse(request.body);

      // Check if already enrolled
      const existing = await db.query(
        'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [userId, body.courseId]
      );

      if (existing.rows.length > 0) {
        return reply.code(409).send({ error: 'Already enrolled in this course' });
      }

      // Check course capacity
      const course = await db.query(
        'SELECT max_students FROM courses WHERE id = $1',
        [body.courseId]
      );

      if (course.rows.length === 0) {
        return reply.code(404).send({ error: 'Course not found' });
      }

      if (course.rows[0].max_students) {
        const enrollmentCount = await db.query(
          'SELECT COUNT(*) FROM enrollments WHERE course_id = $1 AND status = $2',
          [body.courseId, 'active']
        );

        if (parseInt(enrollmentCount.rows[0].count) >= course.rows[0].max_students) {
          return reply.code(400).send({ error: 'Course is full' });
        }
      }

      // Create enrollment
      const result = await db.query(
        `INSERT INTO enrollments (user_id, course_id, status)
         VALUES ($1, $2, 'active')
         RETURNING *`,
        [userId, body.courseId]
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

  // Unenroll from course
  fastify.delete('/:id', async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { id } = request.params as { id: string };

      const result = await db.query(
        `UPDATE enrollments
         SET status = 'dropped'
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [id, userId]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Enrollment not found' });
      }

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
