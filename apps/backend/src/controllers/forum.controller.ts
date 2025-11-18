import { FastifyRequest, FastifyReply } from 'fastify';
import { ForumService } from '../services';
import { CreateForumDTO, CreateForumPostDTO, UserRole } from '../models';

export class ForumController {
  constructor(private forumService: ForumService) {}

  async crearForo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const datos = request.body as CreateForumDTO;

      // Solo profesores y admins pueden crear foros
      if (usuario.role !== UserRole.TEACHER && usuario.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'Solo profesores pueden crear foros' });
      }

      const foro = await this.forumService.crearForo(datos);

      return reply.code(201).send(foro);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async obtenerForoPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      const foro = await this.forumService.obtenerForoPorId(id);

      if (!foro) {
        return reply.code(404).send({ error: 'Foro no encontrado' });
      }

      return reply.send(foro);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async obtenerForosPorCurso(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { cursoId } = request.params as { cursoId: string };

      const foros = await this.forumService.obtenerForosPorCurso(cursoId);

      return reply.send(foros);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async actualizarForo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const { id } = request.params as { id: string };
      const { titulo, descripcion } = request.body as { titulo?: string; descripcion?: string };

      // Solo profesores y admins
      if (usuario.role !== UserRole.TEACHER && usuario.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'No autorizado' });
      }

      const foro = await this.forumService.actualizarForo(id, titulo, descripcion);

      return reply.send(foro);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async bloquearForo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const { id } = request.params as { id: string };

      // Solo profesores y admins
      if (usuario.role !== UserRole.TEACHER && usuario.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'No autorizado' });
      }

      const foro = await this.forumService.bloquearForo(id);

      return reply.send(foro);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async desbloquearForo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const { id } = request.params as { id: string };

      // Solo profesores y admins
      if (usuario.role !== UserRole.TEACHER && usuario.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'No autorizado' });
      }

      const foro = await this.forumService.desbloquearForo(id);

      return reply.send(foro);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async eliminarForo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const { id } = request.params as { id: string };

      // Solo profesores y admins
      if (usuario.role !== UserRole.TEACHER && usuario.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'No autorizado' });
      }

      await this.forumService.eliminarForo(id);

      return reply.code(204).send();
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  // Publicaciones
  async crearPublicacion(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const datos = request.body as CreateForumPostDTO;

      const publicacion = await this.forumService.crearPublicacion(usuario.id, datos);

      return reply.code(201).send(publicacion);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async obtenerPublicaciones(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { foroId } = request.params as { foroId: string };

      const publicaciones = await this.forumService.obtenerPublicaciones(foroId);

      return reply.send(publicaciones);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async obtenerRespuestas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { publicacionId } = request.params as { publicacionId: string };

      const respuestas = await this.forumService.obtenerRespuestas(publicacionId);

      return reply.send(respuestas);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async obtenerPublicacionPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      const publicacion = await this.forumService.obtenerPublicacionPorId(id);

      if (!publicacion) {
        return reply.code(404).send({ error: 'Publicación no encontrada' });
      }

      return reply.send(publicacion);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async actualizarPublicacion(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const { id } = request.params as { id: string };
      const { contenido } = request.body as { contenido: string };

      const publicacion = await this.forumService.actualizarPublicacion(id, usuario.id, contenido);

      return reply.send(publicacion);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async fijarPublicacion(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const { id } = request.params as { id: string };

      // Solo profesores y admins
      if (usuario.role !== UserRole.TEACHER && usuario.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'No autorizado' });
      }

      const publicacion = await this.forumService.fijarPublicacion(id);

      return reply.send(publicacion);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async desfijarPublicacion(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const { id } = request.params as { id: string };

      // Solo profesores y admins
      if (usuario.role !== UserRole.TEACHER && usuario.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'No autorizado' });
      }

      const publicacion = await this.forumService.desfijarPublicacion(id);

      return reply.send(publicacion);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async eliminarPublicacion(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const { id } = request.params as { id: string };

      const esAdmin = usuario.role === UserRole.ADMIN || usuario.role === UserRole.TEACHER;

      await this.forumService.eliminarPublicacion(id, usuario.id, esAdmin);

      return reply.code(204).send();
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async buscarPublicaciones(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { foroId } = request.params as { foroId: string };
      const { termino } = request.query as { termino: string };

      if (!termino) {
        return reply.code(400).send({ error: 'Se requiere término de búsqueda' });
      }

      const publicaciones = await this.forumService.buscarPublicaciones(foroId, termino);

      return reply.send(publicaciones);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }
}
