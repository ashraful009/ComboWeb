import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { validatedOf } from '../middlewares/validate';
import { createPurchaseSchema } from '../validations/item.validation';
import { InventoryService } from '../services/inventory.service';
import { requireUser } from '../utils/requireUser';

const service = new InventoryService();

export const recordPurchase = catchAsync(async (req, res) => {
  const user = requireUser(req);
  const { body } = validatedOf(req, createPurchaseSchema);
  
  const data = await service.recordPurchase(body, user.id);
  sendResponse(res, { statusCode: 201, message: 'Purchase recorded and stock updated', data });
});
