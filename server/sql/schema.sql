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
