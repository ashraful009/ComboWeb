import type { Knex } from 'knex';
import { db } from '../config/db';

export class BaseRepository {
  /**
   * Returns the transaction object if provided, otherwise the global db instance.
   * Ensures repositories can participate in transactions smoothly.
   */
  protected conn(trx?: Knex.Transaction): Knex | Knex.Transaction {
    return trx || db;
  }
}
