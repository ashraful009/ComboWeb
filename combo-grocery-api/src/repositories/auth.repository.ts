import { BaseRepository } from './base.repository';
import type { Knex } from 'knex';

export class AuthRepository extends BaseRepository {
  async saveRefreshToken(userId: number, token: string, expiresAt: Date, trx?: Knex.Transaction): Promise<void> {
    await this.conn(trx).table('refresh_tokens').insert({
      user_id: userId,
      token,
      expires_at: expiresAt
    });
  }

  async revokeRefreshToken(userId: number, trx?: Knex.Transaction): Promise<void> {
    await this.conn(trx).table('refresh_tokens').where({ user_id: userId }).delete();
  }
}
