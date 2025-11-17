import { FastifyInstance } from 'fastify';
import { db } from '../config/database';

export default async function assignmentRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', fastify.authenticate);

  // Get assignments for a course
  fastify.get('/course/:courseId', async (request, reply) => {
    try {
      const { courseId } = request.params as { courseId: string };

      const result = await db.query(
        `SELECT * FROM assignments
         WHERE course_id = $1 AND is_published = true
         ORDER BY due_date ASC`,
        [courseId]
      );

      return result.rows.map(assignment => ({
        id: assignment.id,
        courseId: assignment.course_id,
        moduleId: assignment.module_id,
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        maxPoints: assignment.max_points,
        dueDate: assignment.due_date,
        allowLate: assignment.allow_late,
        latePenaltyPercent: assignment.late_penalty_percent,
        createdAt: assignment.created_at,
      }));
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get assignment by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const result = await db.query('SELECT * FROM assignments WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Assignment not found' });
      }

      const assignment = result.rows[0];
      return {
        id: assignment.id,
        courseId: assignment.course_id,
        moduleId: assignment.module_id,
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        maxPoints: assignment.max_points,
        dueDate: assignment.due_date,
        allowLate: assignment.allow_late,
        latePenaltyPercent: assignment.late_penalty_percent,
        instructions: assignment.instructions,
        attachments: assignment.attachments,
        isPublished: assignment.is_published,
        createdAt: assignment.created_at,
        updatedAt: assignment.updated_at,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
