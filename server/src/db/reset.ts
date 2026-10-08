import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { env } from '../config/env';
import fs from 'fs';
import path from 'path';

const resetDB = async () => {
  const connection = await pool.getConnection();
  try {
    // Drop all tables
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    const [rows] = await connection.query<RowDataPacket[]>(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ?
    `, [env.DB_NAME]);

    for (const row of rows) {
      await connection.query(`DROP TABLE IF EXISTS \`${row.TABLE_NAME}\``);
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('All tables dropped.');

    // Run setup
    const schemaPath = path.resolve(__dirname, '../../sql/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    const statements = sql.split(';').filter(s => s.trim().length > 0);

    for (const statement of statements) {
      await connection.query(statement);
    }
    console.log('Database schema created successfully.');

  } catch (error) {
    console.error('Error resetting database:', error);
    connection.release();
  }
};

resetDB().then(() => {
  require('./seed');
});
