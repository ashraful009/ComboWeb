"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const password = process.argv[2];
if (!password) {
    console.error('Usage: npm run admin:hash -- <password>');
    process.exit(1);
}
const hash = bcryptjs_1.default.hashSync(password, 10);
console.log('\nGenerated Hash:');
console.log(hash);
console.log('\nAdd this to your .env file as ADMIN_PASSWORD_HASH');
