import { z } from 'zod';
import type { RequestSchema } from '../middlewares/validate';

export const checkoutSchema: RequestSchema = {
  body: z.object({
    address_id: z.number().int().positive().optional(),
    recipient_name: z.string().optional(),
    recipient_phone: z.string().optional(),
    street_address: z.string().optional(),
    delivery_zone_id: z.number().int().positive(),
    coupon_code: z.string().optional(),
    payment_method: z.enum(['COD', 'bKash', 'Nagad', 'WALLET']), // Added WALLET
    idempotency_key: z.string().uuid().optional(),
  }).refine(data => data.address_id || (data.recipient_name && data.recipient_phone && data.street_address), {
    message: "Either address_id or (recipient_name, recipient_phone, street_address) must be provided",
    path: ["address_id"],
  }),
};
