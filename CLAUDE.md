# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ELM (饿了么 clone) is a multi-role food delivery platform: four independent React frontends (Customer, Rider, Merchant, Manager) and a Django REST backend. Customer, Merchant, and Rider are now wired to real backend APIs; Manager still uses mock data.

| App | Directory | Stack | Backend-connected? |
|-----|-----------|-------|---------------------|
| Customer | `fronted/Customer/` | React 19 + TS + Vite + Tailwind v4 | Yes, via `src/api/config.ts` (axios, base URL `http://localhost:8000/api/v1`). One lingering `store.ts` import remains in `components/BottomNav.tsx` — not fully migrated despite docs claiming 100% |
| Rider | `fronted/Rider/` | React 19 + TS + Vite + Tailwind v4 | **Yes** — available/mine orders, grab/pickup/deliver, profile all wire to backend; StatisticsTab (earnings trend) remains mock-only (no backend analytics model) |
| Merchant | `fronted/Merchant/` | React 19 + TS + Vite + Tailwind v4 | **Yes** — orders/products/reviews/settings wire to backend; campaigns/analytics tabs remain mock-only (no backend model) |
| Manager | `fronted/Manager/` | React 19 + TS + Vite + Tailwind v4 | No — mock `store.ts` only |
| Backend | `src/elm/` | Django 6.0 + DRF + Channels | 10 of 13 apps wired at `/api/v1/` |

**Documentation**: `docs/需求分析.txt` (requirements, Chinese), `docs/00-overview.md` through `docs/05-module-design.md` (architecture/DB/API/RBAC/order-lifecycle design docs), `docs/DEVELOPMENT.md`, `docs/TESTING.md`. `docs/问题.txt` is a known-issues audit (Chinese). `BUG_REPORT.md` / `FIXED_REPORT.md` at repo root track a prior security pass — treat "完全清理"/100%-fixed claims in these as aspirational, not verified (see Customer's leftover `store.ts` import above).

## Commands

### Frontend (each app is independent — install per-directory)

```bash
cd fronted/Customer && npm install && npm run dev     # port 3000
cd fronted/Rider   && npm install && npm run dev      # port 3000
cd fronted/Merchant && npm install && npm run dev     # port 3000
cd fronted/Manager && npm install && npm run dev      # port 3000

npm run lint    # tsc --noEmit, run from inside an app directory
npm run build   # vite build
```

### Backend

```bash
cd src/elm
uv sync
uv run python manage.py migrate
uv run python manage.py runserver          # dev server
uv run daphne config.asgi:application --port 8000   # ASGI (needed for Channels/websockets)

uv run python manage.py test                         # all tests, Django test runner (not pytest)
uv run python manage.py test accounts                # single app
uv run python runtests.py                             # wrapper; defaults to accounts, merchants, products, orders, addresses (excludes promotions — update runtests.py if you add tests there)
uv run python manage.py init_data                     # seed roles + 4 test users + sample merchant/products/order
uv run python manage.py add_more_data                 # seed additional demo data

# Coverage
uv add coverage && uv run coverage run --source='.' manage.py test && uv run coverage report
```

**Test accounts** (seeded by `init_data`, phone/password): `13800001000/customer`, `13800002000/merchant`, `13800003000/rider`, `13800004000/manager` (manager account gets the `admin` role).

**Production settings**: `DJANGO_SETTINGS_MODULE=config.settings_prod` switches SQLite → Postgres (via `DB_NAME`/`DB_USER`/`DB_PASSWORD`/`DB_HOST`/`DB_PORT` env vars) and adds file+console logging. `.env.example` at repo root lists the expected vars (`SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `CORS_ALLOW_ALL`, DB vars).

## Architecture

### Backend (`src/elm/`)

Django project root is `config/` (not `elm/`) — `manage.py`, `config/settings.py`, `config/urls.py`, `config/asgi.py`/`wsgi.py`.

**Auth**: custom user model `accounts.User(AbstractUser)` with `username=None` — login is by `phone` (`USERNAME_FIELD`), not username or email. JWT via `djangorestframework-simplejwt`; `login`/`register`/`me` are function-based `@api_view` views in `accounts/views.py`. RBAC is DB-driven: `Role` (with a `permissions` JSONField list of permission-code strings) and `UserRole` join table, checked via `User.has_role()` / `get_roles()`. See `docs/03-rbac-design.md` for the 4 fixed roles (customer/merchant/rider/admin) and their permission codes and data-isolation rules — merchant and rider roles are not meant to coexist on one account.

**Wired apps** (mounted in `config/urls.py` under `/api/v1/`): 10 of 13 apps are wired — `accounts`, `merchants`, `products`, `orders`, `addresses`, `reviews`, `riders`, `admin_panel`, `uploads`, `sessions` (websocket). `orders/urls.py` splits into customer/merchant/rider sub-routes; `merchants/urls.py` has public + merchant-only sections; `products/urls.py` has public list + merchant CRUD; `reviews/urls.py` has public list + merchant reply.

**Unwired apps** (models/tests exist but no URL wiring): `promotions`, `payments`, `notifications`, `common`. Don't assume these have working HTTP endpoints.

**Order lifecycle**: `docs/04-order-lifecycle.md` defines 11 status values (`pending, paid, accepted, preparing, ready, picked, delivered, finished, cancelled, refunding, refunded`). All merchant transitions (`paid→accepted→preparing→ready`) and rider transitions (`ready→picked→delivered`) are now implemented; refund flow remains unimplemented.

**Channels**: `ASGI_APPLICATION` is configured and `CHANNEL_LAYERS` uses `InMemoryChannelLayer` — no Redis-backed layer yet, so websocket state won't survive a process restart or work across multiple workers.

**CORS**: `CORS_ALLOW_ALL_ORIGINS` defaults to `True` in dev via env var — fine for local work, must be tightened before any shared/production deployment.

### Frontend

#### Shared Module (`fronted/shared/`)

All four apps import from `@shared` via Vite `resolve.alias` (see any app's `vite.config.ts`) and a matching `tsconfig.json` `paths` entry:

- `Toast.tsx` — `<Toast />` + `toast(msg)`
- `Modal.tsx` — `<Modal />` + `showModal(title, desc, body, onConfirm)` / `closeModal()`
- `Header.tsx` — exported from `@shared` but **not adopted anywhere**: all four `App.tsx` files still render their own inline `<header>` markup instead of `<Header title="..." onBack={...} />`
- `types.ts` — shared interfaces (`Order`, `Product`, `TabConfig`)
- `index.ts` — barrel export

#### Design System (`fronted/DESIGN.md`)

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#0085FF` | Brand, active tabs, buttons |
| Promo | `#FF5000` | Prices, urgency, badges |
| Success | `#00B578` | Completions, positive trends |
| Background | `#F5F5F5` | Page background |
| Cards | `rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03)]` | White cards |
| Bottom nav | `rounded-t-[20px] shadow-[0_-8px_24px_rgba(0,0,0,0.04)]` | Fixed bottom |

Design tokens are hardcoded as hex values throughout components rather than pulled from CSS variables — when touching styled components, match the existing hardcoded-hex pattern rather than introducing a token system unprompted.

#### App structure (all four follow this pattern)

```
AppName/
├── index.html, package.json, tsconfig.json, vite.config.ts
└── src/
    ├── main.tsx          ← createRoot + render
    ├── index.css         ← @import "tailwindcss"
    ├── App.tsx           ← inline header + tab navigation + <Toast/>
    ├── store.ts           ← mock data + subscribe/notify pattern (Manager only now — Customer/Merchant/Rider have all migrated off this)
    ├── api/                ← Customer/Merchant/Rider: api/config.ts holds the axios instance and API_BASE_URL, api/index.ts has domain API modules
    ├── contexts/AuthContext.tsx  ← Customer/Merchant/Rider: JWT login/logout, role-checked on login
    └── components/         ← one file per tab/route
```

Vite dev server config sets `HMR`/file-watching off when `DISABLE_HMR=true` is set in the environment — this is intentional (avoids flicker from concurrent agent edits), not a bug.

#### State management

Rider, Merchant, and Manager use a plain reactive store, not Redux:

```ts
// store.ts
export const data = [...];
let listeners: (() => void)[] = [];
export function subscribe(fn: () => void) { listeners.push(fn); return () => { listeners = listeners.filter(l => l !== fn); }; }
export function notify() { listeners.forEach(fn => fn()); }

// Component
const [, forceUpdate] = useState(0);
useEffect(() => subscribe(() => forceUpdate(n => n + 1)), []);
```

Customer is mid-migration from this same pattern to real API calls (`src/api/config.ts`) — most components now call the backend, but `components/BottomNav.tsx` still imports `getCartCount`/`subscribe`/`StoreState` from `store.ts`.

### Key Conventions

- **Icons**: `lucide-react` everywhere, no emoji in UI messages
- **Modals**: never browser `prompt()`/`alert()` — use `showModal()` from `@shared`
- **Notifications**: `toast()` from `@shared`, never `alert()`
- **Colors**: use the hex values from `DESIGN.md`, not Tailwind color names like `blue-500`
- **Tab indices**: Customer/Manager use string tab IDs, Merchant uses numeric indices
- **Sub-page routing**: a `currentRoute` state string, conditionally rendered — no React Router

## Known Issues & Incomplete Work

Non-obvious gaps worth knowing before touching related code (full audit in `docs/问题.txt`):

**Rider app**: now wired to real orders (available/mine/grab/pickup/deliver) and profile; logout works via AuthContext. Edit profile, settings menu items, and exception-report submission remain toast-only placeholders (no backend endpoint for these). StatisticsTab (earnings/trend) stays mock — no backend analytics model.

**Customer app**: Settings/Profile menu items are non-functional; Home search bar is `readOnly`; order review submit isn't wired; cart checkboxes are decorative (`onClick={() => {}}`); favorites list is hardcoded.

**Merchant app**: CampaignsPage and DataTab remain mock-only (no backend Campaign or analytics models); notification bell and account settings are toast-only placeholders.

**Manager app**: "更多操作" button and license image viewers have no `onClick`; product-audit and report-handling tabs return empty lists (only the merchant-audit tab is functional).

**Backend**: 3 of 13 Django apps (`promotions`, `payments`, `notifications`, `common`) have no URL wiring despite having models/tests — don't assume an endpoint exists without checking `config/urls.py`. Channels uses `InMemoryChannelLayer`, not production-safe for multi-worker deployments. Order stock-restore on cancel/reject was added mid-session; earlier commits may not have it.
