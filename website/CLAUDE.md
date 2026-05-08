@AGENTS.md

# Meritspe — Pre-IPO Platform

## Project overview

**Meritspe** (`meritspe.com`) is an Indian pre-IPO / unlisted shares marketplace where users browse stocks, view indicative prices, and submit buy/sell enquiries.

Stack: **Next.js 16 (App Router)** frontend + **Django 6 REST API** backend + **PostgreSQL 18** database.

---

## Tech stack

| Layer | Tech | Version |
|-------|------|---------|
| Frontend framework | Next.js (App Router) | 16.2.4 |
| UI base | Tailwind CSS v4 + shadcn/ui | latest |
| Animations | Framer Motion | latest |
| Charts | Recharts | latest |
| Backend | Django + DRF + SimpleJWT | 6.0.4 |
| Database | PostgreSQL | 18 |
| CRM | Kylas CRM REST API | — |

> **Next.js 16 / React 19 have breaking changes** — read `node_modules/next/dist/docs/` before writing any Next.js code.

---

## Repository layout

```
C:\Project_pre-IPO\
├── website/                        ← Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            ← Main page (client component, fetches stocks)
│   │   │   ├── layout.tsx          ← Root layout, SEO metadata, JSON-LD, fonts
│   │   │   ├── globals.css         ← Tailwind v4 + shadcn + custom theme tokens
│   │   │   ├── admin/page.tsx      ← Admin stock manager (password-gated, Django-connected)
│   │   │   └── api/
│   │   │       ├── stocks/route.ts       ← GET: proxies to Django /api/stocks/
│   │   │       ├── enquiry/route.ts      ← POST: creates lead in Kylas CRM
│   │   │       ├── admin/route.ts        ← GET/POST/PUT/DELETE: proxies to Django admin endpoints
│   │   │       └── admin/auth/route.ts   ← POST: validates ADMIN_PASSWORD env var
│   │   ├── components/             ← All UI components (all "use client")
│   │   ├── lib/                    ← Utility helpers
│   │   └── types/stock.ts          ← Stock interface (camelCase, matches Django output)
│   ├── public/                     ← Static assets (bg-collage.png, og-image.png)
│   ├── .env.local                  ← Local secrets (not committed)
│   ├── next.config.ts              ← allowedDevOrigins for ngrok tunnel
│   └── components.json             ← shadcn/ui config
├── preipo_backend/                 ← Django project
│   ├── preipo_backend/             ← Django package (settings, urls, wsgi)
│   ├── stocks/                     ← Stocks app (models, views, serializers, urls)
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env                        ← Django secrets (not committed)
│   └── seed.py                     ← Data seeding script
└── venv/                           ← Python virtual environment
```

---

## Components

All components are `"use client"`. None are Server Components.

| File | Section / purpose | Notes |
|------|-------------------|-------|
| `navbar.tsx` | Sticky top nav | Two-tier: orange contact bar + white main nav with scroll shadow. Framer Motion burger animation. |
| `hero.tsx` | Hero section | Single left-aligned column (max-w-3xl). Copy, CTAs, trust badges, stats strip, featured deal bar. Right-side HeroVisual card was removed. Live news lower-thirds planned here (pending yfinance API). |
| `search-filter.tsx` | Sticky search + tabs | Tabs: All, Pre-IPO, DRHP Filed, Fintech, Tech, BFSI, Infrastructure, Healthcare, Consumer, EV & Auto, Top Gainers. Calls `onFilter` prop up to `page.tsx`. |
| `top-picks.tsx` | Stock card grid | Filters and renders up to 8 cards. Clicking a card updates `selectedStock` in `page.tsx`. BUY/SELL buttons open `EnquiryModal`. |
| `enquiry-modal.tsx` | BUY/SELL enquiry form | Collects name/phone/email → POST `/api/enquiry/`. Shows success state on submit. |
| `price-chart.tsx` | Recharts area chart | Periods: 1M–Max. Price history is synthetic (`genHistory()` seeded pseudo-random walk). Custom tooltip. **Not rendered on main page yet.** |
| `ticker.tsx` | Scrolling price ticker | Static hardcoded data (12 companies). CSS marquee. **Not rendered on main page yet.** |
| `merits.tsx` | "Merits That Matter" section | Animated count-up stats via IntersectionObserver. 4 feature cards. Trust score widget. |
| `community.tsx` | WhatsApp CTA | Links to `wa.me/919999999999` (placeholder — needs real number). |
| `footer.tsx` | Footer | All nav links and social icons are `href="#"` (not wired). |

---

## Hero section — current state

The hero (`hero.tsx`) is now a **single-column layout** (`max-w-3xl`). The right-side `HeroVisual` dashboard card was removed (it was a static hardcoded mock). What remains:

- Orange eyebrow pill badge
- Headline + subtitle
- CTA buttons (Explore Deals, Speak to an Advisor)
- Trust badge pills (T+1 SETTLEMENT, ASSISTED EXECUTION, PRIVATE DEAL FLOW)
- Stats strip (₹850Cr+, 12,000+ investors, T+1 settlement)
- Featured deal bar (shows selected stock's name, price, sector)

**Planned addition:** Live news lower-thirds (TV breaking-news banner style) in orange/blue/white, auto-refreshing every 30s via yfinance API. Implementation pending API key from user.

---

## Data flow

```
Browser
  GET /api/stocks/  (Next.js route handler)
    └─ fetch → Django :8000/api/stocks/
         └─ PostgreSQL preipo_db
              Stock + DailyPrice models → camelCase JSON
  (if Django is down → returns [] gracefully, no crash)

Admin panel (/admin)
  Password gate → POST /api/admin/auth (checks ADMIN_PASSWORD env var)
  GET  /api/admin  →  Django GET /api/stocks/  (list)
  POST /api/admin  →  Django POST /api/stocks/admin/create/  (create)
  PUT  /api/admin  →  Django PUT  /api/stocks/admin/<id>/update/  (update)
  DELETE /api/admin?id=<id>  →  Django DELETE /api/stocks/admin/<id>/delete/
  Each write fetches a fresh JWT from Django using DJANGO_ADMIN_EMAIL / DJANGO_ADMIN_PASS

Enquiry
  EnquiryModal → POST /api/enquiry/
    └─ Kylas CRM REST API (creates lead)
```

---

## Stock type

```typescript
// src/types/stock.ts
interface Stock {
  id: string;
  name: string;        // short display name
  fullName: string;
  ticker: string;
  sector: string;
  category: string;    // "Pre-IPO" | "DRHP Filed" | "Listed"
  price: number;
  change: number;
  changePct: number;
  high52w: number;
  low52w: number;
  exchange: string;
  initials: string;    // 2-3 letter avatar text
  color: string;       // hex for avatar background
}
```

Django's `serialize_stock()` outputs exactly this camelCase shape.

---

## Brand colors

| Token | Hex | Usage |
|-------|-----|-------|
| Orange accent | `#F09020` / `#E87A00` | Top bar, CTA buttons, highlights |
| Navy text | `#0D2040` | Body text, nav text |
| Primary blue | `#1E88E5` / `#1565C0` | Buttons, gradients, chart lines |
| Positive | `#10b981` (emerald-600) | Price up, BUY button |
| Negative | `#ef4444` (red-500) | Price down, SELL button |

---

## Environment variables

### `website/.env.local`
```
NEXT_PUBLIC_DJANGO_API=http://localhost:8000
KYLAS_API_KEY=<key>
ADMIN_PASSWORD=meritspe@admin        # password for /admin page gate (default: meritspe@admin)
DJANGO_ADMIN_EMAIL=<superuser email> # Django superuser email — used server-side for write ops
DJANGO_ADMIN_PASS=<superuser pass>   # Django superuser password
```

### `preipo_backend/.env`
```
SECRET_KEY=...
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,...
DB_NAME=preipo_db
DB_USER=postgres
DB_PASSWORD=12345678
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

---

## Running locally

```powershell
# Frontend (http://localhost:3000)
cd website && npm run dev

# Backend (http://localhost:8000)
C:\Project_pre-IPO\venv\Scripts\python.exe manage.py runserver 8000
# (run from C:\Project_pre-IPO\preipo_backend)

# ngrok tunnel for public access
C:\Users\DTG\ngrok\ngrok.exe http --domain=shifter-rockslide-blooper.ngrok-free.dev 8000
```

---

## Django API

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/stocks/` | Public | All stocks, latest DailyPrice, camelCase |
| GET | `/api/stocks/<id>/` | Public | Single stock |
| GET | `/api/stocks/news/` | Public | yfinance news feed (5-min cache) |
| POST | `/api/stocks/admin/create/` | `is_staff` JWT | Create stock + initial DailyPrice |
| PUT | `/api/stocks/admin/<id>/update/` | `is_staff` JWT | Update stock info and/or today's price |
| DELETE | `/api/stocks/admin/<id>/delete/` | `is_staff` JWT | Delete stock (cascades DailyPrice) |
| POST | `/api/auth/login/` | Public | JWT obtain (email + password) |
| POST | `/api/auth/token/refresh/` | Public | JWT refresh |
| * | `/admin/` | Superuser session | Django admin panel |

---

## Django models

**`Stock`** — static company info: `name`, `full_name`, `ticker`, `sector`, `category`, `description`. `initials` and `color` are auto-generated in `serialize_stock()` (not stored).

**`DailyPrice`** — price snapshot FK'd to Stock. Ordered by `-date, -updated_at`. Latest row = current price in API. `change` and `change_pct` are auto-calculated on `save()` from the previous day's price. Multiple entries per day are allowed — most recent `updated_at` wins.

---

## PostgreSQL

- Version 18 at `C:\Program Files\PostgreSQL\18\`
- DB: `preipo_db` / user: `postgres` / password: `12345678`
- All migrations applied. Django admin confirmed working.
- Service name: `postgresql-x64-18` (confirm running with `Get-Service postgresql*`)

---

## Styling notes

- Tailwind v4: uses `@import "tailwindcss"`, no `tailwind.config.js`. Custom tokens in `@theme inline {}` in `globals.css`.
- shadcn/ui: imported via `@import "shadcn/tailwind.css"`. Config in `components.json`.
- Three fonts via `next/font/google`: Geist Sans (body), Geist Mono, Playfair Display (headings via `font-heading`).
- Background: `public/bg-collage.png` at 30% opacity, fixed position, behind all content.

---

## Admin panel — `/admin`

Password-gated (default: `meritspe@admin`, set via `ADMIN_PASSWORD` env var). No session/cookie — uses `sessionStorage` key `admin_authed`.

**Features:**
- List all stocks with live prices from Django
- Add stock — form with name, fullName, ticker, sector, category, price, 52W high/low, description
- Edit stock — inline row edit for all fields including today's price
- Delete stock — confirm dialog, hard delete (cascades DailyPrice)
- Refresh button

**Auth flow for writes:** Next.js API route (`/api/admin`) calls `POST /api/auth/login/` with `DJANGO_ADMIN_EMAIL` + `DJANGO_ADMIN_PASS` (server-side env vars) to get a fresh JWT, then includes it as `Authorization: Bearer <token>` on the Django admin endpoint.

**Required env vars** (add to `website/.env.local`):
```
DJANGO_ADMIN_EMAIL=<superuser email used during createsuperuser>
DJANGO_ADMIN_PASS=<that password>
```

---

## Known gaps / todos

- **Live news lower-thirds** — to be added in hero section, yfinance API, refresh every 30s, TV breaking-news style, orange/blue/white palette. Waiting on API key.
- `price-chart.tsx` and `ticker.tsx` exist but are **not imported in `page.tsx`** — built but unused.
- `community.tsx` WhatsApp link uses placeholder number `919999999999`.
- All footer nav links and social icons use `href="#"` — not wired to real pages.
- Ticker data is hardcoded static, not live from Django.
- ngrok domain `shifter-rockslide-blooper.ngrok-free.dev` is hardcoded in both `next.config.ts` and Django `settings.py`.
