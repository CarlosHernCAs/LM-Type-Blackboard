import { FastifyRequest, FastifyReply } from 'fastify';
import { AssignmentService } from '../services';
import { CreateAssignmentDTO, UpdateAssignmentDTO, AssignmentQuery, UserRole, CreateSubmissionDTO } from '../models';

export class AssignmentController {
  constructor(private assignmentService: AssignmentService) {}

  async crear(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const datos = request.body as CreateAssignmentDTO;

      // Solo profesores y admins pueden crear tareas
      if (usuario.role !== UserRole.TEACHER && usuario.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'Solo profesores pueden crear tareas' });
      }

      const tarea = await this.assignmentService.crear(datos);

      return reply.code(201).send(tarea);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async obtenerTodos(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as AssignmentQuery;

      const tareas = await this.assignmentService.obtenerTodos(query);

      return reply.send(tareas);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async obtenerPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      const tarea = await this.assignmentService.obtenerPorId(id);

      if (!tarea) {
        return reply.code(404).send({ error: 'Tarea no encontrada' });
      }

      return reply.send(tarea);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async actualizar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const { id } = request.params as { id: string };
      const datos = request.body as UpdateAssignmentDTO;

      // Solo profesores y admins
      if (usuario.role !== UserRole.TEACHER && usuario.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'No autorizado' });
      }

      const tarea = await this.assignmentService.actualizar(id, datos);

      return reply.send(tarea);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async eliminar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const { id } = request.params as { id: string };

      // Solo profesores y admins
      if (usuario.role !== UserRole.TEACHER && usuario.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'No autorizado' });
      }

      await this.assignmentService.eliminar(id);

      return reply.code(204).send();
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async publicar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const { id } = request.params as { id: string };

      // Solo profesores y admins
      if (usuario.role !== UserRole.TEACHER && usuario.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'No autorizado' });
      }

      const tarea = await this.assignmentService.publicar(id);

      return reply.send(tarea);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async obtenerPorCurso(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { cursoId } = request.params as { cursoId: string };

      const tareas = await this.assignmentService.obtenerPorCurso(cursoId);

      return reply.send(tareas);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async obtenerProximas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const { limite } = request.query as { limite?: number };

      const tareas = await this.assignmentService.obtenerProximas(usuario.id, limite);

      return reply.send(tareas);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  // Entregas
  async crearEntrega(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const datos = request.body as CreateSubmissionDTO;

      const entrega = await this.assignmentService.crearEntrega(usuario.id, datos);

      return reply.code(201).send(entrega);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async obtenerEntregas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const { tareaId } = request.params as { tareaId: string };

      // Solo profesores y admins pueden ver todas las entregas
      if (usuario.role !== UserRole.TEACHER && usuario.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'No autorizado' });
      }

      const entregas = await this.assignmentService.obtenerEntregas(tareaId);

      return reply.send(entregas);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async calificar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const { entregaId } = request.params as { entregaId: string };
      const { puntaje, feedback } = request.body as { puntaje: number; feedback?: string };

      // Solo profesores y admins
      if (usuario.role !== UserRole.TEACHER && usuario.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'No autorizado' });
      }

      const entrega = await this.assignmentService.calificar(entregaId, usuario.id, puntaje, feedback);

      return reply.send(entrega);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async obtenerEstadisticas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const { tareaId } = request.params as { tareaId: string };

      // Solo profesores y admins
      if (usuario.role !== UserRole.TEACHER && usuario.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'No autorizado' });
      }

      const estadisticas = await this.assignmentService.obtenerEstadisticas(tareaId);

      return reply.send(estadisticas);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }
}
