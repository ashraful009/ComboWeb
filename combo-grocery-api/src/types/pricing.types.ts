import type { ComboRow, ComboItemRow } from './combo.types';

export interface PricedCombo extends ComboRow {
  overall_discount_paisa: number;
  final_price_paisa: number;
  items?: ComboItemRow[]; // if fetched with items
}

export interface PricedComboDetail extends ComboRow {
  discount_paisa: number;
  final_price_paisa: number;
  investor_price_paisa: number;
  items?: any[];
  images?: any[];
}

export interface DiscountMatch {
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  max_cap_paisa: number | null;
}
