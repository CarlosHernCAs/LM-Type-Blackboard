import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../config/database';
import { AssignmentController } from '../controllers';
import { AssignmentService } from '../services';
import { createAssignmentSchema, updateAssignmentSchema } from '../utils/validation';

export default async function assignmentRoutes(fastify: FastifyInstance) {
  // Inicializar servicio y controlador
  const assignmentService = new AssignmentService(db);
  const assignmentController = new AssignmentController(assignmentService);

  // Todas las rutas requieren autenticación
  fastify.addHook('onRequest', fastify.authenticate);

  // Crear tarea
  fastify.post('/', async (request, reply) => {
    try {
      createAssignmentSchema.parse(request.body);
      return assignmentController.crear(request, reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
      throw error;
    }
  });

  // Obtener todas las tareas
  fastify.get('/', async (request, reply) => {
    return assignmentController.obtenerTodos(request, reply);
  });

  // Obtener tareas por curso
  fastify.get('/curso/:cursoId', async (request, reply) => {
    return assignmentController.obtenerPorCurso(request, reply);
  });

  // Obtener próximas tareas del estudiante
  fastify.get('/proximas', async (request, reply) => {
    return assignmentController.obtenerProximas(request, reply);
  });

  // Obtener tarea por ID
  fastify.get('/:id', async (request, reply) => {
    return assignmentController.obtenerPorId(request, reply);
  });

  // Actualizar tarea
  fastify.put('/:id', async (request, reply) => {
    try {
      updateAssignmentSchema.parse(request.body);
      return assignmentController.actualizar(request, reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
      throw error;
    }
  });

  // Eliminar tarea
  fastify.delete('/:id', async (request, reply) => {
    return assignmentController.eliminar(request, reply);
  });

  // Publicar tarea
  fastify.post('/:id/publicar', async (request, reply) => {
    return assignmentController.publicar(request, reply);
  });

  // Entregas
  fastify.post('/entregas', async (request, reply) => {
    return assignmentController.crearEntrega(request, reply);
  });

  fastify.get('/:tareaId/entregas', async (request, reply) => {
    return assignmentController.obtenerEntregas(request, reply);
  });

  fastify.post('/entregas/:entregaId/calificar', async (request, reply) => {
    return assignmentController.calificar(request, reply);
  });

  fastify.get('/:tareaId/estadisticas', async (request, reply) => {
    return assignmentController.obtenerEstadisticas(request, reply);
  });
}
