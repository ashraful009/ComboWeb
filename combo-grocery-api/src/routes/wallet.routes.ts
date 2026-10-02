import { Router } from 'express';
import { getWallet, distributeROI } from '../controllers/wallet.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

// User
router.get('/', getWallet);

// Admin (In real app, add role checks)
router.post('/admin/distribute-roi', distributeROI);

export { router as walletRouter };
