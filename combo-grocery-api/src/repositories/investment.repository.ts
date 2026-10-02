import { BaseRepository } from './base.repository';
import type { Knex } from 'knex';

export class InvestmentRepository extends BaseRepository {
  async createCampaign(data: any, trx?: Knex.Transaction): Promise<number> {
    const [id] = await this.conn(trx).table('investment_campaigns').insert(data);
    return id as number;
  }

  async getActiveCampaigns(trx?: Knex.Transaction) {
    return this.conn(trx).table('investment_campaigns').where({ status: 'active' });
  }

  async getCampaignById(id: number, trx?: Knex.Transaction) {
    return this.conn(trx).table('investment_campaigns').where({ id }).first();
  }

  async createInvestment(data: any, trx?: Knex.Transaction): Promise<number> {
    const [id] = await this.conn(trx).table('investments').insert(data);
    return id as number;
  }

  async createPayment(data: any, trx?: Knex.Transaction): Promise<void> {
    await this.conn(trx).table('payments').insert(data);
  }

  async getMyInvestments(userId: number, trx?: Knex.Transaction) {
    return this.conn(trx)
      .table('investments')
      .join('investment_campaigns', 'investments.campaign_id', 'investment_campaigns.id')
      .where({ 'investments.user_id': userId })
      .select('investments.*', 'investment_campaigns.title as campaign_name', 'investment_campaigns.roi_percentage', 'investment_campaigns.duration_months');
  }

  async getMyPayments(userId: number, trx?: Knex.Transaction) {
    return this.conn(trx).table('payments')
      .where({ user_id: userId, purpose: 'investment' })
      .orderBy('created_at', 'desc');
  }

  async getMySavings(userId: number, trx?: Knex.Transaction) {
    return this.conn(trx)
      .table('orders')
      .join('order_items', 'orders.id', 'order_items.order_id')
      .join('combos', 'order_items.combo_id', 'combos.id')
      .where('orders.user_id', userId)
      .where('orders.status', '!=', 'cancelled')
      .select(
        this.conn(trx).raw('DATE_FORMAT(orders.created_at, "%Y-%m") as month'),
        this.conn(trx).raw('SUM((combos.base_price_paisa - order_items.unit_price_paisa) * order_items.quantity) as total_savings_paisa'),
        this.conn(trx).raw('COUNT(DISTINCT orders.id) as order_count')
      )
      .groupBy('month')
      .orderBy('month', 'desc');
  }
}
