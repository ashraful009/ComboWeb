import { Router } from 'express';
import { createDiscount } from '../controllers/discount.controller';
import { validate } from '../middlewares/validate';
import { createDiscountSchema } from '../validations/discount.validation';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/admin', authenticate, validate(createDiscountSchema), createDiscount);

export { router as discountRouter };
