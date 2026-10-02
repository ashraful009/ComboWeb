import { z } from 'zod';
import type { RequestSchema } from '../middlewares/validate';

export const registerSchema: RequestSchema = {
  body: z.object({
    first_name: z.string().min(2).max(100),
    last_name: z.string().min(2).max(100),
    phone: z.string().min(11).max(15),
    password: z.string().min(6),
  }),
};

export const loginSchema: RequestSchema = {
  body: z.object({
    phone: z.string().min(11).max(15),
    password: z.string(),
  }),
};
