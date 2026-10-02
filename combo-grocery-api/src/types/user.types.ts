export interface UserRow {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  password_hash: string;
  role: 'customer' | 'staff' | 'admin';
  is_active: boolean;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface AddressRow {
  id: number;
  user_id: number;
  title: string;
  recipient_name: string;
  recipient_phone: string;
  street_address: string;
  delivery_zone_id: number | null;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}
