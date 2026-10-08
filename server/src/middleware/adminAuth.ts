import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.admin_token;

  if (!token) {
    return next(new AppError('UNAUTHORIZED', 401, 'Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { username: string };
    if (decoded.username !== env.ADMIN_USERNAME) {
      return next(new AppError('UNAUTHORIZED', 401, 'Invalid token'));
    }
    next();
  } catch (error) {
    return next(new AppError('UNAUTHORIZED', 401, 'Invalid or expired token'));
  }
};
