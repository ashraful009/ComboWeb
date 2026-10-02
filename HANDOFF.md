# AggriGo - Project Handoff & Implementation Plan

## 1. Project Context & Current Status
- **Repositories**: `combo-grocery-api` (Backend - Node.js/Express/Knex/MySQL) and `combo-grocery-web` (Frontend - React/Vite/Zustand).
- **Recent Achievements in previous chat**: 
  - Database schema for Auth (users, refresh_tokens, addresses) is fully set up.
  - Backend Auth routes (`/register`, `/login`) are completely functional with Zod validation.
  - Frontend Auth (Login & Register) pages have been beautifully redesigned with a modern split layout, and integrated with the backend correctly.
  - CORS errors and payload formatting mismatches (e.g. `first_name`/`last_name` splitting) between frontend and backend have been resolved.
  - Backend `.env` and `.env.example` files are properly configured.

## 2. Problem Statement (Mocked Data)
As identified in the project review, the frontend is currently only partially connected. The following areas are relying on mocked or hardcoded data:
1. **Investment Applications**: `InvestmentApplication.tsx` uses fake `setTimeout` requests.
2. **Product Reviews**: Hardcoded state in `ComboDetail.tsx`.
3. **Account Dashboards**: Order Tracking, Address Book, and Investor Dashboard revert to dummy data if API fails.
4. **Cart & Checkout**: Promotional/discount logic is using dummy variables (e.g., `const investorDiscount = 0`).
5. **Empty API Services**: Core service files in `src/api/` (like `combo.api.ts`, `auth.api.ts`, `cart.api.ts`) are completely empty.

---

## 3. Implementation Plan (Next Steps for New Chat)

### Phase 1: Consolidate API Client & Services
- **Goal**: Populate the empty files in `src/api/` and route all frontend requests through them to maintain clean architecture.
- **Action Items**:
  - Implement `auth.api.ts` (login, register, logout, getProfile).
  - Implement `combo.api.ts` (getCombos, getComboById, getReviews).
  - Implement `cart.api.ts` & `order.api.ts` (checkout, tracking).
  - Implement `user.api.ts` (addresses, investor application, KYC).

### Phase 2: Connect Investment & KYC Workflows
- **Goal**: Replace fake `setTimeout` in `InvestmentApplication.tsx` and connect `InvestorDashboard.tsx`.
- **Backend Requirements**: Ensure `/api/v1/investments` endpoints exist, handle application submission, and status fetching.
- **Frontend Action**: Map form data to the new API services and handle real loading/error states.

### Phase 3: Connect Account Dashboards & Reviews
- **Goal**: Feed real user data into `AddressBook.tsx`, `Order Tracking`, and `ComboDetail.tsx`.
- **Backend Requirements**: Implement `/api/v1/users/addresses` and `/api/v1/combos/:id/reviews`.
- **Frontend Action**: Fetch data inside `useEffect` (or React Query if added) and map to component state, removing all dummy data fallbacks.

### Phase 4: Cart & Checkout Logic
- **Goal**: Make discounts, coupons, and cart totals dynamic based on backend validation.
- **Backend Requirements**: Implement `/api/v1/orders/checkout` to calculate real totals and verify investor/coupon discounts on the server.
- **Frontend Action**: Pass cart items to the backend and use the returned pricing/discounts to render the checkout totals, instead of calculating them on the frontend.

---
**Instruction for AI in new chat**: Please review this document to understand the context, then begin executing **Phase 1** of the Implementation Plan.
