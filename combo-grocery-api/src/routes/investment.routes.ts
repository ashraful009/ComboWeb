import { Router } from 'express';
import { createCampaign, getActiveCampaigns, invest, getMyInvestments, getMyPayments, getMySavings } from '../controllers/investment.controller';
import { validate } from '../middlewares/validate';
import { createCampaignSchema, createInvestmentSchema } from '../validations/investment.validation';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Public
router.get('/campaigns', getActiveCampaigns);

// User
router.get('/me', authenticate, getMyInvestments);
router.get('/me/payments', authenticate, getMyPayments);
router.get('/me/savings', authenticate, getMySavings);
router.post('/', authenticate, validate(createInvestmentSchema), invest);

// Admin
router.post('/admin/campaigns', authenticate, validate(createCampaignSchema), createCampaign);

export { router as investmentRouter };
