import { createDB } from 'mysql-memory-server';
import { spawn, execSync } from 'child_process';
import path from 'path';

async function run() {
  console.log('Starting mysql-memory-server...');
  const db = await createDB({ dbName: 'freshagro_test', logLevel: 'ERROR', version: '8.4.x' });
  console.log(`DB started on port ${db.port}`);

  process.env.DB_HOST = '127.0.0.1';
  process.env.DB_PORT = db.port.toString();
  process.env.DB_USER = db.username;
  process.env.DB_PASSWORD = '';
  process.env.DB_NAME = db.dbName;
  process.env.JWT_SECRET = 'testsecret';
  process.env.ADMIN_USERNAME = 'admin';
  process.env.ADMIN_PASSWORD_HASH = '$2a$10$TKh8H1.PfQx37YgCzwiTmO.z/x.c.NqUj2.3.4.5.6.7.8.9';
  process.env.NODE_ENV = 'test';


  console.log('Running db:reset...');
  execSync('npm run db:reset --workspace=server', { stdio: 'inherit', env: process.env });

  const client = spawn('npm', ['run', 'dev', '--workspace=client'], { stdio: 'inherit', env: process.env, shell: true });
  const server = spawn('npm', ['run', 'dev', '--workspace=server'], { stdio: 'inherit', env: process.env, shell: true });

  const stop = () => {
    client.kill();
    server.kill();
    db.stop();
  };

  client.on('close', stop);
  server.on('close', stop);
}
run();
