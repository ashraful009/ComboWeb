import type { FieldError } from '../types/common.types';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: FieldError[];
  public readonly isOperational = true;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    details?: FieldError[],
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code = 'BAD_REQUEST'): AppError {
    return new AppError(message, 400, code);
  }
  static unauthorized(
    message = 'Authentication required',
    code = 'UNAUTHORIZED',
  ): AppError {
    return new AppError(message, 401, code);
  }
  static forbidden(message = 'You do not have permission', code = 'FORBIDDEN'): AppError {
    return new AppError(message, 403, code);
  }
  static notFound(message = 'Resource not found', code = 'NOT_FOUND'): AppError {
    return new AppError(message, 404, code);
  }
  static conflict(message: string, code = 'CONFLICT'): AppError {
    return new AppError(message, 409, code);
  }
  static unprocessable(
    message: string,
    code = 'UNPROCESSABLE',
    details?: FieldError[],
  ): AppError {
    return new AppError(message, 422, code, details);
  }
}
