import { Coupon, QuoteResponse, Settings } from '@freshagro/shared';
import { isBefore, isAfter } from 'date-fns';

export interface PricingComboInput {
  comboId: number;
  quantity: number;
  marketPrice: number;
  unitPrice: number;
}

export const calculatePricing = (
  items: PricingComboInput[],
  deliveryZone: 'inside_dhaka' | 'outside_dhaka',
  settings: Settings,
  coupon?: Coupon | null,
  now: Date = new Date()
): QuoteResponse => {
  const lines = items.map(item => ({
    comboId: item.comboId,
    quantity: item.quantity,
    marketPrice: item.marketPrice,
    unitPrice: item.unitPrice,
    lineTotal: item.unitPrice * item.quantity,
  }));

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  // Delivery charge calculation
  let deliveryCharge = 0;
  const freeDeliveryRemaining = Math.max(0, settings.free_delivery_min_amount - subtotal);

  if (subtotal < settings.free_delivery_min_amount) {
    deliveryCharge = deliveryZone === 'inside_dhaka'
      ? settings.delivery_charge_inside_dhaka
      : settings.delivery_charge_outside_dhaka;
  }

  // Coupon calculation
  let discountAmount = 0;
  let appliedCoupon: string | undefined = undefined;
  let couponError: string | undefined = undefined;

  if (coupon) {
    if (!coupon.is_active) {
      couponError = 'COUPON_INACTIVE';
    } else if (coupon.starts_at && isBefore(now, new Date(coupon.starts_at))) {
      couponError = 'COUPON_NOT_STARTED';
    } else if (coupon.expires_at && isAfter(now, new Date(coupon.expires_at))) {
      couponError = 'COUPON_EXPIRED';
    } else if (subtotal < coupon.min_order_amount) {
      couponError = `COUPON_MIN_ORDER:${coupon.min_order_amount}`;
    } else if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      couponError = 'COUPON_LIMIT_REACHED';
    } else {
      if (coupon.type === 'fixed') {
        discountAmount = coupon.value;
      } else if (coupon.type === 'percent') {
        discountAmount = Math.floor(subtotal * (coupon.value / 100));
        if (coupon.max_discount_amount !== null && discountAmount > coupon.max_discount_amount) {
          discountAmount = coupon.max_discount_amount;
        }
      }
      
      // Discount cannot exceed subtotal
      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }
      
      appliedCoupon = coupon.code;
    }
  }

  const grandTotal = subtotal + deliveryCharge - discountAmount;

  return {
    lines,
    subtotal,
    deliveryCharge,
    freeDeliveryRemaining,
    discountAmount,
    grandTotal,
    couponError,
    appliedCoupon
  };
};
