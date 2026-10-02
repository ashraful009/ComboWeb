export interface Address {
  id: number;
  user_id: number;
  title: string;
  recipient_name: string;
  recipient_phone: string;
  street_address: string;
  delivery_zone_id: number | null;
  zone_name?: string;
  is_default: boolean;
}

export interface AddressFormData {
  title: string;
  recipient_name: string;
  recipient_phone: string;
  street_address: string;
  delivery_zone_id: number;
  is_default: boolean;
}
