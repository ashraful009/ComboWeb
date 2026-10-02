import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { validatedOf } from '../middlewares/validate';
import { checkoutSchema } from '../validations/order.validation';
import { OrderService } from '../services/order.service';
import { requireUser } from '../utils/requireUser';

const service = new OrderService();

export const checkout = catchAsync(async (req, res) => {
  const user = requireUser(req);
  const { body } = validatedOf(req, checkoutSchema);
  
  const data = await service.checkout(user.id, body);
  sendResponse(res, { statusCode: 201, message: 'Order placed successfully', data });
});

export const previewCheckout = catchAsync(async (req, res) => {
  const user = requireUser(req);
  const { body } = validatedOf(req, checkoutSchema);
  
  const data = await service.previewCheckout(user.id, body);
  sendResponse(res, { message: 'Checkout preview generated', data });
});

export const trackOrder = catchAsync(async (req, res) => {
  const user = requireUser(req);
  const { orderNumber } = req.params;
  
  const data = await service.trackOrder(user.id, String(orderNumber));
  sendResponse(res, { message: 'Order tracked successfully', data });
});
