import { pool } from '../config/db';
import fs from 'fs';
import path from 'path';

const setupDB = async () => {
  const schemaPath = path.resolve(__dirname, '../../sql/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  // Split by ; to run multiple statements (or use multipleStatements: true in mysql2)
  const statements = sql.split(';').filter(s => s.trim().length > 0);

  const connection = await pool.getConnection();
  try {
    for (const statement of statements) {
      await connection.query(statement);
    }
    console.log('Database schema created successfully.');
  } catch (error) {
    console.error('Error creating schema:', error);
  } finally {
    connection.release();
    pool.end();
  }
};

setupDB();
