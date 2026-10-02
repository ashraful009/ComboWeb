import { CouponRepository } from '../repositories/coupon.repository';

export class CouponService {
  private repo = new CouponRepository();

  async createCoupon(data: any) {
    const id = await this.repo.createCoupon({
      ...data,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date)
    });
    return { id, ...data };
  }
}
