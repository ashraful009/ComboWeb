export interface CheckoutPayload {
  address_id?: number;
  street_address?: string;
  recipient_name?: string;
  recipient_phone?: string;
  delivery_zone_id: number;
  coupon_code?: string;
  payment_method: string;
  idempotency_key?: string;
}

export interface CheckoutPreview {
  subtotal_paisa: number;
  delivery_fee_paisa: number;
  coupon_discount_paisa: number;
  total_amount_paisa: number;
}

export interface CheckoutResult {
  orderId: number;
  orderNumber: string;
  totalAmount: number;
}

export interface OrderTrack {
  id: number;
  order_number: string;
  status: string;
  total_amount_paisa: number;
  created_at: string;
  items: {
    id: number;
    combo_name: string;
    quantity: number;
    unit_price_paisa: number;
  }[];
  history: {
    status: string;
    created_at: string;
  }[];
}
