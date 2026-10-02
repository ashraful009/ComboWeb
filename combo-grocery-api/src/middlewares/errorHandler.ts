import type { ErrorRequestHandler, RequestHandler } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ZodError } from 'zod';
import { env } from '../config';
import type { FieldError } from '../types/common.types';
import { AppError } from '../utils/appError';

interface NormalizedError {
  statusCode: number;
  code: string;
  message: string;
  errors?: FieldError[];
}

interface ErrorBody {
  success: false;
  code: string;
  message: string;
  errors?: FieldError[];
  stack?: string;
}

interface MysqlError extends Error {
  code: string;
  errno: number;
}

const isMysqlError = (e: unknown): e is MysqlError =>
  e instanceof Error && 'code' in e && typeof e.code === 'string' && 'errno' in e;

const isBodyParseError = (e: unknown): boolean =>
  e instanceof SyntaxError && 'status' in e && (e as any).status === 400;

const normalizeError = (err: unknown): NormalizedError => {
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      errors: err.details,
    };
  }
  if (err instanceof ZodError) {
    const errors = err.issues.map((i) => ({
      field: i.path.map(String).join('.'),
      message: i.message,
    }));
    return {
      statusCode: 422,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors,
    };
  }
  if (err instanceof TokenExpiredError) {
    return { statusCode: 401, code: 'TOKEN_EXPIRED', message: 'Access token expired' };
  }
  if (err instanceof JsonWebTokenError) {
    return { statusCode: 401, code: 'INVALID_TOKEN', message: 'Invalid access token' };
  }
  if (isBodyParseError(err)) {
    return { statusCode: 400, code: 'INVALID_JSON', message: 'Malformed JSON body' };
  }
  if (isMysqlError(err)) {
    switch (err.errno) {
      case 1062: // ER_DUP_ENTRY
        return {
          statusCode: 409,
          code: 'DUPLICATE_ENTRY',
          message: 'Record already exists',
        };
      case 1451: // ER_ROW_IS_REFERENCED
        return { statusCode: 409, code: 'IN_USE', message: 'Record is used by other data' };
      case 1452: // ER_NO_REFERENCED_ROW
        return {
          statusCode: 400,
          code: 'INVALID_REFERENCE',
          message: 'Related record not found',
        };
      case 1213: // ER_LOCK_DEADLOCK
        return {
          statusCode: 503,
          code: 'RETRY_LATER',
          message: 'Please retry the request',
        };
      default:
        break;
    }
  }
  return { statusCode: 500, code: 'INTERNAL_ERROR', message: 'Something went wrong' };
};

export const notFoundHandler: RequestHandler = (req, _res, next): void => {
  next(
    AppError.notFound(
      `Route ${req.method} ${req.originalUrl} not found`,
      'ROUTE_NOT_FOUND',
    ),
  );
};

/** Global error handler: the ONLY place that writes error responses. */
export const errorHandler: ErrorRequestHandler = (err: unknown, req, res, _next): void => {
  const normalized = normalizeError(err);

  if (normalized.statusCode >= 500) {
    console.error(`[${req.method}] ${req.originalUrl}`, err);
  }

  const body: ErrorBody = {
    success: false,
    code: normalized.code,
    message: normalized.message,
    ...(normalized.errors ? { errors: normalized.errors } : {}),
    ...(env.NODE_ENV !== 'production' && err instanceof Error ? { stack: err.stack } : {}),
  };
  res.status(normalized.statusCode).json(body);
};
