import { Router } from 'express';
import { createItem, getItems } from '../controllers/item.controller';
import { createSupplier } from '../controllers/supplier.controller';
import { recordPurchase } from '../controllers/inventory.controller';
import { validate } from '../middlewares/validate';
import { createItemSchema, createSupplierSchema, createPurchaseSchema } from '../validations/item.validation';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, getItems);
// In real app, these would be split or placed under /admin/items, /admin/suppliers, etc.
router.post('/', authenticate, validate(createItemSchema), createItem);
router.post('/suppliers', authenticate, validate(createSupplierSchema), createSupplier);
router.post('/purchases', authenticate, validate(createPurchaseSchema), recordPurchase);

export { router as itemRouter };
