import { WalletRepository } from '../repositories/wallet.repository';
import { withTransaction } from '../config/db';
import { AppError } from '../utils/appError';

export class WalletService {
  private repo = new WalletRepository();

  async getWalletDetails(userId: number) {
    const wallet = await this.repo.getWallet(userId);
    const transactions = await this.repo.getTransactions(wallet.id);
    return { balance_paisa: wallet.balance_paisa, transactions };
  }

  async distributeROI(campaignId: number) {
    return withTransaction(async (trx) => {
      const investments = await this.repo.getActiveInvestmentsForCampaign(campaignId, trx);
      
      for (const inv of investments) {
        const wallet = await this.repo.getWallet(inv.user_id, trx);
        // Distribute Principle + Expected ROI
        const payout = inv.amount_paisa + inv.expected_roi_paisa;
        
        await this.repo.addTransaction(
          wallet.id, 
          'roi', 
          payout, 
          campaignId, 
          `ROI Payout for Campaign #${campaignId}`, 
          trx
        );
      }

      await this.repo.markInvestmentsMatured(campaignId, trx);
      
      // We would also update campaign status to 'completed' here.
      await trx.table('investment_campaigns').where({ id: campaignId }).update({ status: 'completed' });

      return { processed_investments: investments.length };
    });
  }
}
