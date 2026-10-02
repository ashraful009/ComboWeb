import type { Request } from 'express';
import { AppError } from './appError';
import type { AuthUser } from '../types/auth.types';

/** Used by controllers to strictly require req.user */
export const requireUser = (req: Request): AuthUser => {
  if (!req.user) {
    throw AppError.unauthorized('User not authenticated');
  }
  return req.user;
};
