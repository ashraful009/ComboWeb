"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const env_1 = require("../config/env");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const resetDB = async () => {
    const connection = await db_1.pool.getConnection();
    try {
        // Drop all tables
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        const [rows] = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ?
    `, [env_1.env.DB_NAME]);
        for (const row of rows) {
            await connection.query(`DROP TABLE IF EXISTS \`${row.TABLE_NAME}\``);
        }
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('All tables dropped.');
        // Run setup
        const schemaPath = path_1.default.resolve(__dirname, '../../sql/schema.sql');
        const sql = fs_1.default.readFileSync(schemaPath, 'utf8');
        const statements = sql.split(';').filter(s => s.trim().length > 0);
        for (const statement of statements) {
            await connection.query(statement);
        }
        console.log('Database schema created successfully.');
    }
    catch (error) {
        console.error('Error resetting database:', error);
        connection.release();
    }
};
resetDB().then(() => {
    require('./seed');
});
