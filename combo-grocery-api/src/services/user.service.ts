import { UserRepository } from '../repositories/user.repository';
import type { AddressRow } from '../types/user.types';
import { withTransaction } from '../config/db';

export class UserService {
  private userRepo = new UserRepository();

  async getAddresses(userId: number) {
    return this.userRepo.getAddresses(userId);
  }

  async addAddress(userId: number, data: Partial<AddressRow>): Promise<number> {
    const addressData: Partial<AddressRow> = {
      ...data,
      user_id: userId,
    };
    return this.userRepo.addAddress(addressData);
  }

  async updateAddress(id: number, userId: number, data: Partial<AddressRow>): Promise<void> {
    await this.userRepo.updateAddress(id, userId, data);
  }

  async deleteAddress(id: number, userId: number): Promise<void> {
    await this.userRepo.deleteAddress(id, userId);
  }

  async setDefaultAddress(id: number, userId: number): Promise<void> {
    return withTransaction(async (trx) => {
      await this.userRepo.clearDefaultAddresses(userId, trx);
      await this.userRepo.setDefaultAddress(id, userId, trx);
    });
  }
}
