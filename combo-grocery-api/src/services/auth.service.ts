import { UserRepository } from '../repositories/user.repository';
import { AuthRepository } from '../repositories/auth.repository';
import { AppError } from '../utils/appError';
import { hashPassword, verifyPassword, generateTokens } from '../utils/security.util';

export class AuthService {
  private userRepo = new UserRepository();
  private authRepo = new AuthRepository();

  async register(data: any) {
    const existingUser = await this.userRepo.findByPhone(data.phone);
    if (existingUser) {
      throw AppError.conflict('Phone number already in use');
    }

    const password_hash = await hashPassword(data.password);
    const userId = await this.userRepo.create({
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      password_hash,
      role: 'customer'
    });

    const user = { id: userId, role: 'customer' as const };
    const tokens = generateTokens(user);
    
    // Refresh token expiry (7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.authRepo.saveRefreshToken(userId, tokens.refreshToken, expiresAt);

    return {
      token: tokens.accessToken,
      user: {
        id: userId,
        role_id: 3,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone
      }
    };
  }

  async login(data: any) {
    const user = await this.userRepo.findByPhone(data.phone);
    if (!user) {
      throw AppError.unauthorized('Invalid phone or password');
    }
    
    if (!user.is_active) {
      throw AppError.unauthorized('Account is suspended');
    }

    const isValid = await verifyPassword(data.password, user.password_hash);
    if (!isValid) {
      throw AppError.unauthorized('Invalid phone or password');
    }

    const authUser = { id: user.id, role: user.role };
    const tokens = generateTokens(authUser);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.authRepo.saveRefreshToken(user.id, tokens.refreshToken, expiresAt);

    return {
      token: tokens.accessToken,
      user: {
        id: user.id,
        role_id: user.role === 'admin' ? 1 : (user.role === 'staff' ? 2 : 3),
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        email: user.email
      }
    };
  }

  async logout(userId: number) {
    await this.authRepo.revokeRefreshToken(userId);
  }
}
