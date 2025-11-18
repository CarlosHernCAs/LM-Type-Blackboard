import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../config/database';
import { CalendarController } from '../controllers';
import { CalendarService } from '../services';
import { createCalendarEventSchema, updateCalendarEventSchema } from '../utils/validation';

export default async function calendarRoutes(fastify: FastifyInstance) {
  // Inicializar servicio y controlador
  const calendarService = new CalendarService(db);
  const calendarController = new CalendarController(calendarService);

  fastify.addHook('onRequest', fastify.authenticate);

  // Crear evento
  fastify.post('/', async (request, reply) => {
    try {
      createCalendarEventSchema.parse(request.body);
      return calendarController.create(request, reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
      throw error;
    }
  });

  // Obtener mis eventos
  fastify.get('/', async (request, reply) => {
    return calendarController.getUserEvents(request, reply);
  });

  // Obtener próximos eventos
  fastify.get('/proximos', async (request, reply) => {
    return calendarController.getUpcomingEvents(request, reply);
  });

  // Obtener eventos de un curso
  fastify.get('/curso/:courseId', async (request, reply) => {
    return calendarController.getCourseEvents(request, reply);
  });

  // Obtener evento por ID
  fastify.get('/:id', async (request, reply) => {
    return calendarController.findById(request, reply);
  });

  // Actualizar evento
  fastify.put('/:id', async (request, reply) => {
    try {
      updateCalendarEventSchema.parse(request.body);
      return calendarController.update(request, reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
      throw error;
    }
  });

  // Eliminar evento
  fastify.delete('/:id', async (request, reply) => {
    return calendarController.delete(request, reply);
  });
}
