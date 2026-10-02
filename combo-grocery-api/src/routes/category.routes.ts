import { Router } from 'express';
import { createCategory, getAllCategories } from '../controllers/category.controller';
import { validate } from '../middlewares/validate';
import { createCategorySchema } from '../validations/category.validation';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', getAllCategories);
router.post('/', authenticate, validate(createCategorySchema), createCategory); // Assume staff check needed later

export { router as categoryRouter };
