import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // combos table
  await knex.schema.createTable('combos', (table) => {
    table.increments('id').primary();
    table.integer('category_id').unsigned().nullable().references('id').inTable('categories').onDelete('SET NULL');
    table.string('name', 150).notNullable();
    table.string('slug', 150).unique().notNullable();
    table.text('description').nullable();
    table.integer('base_price_paisa').notNullable(); // admin-set selling price
    table.boolean('is_active').defaultTo(true).notNullable();
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });

  // combo_items table (many-to-many relationship)
  await knex.schema.createTable('combo_items', (table) => {
    table.increments('id').primary();
    table.integer('combo_id').unsigned().notNullable().references('id').inTable('combos').onDelete('CASCADE');
    table.integer('item_id').unsigned().notNullable().references('id').inTable('items');
    table.integer('quantity').notNullable(); // how many of this item are in the combo
  });

  // combo_images table
  await knex.schema.createTable('combo_images', (table) => {
    table.increments('id').primary();
    table.integer('combo_id').unsigned().notNullable().references('id').inTable('combos').onDelete('CASCADE');
    table.string('image_url', 500).notNullable();
    table.integer('display_order').defaultTo(0).notNullable();
    table.boolean('is_primary').defaultTo(false).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('combo_images');
  await knex.schema.dropTableIfExists('combo_items');
  await knex.schema.dropTableIfExists('combos');
}
