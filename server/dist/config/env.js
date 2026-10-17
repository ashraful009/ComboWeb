"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load .env from multiple potential deployment locations
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('production'),
    PORT: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(Number).default(3000),
    DB_HOST: zod_1.z.string().default('127.0.0.1'),
    DB_PORT: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(Number).default(3306),
    DB_USER: zod_1.z.string().min(1),
    DB_PASSWORD: zod_1.z.string().default(''),
    DB_NAME: zod_1.z.string().min(1),
    ADMIN_USERNAME: zod_1.z.string().default('admin'),
    ADMIN_PASSWORD_HASH: zod_1.z.string().min(1),
    JWT_SECRET: zod_1.z.string().default('freshagro-secure-jwt-secret-key-2026'),
    CLIENT_ORIGIN: zod_1.z.string().default('https://freshagro.farm'),
    CLOUDINARY_CLOUD_NAME: zod_1.z.string().optional(),
    CLOUDINARY_API_KEY: zod_1.z.string().optional(),
    CLOUDINARY_API_SECRET: zod_1.z.string().optional(),
});
const rawEnv = {
    ...process.env,
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || process.env.CLIENT_URL || 'https://freshagro.farm',
    JWT_SECRET: process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || process.env.JWT_REFRESH_SECRET || 'freshagro-secure-jwt-secret-key-2026',
};
exports.env = envSchema.parse(rawEnv);
