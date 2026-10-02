import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Create reviews table
  await knex.schema.createTable('reviews', (table) => {
    table.increments('id').primary();
    table.integer('combo_id').unsigned().notNullable().references('id').inTable('combos').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('rating').notNullable(); // 1 to 5
    table.text('comment').nullable();
    table.boolean('is_approved').defaultTo(true).notNullable();
    table.timestamps(true, true);

    // Ensure a user can only review a combo once
    table.unique(['combo_id', 'user_id']);
  });

  // 2. Alter combos table to add aggregated fields
  await knex.schema.alterTable('combos', (table) => {
    table.decimal('average_rating', 3, 2).defaultTo(0).notNullable();
    table.integer('review_count').defaultTo(0).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  // 1. Revert combos table alteration
  await knex.schema.alterTable('combos', (table) => {
    table.dropColumn('average_rating');
    table.dropColumn('review_count');
  });

  // 2. Drop reviews table
  await knex.schema.dropTableIfExists('reviews');
}
