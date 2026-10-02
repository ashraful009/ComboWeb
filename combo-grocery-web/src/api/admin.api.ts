import { apiClient } from './client';
import type { ApiResponse } from '../types';

export const getDashboardStats = async (): Promise<any> => {
  const res = await apiClient.get<ApiResponse<any>>('/admin/dashboard-stats');
  return res.data.data;
};

export const getPendingInvestors = async (): Promise<any[]> => {
  const res = await apiClient.get<ApiResponse<any[]>>('/admin/pending-investors');
  return res.data.data;
};

export const getRecentOrders = async (): Promise<any[]> => {
  const res = await apiClient.get<ApiResponse<any[]>>('/admin/recent-orders');
  return res.data.data;
};

export const reviewInvestorApplication = async (id: string | number, status: string, notes: string): Promise<any> => {
  const res = await apiClient.put<ApiResponse<any>>(`/admin/investments/${id}/review`, { status, notes });
  return res.data;
};
