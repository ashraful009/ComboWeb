export interface Review {
  id: number;
  combo_id: number;
  user_id: number;
  rating: number;
  comment: string;
  full_name: string;
  created_at: string;
}

export interface ReviewFormData {
  rating: number;
  comment: string;
}

export interface ReviewStats {
  average_rating: number;
  review_count: number;
}
