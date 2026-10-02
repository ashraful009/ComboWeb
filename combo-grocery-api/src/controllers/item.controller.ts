import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { validatedOf } from '../middlewares/validate';
import { createItemSchema } from '../validations/item.validation';
import { ItemService } from '../services/item.service';

const service = new ItemService();

export const createItem = catchAsync(async (req, res) => {
  const { body } = validatedOf(req, createItemSchema);
  const data = await service.createItem(body);
  sendResponse(res, { statusCode: 201, message: 'Item created', data });
});

export const getItems = catchAsync(async (req, res) => {
  const data = await service.getItems();
  sendResponse(res, { message: 'Items fetched', data });
});
