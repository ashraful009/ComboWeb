export interface InvestmentDashboard {
  status: string;
  planName: string;
  discount: string;
  expiryDate: string;
  totalInvested: number;
  totalSavings: number;
  lockInDays: number;
  remainingDays: number;
}

export interface InvestmentCampaign {
  id: number;
  title: string;
  description: string;
  min_investment_paisa: number;
  roi_percentage: number;
  duration_months: number;
}

export interface InvestmentPayment {
  id: number;
  amount_paisa: number;
  payment_method: string;
  status: string;
  created_at: string;
  transaction_id?: string;
}

export interface MonthlySavings {
  month: string;
  total_savings_paisa: number;
  order_count: number;
}
