import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { validatedOf } from '../middlewares/validate';
import { createDiscountSchema } from '../validations/discount.validation';
import { DiscountService } from '../services/discount.service';

const service = new DiscountService();

export const createDiscount = catchAsync(async (req, res) => {
  const { body } = validatedOf(req, createDiscountSchema);
  const data = await service.createDiscount(body);
  sendResponse(res, { statusCode: 201, message: 'Discount created successfully', data });
});
