import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // settings table (key-value store for global configs)
  await knex.schema.createTable('settings', (table) => {
    table.increments('id').primary();
    table.string('setting_key', 100).unique().notNullable(); // e.g. 'discount_stacking_mode'
    table.text('setting_value').notNullable();
    table.string('description', 255).nullable();
    table.timestamps(true, true);
  });

  // discounts table (overall public campaigns)
  await knex.schema.createTable('discounts', (table) => {
    table.increments('id').primary();
    table.string('name', 150).notNullable();
    table.enum('discount_type', ['percentage', 'fixed']).notNullable();
    table.integer('discount_value').notNullable(); // percentage (e.g. 10) or fixed amount in paisa
    table.integer('max_cap_paisa').nullable(); // cap for percentage discount
    table.dateTime('start_date').notNullable();
    table.dateTime('end_date').notNullable();
    table.enum('target_type', ['global', 'category', 'combo']).notNullable();
    table.integer('target_id').unsigned().nullable(); // null if global, else category_id or combo_id
    table.boolean('is_active').defaultTo(true).notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('discounts');
  await knex.schema.dropTableIfExists('settings');
}
