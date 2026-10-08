import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]:', err);

  if (err instanceof AppError) {
    return res.status(err.httpStatus).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        fieldErrors: err.fieldErrors,
      },
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
    },
  });
};
