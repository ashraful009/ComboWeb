-- FreshAgro Complete Production Database Dump
-- Ready to import in cPanel phpMyAdmin

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS combos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name_bn VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  tag_bn VARCHAR(100) NULL,
  tag_en VARCHAR(100) NULL,
  serves VARCHAR(30) NULL,
  weight_label VARCHAR(30) NULL,
  image_url VARCHAR(255) NULL,
  market_price INT UNSIGNED NOT NULL,
  price INT UNSIGNED NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS combo_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  combo_id INT UNSIGNED NOT NULL,
  name_bn VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  qty_label VARCHAR(50) NOT NULL,
  market_price INT UNSIGNED NOT NULL,
  price INT UNSIGNED NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (combo_id) REFERENCES combos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coupons (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) UNIQUE NOT NULL,
  type ENUM('fixed','percent') NOT NULL,
  value INT UNSIGNED NOT NULL,
  min_order_amount INT UNSIGNED DEFAULT 0,
  max_discount_amount INT UNSIGNED NULL,
  usage_limit INT UNSIGNED NULL,
  used_count INT UNSIGNED DEFAULT 0,
  starts_at DATETIME NULL,
  expires_at DATETIME NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_no VARCHAR(30) UNIQUE,
  public_token CHAR(32) UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(11) NOT NULL,
  email VARCHAR(255) NULL,
  division VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  area VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  delivery_note TEXT NULL,
  delivery_slot VARCHAR(60) NULL,
  delivery_zone ENUM('inside_dhaka','outside_dhaka') NOT NULL,
  payment_method ENUM('cod','bkash','nagad') NOT NULL,
  payment_sender_number VARCHAR(20) NULL,
  payment_txn_id VARCHAR(50) NULL,
  payment_status ENUM('unpaid','paid') DEFAULT 'unpaid',
  order_status ENUM('pending','confirmed','packed','out_for_delivery','delivered','cancelled') DEFAULT 'pending',
  subtotal INT UNSIGNED NOT NULL,
  delivery_charge INT UNSIGNED NOT NULL,
  coupon_id INT UNSIGNED NULL,
  coupon_code VARCHAR(40) NULL,
  discount_amount INT UNSIGNED NOT NULL DEFAULT 0,
  grand_total INT UNSIGNED NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL,
  INDEX idx_order_status (order_status),
  INDEX idx_created_at (created_at),
  INDEX idx_phone (phone)
) ENGINE=InnoDB AUTO_INCREMENT=10001 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  combo_id INT UNSIGNED NULL,
  name_bn VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  items_snapshot JSON NOT NULL,
  market_price INT UNSIGNED NOT NULL,
  unit_price INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  line_total INT UNSIGNED NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (combo_id) REFERENCES combos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(60) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Initial Settings
INSERT INTO settings (setting_key, setting_value) VALUES ('bkash_number', '') ON DUPLICATE KEY UPDATE setting_value = '';
INSERT INTO settings (setting_key, setting_value) VALUES ('delivery_charge_inside_dhaka', '60') ON DUPLICATE KEY UPDATE setting_value = '60';
INSERT INTO settings (setting_key, setting_value) VALUES ('delivery_charge_outside_dhaka', '120') ON DUPLICATE KEY UPDATE setting_value = '120';
INSERT INTO settings (setting_key, setting_value) VALUES ('delivery_time_slots', '[]') ON DUPLICATE KEY UPDATE setting_value = '[]';
INSERT INTO settings (setting_key, setting_value) VALUES ('free_delivery_min_amount', '5000') ON DUPLICATE KEY UPDATE setting_value = '5000';
INSERT INTO settings (setting_key, setting_value) VALUES ('hero_image_url', '') ON DUPLICATE KEY UPDATE setting_value = '';
INSERT INTO settings (setting_key, setting_value) VALUES ('hero_subtitle_bn', '') ON DUPLICATE KEY UPDATE setting_value = '';
INSERT INTO settings (setting_key, setting_value) VALUES ('hero_subtitle_en', '') ON DUPLICATE KEY UPDATE setting_value = '';
INSERT INTO settings (setting_key, setting_value) VALUES ('hero_title_bn', '') ON DUPLICATE KEY UPDATE setting_value = '';
INSERT INTO settings (setting_key, setting_value) VALUES ('hero_title_en', '') ON DUPLICATE KEY UPDATE setting_value = '';
INSERT INTO settings (setting_key, setting_value) VALUES ('invoice_policy_note_bn', '') ON DUPLICATE KEY UPDATE setting_value = '';
INSERT INTO settings (setting_key, setting_value) VALUES ('invoice_policy_note_en', '') ON DUPLICATE KEY UPDATE setting_value = '';
INSERT INTO settings (setting_key, setting_value) VALUES ('nagad_number', '') ON DUPLICATE KEY UPDATE setting_value = '';
INSERT INTO settings (setting_key, setting_value) VALUES ('site_address_bn', 'মধ্য বাড্ডা, ঢাকা ১২১২') ON DUPLICATE KEY UPDATE setting_value = 'মধ্য বাড্ডা, ঢাকা ১২১২';
INSERT INTO settings (setting_key, setting_value) VALUES ('site_address_en', 'Middle Budda, Dhaka 1212') ON DUPLICATE KEY UPDATE setting_value = 'Middle Budda, Dhaka 1212';
INSERT INTO settings (setting_key, setting_value) VALUES ('site_email', 'freshagrosupport@gmail.com') ON DUPLICATE KEY UPDATE setting_value = 'freshagrosupport@gmail.com';
INSERT INTO settings (setting_key, setting_value) VALUES ('site_phone', '01609663345') ON DUPLICATE KEY UPDATE setting_value = '01609663345';
INSERT INTO settings (setting_key, setting_value) VALUES ('site_whatsapp', '+8801609663345') ON DUPLICATE KEY UPDATE setting_value = '+8801609663345';

-- Initial Coupons
INSERT IGNORE INTO coupons (code, type, value, min_order_amount, is_active) VALUES ('CODE', 'fixed', 100, 5000, 1);

-- Combos
INSERT INTO combos (id, name_bn, name_en, tag_bn, tag_en, serves, weight_label, image_url, market_price, price, is_active, sort_order) VALUES (2, 'সাপ্তাহিক প্যাকেজ', 'Weekly Pack', 'সর্বাধিক বিক্রিত', 'Best Seller', '', '', 'https://res.cloudinary.com/dawywlpjn/image/upload/v1791542717/freshagro/e5yux5u3wzz7xczmknxt.png', 3344, 2744, 1, 1);

-- Combo Items
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (88, 2, 'আটা', 'Wheat flour', '2 kg', 130, 100, 0);
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (89, 2, 'মসুর ডাল', 'Red lentils', '1 kg', 110, 90, 1);
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (90, 2, 'সয়াবিন তেল', 'Soybean oil', '2 li', 408, 350, 2);
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (91, 2, 'সরিষার তেল', 'Mustard oil', '1 li', 350, 290, 3);
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (92, 2, 'লবণ', 'Salt', '1 kg', 42, 30, 4);
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (93, 2, 'চিনি', 'Sugar', '1 kg', 110, 95, 5);
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (94, 2, 'মরিচ গুঁড়া', 'Chili powder', '200 gm', 136, 126, 6);
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (95, 2, 'হলুদ গুঁড়া', 'Turmeric powder', '200 gm', 145, 135, 7);
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (96, 2, 'ধনিয়া গুঁড়া', 'Coriander powder', '200 gm', 110, 100, 8);
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (97, 2, 'জিরা গুঁড়া', 'Cumin powder', '100 gm', 150, 133, 9);
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (98, 2, 'ডিম', 'Egg', '12 Pcs', 150, 125, 10);
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (99, 2, 'গুঁড়া সাবান', 'Powdered soap', '2 kg', 400, 320, 11);
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (100, 2, 'ভীম বার', 'Bhim Bar', '1 Pcs', 40, 35, 12);
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (101, 2, 'রসুন', 'Garlic', '250 gm', 65, 45, 13);
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (102, 2, 'আদা', 'Ginger', '250 gm', 65, 35, 14);
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (103, 2, 'টয়লেট পেপার/টিস্যু', 'Toilet paper/tissue', '6 pcs', 168, 130, 15);
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (104, 2, 'নুডলস ৪০০ গ্রাম – ৮ পিস', 'Noodles 400g – 8 pieces', '8 pcs', 160, 130, 16);
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (105, 2, 'হ্যান্ড টাওয়েল টিস্যু', 'Hand towel tissue', '2 pcs', 110, 90, 17);
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (106, 2, 'লিকুইড সোপ /হ্যান্ডওয়াশ', 'Liquid Soap / Handwash', '2 pcs', 160, 145, 18);
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (107, 2, 'লিকুইড ডিশওয়াশ', 'Liquid Dishwash', '200 gm', 50, 40, 19);
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (108, 2, 'নিম সাবান', 'Neem soap', '75 gm', 65, 50, 20);
INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (109, 2, 'র‍্যাপিড পেস্ট', 'Rapid Paste', '100 gm', 220, 150, 21);

SET FOREIGN_KEY_CHECKS = 1;
