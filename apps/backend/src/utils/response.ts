import { FastifyReply } from 'fastify';

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

export interface PaginatedData<T = any> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Success response helper
export function sendSuccess<T>(
  reply: FastifyReply,
  data: T,
  message?: string,
  statusCode: number = 200
): FastifyReply {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return reply.code(statusCode).send(response);
}

// Created response helper
export function sendCreated<T>(reply: FastifyReply, data: T, message?: string): FastifyReply {
  return sendSuccess(reply, data, message, 201);
}

// No content response helper
export function sendNoContent(reply: FastifyReply): FastifyReply {
  return reply.code(204).send();
}

// Error response helper
export function sendError(
  reply: FastifyReply,
  error: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): FastifyReply {
  const response: ErrorResponse = {
    success: false,
    error,
  };

  if (code) {
    response.code = code;
  }

  if (details) {
    response.details = details;
  }

  return reply.code(statusCode).send(response);
}

// Paginated response helper
export function sendPaginated<T>(
  reply: FastifyReply,
  data: T[],
  total: number,
  page: number,
  limit: number,
  statusCode: number = 200
): FastifyReply {
  const totalPages = Math.ceil(total / limit);

  const response: PaginatedData<T> = {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };

  return reply.code(statusCode).send(response);
}

// Extract pagination params from query
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function extractPaginationParams(query: any, defaultLimit: number = 20): PaginationParams {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || defaultLimit));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}
