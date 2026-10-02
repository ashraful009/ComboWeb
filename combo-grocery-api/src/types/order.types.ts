export interface RiderRow {
  id: number;
  name: string;
  phone: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface OrderRow {
  id: number;
  user_id: number;
  order_number: string;
  shipping_address: string;
  recipient_name: string;
  recipient_phone: string;
  subtotal_paisa: number;
  delivery_fee_paisa: number;
  coupon_discount_paisa: number;
  total_amount_paisa: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  rider_id: number | null;
  coupon_id: number | null;
  idempotency_key: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItemRow {
  id: number;
  order_id: number;
  combo_id: number;
  quantity: number;
  unit_price_paisa: number;
  line_total_paisa: number;
}

export interface OrderStatusHistoryRow {
  id: number;
  order_id: number;
  status: string;
  notes: string | null;
  created_at: Date;
}

export interface PaymentRow {
  id: number;
  purpose: 'order' | 'investment';
  reference_id: number;
  user_id: number;
  amount_paisa: number;
  payment_method: string;
  transaction_id: string | null;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  created_at: Date;
  updated_at: Date;
}
