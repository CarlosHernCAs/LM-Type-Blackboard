import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../config/database';
import { UserController } from '../controllers';
import { UserService } from '../services';

export default async function userRoutes(fastify: FastifyInstance) {
  // Inicializar servicio y controlador
  const userService = new UserService(db);
  const userController = new UserController(userService);

  fastify.addHook('onRequest', fastify.authenticate);

  // Obtener todos los usuarios (admin)
  fastify.get('/', async (request, reply) => {
    return userController.obtenerTodos(request, reply);
  });

  // Obtener usuario por ID
  fastify.get('/:id', async (request, reply) => {
    return userController.obtenerPorId(request, reply);
  });

  // Actualizar usuario
  fastify.put('/:id', async (request, reply) => {
    return userController.actualizar(request, reply);
  });

  // Desactivar usuario
  fastify.post('/:id/desactivar', async (request, reply) => {
    return userController.desactivar(request, reply);
  });

  // Activar usuario
  fastify.post('/:id/activar', async (request, reply) => {
    return userController.activar(request, reply);
  });

  // Buscar usuarios
  fastify.get('/buscar', async (request, reply) => {
    return userController.buscar(request, reply);
  });

  // Obtener estudiantes
  fastify.get('/rol/estudiantes', async (request, reply) => {
    return userController.obtenerEstudiantes(request, reply);
  });

  // Obtener profesores
  fastify.get('/rol/profesores', async (request, reply) => {
    return userController.obtenerProfesores(request, reply);
  });

  // Obtener padres
  fastify.get('/rol/padres', async (request, reply) => {
    return userController.obtenerPadres(request, reply);
  });

  // Obtener estadísticas
  fastify.get('/estadisticas/general', async (request, reply) => {
    return userController.obtenerEstadisticas(request, reply);
  });

  // Actualizar foto de perfil
  fastify.put('/:id/foto-perfil', async (request, reply) => {
    return userController.actualizarFotoPerfil(request, reply);
  });
}
