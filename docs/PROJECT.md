# freshagro.farm — PROJECT.md

> Single source of truth. Update after EVERY change (endpoint, table, page, rule, bug fix) and read at the start of every session.

**Status:** Stage 4 (Testing & Verification) complete. Fully static audited, unit-tested, and E2E scripted.

## 1. Overview
Bangladesh-based e-commerce site selling ONLY pre-made grocery COMBO packages (never single items).

- **Public site** (no login/registration): Home (hero, combo cards, info sections, mini-cart drawer), Cart, Checkout (+ "Buy Now"), Order Confirmation, Invoice.
- **Admin panel** (single admin login): Dashboard, Combos (CRUD + items), Coupons (CRUD), Orders (list/filter/detail/status/invoice), Settings.
- All business data comes from the DB via the API. Nothing hardcoded.

## 2. Tech stack (fixed)
| Layer | Choice |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS + React Router; Context API only |
| Backend | Node.js + Express + TypeScript |
| Database | MySQL via `mysql2`, raw parameterized SQL only (no ORM/query builder) |
| Validation | zod (types inferred from schemas) |
| Auth | One admin: username + bcrypt hash in `.env`, JWT in httpOnly cookie |
| Production | Express serves built client + `/api` + `/uploads` on one domain |
| Dev | Vite proxy for `/api` and `/uploads` |

## 3. Folder structure (proposed)
```
/client
  src/
    api/            fetch wrappers (zod-parsed responses)
    components/     shared UI (Navbar, CartDrawer, ComboCard, LangToggle…)
    context/        CartContext, LangContext, SettingsContext, AdminAuthContext
    i18n/           en.json, bn.json
    pages/          Home, Cart, Checkout, OrderConfirmation, Invoice
    pages/admin/    Login, Dashboard, Combos, ComboForm, Coupons, Orders, OrderDetail, Settings
    data/           bd-locations.json (static reference data)
    lib/            format (৳), storage (zod-parsed localStorage)
    main.tsx, App.tsx
/server
  src/
    config/         env.ts (zod-parsed env), db.ts (mysql2 pool)
    middleware/     adminAuth, validate, errorHandler, upload
    routes/         public.ts, admin.ts (thin; delegate to services)
    services/       pricing.ts, orders.ts, combos.ts, coupons.ts, settings.ts
    db/             schema.sql, seed.ts, migrate.ts
    app.ts, index.ts
  uploads/
/shared
  src/
    schemas/        zod schemas + inferred DTO types (request/response)
    index.ts
/docs
  PROJECT.md
.env.example, package.json (npm workspaces), tsconfig.base.json, eslint config
```

## 4. DB schema (planned, minimal — 6 tables)
- `combos` (id, name_bn, name_en, tag_bn, tag_en, image_url, serves_bn, serves_en, market_price, our_price, is_active, sort_order, timestamps)
- `combo_items` (id, combo_id FK, name_bn, name_en, qty_label, market_price, our_price, sort_order)
- `coupons` (id, code UNIQUE, type fixed|percent, value, min_order, max_discount NULL, usage_limit NULL, used_count, starts_at NULL, expires_at NULL, is_active)
- `orders` (id, order_no UNIQUE sequential, public_token UNIQUE random, customer name/phone/address/district/division, zone, payment_method, sender_number, txn_id, subtotal, discount, delivery_charge, total, coupon_code, status, payment_status, items_snapshot JSON, timestamps)
- `settings` (key PRIMARY, value) — key/value rows for delivery charges, threshold, contacts, bKash/Nagad, hero image/text, invoice note, time slots (JSON values parsed by zod)
- (order lines stored as JSON snapshot in `orders.items_snapshot`; no separate order_items table to keep it simple)

## 5. API list (planned)
Public: `GET /api/combos`, `GET /api/settings/public`, `POST /api/cart/quote`, `POST /api/orders`, `GET /api/orders/:token`
Admin (cookie auth): `POST /api/admin/login|logout`, `GET /api/admin/me`, `GET /api/admin/dashboard`, combos CRUD + toggle + image upload, coupons CRUD + toggle, `GET /api/admin/orders`, `GET/PATCH /api/admin/orders/:id`, `GET/PUT /api/admin/settings`.

## 6. Env variables (planned)
`PORT`, `NODE_ENV`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET`, `CLIENT_ORIGIN`.

## 7. How to run / seed / test
1. Run `npm install` in the root folder.
2. Ensure you have MySQL running and create the `freshagro` database.
3. Configure `.env` in the root based on `.env.example`.
4. Inside `/server`, run `npm run db:reset` to setup and seed the database.
5. In the root, run `npm run admin:hash -- <password>` to get the hash and place it in `.env`.
6. Run `npm run dev --workspace=server` to start the backend.
7. Use `/docs/api-examples.http` to test endpoints.

## 8. Business rules
- BDT whole-taka integers only. Bangla + English toggle.
- Prices always computed server-side; client sends only combo IDs, quantities, coupon code, zone.
- Orders snapshot combo names, prices, items. Old orders never change.
- Customer pages use random public token, not order number.
- One coupon per order; fixed/percent, min order, max cap, usage limit, dates, active flag.
- Delivery: Inside/Outside Dhaka charge from settings; free when subtotal >= threshold.
- Payment: COD, bKash, Nagad (sender number + txn ID; admin marks paid). No gateway.
- Order status: pending → confirmed → packed → out_for_delivery → delivered | cancelled. Payment: unpaid/paid.

## 9. Code rules
Strict TS; no `any`, `@ts-ignore`, `as unknown as`; zod at every boundary; explicit param/return types; named shared DTOs; no hardcoded business data; no secrets in code; keep simple.

## 10. Decisions
- npm workspaces monorepo; `/shared` consumed as TS source by both sides.
- Order lines as JSON snapshot instead of an extra table.
- Settings as key/value table.

## 11. Open questions (see chat)
All questions resolved. Pricing is calculated on the backend. Used atomic updates for coupons. Order pages use random tokens. Multer added for uploads.

## 12. Changelog
- 2026-10-08: Initial PROJECT.md created (Stage 1 planning).
- 2026-10-08: Backend created and database set up (Stage 2).
- 2026-10-08: Frontend built and wired to API (Stage 3).
- 2026-10-08: Hardcode audit, strict typing (`any` removal), Cloudinary integration, Unit/API/E2E test scripts created (Stage 4).
- 2026-10-08: Completed testing audits. Static audits and unit tests passed. API and E2E tests could not be run locally due to missing MySQL dependency. Test report saved in TEST_REPORT.md.
