import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config';
import type { AuthUser } from '../types/auth.types';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateTokens = (user: AuthUser) => {
  const payload = { id: user.id, role: user.role };
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): AuthUser => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthUser;
};
