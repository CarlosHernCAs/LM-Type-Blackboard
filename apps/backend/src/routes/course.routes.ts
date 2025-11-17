import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../config/database';

const createCourseSchema = z.object({
  code: z.string().min(1).max(20),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxStudents: z.number().int().positive().optional(),
  credits: z.number().positive().optional(),
});

export default async function courseRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', fastify.authenticate);

  // Get all courses
  fastify.get('/', async (request, reply) => {
    try {
      const result = await db.query(
        `SELECT c.*, u.first_name, u.last_name, u.email as instructor_email
         FROM courses c
         LEFT JOIN users u ON c.instructor_id = u.id
         WHERE c.status != 'archived'
         ORDER BY c.created_at DESC`
      );

      return result.rows.map(course => ({
        id: course.id,
        code: course.code,
        title: course.title,
        description: course.description,
        instructor: course.instructor_id ? {
          id: course.instructor_id,
          firstName: course.first_name,
          lastName: course.last_name,
          email: course.instructor_email,
        } : null,
        category: course.category,
        status: course.status,
        thumbnailUrl: course.thumbnail_url,
        startDate: course.start_date,
        endDate: course.end_date,
        maxStudents: course.max_students,
        credits: course.credits,
        createdAt: course.created_at,
      }));
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get course by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const result = await db.query(
        `SELECT c.*, u.first_name, u.last_name, u.email as instructor_email
         FROM courses c
         LEFT JOIN users u ON c.instructor_id = u.id
         WHERE c.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Course not found' });
      }

      const course = result.rows[0];
      return {
        id: course.id,
        code: course.code,
        title: course.title,
        description: course.description,
        instructor: course.instructor_id ? {
          id: course.instructor_id,
          firstName: course.first_name,
          lastName: course.last_name,
          email: course.instructor_email,
        } : null,
        category: course.category,
        status: course.status,
        thumbnailUrl: course.thumbnail_url,
        startDate: course.start_date,
        endDate: course.end_date,
        maxStudents: course.max_students,
        credits: course.credits,
        createdAt: course.created_at,
        updatedAt: course.updated_at,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Create course (teachers and admins only)
  fastify.post('/', async (request, reply) => {
    try {
      const currentUser = request.user as any;

      if (!['teacher', 'admin'].includes(currentUser.role)) {
        return reply.code(403).send({ error: 'Only teachers and admins can create courses' });
      }

      const body = createCourseSchema.parse(request.body);

      // Check if course code already exists
      const existing = await db.query('SELECT id FROM courses WHERE code = $1', [body.code]);
      if (existing.rows.length > 0) {
        return reply.code(409).send({ error: 'Course code already exists' });
      }

      const result = await db.query(
        `INSERT INTO courses (code, title, description, instructor_id, category, start_date, end_date, max_students, credits)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          body.code,
          body.title,
          body.description || null,
          currentUser.id,
          body.category || null,
          body.startDate || null,
          body.endDate || null,
          body.maxStudents || null,
          body.credits || null,
        ]
      );

      const course = result.rows[0];
      return reply.code(201).send({
        id: course.id,
        code: course.code,
        title: course.title,
        description: course.description,
        instructorId: course.instructor_id,
        category: course.category,
        status: course.status,
        startDate: course.start_date,
        endDate: course.end_date,
        maxStudents: course.max_students,
        credits: course.credits,
        createdAt: course.created_at,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
