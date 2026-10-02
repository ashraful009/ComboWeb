export interface DiscountRow {
  id: number;
  name: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_cap_paisa: number | null;
  start_date: Date;
  end_date: Date;
  target_type: 'global' | 'category' | 'combo';
  target_id: number | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
