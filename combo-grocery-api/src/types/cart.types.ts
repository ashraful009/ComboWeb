export interface CartRow {
  id: number;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface CartItemRow {
  id: number;
  cart_id: number;
  combo_id: number;
  quantity: number;
}

export interface DeliveryZoneRow {
  id: number;
  name: string;
  base_fee_paisa: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DeliveryZoneAreaRow {
  id: number;
  zone_id: number;
  postal_code: string | null;
  area_name: string;
}

export interface CouponRow {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_spend_paisa: number;
  max_cap_paisa: number | null;
  start_date: Date;
  end_date: Date;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CouponUsageRow {
  id: number;
  coupon_id: number;
  user_id: number;
  used_at: Date;
}
