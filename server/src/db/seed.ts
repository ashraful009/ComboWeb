import { pool } from '../config/db';
import fs from 'fs';
import path from 'path';
import { ResultSetHeader } from 'mysql2';

const seedDB = async () => {
  const seedPath = path.resolve(__dirname, '../../seed/combos.seed.json');
  const combosData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insert Settings
    const settings = {
      delivery_charge_inside_dhaka: "60",
      delivery_charge_outside_dhaka: "120",
      free_delivery_min_amount: "5000",
      site_phone: "01700000000",
      site_whatsapp: "01700000000",
      site_email: "support@freshagro.farm",
      site_address_bn: "ঢাকা, বাংলাদেশ",
      site_address_en: "Dhaka, Bangladesh",
      bkash_number: "01700000000",
      nagad_number: "01700000000",
      hero_image_url: "",
      hero_title_bn: "ফ্রেশ এগ্রো ফার্ম",
      hero_title_en: "Freshagro Farm",
      hero_subtitle_bn: "খাঁটি ও তাজা পণ্যের সমাহার",
      hero_subtitle_en: "Fresh & Authentic Groceries",
      invoice_policy_note_bn: "পণ্য বুঝে পেয়ে মূল্য পরিশোধ করুন।",
      invoice_policy_note_en: "Please check your products before paying.",
      delivery_time_slots: JSON.stringify(["Morning (9 AM - 12 PM)", "Afternoon (1 PM - 4 PM)", "Evening (5 PM - 8 PM)"])
    };

    for (const [key, value] of Object.entries(settings)) {
      await connection.query(
        'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, value, value]
      );
    }

    // Insert Coupon
    await connection.query(
      `INSERT IGNORE INTO coupons (code, type, value, min_order_amount, is_active) 
       VALUES ('FRESH100', 'fixed', 100, 0, 1)`
    );

    // Insert Combos
    for (const combo of combosData) {
      const [comboResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO combos (name_bn, name_en, tag_bn, tag_en, serves, weight_label, image_url, market_price, price, is_active, sort_order) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [combo.name_bn, combo.name_en, combo.tag_bn, combo.tag_en, combo.serves, combo.weight_label, combo.image_url, combo.market_price, combo.price, combo.is_active, combo.sort_order]
      );

      const comboId = comboResult.insertId;

      if (combo.items && combo.items.length > 0) {
        const itemsData = combo.items.map((item: { name_bn: string, name_en: string, qty_label: string, market_price: number, price: number, sort_order: number }) => [
          comboId, item.name_bn, item.name_en, item.qty_label, item.market_price, item.price, item.sort_order
        ]);
        await connection.query(
          'INSERT INTO combo_items (combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES ?',
          [itemsData]
        );
      }
    }

    await connection.commit();
    console.log('Database seeded successfully.');
  } catch (error) {
    await connection.rollback();
    console.error('Error seeding database:', error);
  } finally {
    connection.release();
    pool.end();
  }
};

seedDB();
