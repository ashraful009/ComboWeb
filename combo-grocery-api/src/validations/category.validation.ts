import { z } from 'zod';
import type { RequestSchema } from '../middlewares/validate';

export const createCategorySchema: RequestSchema = {
  body: z.object({
    name: z.string().min(2).max(100),
    slug: z.string().min(2).max(100),
    description: z.string().optional(),
    parent_id: z.number().int().positive().optional(),
    is_active: z.boolean().optional(),
    display_order: z.number().int().optional(),
  }),
};
