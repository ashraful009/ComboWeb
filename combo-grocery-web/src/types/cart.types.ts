export interface CartItem {
  combo_id: number;
  quantity: number;
  price_paisa: number;
  name: string;
}

export interface ServerCartItem {
  id: number;
  cart_id: number;
  combo_id: number;
  quantity: number;
  name: string;
  base_price_paisa: number;
  unit_price_paisa: number;
  line_total_paisa: number;
}

export interface ServerCart {
  cart_id: number;
  items: ServerCartItem[];
  subtotal_paisa: number;
}
