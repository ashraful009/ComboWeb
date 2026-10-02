import { apiClient } from './client';
import type { ApiResponse } from '../types';

export const fetchCategories = async (): Promise<any[]> => {
  const res = await apiClient.get<ApiResponse<any[]>>('/categories');
  return res.data.data;
};

export const createCategory = async (data: { name: string; slug: string; description?: string }): Promise<any> => {
  const res = await apiClient.post<ApiResponse<any>>('/categories', data);
  return res.data.data;
};
