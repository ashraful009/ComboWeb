import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { validatedOf } from '../middlewares/validate';
import { loginSchema, registerSchema } from '../validations/auth.validation';
import { AuthService } from '../services/auth.service';
import { requireUser } from '../utils/requireUser';

const authService = new AuthService();

export const register = catchAsync(async (req, res) => {
  const { body } = validatedOf(req, registerSchema);
  const data = await authService.register(body);
  
  // Note: For production, you might want to send refreshToken in httpOnly cookie
  sendResponse(res, {
    statusCode: 201,
    message: 'Registration successful',
    data,
  });
});

export const login = catchAsync(async (req, res) => {
  const { body } = validatedOf(req, loginSchema);
  const data = await authService.login(body);
  
  sendResponse(res, {
    message: 'Login successful',
    data,
  });
});

export const logout = catchAsync(async (req, res) => {
  const user = requireUser(req);
  await authService.logout(user.id);
  sendResponse(res, { message: 'Logged out successfully' });
});
