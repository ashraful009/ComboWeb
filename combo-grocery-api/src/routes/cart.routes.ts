import { Router } from 'express';
import { addToCart, viewCart, syncCart } from '../controllers/cart.controller';
import { validate } from '../middlewares/validate';
import { addToCartSchema, syncCartSchema } from '../validations/cart.validation';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate); // Cart requires authentication
router.get('/', viewCart);
router.post('/items', validate(addToCartSchema), addToCart);
router.post('/sync', validate(syncCartSchema), syncCart);

export { router as cartRouter };
