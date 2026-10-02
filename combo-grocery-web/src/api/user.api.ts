import { apiClient } from './client';
import type { ApiResponse, Address, AddressFormData } from '../types';

export const fetchAddresses = async (): Promise<Address[]> => {
  const res = await apiClient.get<ApiResponse<Address[]>>('/user/addresses');
  return res.data.data;
};

export const addAddress = async (addressData: AddressFormData): Promise<{ id: number }> => {
  const res = await apiClient.post<ApiResponse<{ id: number }>>('/user/addresses', addressData);
  return res.data.data;
};

export const updateAddress = async (id: number, addressData: AddressFormData): Promise<void> => {
  const res = await apiClient.put<ApiResponse<void>>(`/user/addresses/${id}`, addressData);
  return res.data.data;
};

export const deleteAddress = async (id: number): Promise<void> => {
  const res = await apiClient.delete<ApiResponse<void>>(`/user/addresses/${id}`);
  return res.data.data;
};

export const setDefaultAddress = async (id: number): Promise<void> => {
  const res = await apiClient.patch<ApiResponse<void>>(`/user/addresses/${id}/default`);
  return res.data.data;
};
