import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { WalletService } from '../services/wallet.service';
import { requireUser } from '../utils/requireUser';
import { z } from 'zod';
import { validatedOf } from '../middlewares/validate';

const service = new WalletService();

export const getWallet = catchAsync(async (req, res) => {
  const user = requireUser(req);
  const data = await service.getWalletDetails(user.id);
  sendResponse(res, { message: 'Wallet retrieved', data });
});

export const distributeROI = catchAsync(async (req, res) => {
  const schema = { body: z.object({ campaign_id: z.number().int().positive() }) };
  const { body } = validatedOf(req, schema);
  
  const data = await service.distributeROI(body.campaign_id);
  sendResponse(res, { message: 'ROI successfully distributed to investor wallets', data });
});
