import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // riders table
  await knex.schema.createTable('riders', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('phone', 20).unique().notNullable();
    table.boolean('is_active').defaultTo(true).notNullable();
    table.timestamps(true, true);
  });

  // orders table
  await knex.schema.createTable('orders', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users');
    table.string('order_number', 50).unique().notNullable();
    
    // Addresses snapshotted
    table.text('shipping_address').notNullable();
    table.string('recipient_name', 100).notNullable();
    table.string('recipient_phone', 20).notNullable();
    
    // Math
    table.integer('subtotal_paisa').notNullable();
    table.integer('delivery_fee_paisa').notNullable();
    table.integer('coupon_discount_paisa').defaultTo(0).notNullable();
    table.integer('total_amount_paisa').notNullable();
    
    // Status
    table.enum('status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).defaultTo('pending').notNullable();
    table.integer('rider_id').unsigned().nullable().references('id').inTable('riders');
    
    // Tracking
    table.integer('coupon_id').unsigned().nullable().references('id').inTable('coupons');
    table.string('idempotency_key', 100).unique().nullable(); // Prevent duplicate orders
    
    table.timestamps(true, true);
  });

  // order_items table (Snapshot pricing)
  await knex.schema.createTable('order_items', (table) => {
    table.increments('id').primary();
    table.integer('order_id').unsigned().notNullable().references('id').inTable('orders').onDelete('CASCADE');
    table.integer('combo_id').unsigned().notNullable().references('id').inTable('combos');
    table.integer('quantity').notNullable();
    
    // The exact price at the moment of purchase
    table.integer('unit_price_paisa').notNullable(); 
    table.integer('line_total_paisa').notNullable();
  });

  // order_status_history table
  await knex.schema.createTable('order_status_history', (table) => {
    table.increments('id').primary();
    table.integer('order_id').unsigned().notNullable().references('id').inTable('orders').onDelete('CASCADE');
    table.string('status', 50).notNullable();
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
  });

  // payments table (Polymorphic for Orders & Investments)
  await knex.schema.createTable('payments', (table) => {
    table.increments('id').primary();
    table.enum('purpose', ['order', 'investment']).notNullable();
    table.integer('reference_id').unsigned().notNullable(); // order_id or investment_id
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users');
    
    table.integer('amount_paisa').notNullable();
    table.string('payment_method', 50).notNullable(); // bKash, Nagad, COD
    table.string('transaction_id', 100).unique().nullable();
    
    table.enum('status', ['pending', 'success', 'failed', 'refunded']).defaultTo('pending').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('payments');
  await knex.schema.dropTableIfExists('order_status_history');
  await knex.schema.dropTableIfExists('order_items');
  await knex.schema.dropTableIfExists('orders');
  await knex.schema.dropTableIfExists('riders');
}
