import { Router } from 'express';
import { createCombo, getCombos, getComboById, updateCombo, deleteCombo } from '../controllers/combo.controller';
import { validate } from '../middlewares/validate';
import { createComboSchema, updateComboSchema } from '../validations/combo.validation';
import { authenticate, optionalAuthenticate } from '../middlewares/auth';

const router = Router();

// Storefront API (Public)
router.get('/', getCombos);
router.get('/:id', optionalAuthenticate, getComboById);

// Admin API
router.post('/admin', authenticate, validate(createComboSchema), createCombo);
router.put('/admin/:id', authenticate, validate(updateComboSchema), updateCombo);
router.delete('/admin/:id', authenticate, deleteCombo);

export { router as comboRouter };
