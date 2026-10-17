"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const setupDB = async () => {
    const schemaPath = path_1.default.resolve(__dirname, '../../sql/schema.sql');
    const sql = fs_1.default.readFileSync(schemaPath, 'utf8');
    // Split by ; to run multiple statements (or use multipleStatements: true in mysql2)
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    const connection = await db_1.pool.getConnection();
    try {
        for (const statement of statements) {
            await connection.query(statement);
        }
        console.log('Database schema created successfully.');
    }
    catch (error) {
        console.error('Error creating schema:', error);
    }
    finally {
        connection.release();
        db_1.pool.end();
    }
};
setupDB();
