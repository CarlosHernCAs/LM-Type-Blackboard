import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services';
import { UpdateUserDTO, UserRole } from '../models';

export class UserController {
  constructor(private userService: UserService) {}

  async obtenerPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      const usuario = await this.userService.obtenerPorId(id);

      if (!usuario) {
        return reply.code(404).send({ error: 'Usuario no encontrado' });
      }

      return reply.send(usuario);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async obtenerTodos(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuarioActual = request.user as any;
      const { rol, activo } = request.query as { rol?: UserRole; activo?: string };

      // Solo admins pueden ver todos los usuarios
      if (usuarioActual.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'No autorizado' });
      }

      const activoBool = activo === 'true' ? true : activo === 'false' ? false : undefined;

      const usuarios = await this.userService.obtenerTodos(rol, activoBool);

      return reply.send(usuarios);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async actualizar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuarioActual = request.user as any;
      const { id } = request.params as { id: string };
      const datos = request.body as UpdateUserDTO;

      // Solo el propio usuario o admin puede actualizar
      if (usuarioActual.id !== id && usuarioActual.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'No autorizado' });
      }

      const usuario = await this.userService.actualizar(id, datos);

      return reply.send(usuario);
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async desactivar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuarioActual = request.user as any;
      const { id } = request.params as { id: string };

      // Solo admins
      if (usuarioActual.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'No autorizado' });
      }

      // No puede desactivarse a sí mismo
      if (usuarioActual.id === id) {
        return reply.code(400).send({ error: 'No puedes desactivar tu propia cuenta' });
      }

      await this.userService.desactivar(id);

      return reply.send({ mensaje: 'Usuario desactivado correctamente' });
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async activar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuarioActual = request.user as any;
      const { id } = request.params as { id: string };

      // Solo admins
      if (usuarioActual.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'No autorizado' });
      }

      await this.userService.activar(id);

      return reply.send({ mensaje: 'Usuario activado correctamente' });
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }

  async buscar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { termino } = request.query as { termino: string };

      if (!termino || termino.length < 2) {
        return reply.code(400).send({ error: 'Se requiere término de búsqueda (mínimo 2 caracteres)' });
      }

      const usuarios = await this.userService.buscar(termino);

      return reply.send(usuarios);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async obtenerEstudiantes(request: FastifyRequest, reply: FastifyReply) {
    try {
      const estudiantes = await this.userService.obtenerEstudiantes();

      return reply.send(estudiantes);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async obtenerProfesores(request: FastifyRequest, reply: FastifyReply) {
    try {
      const profesores = await this.userService.obtenerProfesores();

      return reply.send(profesores);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async obtenerPadres(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuarioActual = request.user as any;

      // Solo profesores y admins pueden ver padres
      if (usuarioActual.role !== UserRole.TEACHER && usuarioActual.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'No autorizado' });
      }

      const padres = await this.userService.obtenerPadres();

      return reply.send(padres);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async obtenerEstadisticas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuarioActual = request.user as any;

      // Solo admins
      if (usuarioActual.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'No autorizado' });
      }

      const estadisticas = await this.userService.obtenerEstadisticas();

      return reply.send(estadisticas);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async actualizarFotoPerfil(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuarioActual = request.user as any;
      const { id } = request.params as { id: string };
      const { url } = request.body as { url: string };

      // Solo el propio usuario o admin puede actualizar
      if (usuarioActual.id !== id && usuarioActual.role !== UserRole.ADMIN) {
        return reply.code(403).send({ error: 'No autorizado' });
      }

      if (!url) {
        return reply.code(400).send({ error: 'Se requiere URL de la foto' });
      }

      await this.userService.actualizarFotoPerfil(id, url);

      return reply.send({ mensaje: 'Foto de perfil actualizada correctamente' });
    } catch (error: any) {
      return reply.code(400).send({ error: error.message });
    }
  }
}
