import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../config/database';
import { EnrollmentController } from '../controllers';
import { EnrollmentService } from '../services';
import { createEnrollmentSchema } from '../utils/validation';

export default async function enrollmentRoutes(fastify: FastifyInstance) {
  // Inicializar servicio y controlador
  const enrollmentService = new EnrollmentService(db);
  const enrollmentController = new EnrollmentController(enrollmentService);

  fastify.addHook('onRequest', fastify.authenticate);

  // Inscribirse en curso
  fastify.post('/', async (request, reply) => {
    try {
      createEnrollmentSchema.parse(request.body);
      return enrollmentController.enroll(request, reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
      throw error;
    }
  });

  // Obtener mis inscripciones
  fastify.get('/mis-inscripciones', async (request, reply) => {
    return enrollmentController.getUserEnrollments(request, reply);
  });

  // Obtener inscripciones de un curso
  fastify.get('/curso/:courseId', async (request, reply) => {
    return enrollmentController.getCourseEnrollments(request, reply);
  });

  // Actualizar progreso
  fastify.put('/curso/:courseId/progreso', async (request, reply) => {
    return enrollmentController.updateProgress(request, reply);
  });

  // Desinscribirse
  fastify.delete('/curso/:courseId', async (request, reply) => {
    return enrollmentController.unenroll(request, reply);
  });

  // Estadísticas del curso
  fastify.get('/curso/:courseId/estadisticas', async (request, reply) => {
    return enrollmentController.getEnrollmentStats(request, reply);
  });
}
