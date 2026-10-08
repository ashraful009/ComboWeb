import { createDB } from 'mysql-memory-server';
import { execSync, spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';

async function run() {
  let db;
  try {
    console.log('Starting mysql-memory-server...');
    db = await createDB({ dbName: 'freshagro_test', logLevel: 'ERROR', version: '8.4.x' });
    console.log(`DB started on port ${db.port} with user ${db.username}`);

    process.env.DB_HOST = '127.0.0.1';
    process.env.DB_PORT = db.port.toString();
    process.env.DB_USER = db.username;
    process.env.DB_PASSWORD = '';
    process.env.DB_NAME = db.dbName;
    process.env.JWT_SECRET = 'testsecret';
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD_HASH = '$2a$10$TKh8H1.PfQx37YgCzwiTmO.z/x.c.NqUj2.3.4.5.6.7.8.9';

    console.log('Running db:reset...');
    execSync('npm run db:reset', { stdio: 'inherit', env: process.env });

    console.log('Running tests...');
    const result = spawnSync('npm', ['run', 'test:api'], { stdio: 'inherit', env: process.env, shell: true });
    
    if (result.status !== 0) {
      console.error(`Tests failed with exit code ${result.status}`);
      process.exitCode = result.status;
    } else {
      console.log('Tests passed!');
    }
  } catch (err) {
    console.error('Error running tests:', err);
    process.exitCode = 1;
  } finally {
    if (db) {
      console.log('Stopping mysql-memory-server...');
      await db.stop();
    }
  }
}

run();
