import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { validatedOf } from '../middlewares/validate';
import { createDeliveryZoneSchema } from '../validations/cart.validation';
import { DeliveryService } from '../services/delivery.service';

const service = new DeliveryService();

export const getZones = catchAsync(async (_req, res) => {
  const data = await service.getZones();
  sendResponse(res, { message: 'Delivery zones retrieved', data });
});

export const createDeliveryZone = catchAsync(async (req, res) => {
  const { body } = validatedOf(req, createDeliveryZoneSchema);
  const data = await service.createZone(body);
  sendResponse(res, { statusCode: 201, message: 'Delivery zone created', data });
});
