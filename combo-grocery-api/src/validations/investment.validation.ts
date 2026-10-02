import { z } from 'zod';
import type { RequestSchema } from '../middlewares/validate';

export const createCampaignSchema: RequestSchema = {
  body: z.object({
    title: z.string().min(5).max(150),
    description: z.string().min(10),
    target_amount_paisa: z.number().int().positive(),
    min_investment_paisa: z.number().int().positive(),
    roi_percentage: z.number().positive().max(100),
    duration_months: z.number().int().positive(),
    start_date: z.string().datetime(),
    end_date: z.string().datetime(),
  }),
};

export const createInvestmentSchema: RequestSchema = {
  body: z.object({
    campaign_id: z.number().int().positive(),
    amount_paisa: z.number().int().positive(),
    payment_method: z.enum(['bKash', 'Nagad', 'BankTransfer']), // COD is not allowed for investments
  }),
};
