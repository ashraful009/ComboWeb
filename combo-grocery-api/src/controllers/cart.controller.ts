import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { validatedOf } from '../middlewares/validate';
import { addToCartSchema } from '../validations/cart.validation';
import { CartService } from '../services/cart.service';
import { requireUser } from '../utils/requireUser';

const service = new CartService();

export const viewCart = catchAsync(async (req, res) => {
  const user = requireUser(req);
  const data = await service.viewCart(user.id);
  sendResponse(res, { message: 'Cart retrieved', data });
});

export const addToCart = catchAsync(async (req, res) => {
  const user = requireUser(req);
  const { body } = validatedOf(req, addToCartSchema);
  const data = await service.addToCart(user.id, body);
  sendResponse(res, { message: 'Added to cart', data });
});

export const syncCart = catchAsync(async (req, res) => {
  const user = requireUser(req);
  const { items } = req.body;
  const data = await service.syncCart(user.id, items);
  sendResponse(res, { message: 'Cart synced', data });
});
