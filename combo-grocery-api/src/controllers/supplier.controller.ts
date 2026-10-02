import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { validatedOf } from '../middlewares/validate';
import { createSupplierSchema } from '../validations/item.validation';
import { ItemService } from '../services/item.service';

const service = new ItemService();

export const createSupplier = catchAsync(async (req, res) => {
  const { body } = validatedOf(req, createSupplierSchema);
  const data = await service.createSupplier(body);
  sendResponse(res, { statusCode: 201, message: 'Supplier created', data });
});
