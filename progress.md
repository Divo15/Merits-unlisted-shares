# Meritspe Pre-IPO Platform — Progress

## Stack
- **Frontend:** Next.js (App Router) — `website/`
- **Backend:** Django REST Framework — `preipo_backend/`
- **DB:** PostgreSQL 18 (`preipo_db`)

## Environment (New Laptop Setup — 11 May 2026)
- Python 3.12.10 installed via winget
- Node.js v26.1.0 + npm 11.13.0 installed via winget
- PostgreSQL 18.3 installed via winget, running on port 5432
  - Data dir: `C:\pgdata`
  - User: `postgres` / Password: `12345678`
  - DB: `preipo_db` (created and migrated)
- Django superuser: `meritsdev1@gmail.com` / `admin@1234`
- All migrations applied (stocks, accounts, portfolio, JWT blacklist, `0008_add_logo_url`)
- 21 correct stocks seeded via `preipo_backend/seed.py`
- 19/21 logos matched in DB via `preipo_backend/seed_logos.py`

## Running Locally
```powershell
# Frontend (http://localhost:3000)
cd website && npm run dev

# Backend (http://localhost:8000)
cd preipo_backend && python manage.py runserver 8000
```

---

## Completed

### Backend (Django)
- Stock model with `name`, `full_name`, `ticker`, `sector`, `category`, `description`, `fundamentals_url`, `fundamentals_json`, `logo_url`
- `DailyPrice` model tracking price, change, change_pct, high_52w, low_52w per day
- `serialize_stock()` returns all fields including `fundamentalsUrl`, `fundamentalsJson`, `logoUrl`
- CRUD endpoints: `stock_list`, `stock_detail`, `stock_create`, `stock_update`, `stock_delete`
- News feed endpoint via yfinance
- All migrations applied through `0008_add_logo_url` + `accounts/0003_portfolio`
- **21 correct stocks seeded** (`preipo_backend/seed.py`) ✅
  - Replaced 7 wrong placeholder stocks with correct ones
  - Correct 21: NSE, APOLLOGREEN, CSK, NAYARA, OYO, STERLITEPOWER, ONIX, PHARMEASY, SBIFM, NESL, PPFAS, MSEI, NCDEX, STUDDS, ORBIS, POLYMATECH, GFCLEV, INCRED, CIAL, HPX, GOODLUCK
- Django built-in admin (`/admin`) disabled — only custom Next.js admin used

### Frontend (Next.js)
- Stock cards grid with Buy/Sell buttons, sector badges, 52W high/low
- Filter tabs (All, Pre-IPO, DRHP Filed, sector filters, Top Gainers) — all stocks shown when "All" selected
- Company modal with About text + Fundamentals section (always shows all 12 fields, "—" for missing)
- Enquiry modal (Buy/Sell)
- Admin panel (`localhost:3000/admin`, password: `meritspe@admin`) with Add/Edit/Delete stocks
  - Add Stock form includes Fundamentals URL + Company Logo upload
  - Edit row expands to show Description, Fundamentals URL, Logo upload, and manual Fundamentals key-value entry (12 fields)
  - Logo upload forwards to Django `POST /api/stocks/admin/logo/` which saves to `preipo_backend/media/logos/`
  - Stock table shows logo thumbnail in Name column
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
  - Custom fields: `cfBuySell` (BUY/SELL), `cfStockName` (stock display name)
  - Standard fields: firstName, lastName, email, phone, description
- Sign-up (Step 1) → creates Kylas lead with email, phone, `cfKycStatus: "Pending"` via `/api/auth/signup`
- KYC (Step 3) → creates Kylas lead with full name (from PAN), `cfPanNumber`, `cfCity`, `cfState`, `cfAccountType`, `cfKycStatus: "Submitted"` via `/api/auth/kyc`
- All CRM calls are fire-and-forget (non-blocking)
- **Kylas custom fields defined:**
  | Label | API Field | Active |
  |---|---|---|
  | BUY/SELL | `cfBuySell` | Yes |
  | PAN NUMBER | `cfPanNumber` | Yes |
  | KYC STATUS | `cfKycStatus` | Yes |
  | Account type | `cfAccountType` | Yes |
  | Stock Name | `cfStockName` | Yes |
- **Enquiry → Kylas lead flow verified end-to-end ✅**

### Portfolio Feature
- `Portfolio` model in `preipo_backend/accounts/models.py`
  - Links `CustomUser` → `Stock` with fields: `quantity`, `purchase_price`, `purchase_date`
  - Ordered by `-purchase_date`
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
Kylas lead created with cfBuySell + cfStockName (outbound push ✅)
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

### Logo System
- 19 company logos moved to `preipo_backend/media/logos/` (served by Django at `/media/logos/`)
- `logo_url` field added to `Stock` model (migration `0008_add_logo_url`)
- All 19 logos linked to stocks in DB via `seed_logos.py` ✅
- DB `logo_url` values updated from `/logos/` → `/media/logos/` (19 rows)
- Stock cards display logo image if available, fall back to coloured initials avatar
- Logo container sized per aspect ratio (square, landscape, wide banner)
- 2 stocks without logos (PHARMEASY, STUDDS) — show initials avatar
- Non-technical admin can upload logos via admin panel — no code changes needed
- **Logo upload now goes through Django** (`POST /api/stocks/admin/logo/`) — Next.js route forwards to Django, no local filesystem writes
- Frontend prefixes all `/media/` paths with `NEXT_PUBLIC_DJANGO_API` via `resolveLogoUrl()` in `top-picks.tsx`
- `seed.py` and `seed_logos.py` updated to use `/media/logos/` paths
- **Vercel-safe** — no logos stored in Next.js public folder; all served from Koyeb (Django)

**Correct 21 stocks with logo status:**
| Ticker | Company | Logo |
|---|---|---|
| NSE | National Stock Exchange | ✅ |
| APOLLOGREEN | Apollo Green Energy | ✅ |
| CSK | Chennai Super Kings | ✅ |
| NAYARA | Nayara Energy | ✅ |
| OYO | Oravel Stays | ✅ |
| STERLITEPOWER | Sterlite Power | ✅ |
| ONIX | Onix Renewable | ✅ |
| PHARMEASY | API Holdings | ❌ |
| SBIFM | SBI Funds Management | ✅ |
| NESL | National E-Repository | ✅ |
| PPFAS | Parag Parikh Financial | ✅ |
| MSEI | Metropolitan Stock Exchange | ✅ |
| NCDEX | National Commodity Exchange | ✅ |
| STUDDS | Studds Accessories | ❌ |
| ORBIS | Orbis Financial | ✅ |
| POLYMATECH | Polymatech Electronics | ✅ |
| GFCLEV | GFCL EV Products | ✅ |
| INCRED | InCred Financial Services | ✅ |
| CIAL | Cochin International Airport | ✅ |
| HPX | Hindustan Power Exchange | ✅ |
| GOODLUCK | Goodluck Defence & Aerospace | ✅ |

---

---

## Session — 12 May 2026

### Webhook Flow Tested ✅
- Tested Kylas deal-close → webhook → portfolio update end-to-end
- Happy path: POST `/api/webhook/kylas-deal/` with Won deal → portfolio entry created, P&L computed correctly
- Edge cases verified: non-Won stage skipped (200), missing fields (400), bad PAN (404), bad ticker (404)

### Auth & Session
- Refresh token lifetime increased from 7 days → **20 days** (`preipo_backend/preipo_backend/settings.py`)
- Navbar: "Start Investing" button replaced with **"Sign Up / Sign In"** → links to `/login`
- Navbar: when logged in, "Sign Up / Sign In" is hidden and replaced with a **blue circle avatar showing user initials** (derived from email)

### UI / UX Fixes
- "View All 180+ →" renamed to **"View more →"** in `top-picks.tsx`
- **Search bar** moved from main nav row to its own slim row below the nav links (less cramped), width increased to `max-w-xl`
- **Stocks without logos** (PHARMEASY, STUDDS) sorted to the bottom of the grid across all filter tabs
- **CSK logo** box padding/dimensions fixed (`w-16 h-10 p-2`) to reduce zoomed-in appearance
- Footer email updated to **unlisted@merits.in**
- Phone number updated to **+91 98713 25544** in both navbar contact strip and footer
- **"Speak to an Advisor"** button now scrolls to `#contact` (footer with phone + email)
- **"Contact Us"** nav link already pointed to `#contact` — confirmed correct

### Navbar layout
- Removed `justify-between` from main nav flex row
- Nav links use `flex-1 justify-center` to center in available space
- Logo left, nav links centered, CTAs + avatar right

### Logout
- Avatar (initials circle) is now a clickable button — opens a dropdown
- Dropdown shows "Signed in as" + user email + **Log out** button
- Clicking Log out: calls Django `POST /api/auth/logout/` to blacklist the refresh token, then clears localStorage + cookie and resets auth state
- Dropdown closes on outside click (click-away ref)
- Mobile: logout card appears at bottom of burger menu (email + Log out button)
- **Tested end-to-end ✅** — login → logout → blacklisted token rejected with 401

### Risk Disclosure & Disclaimer Page (`/disclaimer`)
- Created `website/src/app/disclaimer/page.tsx`
- Content scraped and adapted from unlistedzone.com/disclaimer
- **18 sections** covering full legal disclosure:
  - Not a SEBI-Recognised Exchange, Not SEBI-Registered, For Informational Purposes Only
  - Investment Risks, No Guarantee or Warranty, Past Performance
  - Your Responsibility, Role of Meritspe, Market Manipulation Warning
  - External Links & Third-Party Content, Limitation of Liability (capped ₹1,000)
  - Regulatory Compliance (SEBI/FEMA/AML/KYC), Consult a Professional
  - Age Restriction (18+), Jurisdiction & Governing Law, Changes to Disclaimer
  - No Professional Relationship, Acknowledgment
- Footer "Risk Disclosure" link updated from `href="#"` → `href="/disclaimer"`
- Page has sticky header with back-to-home link, card-based layout

---

---

## Session — 13 May 2026

### Railway Deployment ✅
- Railway Hobby plan ($5/month) subscribed
- GitHub account connected to Railway
- Django service created, root directory set to `preipo_backend`, builder set to Nixpacks
- PostgreSQL service added to Railway project
- Railway env vars set on Django service:
  - `SECRET_KEY` = new secure token (generated via `secrets.token_urlsafe(50)`)
  - `ALLOWED_HOSTS` = `*`
  - `DEBUG` = `False`
  - `DATABASE_URL` = public proxy URL (`postgresql://postgres:...@crossover.proxy.rlwy.net:44255/railway`)
  - `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT` = reference variables from Postgres service

**Issues encountered and fixed:**
1. Root directory reset by Railway to `website/` → changed back to `preipo_backend`
2. Blank-named variable created by whitespace in `DEBUG` field → deleted via Raw Editor
3. `DATABASE_URL` not being picked up (production-ready settings.py was never pushed to GitHub — only existed locally)
4. `urls.py` referenced `admin.site` but `django.contrib.admin` not in `INSTALLED_APPS` → removed admin lines from urls.py

**Root cause of all DB issues:** The production-ready `settings.py`, `requirements.txt` (gunicorn, whitenoise, dj-database-url), and `Procfile` were never pushed to GitHub. Railway was running the old dev-only code. Fixed by cloning the repo fresh, applying all production files, and pushing from `C:\Users\HELLO!\Downloads\merits-repo`.

**Fixes pushed to GitHub:**
- `preipo_backend/preipo_backend/settings.py` — added `dj_database_url`, `whitenoise`, `DATABASE_URL` + `PGHOST` fallback, production-ready config
- `preipo_backend/requirements.txt` — added `gunicorn`, `dj-database-url`, `whitenoise`
- `preipo_backend/Procfile` — `web: gunicorn preipo_backend.wsgi --log-file -`
- `preipo_backend/preipo_backend/urls.py` — removed `admin.site` references

- git identity configured globally (`meritsdev1@gmail.com`)
- **All migrations applied successfully on Railway PostgreSQL** ✅
- **Next step:** Run seed.py on Railway + get the Railway URL + update Vercel NEXT_PUBLIC_DJANGO_API

---

## Session — 14 May 2026

### Production Deployment Completed ✅
- Ran `seed.py` on Railway — 21 stocks seeded into production PostgreSQL
- Applied missing migration `0008_add_logo_url` on Railway before seeding
- Added `unlistedmerits.com` and `www.unlistedmerits.com` to Vercel
- Set GoDaddy DNS: A `@` → `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com`
- Disabled Vercel Authentication (Deployment Protection) for public access
- Fixed Vercel Framework Preset from "Other" → "Next.js" (root cause of all 404s)
- **`https://unlistedmerits.com` is live ✅**

---

## Pending

- [x] Production deployment (Vercel for Next.js + Railway for Django + PostgreSQL, ~$5/month) ✅
  - [x] Frontend pushed to GitHub ✅
  - [x] Production-ready changes made (gunicorn, dj-database-url, whitenoise, Procfile, DATABASE_URL support)
  - [x] news-banner.tsx hardcoded localhost fixed
  - [x] .gitignore fixed — media/logos/ now tracked, media/docs/ still ignored
  - [x] Code pushed to GitHub ✅
  - [x] Railway account setup — Hobby plan ($5/month) ✅
  - [x] PostgreSQL service added to Railway project ✅
  - [x] Django service created on Railway, root directory set to `preipo_backend`, builder set to Nixpacks ✅
  - [x] Railway env vars set: `SECRET_KEY`, `ALLOWED_HOSTS=*`, `DEBUG=False`, `DATABASE_URL`, `PGHOST/PGUSER/PGPASSWORD/PGDATABASE/PGPORT` ✅
  - [x] Production config pushed to GitHub (settings.py, requirements.txt, Procfile, urls.py) ✅
  - [x] Django deployed and running on Railway ✅
  - [x] All migrations applied on Railway PostgreSQL ✅
  - [x] git identity configured (`meritsdev1@gmail.com`) ✅
  - [x] Run seed.py on Railway — 21 stocks seeded ✅
  - [x] Railway public URL: `https://merits-unlisted-shares-production.up.railway.app` ✅
  - [x] Vercel NEXT_PUBLIC_DJANGO_API updated to Railway URL ✅
  - [x] Domain connected (GoDaddy → Vercel) — unlistedmerits.com + www ✅
  - [x] Vercel Framework Preset fixed (was "Other" → set to "Next.js") ✅
  - [x] **`unlistedmerits.com` is live ✅**
- [x] Buy domain — `unlistedmerits.com` (GoDaddy) ✅
- [x] Brand name sweep (footer) — replaced "Meritspe" with "Unlisted Merits" in footer (logo text, social aria-labels, disclaimer text, copyright line)
- [x] Brand name sweep (remaining) — layout.tsx, disclaimer page, admin page, merits.tsx, community.tsx, signup/kyc API routes all updated to "Unlisted Merits" ✅
- [ ] Upload logos for PHARMEASY and STUDDS when available
- [ ] Footer Platform links — "Explore Shares", "Top Gainers", "DRHP Filed", "Pre-IPO Deals" should deep-link to filtered views instead of `href="/"`
- [x] Footer dead links — Blog, Careers, Help Center, Terms of Service removed; Disclaimer now → `/disclaimer` ✅
- [x] WhatsApp community link (`community.tsx`) — updated to real group link `https://chat.whatsapp.com/Gq2IObcgpwGBMWM3OKgyRK`
- [ ] Forgot password / reset password flow

---

## Session: Fundamentals storage, logos, cron, skeleton loader (2026-05-14)

### Fundamentals scraping → DB cache
- [x] Discovered unlistedzone.com migrated old URLs (`/{slug}`) to JS SPA; new `/shares/{slug}/` is server-rendered
- [x] Added `normalizeUnlistedZoneUrl()` in `website/src/app/api/company-info/route.ts` to transform old URLs to new format
- [x] Fall through to auto-detection if stored URL returns empty
- [x] Created Django management command `preipo_backend/stocks/management/commands/refresh_fundamentals.py`
  - Scrapes all stocks from unlistedzone (regex + JSON-LD parsing)
  - Saves results to `Stock.fundamentals_json` field
  - 1s sleep between requests (polite scraping)
  - Uses same `UZ_SLUG_OVERRIDE` map as TS scraper
- [x] Added `requests==2.32.3` to `preipo_backend/requirements.txt`

### Modal: instant fundamentals load from DB
- [x] `website/src/components/company-modal.tsx` updated to initialize state directly from DB (`stock.fundamentalsJson`, `stock.description`)
- [x] Skips API call entirely when `hasAllData` is true → no loading skeleton flash
- [x] Falls back to live API fetch only if DB cache is empty

### Logos on stock cards
- [x] `website/src/components/top-picks.tsx` updated to render `stock.logoUrl` (from Django media)
- [x] Added `resolveLogoUrl()` to prepend `NEXT_PUBLIC_DJANGO_API` to relative paths
- [x] Added `logoUrl: string` to `Stock` interface in `website/src/types/stock.ts` (was missing → caused Vercel TS build failure)
- [x] Pushed to `main` via git plumbing (working tree had untracked files blocking checkout)

### Auto-refresh every 12 hours
- [x] Background thread scheduler in `preipo_backend/stocks/apps.py` (`StocksConfig.ready()`)
- [x] Runs `refresh_fundamentals` every 12h; gated by `DJANGO_SKIP_SCHEDULER` env var
- [x] Set up Railway **cron service** (separate from web service) via dashboard
- [x] **Fixed Railway internal DB hostname issue:**
  - Cron service couldn't resolve `postgres.railway.internal` (not in private network)
  - Railway auto-injects `DATABASE_URL` with internal URL into ALL services — overrides manual vars
  - Solution: changed `settings.py` line 63 to `DATABASE_URL = os.getenv('CUSTOM_DB_URL') or os.getenv('DATABASE_URL')`
  - Added `CUSTOM_DB_URL=postgresql://postgres:****@crossover.proxy.rlwy.net:44255/railway` to cron service only
  - Web service unaffected (no CUSTOM_DB_URL → falls back to injected DATABASE_URL)
  - ✅ Cron service connecting and running successfully

### Skeleton loading screen
- [x] Replaced plain "Loading stocks…" text in `website/src/app/page.tsx` with full-page skeleton
- [x] Matches real layout exactly (orange top bar, navbar, hero, search/filter, 8-card grid)
- [x] Smooth left-to-right shimmer effect (CSS keyframes, not just pulse)
- [x] Staggered fade-in animation (children appear in sequence)
- [x] Brand-tinted hints (orange CTA placeholder, green/red BUY/SELL placeholders)
- [x] Pixel-precise widths via inline styles (Tailwind can't generate dynamic class strings)
- [x] Zero layout shift when real content loads
- [ ] Push skeleton to `main` after local approval

### Open items
- [ ] Parallelize `refresh_fundamentals` with `ThreadPoolExecutor` (deferred — runs every 12h in background, not user-facing)
- [ ] Investigate slow initial page load (likely Railway Django cold start, not frontend issue)
- [ ] STUDDS still missing fundamentals URL
- [ ] Price update workflow — prices never change unless manually edited in admin

---

## Session — 15 May 2026

### Footer cleanup (`website/src/components/footer.tsx`)
- Removed dead links: **Careers**, **Blog** (Company section), **Help Center** (Support), **Terms of Service** (Legal) — all were `href="#"`
- **Disclaimer** link now points to `/disclaimer` (was dead `#`)
- Company section now has only **About Us**; Support only **Contact Us**; Legal has **Disclaimer** + **Risk Disclosure** (both → `/disclaimer`)

### Hero "Speak to an Advisor" fix (`website/src/components/hero.tsx`)
- Button now uses an explicit `onClick` → `scrollIntoView({ behavior: "smooth" })` on the footer (`id="contact"`)
- Plain `href="#contact"` kept as no-JS fallback — fixes failure when footer renders after the skeleton loader

### Risk Disclosure section on homepage
- New component `website/src/components/risk-disclosure.tsx`
- Renders the **first 6 disclosure sections** (Not a SEBI-Recognised Exchange, Not SEBI-Registered, For Informational Purposes Only, Investment Risks, No Guarantee or Warranty, Past Performance)
- Added to `page.tsx` **after About Us, before the WhatsApp/Community section**
- UI: warm cream→amber gradient panel, "Investor Awareness" eyebrow pill, per-card lucide icons in gradient badges, frosted white cards with hover lift — site palette (orange `#FFB74D→#E87A00`, navy `#0D2040`)

### Git
- Committed 4 files (`risk-disclosure.tsx`, `footer.tsx`, `hero.tsx`, `page.tsx`) — commit `c7ce3ac`
- Pushed to `origin/master` (`https://github.com/Divo15/Merits-unlisted-shares.git`)
- Note: most of the working tree is still untracked git — only these files + `progress.md` are now tracked on this remote
- Git identity: `meritsdev1 <meritsdev1@gmail.com>` (local repo config; global unset)
