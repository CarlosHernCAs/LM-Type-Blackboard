import { FastifyInstance } from 'fastify';
import { db } from '../config/database';
import { config } from '../config';
import { UploadController } from '../controllers';
import { UploadService } from '../services';

export default async function uploadRoutes(fastify: FastifyInstance) {
  // Configuración de S3
  const s3Config = {
    endpoint: 'http://localhost:9000',
    bucket: config.s3Bucket || 'eduverse-files',
    credentials: {
      accessKeyId: config.s3AccessKey || 'eduverse',
      secretAccessKey: config.s3SecretKey || 'eduverse123',
    },
  };

  // Inicializar servicio y controlador
  const uploadService = new UploadService(db, s3Config);
  const uploadController = new UploadController(uploadService);

  fastify.addHook('onRequest', fastify.authenticate);

  // Subir archivo
  fastify.post('/', async (request, reply) => {
    return uploadController.subirArchivo(request, reply);
  });

  // Obtener archivo por ID
  fastify.get('/:id', async (request, reply) => {
    return uploadController.obtenerArchivoPorId(request, reply);
  });

  // Obtener mis archivos
  fastify.get('/mis-archivos', async (request, reply) => {
    return uploadController.obtenerMisArchivos(request, reply);
  });

  // Generar URL de descarga
  fastify.get('/:id/descargar', async (request, reply) => {
    return uploadController.generarUrlDescarga(request, reply);
  });

  // Eliminar archivo
  fastify.delete('/:id', async (request, reply) => {
    return uploadController.eliminarArchivo(request, reply);
  });

  // Estadísticas de uso
  fastify.get('/estadisticas/uso', async (request, reply) => {
    return uploadController.obtenerEstadisticas(request, reply);
  });

  // Buscar archivos
  fastify.get('/buscar', async (request, reply) => {
    return uploadController.buscarArchivos(request, reply);
  });

  // Filtrar por tipo
  fastify.get('/tipo/:tipo', async (request, reply) => {
    return uploadController.obtenerArchivosPorTipo(request, reply);
  });
}
