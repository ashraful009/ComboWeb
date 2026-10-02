import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // carts table
  await knex.schema.createTable('carts', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().unique().references('id').inTable('users').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // cart_items table
  await knex.schema.createTable('cart_items', (table) => {
    table.increments('id').primary();
    table.integer('cart_id').unsigned().notNullable().references('id').inTable('carts').onDelete('CASCADE');
    table.integer('combo_id').unsigned().notNullable().references('id').inTable('combos');
    table.integer('quantity').defaultTo(1).notNullable();
    table.unique(['cart_id', 'combo_id']);
  });

  // delivery_zones table
  await knex.schema.createTable('delivery_zones', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.integer('base_fee_paisa').notNullable();
    table.boolean('is_active').defaultTo(true).notNullable();
    table.timestamps(true, true);
  });

  // delivery_zone_areas table
  await knex.schema.createTable('delivery_zone_areas', (table) => {
    table.increments('id').primary();
    table.integer('zone_id').unsigned().notNullable().references('id').inTable('delivery_zones').onDelete('CASCADE');
    table.string('postal_code', 20).nullable();
    table.string('area_name', 100).notNullable();
  });

  // coupons table
  await knex.schema.createTable('coupons', (table) => {
    table.increments('id').primary();
    table.string('code', 50).unique().notNullable();
    table.enum('discount_type', ['percentage', 'fixed']).notNullable();
    table.integer('discount_value').notNullable();
    table.integer('min_spend_paisa').defaultTo(0).notNullable();
    table.integer('max_cap_paisa').nullable();
    table.dateTime('start_date').notNullable();
    table.dateTime('end_date').notNullable();
    table.integer('usage_limit').nullable();
    table.integer('used_count').defaultTo(0).notNullable();
    table.boolean('is_active').defaultTo(true).notNullable();
    table.timestamps(true, true);
  });

  // coupon_usages table
  await knex.schema.createTable('coupon_usages', (table) => {
    table.increments('id').primary();
    table.integer('coupon_id').unsigned().notNullable().references('id').inTable('coupons').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users');
    table.timestamp('used_at').defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('coupon_usages');
  await knex.schema.dropTableIfExists('coupons');
  await knex.schema.dropTableIfExists('delivery_zone_areas');
  await knex.schema.dropTableIfExists('delivery_zones');
  await knex.schema.dropTableIfExists('cart_items');
  await knex.schema.dropTableIfExists('carts');
}
