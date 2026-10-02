import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. users
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('phone', 20).unique().notNullable();
    table.string('email', 255).unique().nullable();
    table.string('password_hash', 255).notNullable();
    table.enum('role', ['customer', 'staff', 'admin']).defaultTo('customer').notNullable();
    table.boolean('is_active').defaultTo(true).notNullable();
    table.timestamp('last_login_at').nullable();
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });

  // 2. refresh_tokens
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token', 500).unique().notNullable();
    table.string('device_info', 255).nullable();
    table.string('ip_address', 45).nullable();
    table.dateTime('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
  });

  // 3. password_resets
  await knex.schema.createTable('password_resets', (table) => {
    table.increments('id').primary();
    table.string('email_or_phone', 255).notNullable();
    table.string('token', 255).notNullable();
    table.dateTime('expires_at').notNullable();
    table.boolean('is_used').defaultTo(false).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    
    table.index(['email_or_phone', 'token']);
  });

  // 4. addresses
  await knex.schema.createTable('addresses', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('title', 50).notNullable(); // e.g. Home, Work
    table.string('recipient_name', 100).notNullable();
    table.string('recipient_phone', 20).notNullable();
    table.text('street_address').notNullable();
    table.integer('delivery_zone_id').unsigned().nullable(); // For later Phase 3
    table.boolean('is_default').defaultTo(false).notNullable();
    table.timestamps(true, true);
  });

  // 5. staff_permissions
  await knex.schema.createTable('staff_permissions', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('permission_key', 100).notNullable(); // e.g. 'combos.manage'
    table.timestamp('granted_at').defaultTo(knex.fn.now()).notNullable();
    
    table.unique(['user_id', 'permission_key']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('staff_permissions');
  await knex.schema.dropTableIfExists('addresses');
  await knex.schema.dropTableIfExists('password_resets');
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('users');
}
