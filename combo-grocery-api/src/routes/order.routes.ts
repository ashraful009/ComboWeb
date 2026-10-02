import { Router } from 'express';
import { checkout, previewCheckout, trackOrder } from '../controllers/order.controller';
import { validate } from '../middlewares/validate';
import { checkoutSchema } from '../validations/order.validation';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/checkout', authenticate, validate(checkoutSchema), checkout);
router.post('/preview', authenticate, validate(checkoutSchema), previewCheckout);
router.get('/:orderNumber/track', authenticate, trackOrder);

export { router as orderRouter };
