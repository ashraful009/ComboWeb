import { BaseRepository } from './base.repository';
import type { Knex } from 'knex';

export class WalletRepository extends BaseRepository {
  async getWallet(userId: number, trx?: Knex.Transaction) {
    let wallet = await this.conn(trx).table('wallets').where({ user_id: userId }).first();
    if (!wallet) {
      const [id] = await this.conn(trx).table('wallets').insert({ user_id: userId });
      wallet = { id, user_id: userId, balance_paisa: 0 };
    }
    return wallet;
  }

  async addTransaction(walletId: number, type: string, amount: number, referenceId: number, notes: string, trx?: Knex.Transaction) {
    await this.conn(trx).table('wallet_transactions').insert({
      wallet_id: walletId,
      transaction_type: type,
      amount_paisa: amount,
      reference_id: referenceId,
      notes: notes
    });
    
    // Update balance
    await this.conn(trx).raw(`
      UPDATE wallets SET balance_paisa = balance_paisa + ? WHERE id = ?
    `, [amount, walletId]);
  }

  async getTransactions(walletId: number, trx?: Knex.Transaction) {
    return this.conn(trx).table('wallet_transactions').where({ wallet_id: walletId }).orderBy('created_at', 'desc');
  }

  // Used for ROI Distribution
  async getActiveInvestmentsForCampaign(campaignId: number, trx?: Knex.Transaction) {
    return this.conn(trx).table('investments').where({ campaign_id: campaignId, status: 'active' });
  }

  async markInvestmentsMatured(campaignId: number, trx?: Knex.Transaction) {
    await this.conn(trx).table('investments').where({ campaign_id: campaignId }).update({ status: 'matured' });
  }
}
