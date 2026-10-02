import { apiClient } from './client';
import type { ApiResponse } from '../types';

export const fetchItems = async (): Promise<any[]> => {
  const res = await apiClient.get<ApiResponse<any[]>>('/items');
  return res.data.data;
};
