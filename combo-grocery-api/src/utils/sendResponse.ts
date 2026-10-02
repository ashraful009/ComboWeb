import type { Response } from 'express';
import type { PaginationMeta } from '../types/common.types';

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T | null;
  meta?: PaginationMeta;
}

interface SendResponseOptions<T> {
  statusCode?: number;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}

export const sendResponse = <T>(
  res: Response,
  { statusCode = 200, message, data, meta }: SendResponseOptions<T>,
): void => {
  const body: ApiSuccess<T> = {
    success: true,
    message,
    data: data ?? null,
    ...(meta ? { meta } : {}),
  };
  res.status(statusCode).json(body);
};
