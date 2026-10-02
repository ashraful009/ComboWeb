import { InvestmentRepository } from '../repositories/investment.repository';
import { withTransaction } from '../config/db';
import { AppError } from '../utils/appError';
import type { InvestmentCampaignRow } from '../types/investor.types';

export class InvestmentService {
  private repo = new InvestmentRepository();

  async createCampaign(data: Partial<InvestmentCampaignRow>): Promise<InvestmentCampaignRow> {
    const id = await this.repo.createCampaign({
      ...data,
      start_date: new Date(data.start_date!),
      end_date: new Date(data.end_date!)
    });
    return { id, ...data } as InvestmentCampaignRow;
  }

  async getActiveCampaigns() {
    return this.repo.getActiveCampaigns();
  }

  async invest(userId: number, data: { campaign_id: number; amount_paisa: number; payment_method: string }) {
    return withTransaction(async (trx) => {
      const campaign = await this.repo.getCampaignById(data.campaign_id, trx);
      if (!campaign) throw AppError.notFound('Campaign not found');
      if (campaign.status !== 'active') throw AppError.badRequest('Campaign is not active');
      if (data.amount_paisa < campaign.min_investment_paisa) {
        throw AppError.badRequest(`Minimum investment is ${campaign.min_investment_paisa / 100}`);
      }

      // Calculate Expected ROI
      const expectedRoi = Math.floor(data.amount_paisa * (campaign.roi_percentage / 100));

      const investmentId = await this.repo.createInvestment({
        user_id: userId,
        campaign_id: campaign.id,
        amount_paisa: data.amount_paisa,
        expected_roi_paisa: expectedRoi,
        status: 'pending'
      }, trx);

      await this.repo.createPayment({
        purpose: 'investment',
        reference_id: investmentId,
        user_id: userId,
        amount_paisa: data.amount_paisa,
        payment_method: data.payment_method,
        status: 'pending'
      }, trx);

      return { investmentId, amount_paisa: data.amount_paisa, expected_roi_paisa: expectedRoi };
    });
  }

  async getMyInvestments(userId: number) {
    const investments = await this.repo.getMyInvestments(userId);
    // Formatting data for the dashboard
    if (!investments || investments.length === 0) return null;
    
    // We assume showing the most recent or active one as the main dashboard view for now
    const active = investments[0];
    
    const durationMonths = active.duration_months;
    const lockInDays = durationMonths * 30; // Approx
    // Calculate remaining days based on created_at
    const createdDate = new Date(active.created_at);
    const currentDate = new Date();
    const passedDays = Math.floor((currentDate.getTime() - createdDate.getTime()) / (1000 * 3600 * 24));
    let remainingDays = lockInDays - passedDays;
    if (remainingDays < 0) remainingDays = 0;

    return {
      status: active.status.toUpperCase(),
      planName: active.campaign_name,
      discount: active.roi_percentage + '%',
      expiryDate: 'Lifetime/Annual', // To replace with actual logic if needed
      totalInvested: active.amount_paisa / 100,
      totalSavings: active.expected_roi_paisa / 100, // Using expected ROI as mock savings for now
      lockInDays: lockInDays,
      remainingDays: remainingDays
    };
  }

  async getMyPayments(userId: number) {
    return this.repo.getMyPayments(userId);
  }

  async getMySavings(userId: number) {
    return this.repo.getMySavings(userId);
  }
}
