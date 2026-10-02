import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { validatedOf } from '../middlewares/validate';
import { createCategorySchema } from '../validations/category.validation';
import { CategoryService } from '../services/category.service';

const service = new CategoryService();

export const getAllCategories = catchAsync(async (_req, res) => {
  const data = await service.getAllCategories();
  sendResponse(res, { message: 'Categories retrieved', data });
});

export const createCategory = catchAsync(async (req, res) => {
  const { body } = validatedOf(req, createCategorySchema);
  const data = await service.createCategory(body);
  sendResponse(res, { statusCode: 201, message: 'Category created', data });
});
