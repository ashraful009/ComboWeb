import { z } from 'zod';
import type { RequestSchema } from '../middlewares/validate';

export const createDiscountSchema: RequestSchema = {
  body: z.object({
    name: z.string().min(2).max(150),
    discount_type: z.enum(['percentage', 'fixed']),
    discount_value: z.number().int().positive(),
    max_cap_paisa: z.number().int().positive().optional(),
    start_date: z.string().datetime(),
    end_date: z.string().datetime(),
    target_type: z.enum(['global', 'category', 'combo']),
    target_id: z.number().int().positive().optional(),
    is_active: z.boolean().optional(),
  }).refine(data => {
    if (data.target_type !== 'global' && !data.target_id) return false;
    return true;
  }, { message: "target_id is required unless target_type is global", path: ['target_id'] }),
};
