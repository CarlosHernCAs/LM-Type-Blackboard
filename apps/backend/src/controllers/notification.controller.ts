import { FastifyRequest, FastifyReply } from 'fastify';
import { NotificationService } from '../services';

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  async getUserNotifications(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { limit } = request.query as { limit?: number };

      const notifications = await this.notificationService.getUserNotifications(user.id, limit);

      return reply.send(notifications);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async getUnreadNotifications(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;

      const notifications = await this.notificationService.getUnreadNotifications(user.id);

      return reply.send(notifications);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async getUnreadCount(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;

      const count = await this.notificationService.getUnreadCount(user.id);

      return reply.send({ count });
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async markAsRead(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { id } = request.params as { id: string };

      await this.notificationService.markAsRead(id, user.id);

      return reply.send({ message: 'Marked as read' });
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async markAllAsRead(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;

      await this.notificationService.markAllAsRead(user.id);

      return reply.send({ message: 'All notifications marked as read' });
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { id } = request.params as { id: string };

      await this.notificationService.delete(id, user.id);

      return reply.code(204).send();
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async deleteAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;

      await this.notificationService.deleteAll(user.id);

      return reply.send({ message: 'All notifications deleted' });
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }
}
