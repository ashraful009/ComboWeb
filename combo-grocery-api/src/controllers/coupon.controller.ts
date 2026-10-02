import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { validatedOf } from '../middlewares/validate';
import { createCouponSchema } from '../validations/cart.validation';
import { CouponService } from '../services/coupon.service';

const service = new CouponService();

export const createCoupon = catchAsync(async (req, res) => {
  const { body } = validatedOf(req, createCouponSchema);
  const data = await service.createCoupon(body);
  sendResponse(res, { statusCode: 201, message: 'Coupon created', data });
});
