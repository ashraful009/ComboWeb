export interface CategoryRow {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  is_active: boolean;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}
