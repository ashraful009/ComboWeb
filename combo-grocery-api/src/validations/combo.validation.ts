import { z } from 'zod';
import type { RequestSchema } from '../middlewares/validate';

export const createComboSchema: RequestSchema = {
  body: z.object({
    category_id: z.number().int().positive().optional(),
    name: z.string().min(2).max(150),
    slug: z.string().min(2).max(150),
    description: z.string().optional(),
    base_price_paisa: z.number().int().min(0),
    is_active: z.boolean().optional(),
    items: z.array(z.object({
      item_id: z.number().int().positive().optional(),
      name: z.string().min(1).max(150).optional(),
      quantity: z.number().positive(),
      costPerUnit: z.number().optional(),
      unit: z.string().optional(),
    }).refine(data => data.item_id !== undefined || (data.name !== undefined && data.name.trim().length > 0), {
      message: 'Either item_id or name must be provided'
    })).min(1, 'Combo must have at least one item'),
    images: z.array(z.object({
      image_url: z.string().url(),
      display_order: z.number().int().optional(),
      is_primary: z.boolean().optional(),
    })).optional(),
  }),
};

export const updateComboSchema: RequestSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID'),
  }),
  body: z.object({
    category_id: z.number().int().positive().optional(),
    name: z.string().min(2).max(150).optional(),
    slug: z.string().min(2).max(150).optional(),
    description: z.string().optional(),
    base_price_paisa: z.number().int().min(0).optional(),
    is_active: z.boolean().optional(),
    items: z.array(z.object({
      item_id: z.number().int().positive().optional(),
      name: z.string().min(1).max(150).optional(),
      quantity: z.number().positive(),
      costPerUnit: z.number().optional(),
      unit: z.string().optional(),
    }).refine(data => data.item_id !== undefined || (data.name !== undefined && data.name.trim().length > 0), {
      message: 'Either item_id or name must be provided'
    })).min(1, 'Combo must have at least one item').optional(),
    images: z.array(z.object({
      image_url: z.string().url(),
      display_order: z.number().int().optional(),
      is_primary: z.boolean().optional(),
    })).optional(),
  }),
};
