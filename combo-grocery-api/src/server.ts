import { createApp } from './app';
import { env } from './config';
import { db } from './config/db';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`API running on port ${env.PORT} (${env.NODE_ENV})`);
});

const shutdown = (signal: string): void => {
  console.log(`${signal} received, shutting down...`);
  server.close(() => {
    void db.destroy().then(() => process.exit(0));
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});
