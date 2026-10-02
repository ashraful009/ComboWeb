import { Router } from 'express';
import { addReview, getReviews } from '../controllers/review.controller';
import { authenticate } from '../middlewares/auth';

const router = Router({ mergeParams: true }); // Important for nested routes like /combos/:comboId/reviews

router.get('/', getReviews);
router.post('/', authenticate, addReview);

export default router;