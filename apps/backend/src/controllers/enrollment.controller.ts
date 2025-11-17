import { FastifyRequest, FastifyReply } from 'fastify';
import { EnrollmentService } from '../services';
import { CreateEnrollmentDTO, UserRole } from '../models';

export class EnrollmentController {
  constructor(private enrollmentService: EnrollmentService) {}

  async enroll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const body = request.body as CreateEnrollmentDTO;

      const enrollment = await this.enrollmentService.enroll(user.id, body);

      return reply.code(201).send(enrollment);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async unenroll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { courseId } = request.params as { courseId: string };

      await this.enrollmentService.unenroll(user.id, courseId);

      return reply.code(204).send();
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async getUserEnrollments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;

      const enrollments = await this.enrollmentService.getUserEnrollments(user.id);

      return reply.send(enrollments);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async getCourseEnrollments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { courseId } = request.params as { courseId: string };

      // Only teachers and admins can view course enrollments
      if (user.role !== UserRole.TEACHER && user.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'Unauthorized' });
      }

      const enrollments = await this.enrollmentService.getCourseEnrollments(courseId);

      return reply.send(enrollments);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async updateProgress(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { courseId } = request.params as { courseId: string };
      const { progress } = request.body as { progress: number };

      const enrollment = await this.enrollmentService.updateProgress(user.id, courseId, progress);

      return reply.send(enrollment);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async getEnrollmentStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      const { courseId } = request.params as { courseId: string };

      // Only teachers and admins can view stats
      if (user.role !== UserRole.TEACHER && user.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'Unauthorized' });
      }

      const stats = await this.enrollmentService.getEnrollmentStats(courseId);

      return reply.send(stats);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }
}
