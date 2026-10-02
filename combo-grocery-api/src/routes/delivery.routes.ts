import { Router } from 'express';
import { createDeliveryZone, getZones } from '../controllers/delivery.controller';
import { validate } from '../middlewares/validate';
import { createDeliveryZoneSchema } from '../validations/cart.validation';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/zones', getZones);
router.post('/admin/zones', authenticate, validate(createDeliveryZoneSchema), createDeliveryZone);

export { router as deliveryRouter };
