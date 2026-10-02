import type { RequestHandler } from 'express';
import { AppError } from '../utils/appError';
import { verifyAccessToken } from '../utils/security.util';

export const authenticate: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(AppError.unauthorized('No token provided'));
  }

  const token = authHeader.split(' ')[1];
  if (!token) return next(AppError.unauthorized('No token provided'));

  try {
    const user = verifyAccessToken(token);
    req.user = user;
    next();
  } catch (err) {
    next(err); // Hands to global error handler
  }
};

export const optionalAuthenticate: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) return next();

  try {
    const user = verifyAccessToken(token);
    req.user = user;
  } catch (err) {
    // Ignore invalid tokens for optional auth
  }
  next();
};
export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (req.user?.role !== 'admin') {
    return next(AppError.forbidden('Admin access required'));
  }
  next();
};
