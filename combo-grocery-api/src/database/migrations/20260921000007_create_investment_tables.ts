import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // investment_campaigns table
  await knex.schema.createTable('investment_campaigns', (table) => {
    table.increments('id').primary();
    table.string('title', 150).notNullable();
    table.text('description').notNullable();
    table.integer('target_amount_paisa').notNullable();
    table.integer('raised_amount_paisa').defaultTo(0).notNullable();
    table.integer('min_investment_paisa').notNullable();
    table.decimal('roi_percentage', 5, 2).notNullable(); // e.g. 15.50 for 15.5%
    table.integer('duration_months').notNullable();
    table.dateTime('start_date').notNullable();
    table.dateTime('end_date').notNullable();
    table.enum('status', ['draft', 'active', 'closed', 'completed', 'cancelled']).defaultTo('draft').notNullable();
    table.timestamps(true, true);
  });

  // investments table
  await knex.schema.createTable('investments', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users');
    table.integer('campaign_id').unsigned().notNullable().references('id').inTable('investment_campaigns');
    table.integer('amount_paisa').notNullable();
    table.integer('expected_roi_paisa').notNullable();
    table.enum('status', ['pending', 'active', 'matured', 'cancelled']).defaultTo('pending').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('investments');
  await knex.schema.dropTableIfExists('investment_campaigns');
}
