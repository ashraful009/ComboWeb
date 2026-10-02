export interface SupplierRow {
  id: number;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ItemRow {
  id: number;
  name: string;
  sku: string;
  unit_type: string;
  stock_qty: number;
  avg_cost_paisa: number;
  reorder_level: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PurchaseRow {
  id: number;
  supplier_id: number;
  reference_no: string | null;
  purchase_date: Date;
  total_amount_paisa: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_by: number;
  created_at: Date;
  updated_at: Date;
}
