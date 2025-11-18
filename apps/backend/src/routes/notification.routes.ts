import { FastifyInstance } from 'fastify';
import { db } from '../config/database';
import { NotificationController } from '../controllers';
import { NotificationService } from '../services';

export default async function notificationRoutes(fastify: FastifyInstance) {
  // Inicializar servicio y controlador
  const notificationService = new NotificationService(db);
  const notificationController = new NotificationController(notificationService);

  fastify.addHook('onRequest', fastify.authenticate);

  // Obtener mis notificaciones
  fastify.get('/', async (request, reply) => {
    return notificationController.getUserNotifications(request, reply);
  });

  // Obtener notificaciones no leídas
  fastify.get('/no-leidas', async (request, reply) => {
    return notificationController.getUnreadNotifications(request, reply);
  });

  // Obtener contador de no leídas
  fastify.get('/no-leidas/contador', async (request, reply) => {
    return notificationController.getUnreadCount(request, reply);
  });

  // Marcar como leída
  fastify.put('/:id/leer', async (request, reply) => {
    return notificationController.markAsRead(request, reply);
  });

  // Marcar todas como leídas
  fastify.put('/marcar-todas-leidas', async (request, reply) => {
    return notificationController.markAllAsRead(request, reply);
  });

  // Eliminar notificación
  fastify.delete('/:id', async (request, reply) => {
    return notificationController.delete(request, reply);
  });

  // Eliminar todas las notificaciones
  fastify.delete('/', async (request, reply) => {
    return notificationController.deleteAll(request, reply);
  });
}
