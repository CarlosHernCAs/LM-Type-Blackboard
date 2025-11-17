import { FastifyRequest, FastifyReply } from 'fastify';
import { MessageService } from '../services';
import { CreateMessageDTO } from '../models';

export class MessageController {
  constructor(private messageService: MessageService) {}

  async send(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const body = request.body as CreateMessageDTO;

      const message = await this.messageService.send(user.id, body);

      // Emit WebSocket event if available
      if (request.server.io) {
        request.server.io.to(`user-${body.recipientId}`).emit('new-message', message);
      }

      return reply.code(201).send(message);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async getInbox(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;

      const messages = await this.messageService.getInbox(user.id);

      return reply.send(messages);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async getSent(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;

      const messages = await this.messageService.getSent(user.id);

      return reply.send(messages);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async getConversations(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;

      const conversations = await this.messageService.getConversations(user.id);

      return reply.send(conversations);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async getConversationWith(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { userId } = request.params as { userId: string };

      const messages = await this.messageService.getConversationWith(user.id, userId);

      return reply.send(messages);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async markAsRead(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { id } = request.params as { id: string };

      await this.messageService.markAsRead(id, user.id);

      return reply.send({ message: 'Marked as read' });
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async markConversationAsRead(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { userId } = request.params as { userId: string };

      await this.messageService.markConversationAsRead(user.id, userId);

      return reply.send({ message: 'Conversation marked as read' });
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { id } = request.params as { id: string };

      await this.messageService.delete(id, user.id);

      return reply.code(204).send();
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async getUnreadCount(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;

      const count = await this.messageService.getUnreadCount(user.id);

      return reply.send({ count });
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }
}
