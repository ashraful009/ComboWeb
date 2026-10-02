import { apiClient } from './client';
import type { ApiResponse, CartItem, ServerCart } from '../types';

export const syncCart = async (cartItems: CartItem[]): Promise<ServerCart> => {
  const res = await apiClient.post<ApiResponse<ServerCart>>('/cart/sync', { items: cartItems });
  return res.data.data;
};
