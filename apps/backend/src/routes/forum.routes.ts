import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../config/database';
import { ForumController } from '../controllers';
import { ForumService } from '../services';

const crearForoSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
});

const crearPublicacionSchema = z.object({
  forum_id: z.string().uuid(),
  parent_post_id: z.string().uuid().optional(),
  title: z.string().optional(),
  content: z.string().min(1),
});

export default async function forumRoutes(fastify: FastifyInstance) {
  // Inicializar servicio y controlador
  const forumService = new ForumService(db);
  const forumController = new ForumController(forumService);

  fastify.addHook('onRequest', fastify.authenticate);

  // Foros
  fastify.post('/', async (request, reply) => {
    try {
      crearForoSchema.parse(request.body);
      return forumController.crearForo(request, reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
      throw error;
    }
  });

  fastify.get('/curso/:cursoId', async (request, reply) => {
    return forumController.obtenerForosPorCurso(request, reply);
  });

  fastify.get('/:id', async (request, reply) => {
    return forumController.obtenerForoPorId(request, reply);
  });

  fastify.put('/:id', async (request, reply) => {
    return forumController.actualizarForo(request, reply);
  });

  fastify.post('/:id/bloquear', async (request, reply) => {
    return forumController.bloquearForo(request, reply);
  });

  fastify.post('/:id/desbloquear', async (request, reply) => {
    return forumController.desbloquearForo(request, reply);
  });

  fastify.delete('/:id', async (request, reply) => {
    return forumController.eliminarForo(request, reply);
  });

  // Publicaciones
  fastify.post('/publicaciones', async (request, reply) => {
    try {
      crearPublicacionSchema.parse(request.body);
      return forumController.crearPublicacion(request, reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
      throw error;
    }
  });

  fastify.get('/:foroId/publicaciones', async (request, reply) => {
    return forumController.obtenerPublicaciones(request, reply);
  });

  fastify.get('/publicaciones/:id', async (request, reply) => {
    return forumController.obtenerPublicacionPorId(request, reply);
  });

  fastify.get('/publicaciones/:publicacionId/respuestas', async (request, reply) => {
    return forumController.obtenerRespuestas(request, reply);
  });

  fastify.put('/publicaciones/:id', async (request, reply) => {
    return forumController.actualizarPublicacion(request, reply);
  });

  fastify.post('/publicaciones/:id/fijar', async (request, reply) => {
    return forumController.fijarPublicacion(request, reply);
  });

  fastify.post('/publicaciones/:id/desfijar', async (request, reply) => {
    return forumController.desfijarPublicacion(request, reply);
  });

  fastify.delete('/publicaciones/:id', async (request, reply) => {
    return forumController.eliminarPublicacion(request, reply);
  });

  fastify.get('/:foroId/buscar', async (request, reply) => {
    return forumController.buscarPublicaciones(request, reply);
  });
}
