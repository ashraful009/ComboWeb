import { apiClient } from './client';
import type { ApiResponse, InvestmentDashboard, InvestmentCampaign, InvestmentPayment, MonthlySavings } from '../types';

export const applyForInvestment = async (applicationData: { campaign_id: number, amount_paisa: number, payment_method: string }): Promise<{ investmentId: number }> => {
  const res = await apiClient.post<ApiResponse<{ investmentId: number }>>('/investments', applicationData);
  return res.data.data;
};

export const getInvestmentDashboard = async (): Promise<InvestmentDashboard> => {
  const res = await apiClient.get<ApiResponse<InvestmentDashboard>>('/investments/me');
  return res.data.data;
};

export const getInvestmentPayments = async (): Promise<InvestmentPayment[]> => {
  const res = await apiClient.get<ApiResponse<InvestmentPayment[]>>('/investments/me/payments');
  return res.data.data;
};

export const getInvestmentSavings = async (): Promise<MonthlySavings[]> => {
  const res = await apiClient.get<ApiResponse<MonthlySavings[]>>('/investments/me/savings');
  return res.data.data;
};

export const getActiveCampaigns = async (): Promise<InvestmentCampaign[]> => {
  const res = await apiClient.get<ApiResponse<InvestmentCampaign[]>>('/investments/campaigns');
  return res.data.data;
};
