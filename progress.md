# Meritspe Pre-IPO Platform — Progress

## Stack
- **Frontend:** Next.js (App Router) — `C:\Project_pre-IPO\website`
- **Backend:** Django REST Framework — `C:\Project_pre-IPO\preipo_backend`
- **DB:** SQLite (dev)

---

## Completed

### Backend (Django)
- Stock model with `name`, `full_name`, `ticker`, `sector`, `category`, `description`, `fundamentals_url`, `fundamentals_json`
- `DailyPrice` model tracking price, change, change_pct, high_52w, low_52w per day
- `serialize_stock()` returns all fields including `fundamentalsUrl` and `fundamentalsJson`
- CRUD endpoints: `stock_list`, `stock_detail`, `stock_create`, `stock_update`, `stock_delete`
- News feed endpoint via yfinance
- Migrations applied through `0007_add_fundamentals_json`

### Frontend (Next.js)
- Stock cards grid with Buy/Sell buttons, sector badges, 52W high/low
- Filter tabs (All, Pre-IPO, DRHP Filed, sector filters, Top Gainers) — all stocks shown when "All" selected
- Company modal with About text + Fundamentals section (always shows all 12 fields, "—" for missing)
- Enquiry modal (Buy/Sell)
- Admin panel with Add/Edit/Delete stocks, password-gated
  - Add Stock form includes Fundamentals URL field
  - Edit row expands to show Description, Fundamentals URL, and manual Fundamentals key-value entry (12 fields)
  - Manual `fundamentalsJson` stored in DB overrides auto-scrape when set

### Fundamentals Scraping (`/api/company-info`)
- Scrapes unlistedzone.com for all 21 stocks via Bootstrap grid + JSON-LD parsing
- About text scraped from Altius, fallback to DuckDuckGo API
- Planify.in as tertiary fallback (4 fields: ISIN, Market Cap, P/E, Face Value)
- 1-hour in-memory cache per stock
- New stocks: paste unlistedzone URL into Fundamentals URL field in admin — auto-scraped
- **All 21 stocks verified returning fundamentals ✅**

**Scraping priority per stock:**
1. Manual `fundamentalsUrl` from DB → scrape that URL
2. `UZ_SLUG_OVERRIDE` map → unlistedzone custom slug
3. Auto-generated unlistedzone slug (without "limited")
4. Auto-generated unlistedzone slug (with "limited")
5. Planify.in fallback

**Unlistedzone slug overrides (13 non-standard URLs):**
| Company | Slug |
|---|---|
| National Stock Exchange of India Ltd | nse-india-limited-unlisted-shares |
| Apollo Green Energy Ltd | apollo-green-energy-limited-unlisted-shares |
| Chennai Super Kings Cricket Ltd | csk-share-price-buy-sell-unlisted-shares |
| Nayara Energy Ltd | buy-sell-share-price-essar-oil-limited-unlisted-shares |
| Oravel Stays Ltd (OYO) | oravel-stays-limited-oyo-unlisted-shares |
| Sterlite Power Transmission Ltd | sterlite-electric-limited-formerly-sterlite-power-unlisted-shares |
| Onix Renewable Ltd | onix-renewable-unlisted-shares-buy-sell-online |
| API Holdings Ltd (PharmEasy) | pharmeasy-share-price-buy-sell-online |
| SBI Funds Management Ltd | sbi-mutual-fund-unlisted-shares |
| National E-Repository Ltd | national-e-repository-share-price-buy-sell-online |
| Parag Parikh Financial Advisory Services Ltd | parag-parikh-financial-advisory-services-share-price-buy-sell-online |
| Metropolitan Stock Exchange of India Ltd | msei-share-price-buy-sell-unlisted-shares-of-msei-metropolitan-stock-exchange |
| National Commodity & Derivatives Exchange Ltd | national-commodity-derivatives-exchange-ncdex-limited-unlisted-shares |

---

### User Authentication (3-Step Registration)
- **Step 1 — Sign-up** (`website/src/app/signup/page.tsx` → Django `/api/auth/register/step1/`)
  - Fields: phone, email, password, confirm_password
  - Creates `CustomUser` in DB, returns JWT access + refresh tokens
  - Pushes Kylas lead with `cfKycStatus: "Pending"` (fire-and-forget)
- **Step 2 — Account Type** (`website/src/app/register/type/page.tsx` → Django `/api/auth/register/step2/`)
  - User selects Individual or Corporate
  - Sets `registration_step = 2` on user record
- **Step 3 — KYC** (`website/src/app/register/kyc/page.tsx` → Django `/api/auth/register/step3/`)
  - Fields: PAN number, PAN name, bank account, IFSC, bank name, account holder name, address, city, state, ZIP
  - Document uploads: PAN card, cancelled cheque
  - Sets `kyc_status = "submitted"`, `registration_step = 3`
  - Pushes Kylas lead with full KYC details and `cfKycStatus: "Submitted"` (fire-and-forget)
- **Login** (`website/src/app/login/page.tsx` → Django `/api/auth/login/`)
  - Email + password, returns JWT pair + user profile
  - Routes incomplete users back to the correct registration step
- **JWT token management** (`website/src/context/AuthContext.tsx`, `website/src/lib/auth.ts`)
  - Tokens stored in localStorage + cookies
  - Auto-refresh every 55 minutes
  - `useAuth()` hook available to all components
- **Logout** — blacklists refresh token on Django via `/api/auth/logout/`
- **`CustomUser` model** (`preipo_backend/accounts/models.py`)
  - Fields: email, phone, account_type, registration_step, kyc_status
  - KYC fields: pan_number, pan_name, state, city, address, zip_code, bank_account, ifsc_code, bank_name, account_holder_name
  - Document fields: pan_card_doc, cheque_doc

### KYC Form Validation
- Client-side format validation on submit (no API call, pure regex)
- PAN Number: `AAAAA0000A` format, required
- Name as per PAN: required
- Account Number: 9–18 digits, required
- IFSC Code: `AAAA0000000` format, required
- City, State: required
- ZIP Code: exactly 6 digits
- Inline red errors per field, borders turn red, form blocks submission until all pass

### CRM Integration (Kylas) — Outbound Lead Push
- Enquiry modal (Buy/Sell) → creates Kylas lead via `/api/enquiry`
- Sign-up (Step 1) → creates Kylas lead with email, phone, `cfKycStatus: "Pending"` via `/api/auth/signup`
- KYC (Step 3) → creates Kylas lead with full name (from PAN), `cfPanNumber`, `cfCity`, `cfState`, `cfAccountType`, `cfKycStatus: "Submitted"` via `/api/auth/kyc`
- Custom fields used: `cfPanNumber`, `cfAccountType`, `cfKycStatus`
- System fields used for address: `city`, `state` (top-level in payload)
- All CRM calls are fire-and-forget (non-blocking)

### Portfolio Feature
- `Portfolio` model in `preipo_backend/accounts/models.py`
  - Links `CustomUser` → `Stock` with fields: `quantity`, `purchase_price`, `purchase_date`
  - Ordered by `-purchase_date`
  - Migration: `accounts/migrations/0003_portfolio.py` — run `python manage.py migrate` before testing
- `PortfolioSerializer` in `accounts/serializers.py`
  - Computed fields: `current_price` (latest `DailyPrice`), `unrealized_pnl`, `pct_return`
  - 1 DB query per holding (cached on object)
- `GET /api/auth/portfolio/` — JWT-protected, returns logged-in user's holdings with live P&L
- `POST /api/webhook/kylas-deal/` — receives Kylas deal-closed webhook, auto-creates `Portfolio` entry
  - Looks up user by `panNumber`, stock by `ticker` (unique field — safer than name)
  - Kylas webhook payload: `{ panNumber, ticker, quantity, purchasePrice, purchaseDate }`
- `/portfolio` frontend page (`website/src/app/portfolio/page.tsx`)
  - Protected route — redirects to `/login` if not authenticated
  - Summary stat cards: Invested, Current Value, Unrealized P&L (with overall % return)
  - Holdings table: Stock (avatar + name + ticker) | Qty | Buy | Current | P&L (with trend icon) | Return (pill badge) | Date
  - P&L and % return coloured green/red with TrendingUp/TrendingDown icons
  - Frosted glass card style (rgba white + backdrop-blur), orange gradient header bar
- **Portfolio panel in navbar** — "Portfolio" nav item appears between Explore and About Us for authenticated users
  - Slides down inline below the navbar (no page navigation), lazy-fetches holdings on first open
  - Works on desktop and mobile

---

## Personal Portfolio Flow (Design)

```
User submits Buy/Sell enquiry on website
        ↓
Kylas lead created (outbound push — already built)
        ↓
CRM agent contacts user, negotiates deal offline
        ↓
Deal closed and marked in Kylas CRM
  (Kylas deal fields: stock name, quantity, purchase price, purchase date, user PAN/ID)
        ↓
Kylas fires webhook → POST /api/webhook/kylas-deal/  ✅
        ↓
Django looks up user by PAN, looks up stock by ticker
Creates Portfolio entry automatically
        ↓
User logs in → /portfolio page shows their holdings  ✅
  Columns: Stock | Qty | Purchase Price | Current Price | Unrealized P&L | % Return | Date
  P&L = (current_price - purchase_price) × quantity
  % Return = ((current_price - purchase_price) / purchase_price) × 100
  Current price pulled live from DailyPrice table
```

---

## Pending

### Other
- [x] Fix footer links (all `href="#"`)
- [x] Fix WhatsApp placeholder number (`919999999999`)
- [ ] Production deployment
- [ ] Fill in `DJANGO_ADMIN_EMAIL` and `DJANGO_ADMIN_PASS` in `website/.env.local`
- [x] Test full signup → KYC → Kylas lead flow end-to-end
  - Step 1 (signup), Step 2 (account type), Step 3 (KYC), login, /me all verified ✅
- [x] Test enquiry → Kylas lead push end-to-end ✅
- [ ] Test Kylas deal close → webhook → portfolio update flow end-to-end
- [ ] Run `python manage.py migrate` to apply Portfolio migration (`0003_portfolio`)
