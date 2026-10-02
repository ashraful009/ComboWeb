import { apiClient } from './client';
import type { ApiResponse, CheckoutPayload, CheckoutPreview, CheckoutResult, OrderTrack } from '../types';

export const checkout = async (checkoutData: CheckoutPayload): Promise<CheckoutResult> => {
  const res = await apiClient.post<ApiResponse<CheckoutResult>>('/orders/checkout', checkoutData);
  return res.data.data;
};

export const previewCheckout = async (checkoutData: Partial<CheckoutPayload>): Promise<CheckoutPreview> => {
  const res = await apiClient.post<ApiResponse<CheckoutPreview>>('/orders/preview', checkoutData);
  return res.data.data;
};

export const trackOrder = async (orderId: string): Promise<OrderTrack> => {
  const res = await apiClient.get<ApiResponse<OrderTrack>>(`/orders/${orderId}/track`);
  return res.data.data;
};
