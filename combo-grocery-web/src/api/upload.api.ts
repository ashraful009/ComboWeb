import { apiClient } from './client';
import type { ApiResponse } from '../types';

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const res = await apiClient.post<ApiResponse<{ url: string }>>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return res.data.data.url;
};
