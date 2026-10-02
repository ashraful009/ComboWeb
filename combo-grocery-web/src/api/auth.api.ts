import { apiClient } from './client';
import type { ApiResponse, LoginResponse, User } from '../types';

export const login = async (credentials: Record<string, any>): Promise<LoginResponse> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
  return response.data.data;
};

export const register = async (userData: Record<string, any>): Promise<void> => {
  const response = await apiClient.post<ApiResponse<void>>('/auth/register', userData);
  return response.data.data;
};

export const getProfile = async (): Promise<User> => {
  const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
  return response.data.data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};
