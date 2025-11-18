import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../config/database';
import { CourseController } from '../controllers';
import { CourseService } from '../services';
import { createCourseSchema, updateCourseSchema } from '../utils/validation';

export default async function courseRoutes(fastify: FastifyInstance) {
  // Inicializar servicio y controlador
  const courseService = new CourseService(db);
  const courseController = new CourseController(courseService);

  // Todas las rutas requieren autenticación
  fastify.addHook('onRequest', fastify.authenticate);

  // Crear curso
  fastify.post('/', async (request, reply) => {
    try {
      createCourseSchema.parse(request.body);
      return courseController.create(request, reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
      throw error;
    }
  });

  // Obtener todos los cursos
  fastify.get('/', async (request, reply) => {
    return courseController.findAll(request, reply);
  });

  // Obtener cursos del estudiante
  fastify.get('/mis-cursos', async (request, reply) => {
    return courseController.getStudentCourses(request, reply);
  });

  // Obtener cursos del profesor
  fastify.get('/mis-cursos-profesor', async (request, reply) => {
    return courseController.getTeacherCourses(request, reply);
  });

  // Obtener curso por ID
  fastify.get('/:id', async (request, reply) => {
    return courseController.findById(request, reply);
  });

  // Actualizar curso
  fastify.put('/:id', async (request, reply) => {
    try {
      updateCourseSchema.parse(request.body);
      return courseController.update(request, reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
      throw error;
    }
  });

  // Eliminar curso
  fastify.delete('/:id', async (request, reply) => {
    return courseController.delete(request, reply);
  });

  // Publicar curso
  fastify.post('/:id/publicar', async (request, reply) => {
    return courseController.publish(request, reply);
  });

  // Archivar curso
  fastify.post('/:id/archivar', async (request, reply) => {
    return courseController.archive(request, reply);
  });
}
