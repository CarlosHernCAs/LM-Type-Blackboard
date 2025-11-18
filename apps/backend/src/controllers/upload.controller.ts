import { FastifyRequest, FastifyReply } from 'fastify';
import { UploadService } from '../services';
import { UserRole } from '../models';

export class UploadController {
  constructor(private uploadService: UploadService) {}

  async subirArchivo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const data = await request.file();

      if (!data) {
        return reply.code(400).send({ error: 'No se proporcionó archivo' });
      }

      const buffer = await data.toBuffer();
      const mimeType = data.mimetype;
      const nombreOriginal = data.filename;

      // Validar tamaño (10MB)
      if (!this.uploadService.validarTamano(buffer.length)) {
        return reply.code(400).send({ error: 'Archivo muy grande (máximo 10MB)' });
      }

      // Validar tipo
      const tiposPermitidos = ['image/', 'application/pdf', 'application/msword', 'application/vnd', 'text/'];
      if (!this.uploadService.validarTipo(mimeType, tiposPermitidos)) {
        return reply.code(400).send({ error: 'Tipo de archivo no permitido' });
      }

      const archivo = await this.uploadService.subirArchivo(
        usuario.id,
        buffer,
        nombreOriginal,
        mimeType
      );

      return reply.code(201).send(archivo);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async obtenerArchivoPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      const archivo = await this.uploadService.obtenerArchivoPorId(id);

      if (!archivo) {
        return reply.code(404).send({ error: 'Archivo no encontrado' });
      }

      return reply.send(archivo);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async obtenerMisArchivos(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;

      const archivos = await this.uploadService.obtenerArchivosPorUsuario(usuario.id);

      return reply.send(archivos);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async generarUrlDescarga(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      const archivo = await this.uploadService.obtenerArchivoPorId(id);

      if (!archivo) {
        return reply.code(404).send({ error: 'Archivo no encontrado' });
      }

      const url = await this.uploadService.generarUrlDescarga(archivo);

      return reply.send({ url });
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async eliminarArchivo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const { id } = request.params as { id: string };

      const esAdmin = usuario.role === UserRole.ADMIN;

      await this.uploadService.eliminarArchivo(id, usuario.id, esAdmin);

      return reply.code(204).send();
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async obtenerEstadisticas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;

      const estadisticas = await this.uploadService.obtenerEstadisticas(usuario.id);

      // Formatear tamaño
      if (estadisticas && estadisticas.espacio_total_usado) {
        estadisticas.espacio_formateado = this.uploadService.formatearTamano(
          parseInt(estadisticas.espacio_total_usado)
        );
      }

      return reply.send(estadisticas);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async buscarArchivos(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const { termino } = request.query as { termino: string };

      if (!termino) {
        return reply.code(400).send({ error: 'Se requiere término de búsqueda' });
      }

      const archivos = await this.uploadService.buscarArchivos(usuario.id, termino);

      return reply.send(archivos);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }

  async obtenerArchivosPorTipo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = request.user as any;
      const { tipo } = request.query as { tipo: string };

      if (!tipo) {
        return reply.code(400).send({ error: 'Se requiere tipo MIME' });
      }

      const archivos = await this.uploadService.obtenerArchivosPorTipo(usuario.id, tipo);

      return reply.send(archivos);
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  }
}
