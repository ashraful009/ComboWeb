import { apiClient } from './client';
import type { ApiResponse, DeliveryZone } from '../types';

export const fetchDeliveryZones = async (): Promise<DeliveryZone[]> => {
  const res = await apiClient.get<ApiResponse<DeliveryZone[]>>('/delivery/zones');
  return res.data.data;
};
