export interface InvestmentCampaignRow {
  id: number;
  title: string;
  description: string;
  target_amount_paisa: number;
  raised_amount_paisa: number;
  min_investment_paisa: number;
  roi_percentage: number;
  duration_months: number;
  start_date: Date;
  end_date: Date;
  status: 'draft' | 'active' | 'closed' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface InvestmentRow {
  id: number;
  user_id: number;
  campaign_id: number;
  amount_paisa: number;
  expected_roi_paisa: number;
  status: 'pending' | 'active' | 'matured' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}
