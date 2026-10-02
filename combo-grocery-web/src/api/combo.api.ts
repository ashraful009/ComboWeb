import { apiClient } from './client';
import type { ApiResponse, Combo, ComboDetail, Review } from '../types';

export const fetchCombos = async (): Promise<Combo[]> => {
  const res = await apiClient.get<ApiResponse<Combo[]>>('/combos');
  return res.data.data;
};

export const fetchComboById = async (id: string): Promise<ComboDetail> => {
  const res = await apiClient.get<ApiResponse<ComboDetail>>(`/combos/${id}`);
  return res.data.data;
};

export const getReviews = async (comboId: string): Promise<Review[]> => {
  const res = await apiClient.get<ApiResponse<Review[]>>(`/combos/${comboId}/reviews`);
  return res.data.data;
};

export const createCombo = async (payload: Partial<ComboDetail>): Promise<Combo> => {
  const res = await apiClient.post<ApiResponse<Combo>>('/combos/admin', payload);
  return res.data.data;
};

export const updateCombo = async (id: number, payload: Partial<ComboDetail>): Promise<Combo> => {
  const res = await apiClient.put<ApiResponse<Combo>>(`/combos/admin/${id}`, payload);
  return res.data.data;
};

export const deleteCombo = async (id: number): Promise<void> => {
  const res = await apiClient.delete<ApiResponse<void>>(`/combos/admin/${id}`);
  return res.data.data;
};
