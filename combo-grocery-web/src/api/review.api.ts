import { apiClient } from './client';
import type { ApiResponse, Review, ReviewFormData } from '../types';

export const fetchComboReviews = async (comboId: string | number): Promise<Review[]> => {
  const res = await apiClient.get<ApiResponse<Review[]>>(`/combos/${comboId}/reviews`);
  return res.data.data;
};

export const submitReview = async (comboId: string | number, reviewData: ReviewFormData): Promise<void> => {
  const res = await apiClient.post<ApiResponse<void>>(`/combos/${comboId}/reviews`, reviewData);
  return res.data.data;
};
