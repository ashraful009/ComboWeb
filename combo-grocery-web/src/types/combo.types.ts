export interface ComboItem {
  id: number;
  combo_id: number;
  item_id: number;
  quantity: number;
  name?: string;
  avg_cost_paisa?: number;
  unit_type?: string;
}

export interface ComboImage {
  id: number;
  combo_id: number;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface Combo {
  id: number;
  category_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  base_price_paisa: number;
  is_active: boolean;
  average_rating?: number;
  review_count?: number;
  stock_qty?: number;
  overall_discount_paisa: number;
  final_price_paisa: number;
  image_url?: string;
}

export interface ComboDetail extends Combo {
  discount_paisa: number;
  investor_price_paisa: number;
  items: ComboItem[];
  images: ComboImage[];
}
