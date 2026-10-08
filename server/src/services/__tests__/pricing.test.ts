import { describe, it, expect } from 'vitest';
import { calculatePricing } from '../pricing';
import { Settings, Coupon } from '@freshagro/shared';

describe('Pricing Service', () => {
  const baseSettings: Settings = {
    delivery_charge_inside_dhaka: 60,
    delivery_charge_outside_dhaka: 120,
    free_delivery_min_amount: 1500,
    delivery_time_slots: [],
    bkash_number: '',
    nagad_number: '',
    site_phone: '',
    site_whatsapp: '',
    site_email: '',
    site_address_en: '',
    site_address_bn: '',
    hero_title_en: '',
    hero_title_bn: '',
    hero_subtitle_en: '',
    hero_subtitle_bn: '',
    hero_image_url: '',
    invoice_policy_note_en: '',
    invoice_policy_note_bn: ''
  };

  const activeCoupon: Coupon & { used_count: number } = {
    id: 1,
    code: 'SAVE100',
    type: 'fixed',
    value: 100,
    min_order_amount: 500,
    max_discount_amount: null,
    usage_limit: null,
    used_count: 0,
    is_active: 1,
    starts_at: null,
    expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  it('calculates subtotal and multi-quantity correctly', () => {
    const items = [
      { comboId: 1, quantity: 2, marketPrice: 600, unitPrice: 500 }, // 1000
      { comboId: 2, quantity: 1, marketPrice: 400, unitPrice: 300 }  // 300
    ];
    const result = calculatePricing(items, 'inside_dhaka', baseSettings, null);
    
    expect(result.subtotal).toBe(1300);
    expect(result.deliveryCharge).toBe(60); // below 1500, inside dhaka
    expect(result.discountAmount).toBe(0);
    expect(result.grandTotal).toBe(1360);
  });

  it('applies delivery charge inside dhaka', () => {
    const items = [{ comboId: 1, quantity: 1, marketPrice: 1200, unitPrice: 1000 }];
    const result = calculatePricing(items, 'inside_dhaka', baseSettings, null);
    expect(result.deliveryCharge).toBe(60);
    expect(result.grandTotal).toBe(1060);
  });

  it('applies delivery charge outside dhaka', () => {
    const items = [{ comboId: 1, quantity: 1, marketPrice: 1200, unitPrice: 1000 }];
    const result = calculatePricing(items, 'outside_dhaka', baseSettings, null);
    expect(result.deliveryCharge).toBe(120);
    expect(result.grandTotal).toBe(1120);
  });

  it('applies free delivery exactly at threshold', () => {
    const items = [{ comboId: 1, quantity: 1, marketPrice: 1800, unitPrice: 1500 }];
    const result = calculatePricing(items, 'outside_dhaka', baseSettings, null);
    expect(result.deliveryCharge).toBe(0);
    expect(result.grandTotal).toBe(1500);
  });

  it('applies delivery charge one below threshold', () => {
    const items = [{ comboId: 1, quantity: 1, marketPrice: 1800, unitPrice: 1499 }];
    const result = calculatePricing(items, 'outside_dhaka', baseSettings, null);
    expect(result.deliveryCharge).toBe(120);
    expect(result.grandTotal).toBe(1619);
  });

  it('applies free delivery one above threshold', () => {
    const items = [{ comboId: 1, quantity: 1, marketPrice: 1800, unitPrice: 1501 }];
    const result = calculatePricing(items, 'outside_dhaka', baseSettings, null);
    expect(result.deliveryCharge).toBe(0);
    expect(result.grandTotal).toBe(1501);
  });

  it('applies fixed coupon correctly', () => {
    const items = [{ comboId: 1, quantity: 1, marketPrice: 1200, unitPrice: 1000 }];
    const result = calculatePricing(items, 'inside_dhaka', baseSettings, activeCoupon);
    expect(result.discountAmount).toBe(100);
    expect(result.subtotal).toBe(1000);
    expect(result.deliveryCharge).toBe(60);
    expect(result.grandTotal).toBe(960); // 1000 - 100 + 60
    expect(result.couponError).toBeUndefined();
  });

  it('applies percent coupon with floor and max cap', () => {
    const items = [{ comboId: 1, quantity: 1, marketPrice: 2400, unitPrice: 2000 }];
    const percentCoupon: Coupon & { used_count: number } = {
      ...activeCoupon,
      type: 'percent',
      value: 10, // 10% of 2000 = 200
      max_discount_amount: 150 // max cap at 150
    };
    const result = calculatePricing(items, 'inside_dhaka', baseSettings, percentCoupon);
    
    expect(result.discountAmount).toBe(150); // Capped
    expect(result.grandTotal).toBe(1850); // (2000 - 150) + 0 (free delivery since 2000 >= 1500)
  });

  it('discount never exceeds subtotal', () => {
    const items = [{ comboId: 1, quantity: 1, marketPrice: 60, unitPrice: 50 }];
    const megaCoupon: Coupon & { used_count: number } = {
      ...activeCoupon,
      min_order_amount: 0,
      value: 100 // larger than subtotal
    };
    const result = calculatePricing(items, 'inside_dhaka', baseSettings, megaCoupon);
    
    expect(result.discountAmount).toBe(50); // Capped at subtotal
    expect(result.subtotal).toBe(50);
    expect(result.deliveryCharge).toBe(60);
    expect(result.grandTotal).toBe(60); // 50 - 50 + 60
  });

  describe('Coupon Validation', () => {
    it('rejects inactive coupon', () => {
      const items = [{ comboId: 1, quantity: 1, marketPrice: 1200, unitPrice: 1000 }];
      const inactive = { ...activeCoupon, is_active: 0 };
      const result = calculatePricing(items, 'inside_dhaka', baseSettings, inactive);
      
      expect(result.couponError).toBe('COUPON_INACTIVE');
      expect(result.discountAmount).toBe(0);
    });

    it('rejects minimum order not met', () => {
      const items = [{ comboId: 1, quantity: 1, marketPrice: 500, unitPrice: 400 }]; // min is 500
      const result = calculatePricing(items, 'inside_dhaka', baseSettings, activeCoupon);
      
      expect(result.couponError).toBe('COUPON_MIN_ORDER:500');
      expect(result.discountAmount).toBe(0);
    });

    it('rejects usage limit reached', () => {
      const items = [{ comboId: 1, quantity: 1, marketPrice: 1200, unitPrice: 1000 }];
      const limited = { ...activeCoupon, usage_limit: 10, used_count: 10 };
      const result = calculatePricing(items, 'inside_dhaka', baseSettings, limited);
      
      expect(result.couponError).toBe('COUPON_LIMIT_REACHED');
      expect(result.discountAmount).toBe(0);
    });

    it('allows usage limit not reached', () => {
      const items = [{ comboId: 1, quantity: 1, marketPrice: 1200, unitPrice: 1000 }];
      const limited = { ...activeCoupon, usage_limit: 10, used_count: 9 };
      const result = calculatePricing(items, 'inside_dhaka', baseSettings, limited);
      
      expect(result.couponError).toBeUndefined();
      expect(result.discountAmount).toBe(100);
    });
  });
});
