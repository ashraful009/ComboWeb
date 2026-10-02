import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. categories
  await knex.schema.createTable('categories', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('slug', 100).unique().notNullable();
    table.text('description').nullable();
    table.integer('parent_id').unsigned().nullable().references('id').inTable('categories').onDelete('SET NULL');
    table.boolean('is_active').defaultTo(true).notNullable();
    table.integer('display_order').defaultTo(0).notNullable();
    table.timestamps(true, true);
  });

  // 2. suppliers
  await knex.schema.createTable('suppliers', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('contact_person', 100).nullable();
    table.string('phone', 20).nullable();
    table.string('email', 100).nullable();
    table.text('address').nullable();
    table.boolean('is_active').defaultTo(true).notNullable();
    table.timestamps(true, true);
  });

  // 3. items
  await knex.schema.createTable('items', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('sku', 50).unique().notNullable();
    table.string('unit_type', 20).notNullable(); // e.g. kg, liter, piece
    table.integer('stock_qty').defaultTo(0).notNullable();
    table.integer('avg_cost_paisa').defaultTo(0).notNullable();
    table.integer('reorder_level').defaultTo(10).notNullable();
    table.boolean('is_active').defaultTo(true).notNullable();
    table.timestamps(true, true);
  });

  // 4. purchases
  await knex.schema.createTable('purchases', (table) => {
    table.increments('id').primary();
    table.integer('supplier_id').unsigned().notNullable().references('id').inTable('suppliers');
    table.string('reference_no', 100).nullable();
    table.dateTime('purchase_date').notNullable();
    table.integer('total_amount_paisa').notNullable();
    table.enum('status', ['pending', 'completed', 'cancelled']).defaultTo('pending').notNullable();
    table.integer('created_by').unsigned().notNullable().references('id').inTable('users');
    table.timestamps(true, true);
  });

  // 5. purchase_items
  await knex.schema.createTable('purchase_items', (table) => {
    table.increments('id').primary();
    table.integer('purchase_id').unsigned().notNullable().references('id').inTable('purchases').onDelete('CASCADE');
    table.integer('item_id').unsigned().notNullable().references('id').inTable('items');
    table.integer('qty').notNullable();
    table.integer('unit_cost_paisa').notNullable();
    table.integer('total_cost_paisa').notNullable();
  });

  // 6. inventory_logs (append-only ledger)
  await knex.schema.createTable('inventory_logs', (table) => {
    table.increments('id').primary();
    table.integer('item_id').unsigned().notNullable().references('id').inTable('items');
    table.enum('transaction_type', ['in', 'out', 'adjust', 'damage']).notNullable();
    table.integer('qty_change').notNullable(); // + or -
    table.integer('previous_stock').notNullable();
    table.integer('new_stock').notNullable();
    table.string('reference_type', 50).notNullable(); // e.g. 'purchase', 'order', 'manual'
    table.integer('reference_id').unsigned().nullable(); // ID of purchase or order
    table.text('notes').nullable();
    table.integer('created_by').unsigned().nullable().references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('inventory_logs');
  await knex.schema.dropTableIfExists('purchase_items');
  await knex.schema.dropTableIfExists('purchases');
  await knex.schema.dropTableIfExists('items');
  await knex.schema.dropTableIfExists('suppliers');
  await knex.schema.dropTableIfExists('categories');
}
