import { FastifyRequest, FastifyReply } from 'fastify';
import { CourseService } from '../services';
import { CreateCourseDTO, UpdateCourseDTO, CourseQuery, UserRole } from '../models';

export class CourseController {
  constructor(private courseService: CourseService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const body = request.body as CreateCourseDTO;

      // Only teachers and admins can create courses
      if (user.role !== UserRole.TEACHER && user.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'Only teachers can create courses' });
      }

      const course = await this.courseService.create(user.id, body);

      return reply.code(201).send(course);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as CourseQuery;

      const result = await this.courseService.findAll(query);

      return reply.send(result);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async findById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      const course = await this.courseService.findById(id);

      if (!course) {
        return reply.code(404).send({ error: 'Course not found' });
      }

      return reply.send(course);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { id } = request.params as { id: string };
      const body = request.body as UpdateCourseDTO;

      // Check if user owns the course or is admin
      const course = await this.courseService.findById(id);
      if (!course) {
        return reply.code(404).send({ error: 'Course not found' });
      }

      if (course.teacher_id !== user.id && user.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'Unauthorized' });
      }

      const updated = await this.courseService.update(id, body);

      return reply.send(updated);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { id } = request.params as { id: string };

      // Check if user owns the course or is admin
      const course = await this.courseService.findById(id);
      if (!course) {
        return reply.code(404).send({ error: 'Course not found' });
      }

      if (course.teacher_id !== user.id && user.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'Unauthorized' });
      }

      await this.courseService.delete(id);

      return reply.code(204).send();
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async getStudentCourses(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;

      const courses = await this.courseService.getStudentCourses(user.id);

      return reply.send(courses);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async getTeacherCourses(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;

      const courses = await this.courseService.getTeacherCourses(user.id);

      return reply.send(courses);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async publish(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { id } = request.params as { id: string };

      // Check ownership
      const course = await this.courseService.findById(id);
      if (!course) {
        return reply.code(404).send({ error: 'Course not found' });
      }

      if (course.teacher_id !== user.id && user.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'Unauthorized' });
      }

      const updated = await this.courseService.publish(id);

      return reply.send(updated);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async archive(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { id } = request.params as { id: string };

      // Check ownership
      const course = await this.courseService.findById(id);
      if (!course) {
        return reply.code(404).send({ error: 'Course not found' });
      }

      if (course.teacher_id !== user.id && user.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'Unauthorized' });
      }

      const updated = await this.courseService.archive(id);

      return reply.send(updated);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }
}
