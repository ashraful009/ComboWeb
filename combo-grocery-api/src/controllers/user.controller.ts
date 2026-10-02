import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { UserService } from '../services/user.service';
import { requireUser } from '../utils/requireUser';

const userService = new UserService();

export const getAddresses = catchAsync(async (req, res) => {
  const user = requireUser(req);
  const addresses = await userService.getAddresses(user.id);
  sendResponse(res, { message: 'Addresses fetched successfully', data: addresses });
});

export const addAddress = catchAsync(async (req, res) => {
  const user = requireUser(req);
  // Basic validation (can be replaced with joi schema later)
  const id = await userService.addAddress(user.id, req.body);
  sendResponse(res, { statusCode: 201, message: 'Address created successfully', data: { id } });
});

export const updateAddress = catchAsync(async (req, res) => {
  const user = requireUser(req);
  const id = Number(req.params.id);
  await userService.updateAddress(id, user.id, req.body);
  sendResponse(res, { message: 'Address updated successfully' });
});

export const deleteAddress = catchAsync(async (req, res) => {
  const user = requireUser(req);
  const id = Number(req.params.id);
  await userService.deleteAddress(id, user.id);
  sendResponse(res, { message: 'Address deleted successfully' });
});

export const setDefaultAddress = catchAsync(async (req, res) => {
  const user = requireUser(req);
  const id = Number(req.params.id);
  await userService.setDefaultAddress(id, user.id);
  sendResponse(res, { message: 'Default address updated successfully' });
});
