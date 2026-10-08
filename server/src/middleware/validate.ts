import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';
import { AppError } from '../utils/AppError';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError || (error as Error).name === 'ZodError') {
        const fieldErrors: Record<string, string> = {};
        const zodErr = error as ZodError;
        zodErr.errors.forEach((err: ZodIssue) => {
          if (err.path.length > 0) {
            fieldErrors[err.path.join('.')] = err.message;
          }
        });
        next(new AppError('VALIDATION_ERROR', 400, 'Invalid request data', fieldErrors));
      } else {
        next(error);
      }
    }
  };
};
