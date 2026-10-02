import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { AppError } from '../utils/appError';
import { validatedOf } from '../middlewares/validate';
import { createComboSchema, updateComboSchema } from '../validations/combo.validation';
import { ComboService } from '../services/combo.service';
import { DiscountService } from '../services/discount.service';

const comboService = new ComboService();
const discountService = new DiscountService();

export const getCombos = catchAsync(async (_req, res) => {
  // Use discount service to get dynamically priced combos
  const data = await discountService.getCombosWithDynamicPrices();
  sendResponse(res, { message: 'Combos retrieved successfully', data });
});

export const getComboById = catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user?.id; // Will be defined if authenticated
  const data = await discountService.getComboByIdWithDynamicPrices(id, userId);
  if (!data) throw new AppError('Combo not found', 404);
  sendResponse(res, { message: 'Combo retrieved successfully', data });
});

export const createCombo = catchAsync(async (req, res) => {
  const { body } = validatedOf(req, createComboSchema);
  const data = await comboService.createCombo(body);
  sendResponse(res, { statusCode: 201, message: 'Combo created successfully', data });
});

export const updateCombo = catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  const { body } = validatedOf(req, updateComboSchema);
  const data = await comboService.updateCombo(id, body);
  sendResponse(res, { message: 'Combo updated successfully', data });
});

export const deleteCombo = catchAsync(async (req, res) => {
  const id = Number(req.params.id);
  await comboService.deleteCombo(id);
  sendResponse(res, { message: 'Combo deleted successfully', data: null });
});
