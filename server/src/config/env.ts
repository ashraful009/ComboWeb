import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from multiple potential deployment locations
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  PORT: z.union([z.string(), z.number()]).transform(Number).default(3000),
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.union([z.string(), z.number()]).transform(Number).default(3306),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().min(1),
  ADMIN_USERNAME: z.string().default('admin'),
  ADMIN_PASSWORD_HASH: z.string().min(1),
  JWT_SECRET: z.string().default('freshagro-secure-jwt-secret-key-2026'),
  CLIENT_ORIGIN: z.string().default('https://freshagro.farm'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const rawEnv = {
  ...process.env,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || process.env.CLIENT_URL || 'https://freshagro.farm',
  JWT_SECRET: process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || process.env.JWT_REFRESH_SECRET || 'freshagro-secure-jwt-secret-key-2026',
};

export const env = envSchema.parse(rawEnv);
