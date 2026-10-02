import { Router } from 'express';
import { createCoupon } from '../controllers/coupon.controller';
import { validate } from '../middlewares/validate';
import { createCouponSchema } from '../validations/cart.validation';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/admin', authenticate, validate(createCouponSchema), createCoupon);

export { router as couponRouter };
