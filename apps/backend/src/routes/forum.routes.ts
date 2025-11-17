import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../config/database';

const createForumSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
});

const createPostSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1),
  parentPostId: z.string().uuid().optional(),
});

export default async function forumRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  // Get forums for course
  fastify.get('/course/:courseId', async (request, reply) => {
    try {
      const { courseId } = request.params as { courseId: string };

      const result = await db.query(
        `SELECT f.*,
                u.first_name, u.last_name,
                (SELECT COUNT(*) FROM forum_posts WHERE forum_id = f.id) as post_count
         FROM forums f
         LEFT JOIN users u ON f.created_by = u.id
         WHERE f.course_id = $1
         ORDER BY f.created_at DESC`,
        [courseId]
      );

      return result.rows;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Create forum (teachers only)
  fastify.post('/', async (request, reply) => {
    try {
      const currentUser = (request.user as any);

      if (!['teacher', 'admin'].includes(currentUser.role)) {
        return reply.code(403).send({ error: 'Only teachers can create forums' });
      }

      const body = createForumSchema.parse(request.body);

      const result = await db.query(
        `INSERT INTO forums (course_id, title, description, created_by)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [body.courseId, body.title, body.description || null, currentUser.id]
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

  // Get posts in forum
  fastify.get('/:forumId/posts', async (request, reply) => {
    try {
      const { forumId } = request.params as { forumId: string };

      const result = await db.query(
        `SELECT fp.*,
                u.first_name, u.last_name, u.avatar_url, u.role,
                (SELECT COUNT(*) FROM forum_posts WHERE parent_post_id = fp.id) as reply_count
         FROM forum_posts fp
         JOIN users u ON fp.author_id = u.id
         WHERE fp.forum_id = $1 AND fp.parent_post_id IS NULL
         ORDER BY fp.is_pinned DESC, fp.created_at DESC`,
        [forumId]
      );

      return result.rows;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get post with replies
  fastify.get('/posts/:postId', async (request, reply) => {
    try {
      const { postId } = request.params as { postId: string };

      // Get main post
      const postResult = await db.query(
        `SELECT fp.*,
                u.first_name, u.last_name, u.avatar_url, u.role
         FROM forum_posts fp
         JOIN users u ON fp.author_id = u.id
         WHERE fp.id = $1`,
        [postId]
      );

      if (postResult.rows.length === 0) {
        return reply.code(404).send({ error: 'Post not found' });
      }

      // Get replies
      const repliesResult = await db.query(
        `SELECT fp.*,
                u.first_name, u.last_name, u.avatar_url, u.role
         FROM forum_posts fp
         JOIN users u ON fp.author_id = u.id
         WHERE fp.parent_post_id = $1
         ORDER BY fp.created_at ASC`,
        [postId]
      );

      // Increment views
      await db.query(
        'UPDATE forum_posts SET views_count = views_count + 1 WHERE id = $1',
        [postId]
      );

      return {
        post: postResult.rows[0],
        replies: repliesResult.rows,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Create post
  fastify.post('/:forumId/posts', async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { forumId } = request.params as { forumId: string };
      const body = createPostSchema.parse(request.body);

      const result = await db.query(
        `INSERT INTO forum_posts (forum_id, parent_post_id, author_id, title, content)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [forumId, body.parentPostId || null, userId, body.title || null, body.content]
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
}
