export interface ComboRow {
  id: number;
  category_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  base_price_paisa: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ComboItemRow {
  id: number;
  combo_id: number;
  item_id: number;
  quantity: number;
}
