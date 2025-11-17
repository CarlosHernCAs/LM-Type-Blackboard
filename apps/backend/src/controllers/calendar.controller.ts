import { FastifyRequest, FastifyReply } from 'fastify';
import { CalendarService } from '../services';
import { CreateCalendarEventDTO, CalendarQuery } from '../models';

export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const body = request.body as CreateCalendarEventDTO;

      const event = await this.calendarService.create(user.id, body);

      return reply.code(201).send(event);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async findById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      const event = await this.calendarService.findById(id);

      if (!event) {
        return reply.code(404).send({ error: 'Event not found' });
      }

      return reply.send(event);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async getUserEvents(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const query = request.query as CalendarQuery;

      const events = await this.calendarService.getUserEvents(user.id, query);

      return reply.send(events);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { id } = request.params as { id: string };
      const body = request.body as Partial<CreateCalendarEventDTO>;

      const event = await this.calendarService.update(id, user.id, body);

      return reply.send(event);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { id } = request.params as { id: string };

      await this.calendarService.delete(id, user.id);

      return reply.code(204).send();
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async getCourseEvents(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { courseId } = request.params as { courseId: string };

      const events = await this.calendarService.getCourseEvents(courseId);

      return reply.send(events);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async getUpcomingEvents(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { limit } = request.query as { limit?: number };

      const events = await this.calendarService.getUpcomingEvents(user.id, limit);

      return reply.send(events);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }
}
