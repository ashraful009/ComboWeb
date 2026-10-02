import { OrderRepository } from '../repositories/order.repository';
import { CartRepository } from '../repositories/cart.repository';
import { CouponRepository } from '../repositories/coupon.repository';
import { WalletRepository } from '../repositories/wallet.repository';
import { CartService } from '../services/cart.service';
import { withTransaction } from '../config/db';
import { AppError } from '../utils/appError';

export class OrderService {
  private orderRepo = new OrderRepository();
  private cartRepo = new CartRepository();
  private couponRepo = new CouponRepository();
  private walletRepo = new WalletRepository();
  private cartService = new CartService();

  async previewCheckout(userId: number, data: { address_id?: number; delivery_zone_id: number; coupon_code?: string }) {
    return withTransaction(async (trx) => {
      const cartDetails = await this.cartService.viewCart(userId);
      if (cartDetails.items.length === 0) {
        throw AppError.badRequest('Cart is empty');
      }

      // We only need to validate address_id if it's provided. If not, it means they are providing manual address, which doesn't affect price.
      if (data.address_id) {
        const address = await this.orderRepo.getAddress(data.address_id, userId, trx);
        if (!address) throw AppError.notFound('Address not found');
      }

      const zone = await this.orderRepo.getDeliveryZone(data.delivery_zone_id, trx);
      if (!zone) throw AppError.notFound('Delivery zone not found');

      let subtotal = cartDetails.subtotal_paisa;
      let couponDiscount = 0;

      if (data.coupon_code) {
        const coupon = await this.couponRepo.findByCode(data.coupon_code, trx);
        if (coupon && new Date() >= new Date(coupon.start_date) && new Date() <= new Date(coupon.end_date)) {
          if (subtotal >= coupon.min_spend_paisa) {
            if (coupon.discount_type === 'fixed') {
              couponDiscount = coupon.discount_value;
            } else {
              couponDiscount = Math.floor(subtotal * (coupon.discount_value / 100));
              if (coupon.max_cap_paisa && couponDiscount > coupon.max_cap_paisa) {
                couponDiscount = coupon.max_cap_paisa;
              }
            }
          }
        }
      }

      const totalAmount = subtotal + zone.base_fee_paisa - couponDiscount;

      return {
        subtotal_paisa: subtotal,
        delivery_fee_paisa: zone.base_fee_paisa,
        coupon_discount_paisa: couponDiscount,
        total_amount_paisa: totalAmount,
      };
    });
  }

  async checkout(userId: number, data: { street_address?: string; recipient_name?: string; recipient_phone?: string; address_id?: number; delivery_zone_id: number; coupon_code?: string; payment_method: string; idempotency_key?: string }) {
    return withTransaction(async (trx) => {
      // 1. Fetch Cart and dynamic prices
      const cartDetails = await this.cartService.viewCart(userId);
      if (cartDetails.items.length === 0) {
        throw AppError.badRequest('Cart is empty');
      }

      // 2. Validate Address & Delivery Zone
      let finalAddress = {
        street_address: data.street_address,
        recipient_name: data.recipient_name,
        recipient_phone: data.recipient_phone
      };

      if (data.address_id) {
        const address = await this.orderRepo.getAddress(data.address_id, userId, trx);
        if (!address) throw AppError.notFound('Address not found');
        finalAddress = {
          street_address: address.street_address,
          recipient_name: address.recipient_name,
          recipient_phone: address.recipient_phone
        };
      }

      const zone = await this.orderRepo.getDeliveryZone(data.delivery_zone_id, trx);
      if (!zone) throw AppError.notFound('Delivery zone not found');

      let subtotal = cartDetails.subtotal_paisa;
      let couponDiscount = 0;
      let couponId = null;

      // 3. Validate Coupon
      if (data.coupon_code) {
        const coupon = await this.couponRepo.findByCode(data.coupon_code, trx);
        if (!coupon) throw AppError.notFound('Invalid coupon code');
        if (new Date() < new Date(coupon.start_date) || new Date() > new Date(coupon.end_date)) {
          throw AppError.badRequest('Coupon expired or not active');
        }
        if (subtotal < coupon.min_spend_paisa) {
          throw AppError.badRequest(`Minimum spend of ${coupon.min_spend_paisa / 100} required`);
        }

        if (coupon.discount_type === 'fixed') {
          couponDiscount = coupon.discount_value;
        } else {
          couponDiscount = Math.floor(subtotal * (coupon.discount_value / 100));
          if (coupon.max_cap_paisa && couponDiscount > coupon.max_cap_paisa) {
            couponDiscount = coupon.max_cap_paisa;
          }
        }
        couponId = coupon.id;
      }

      // 4. Calculate Final Totals
      const totalAmount = subtotal + zone.base_fee_paisa - couponDiscount;

      // 4.5. [PHASE 4 FINTECH LOGIC] Check Wallet Balance if WALLET payment method selected
      if (data.payment_method === 'WALLET') {
        const wallet = await this.walletRepo.getWallet(userId, trx);
        if (wallet.balance_paisa < totalAmount) {
          throw AppError.badRequest('Insufficient wallet balance to cover the order total.');
        }
      }

      // 5. Create Order
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const orderId = await this.orderRepo.createOrder({
        user_id: userId,
        order_number: orderNumber,
        shipping_address: finalAddress.street_address,
        recipient_name: finalAddress.recipient_name,
        recipient_phone: finalAddress.recipient_phone,
        subtotal_paisa: subtotal,
        delivery_fee_paisa: zone.base_fee_paisa,
        coupon_discount_paisa: couponDiscount,
        total_amount_paisa: totalAmount,
        status: data.payment_method === 'WALLET' ? 'confirmed' : 'pending',
        coupon_id: couponId,
        idempotency_key: data.idempotency_key
      }, trx);

      // 6. Snapshot Order Items
      const orderItems = cartDetails.items.map(i => ({
        order_id: orderId,
        combo_id: i.combo_id,
        quantity: i.quantity,
        unit_price_paisa: i.unit_price_paisa,
        line_total_paisa: i.line_total_paisa
      }));
      await this.orderRepo.addOrderItems(orderItems, trx);
      await this.orderRepo.addStatusHistory(orderId, 'pending', trx);

      // 7. Empty Cart
      await trx.table('cart_items').where({ cart_id: cartDetails.cart_id }).delete();

      // 8. Generate Payment Record & Deduct Wallet
      await this.orderRepo.createPayment({
        purpose: 'order',
        reference_id: orderId,
        user_id: userId,
        amount_paisa: totalAmount,
        payment_method: data.payment_method,
        status: data.payment_method === 'WALLET' ? 'success' : 'pending' 
      }, trx);

      // Deduct Wallet Balance Atomically
      if (data.payment_method === 'WALLET') {
        const wallet = await this.walletRepo.getWallet(userId, trx);
        await this.walletRepo.addTransaction(
          wallet.id, 
          'purchase', 
          -totalAmount, 
          orderId, 
          `Paid for Order ${orderNumber}`, 
          trx
        );
      }

      return { orderId, orderNumber, totalAmount };
    });
  }

  async trackOrder(userId: number, orderNumber: string) {
    const orderDetails = await this.orderRepo.trackOrder(orderNumber, userId);
    if (!orderDetails) {
      throw AppError.notFound('Order not found or access denied');
    }
    return orderDetails;
  }
}
