import { z } from 'zod';
import type { RequestSchema } from '../middlewares/validate';

export const createItemSchema: RequestSchema = {
  body: z.object({
    name: z.string().min(2).max(100),
    sku: z.string().min(2).max(50),
    unit_type: z.string().min(1).max(20),
    reorder_level: z.number().int().min(0).optional(),
    is_active: z.boolean().optional(),
  }),
};

export const createSupplierSchema: RequestSchema = {
  body: z.object({
    name: z.string().min(2).max(100),
    contact_person: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
  }),
};

export const createPurchaseSchema: RequestSchema = {
  body: z.object({
    supplier_id: z.number().int().positive(),
    reference_no: z.string().optional(),
    purchase_date: z.string().datetime(),
    items: z.array(z.object({
      item_id: z.number().int().positive(),
      qty: z.number().int().positive(),
      unit_cost_paisa: z.number().int().positive(),
    })).min(1),
  }),
};
