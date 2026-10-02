import { z } from 'zod';
import type { RequestSchema } from '../middlewares/validate';

export const addToCartSchema: RequestSchema = {
  body: z.object({
    combo_id: z.number().int().positive(),
    quantity: z.number().int().positive().default(1),
  }),
};

export const syncCartSchema: RequestSchema = {
  body: z.object({
    items: z.array(z.object({
      combo_id: z.number().int().positive(),
      quantity: z.number().int().positive(),
    }))
  }),
};

export const createDeliveryZoneSchema: RequestSchema = {
  body: z.object({
    name: z.string().min(2).max(100),
    base_fee_paisa: z.number().int().min(0),
    is_active: z.boolean().optional(),
    areas: z.array(z.object({
      postal_code: z.string().optional(),
      area_name: z.string().min(2).max(100),
    })).min(1),
  }),
};

export const createCouponSchema: RequestSchema = {
  body: z.object({
    code: z.string().min(3).max(50),
    discount_type: z.enum(['percentage', 'fixed']),
    discount_value: z.number().int().positive(),
    min_spend_paisa: z.number().int().min(0).optional(),
    max_cap_paisa: z.number().int().positive().optional(),
    start_date: z.string().datetime(),
    end_date: z.string().datetime(),
    usage_limit: z.number().int().positive().optional(),
    is_active: z.boolean().optional(),
  }),
};
