import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { Settings, SettingsSchema } from '@freshagro/shared';

export const getSettings = async (): Promise<Settings> => {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT setting_key, setting_value FROM settings');
  
  const rawSettings: Record<string, unknown> = {};
  for (const row of rows) {
    try {
      rawSettings[row.setting_key] = JSON.parse(row.setting_value);
    } catch {
      rawSettings[row.setting_key] = row.setting_value;
    }
  }

  // Parse through Zod schema to apply defaults for missing keys
  return SettingsSchema.parse(rawSettings);
};

export const updateSettings = async (settings: Partial<Settings>): Promise<void> => {
  const entries = Object.entries(settings);
  if (entries.length === 0) return;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    for (const [key, value] of entries) {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      await connection.query(
        'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, stringValue, stringValue]
      );
    }
    
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
