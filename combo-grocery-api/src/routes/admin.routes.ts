import { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth';
import { getDashboardStats, getPendingInvestors, getRecentOrders, reviewInvestment } from '../controllers/admin.controller';

const router = Router();

// All admin routes are protected by authenticate and requireAdmin middlewares
router.use(authenticate, requireAdmin);

router.get('/dashboard-stats', getDashboardStats);
router.get('/pending-investors', getPendingInvestors);
router.get('/recent-orders', getRecentOrders);
router.put('/investments/:id/review', reviewInvestment);

export default router;
