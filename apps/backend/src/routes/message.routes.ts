import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../config/database';
import { MessageController } from '../controllers';
import { MessageService } from '../services';
import { createMessageSchema } from '../utils/validation';

export default async function messageRoutes(fastify: FastifyInstance) {
  // Inicializar servicio y controlador
  const messageService = new MessageService(db);
  const messageController = new MessageController(messageService);

  fastify.addHook('onRequest', fastify.authenticate);

  // Enviar mensaje
  fastify.post('/', async (request, reply) => {
    try {
      createMessageSchema.parse(request.body);
      return messageController.send(request, reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
      throw error;
    }
  });

  // Obtener bandeja de entrada
  fastify.get('/bandeja', async (request, reply) => {
    return messageController.getInbox(request, reply);
  });

  // Obtener mensajes enviados
  fastify.get('/enviados', async (request, reply) => {
    return messageController.getSent(request, reply);
  });

  // Obtener conversaciones
  fastify.get('/conversaciones', async (request, reply) => {
    return messageController.getConversations(request, reply);
  });

  // Obtener conversación con usuario
  fastify.get('/conversacion/:userId', async (request, reply) => {
    return messageController.getConversationWith(request, reply);
  });

  // Marcar como leído
  fastify.put('/:id/leer', async (request, reply) => {
    return messageController.markAsRead(request, reply);
  });

  // Marcar conversación como leída
  fastify.put('/conversacion/:userId/leer', async (request, reply) => {
    return messageController.markConversationAsRead(request, reply);
  });

  // Eliminar mensaje
  fastify.delete('/:id', async (request, reply) => {
    return messageController.delete(request, reply);
  });

  // Obtener contador de no leídos
  fastify.get('/no-leidos/contador', async (request, reply) => {
    return messageController.getUnreadCount(request, reply);
  });
}
