import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // wallets table
  await knex.schema.createTable('wallets', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().unique().references('id').inTable('users');
    table.integer('balance_paisa').defaultTo(0).notNullable();
    table.timestamps(true, true);
  });

  // wallet_transactions table (ledger)
  await knex.schema.createTable('wallet_transactions', (table) => {
    table.increments('id').primary();
    table.integer('wallet_id').unsigned().notNullable().references('id').inTable('wallets');
    table.enum('transaction_type', ['deposit', 'withdrawal', 'purchase', 'roi']).notNullable();
    table.integer('amount_paisa').notNullable(); // positive or negative
    table.integer('reference_id').unsigned().nullable(); // e.g. order_id or campaign_id
    table.string('notes', 255).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('wallet_transactions');
  await knex.schema.dropTableIfExists('wallets');
}
