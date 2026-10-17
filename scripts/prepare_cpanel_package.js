const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function preparePackage() {
  const rootDir = path.resolve(__dirname, '..');
  const deployDir = path.join(rootDir, 'cpanel_deploy');

  console.log('1. Preparing deployment directory:', deployDir);
  if (fs.existsSync(deployDir)) {
    fs.rmSync(deployDir, { recursive: true, force: true });
  }
  fs.mkdirSync(deployDir, { recursive: true });

  // 2. Copy compiled frontend (client/dist -> public & root for LiteSpeed)
  const clientDist = path.join(rootDir, 'client', 'dist');
  const publicDest = path.join(deployDir, 'public');
  console.log('2. Copying frontend build from', clientDist, 'to', publicDest, 'and root');
  copyDirSync(clientDist, publicDest);
  copyDirSync(clientDist, deployDir);

  // 3. Copy compiled server (server/dist -> server/dist)
  const serverDist = path.join(rootDir, 'server', 'dist');
  const serverDest = path.join(deployDir, 'server', 'dist');
  console.log('3. Copying backend build from', serverDist, 'to', serverDest);
  copyDirSync(serverDist, serverDest);

  // 4. Copy shared package (shared -> shared)
  const sharedSrc = path.join(rootDir, 'shared');
  const sharedDest = path.join(deployDir, 'shared');
  console.log('4. Copying shared package to', sharedDest);
  fs.mkdirSync(path.join(sharedDest, 'dist'), { recursive: true });
  fs.copyFileSync(path.join(sharedSrc, 'package.json'), path.join(sharedDest, 'package.json'));
  copyDirSync(path.join(sharedSrc, 'dist'), path.join(sharedDest, 'dist'));

  // 5. Create uploads directory with a placeholder
  const uploadsDest = path.join(deployDir, 'uploads');
  fs.mkdirSync(uploadsDest, { recursive: true });
  fs.writeFileSync(path.join(uploadsDest, '.gitkeep'), '');

  const appJsContent = `// ==============================================================
// FreshAgro - cPanel Node.js Application Startup File
// ==============================================================
const path = require('path');

// Preserve Passenger dynamic port before dotenv loads
const passengerPort = process.env.PORT;

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import the compiled Express application
const app = require('./server/dist/app').default;

// Port binding for cPanel Phusion Passenger / LiteSpeed
if (typeof(PhusionPassenger) !== 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
  app.listen('passenger', () => {
    console.log('----------------------------------------------------');
    console.log(' FreshAgro is running under Phusion Passenger!');
    console.log(' Domain: https://freshagro.farm');
    console.log(' Mode:   ' + (process.env.NODE_ENV || 'production'));
    console.log('----------------------------------------------------');
  });
} else {
  const port = passengerPort || process.env.PORT || 3000;
  app.listen(port, () => {
    console.log('----------------------------------------------------');
    console.log(' FreshAgro Production Server is Running!');
    console.log(' Domain: https://freshagro.farm');
    console.log(' Port:   ' + port);
    console.log(' Mode:   ' + (process.env.NODE_ENV || 'production'));
    console.log('----------------------------------------------------');
  });
}
`;
  fs.writeFileSync(path.join(deployDir, 'app.js'), appJsContent, 'utf8');

  // 7. Create root package.json for cPanel production install
  const serverPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'server', 'package.json'), 'utf8'));
  const prodPkg = {
    name: "freshagro-farm",
    version: "1.0.0",
    private: true,
    main: "app.js",
    scripts: {
      start: "node app.js"
    },
    dependencies: {
      ...serverPkg.dependencies,
      "@freshagro/shared": "file:./shared"
    }
  };
  fs.writeFileSync(path.join(deployDir, 'package.json'), JSON.stringify(prodPkg, null, 2), 'utf8');

  // 8. Create production .env.example
  const envExampleContent = `# ==============================================================
# FreshAgro Production Environment Settings (.env)
# Rename this file to .env on your cPanel server
# ==============================================================

NODE_ENV=production
PORT=3000

# Database Configuration (Create in cPanel MySQL Databases)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=cpaneluser_freshagro
DB_USER=cpaneluser_dbuser
DB_PASSWORD=YourStrongDatabasePasswordHere

# Admin Login Credentials (for /admin)
ADMIN_USERNAME=admin
# Default admin password hash for password "admin123"
ADMIN_PASSWORD_HASH=$2a$10$7Jmruc0xR70SCpJV7We3ve.jzruUCuvFkjxPLwwSTTdoqhxG4vk/i
JWT_SECRET=Hn5rTqKv8wYmLxBj2cEoZs3gDaWuPi9fVbNtXh6dRkMp4eSyJl7nCz0vQwFaGiUo

# Website URL (Your Domain)
CLIENT_ORIGIN=https://freshagro.farm

# Cloudinary Media Storage (Optional, for image uploads)
CLOUDINARY_CLOUD_NAME=dawywlpjn
CLOUDINARY_API_KEY=151532963797113
CLOUDINARY_API_SECRET=0Sdgz9YH0dHLe7RHuiP3bmQqGo0
`;
  fs.writeFileSync(path.join(deployDir, '.env.example'), envExampleContent, 'utf8');

  // 9. Create production .htaccess
  const htaccessContent = `# ==============================================================
# FreshAgro cPanel Apache & LiteSpeed Configuration
# Location: /freshagro.farm/.htaccess
# ==============================================================

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # 1. Force HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # 2. Prevent Directory Browsing and block sensitive files
  Options -Indexes
  RewriteRule ^(\.env|package\.json|package-lock\.json|database\.sql) - [F,L]

  # 3. Directly serve assets and static files from public/
  RewriteRule ^assets/(.*)$ public/assets/$1 [L]
  RewriteRule ^vite\.svg$ public/vite.svg [L]

  # 4. React Single Page Application (SPA) Fallback
  # If requested path is not an API call or Uploads, fallback to index.html
  RewriteCond %{REQUEST_URI} !^/api/
  RewriteCond %{REQUEST_URI} !^/uploads/
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ public/index.html [L]
</IfModule>

# Caching Configuration for Static Assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
  Header set X-Frame-Options "SAMEORIGIN"
</IfModule>
`;
  // NOTE: Written as .htaccess.example (NOT .htaccess) on purpose.
  // cPanel "Setup Node.js App" injects a PASSENGER CONFIGURATION block into the
  // live .htaccess. Overwriting it on extract breaks all /api routes (404).
  fs.writeFileSync(path.join(deployDir, '.htaccess.example'), htaccessContent, 'utf8');

  // 10. Dump complete database.sql
  console.log('5. Dumping database.sql...');
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'freshagro'
    });

    const schemaSql = fs.readFileSync(path.join(rootDir, 'server', 'sql', 'schema.sql'), 'utf8');
    let sqlOutput = `-- FreshAgro Complete Production Database Dump\n-- Ready to import in cPanel phpMyAdmin\n\n`;
    sqlOutput += `SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS = 0;\n\n`;
    sqlOutput += schemaSql + `\n\n`;

    const [settings] = await conn.query('SELECT * FROM settings');
    if (settings.length > 0) {
      sqlOutput += `-- Initial Settings\n`;
      for (const s of settings) {
        sqlOutput += `INSERT INTO settings (setting_key, setting_value) VALUES (${conn.escape(s.setting_key)}, ${conn.escape(s.setting_value)}) ON DUPLICATE KEY UPDATE setting_value = ${conn.escape(s.setting_value)};\n`;
      }
      sqlOutput += `\n`;
    }

    const [coupons] = await conn.query('SELECT * FROM coupons');
    if (coupons.length > 0) {
      sqlOutput += `-- Initial Coupons\n`;
      for (const c of coupons) {
        sqlOutput += `INSERT IGNORE INTO coupons (code, type, value, min_order_amount, is_active) VALUES (${conn.escape(c.code)}, ${conn.escape(c.type)}, ${c.value}, ${c.min_order_amount}, ${c.is_active});\n`;
      }
      sqlOutput += `\n`;
    }

    const [combos] = await conn.query('SELECT * FROM combos');
    if (combos.length > 0) {
      sqlOutput += `-- Combos\n`;
      for (const cb of combos) {
        sqlOutput += `INSERT INTO combos (id, name_bn, name_en, tag_bn, tag_en, serves, weight_label, image_url, market_price, price, is_active, sort_order) VALUES (${cb.id}, ${conn.escape(cb.name_bn)}, ${conn.escape(cb.name_en)}, ${conn.escape(cb.tag_bn)}, ${conn.escape(cb.tag_en)}, ${conn.escape(cb.serves)}, ${conn.escape(cb.weight_label)}, ${conn.escape(cb.image_url)}, ${cb.market_price}, ${cb.price}, ${cb.is_active}, ${cb.sort_order});\n`;
      }
      sqlOutput += `\n`;
    }

    const [items] = await conn.query('SELECT * FROM combo_items');
    if (items.length > 0) {
      sqlOutput += `-- Combo Items\n`;
      for (const it of items) {
        sqlOutput += `INSERT INTO combo_items (id, combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES (${it.id}, ${it.combo_id}, ${conn.escape(it.name_bn)}, ${conn.escape(it.name_en)}, ${conn.escape(it.qty_label)}, ${it.market_price}, ${it.price}, ${it.sort_order});\n`;
      }
      sqlOutput += `\n`;
    }

    sqlOutput += `SET FOREIGN_KEY_CHECKS = 1;\n`;
    await conn.end();
    fs.writeFileSync(path.join(deployDir, 'database.sql'), sqlOutput, 'utf8');
    console.log('Database dump saved to cpanel_deploy/database.sql');
  } catch (err) {
    console.warn('Could not dump from running MySQL, copying schema.sql as fallback:', err.message);
    const schemaSql = fs.readFileSync(path.join(rootDir, 'server', 'sql', 'schema.sql'), 'utf8');
    fs.writeFileSync(path.join(deployDir, 'database.sql'), schemaSql, 'utf8');
  }

  // 10.5 Bundle node_modules if node_modules.zip exists
  const nodeModulesZip = path.join(rootDir, 'node_modules.zip');
  if (fs.existsSync(nodeModulesZip)) {
    console.log('Including node_modules in deployment package...');
    try {
      const { execSync } = require('child_process');
      execSync(`tar.exe -xf "${nodeModulesZip}" -C "${deployDir}"`);
      console.log('✅ node_modules bundled into deployment folder!');
    } catch (nmErr) {
      console.warn('Could not extract node_modules.zip:', nmErr.message);
    }
  }

  console.log('✅ Deployment folder prepared successfully at:', deployDir);

  // 11. Create freshagro_cpanel.zip archive
  try {
    const { execSync } = require('child_process');
    const zipPath = path.join(rootDir, 'freshagro_cpanel.zip');
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
    console.log('6. Creating freshagro_cpanel.zip...');
    execSync(`tar.exe -a -c -f "${zipPath}" -C "${deployDir}" .`);
    console.log('✅ Deployment ZIP created at:', zipPath);
  } catch (zErr) {
    console.warn('Could not auto-zip:', zErr.message);
  }
}

preparePackage().catch(console.error);
