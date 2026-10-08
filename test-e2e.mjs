import { createDB } from 'mysql-memory-server';
import { execSync, spawnSync, spawn } from 'child_process';
import path from 'path';

async function run() {
  let db;
  try {
    console.log('Starting mysql-memory-server for E2E...');
    db = await createDB({ dbName: 'freshagro_test', logLevel: 'ERROR', version: '8.4.x' });
    console.log(`DB started on port ${db.port} with user ${db.username}`);

    process.env.DB_HOST = '127.0.0.1';
    process.env.DB_PORT = db.port.toString();
    process.env.DB_USER = db.username;
    process.env.DB_PASSWORD = '';
    process.env.DB_NAME = db.dbName;
    process.env.JWT_SECRET = 'testsecret';
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD_HASH = '$2a$10$WJCCIlGdvBzxprZVhrd7Dubc9n/egacSTd4v1AOvOsmxD4DkDIq5y';

    console.log('Running db:reset in server workspace...');
    execSync('npm run db:reset --workspace=server', { stdio: 'inherit', env: process.env });

    console.log('Running playwright tests...');
    const result = spawnSync('npm', ['run', 'test:e2e'], { stdio: 'inherit', env: process.env, shell: true });
    
    if (result.status !== 0) {
      console.error(`Tests failed with exit code ${result.status}`);
      process.exitCode = result.status;
    } else {
      console.log('E2E Tests passed!');
    }
  } catch (err) {
    console.error('Error running E2E tests:', err);
    process.exitCode = 1;
  } finally {
    if (db) {
      console.log('Stopping mysql-memory-server...');
      await db.stop();
    }
  }
}

run();
