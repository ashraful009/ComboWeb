"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = void 0;
const db_1 = require("../config/db");
const shared_1 = require("@freshagro/shared");
const getSettings = async () => {
    const [rows] = await db_1.pool.query('SELECT setting_key, setting_value FROM settings');
    const rawSettings = {};
    for (const row of rows) {
        try {
            rawSettings[row.setting_key] = JSON.parse(row.setting_value);
        }
        catch {
            rawSettings[row.setting_key] = row.setting_value;
        }
    }
    // Parse through Zod schema to apply defaults for missing keys
    return shared_1.SettingsSchema.parse(rawSettings);
};
exports.getSettings = getSettings;
const updateSettings = async (settings) => {
    const entries = Object.entries(settings);
    if (entries.length === 0)
        return;
    const connection = await db_1.pool.getConnection();
    try {
        await connection.beginTransaction();
        for (const [key, value] of entries) {
            const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
            await connection.query('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', [key, stringValue, stringValue]);
        }
        await connection.commit();
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
};
exports.updateSettings = updateSettings;
