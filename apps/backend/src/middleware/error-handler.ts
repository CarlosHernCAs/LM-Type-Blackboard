import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  BadRequestError,
  InternalServerError,
} from '../utils/errors';

export async function errorHandler(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log del error para debugging
  request.log.error({
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    request: {
      method: request.method,
      url: request.url,
      params: request.params,
      query: request.query,
      userId: (request.user as any)?.id,
    },
  }, 'Error en request');

  // Errores de validación Zod
  if (error instanceof ZodError) {
    return reply.code(400).send({
      error: 'Error de validación',
      detalles: error.errors.map((err) => ({
        campo: err.path.join('.'),
        mensaje: err.message,
      })),
    });
  }

  // Errores personalizados de la aplicación
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      error: error.message,
      codigo: error.code,
    });
  }

  // Error de JWT (Fastify)
  if (error.name === 'UnauthorizedError' || error.message.includes('jwt')) {
    return reply.code(401).send({
      error: 'Token inválido o expirado',
      codigo: 'TOKEN_INVALIDO',
    });
  }

  // Error de payload muy grande
  if (error.message.includes('payload') || error.message.includes('too large')) {
    return reply.code(413).send({
      error: 'Payload muy grande',
      codigo: 'PAYLOAD_GRANDE',
    });
  }

  // Error de sintaxis JSON
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return reply.code(400).send({
      error: 'JSON inválido',
      codigo: 'JSON_INVALIDO',
    });
  }

  // Error de timeout
  if (error.message.includes('timeout')) {
    return reply.code(504).send({
      error: 'Tiempo de espera agotado',
      codigo: 'TIMEOUT',
    });
  }

  // Error genérico de servidor
  return reply.code(500).send({
    error: 'Error interno del servidor',
    codigo: 'ERROR_INTERNO',
  });
}

// Manejador para rutas no encontradas
export function notFoundHandler(request: FastifyRequest, reply: FastifyReply) {
  return reply.code(404).send({
    error: 'Ruta no encontrada',
    codigo: 'RUTA_NO_ENCONTRADA',
    ruta: request.url,
    metodo: request.method,
  });
}
