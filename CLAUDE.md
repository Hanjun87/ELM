# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ELM (饿了么 clone) is a multi-role food delivery platform. **The project now targets 3 WeChat mini-programs (Customer, Merchant, Rider) + 1 web admin (Manager), all on one Django REST backend.** The three `fronted/` web frontends Customer/Rider/Merchant are **deprecated** — superseded by the mini-programs, code retained for reference only. Manager is the sole active web frontend.

| App | Directory | Stack | Status |
|-----|-----------|-------|--------|
| Customer (小程序) | `miniprogram/customer/` | Taro 4 + React + TS + weapp-tailwindcss | **Active** — wired to `/api/v1` via `Taro.request` wrapper (`src/api/config.ts`). 11 pages |
| Merchant (小程序) | `miniprogram/merchant/` | Taro 4 + React + TS + weapp-tailwindcss | **Active** — orders (accept/reject/prepare/ready), products CRUD + product-edit page, store settings wired; stats tab is mock. Login guards `merchant` role. 6 pages |
| Rider (小程序) | `miniprogram/rider/` | Taro 4 + React + TS + weapp-tailwindcss | **Active** — available/grab, deliveries (pickup/deliver) + exception sheet, history, profile, work-status toggle wired. Login guards `rider` role. Exception-report has no backend endpoint (toast-only). 5 pages |
| Manager | `fronted/Manager/` | React 19 + TS + Vite + Tailwind v4 | **Active (only web frontend)** — dashboard stats and user list/ban/unban wire to backend; AuditTab, FinanceTab, BannersTab remain mock-only (no backend models). Desktop web layout |
| Backend | `src/elm/` | Django 6.0 + DRF + Channels | 10 of 13 apps wired at `/api/v1/` |
| ~~Customer (Web)~~ | `fronted/Customer/` | React 19 + TS + Vite | **Deprecated** — replaced by `miniprogram/customer/`. Code retained; lingering `store.ts` import in `components/BottomNav.tsx` |
| ~~Rider (Web)~~ | `fronted/Rider/` | React 19 + TS + Vite | **Deprecated** — replaced by `miniprogram/rider/` |
| ~~Merchant (Web)~~ | `fronted/Merchant/` | React 19 + TS + Vite | **Deprecated** — replaced by `miniprogram/merchant/` |

**Documentation**: `docs/需求分析.txt` (requirements, Chinese), `docs/00-overview.md` through `docs/05-module-design.md` (architecture/DB/API/RBAC/order-lifecycle design docs), `docs/DEVELOPMENT.md`, `docs/TESTING.md`. `docs/问题.txt` is a known-issues audit (Chinese). `BUG_REPORT.md` / `FIXED_REPORT.md` at repo root track a prior security pass — treat "完全清理"/100%-fixed claims in these as aspirational, not verified (see Customer's leftover `store.ts` import above).

## Commands

### Mini-programs (WeChat — Customer, Merchant, Rider; the primary clients)

Each mini-program is an independent Taro project (own `node_modules`, `dist/`) — install per-directory.

```bash
cd miniprogram/customer && npm install   # or miniprogram/merchant, miniprogram/rider
npm run dev:weapp     # watch-compile to dist/
npm run build:weapp   # one-shot build to dist/
# taro binary isn't on PATH — the npm scripts call it; if invoking directly use `npx taro build --type weapp`
npx tsc --noEmit -p tsconfig.json   # type-check (no `npm run lint` script defined)
```

Import `miniprogram/<app>` (not `dist/`) in WeChat DevTools; `project.config.json` points `miniprogramRoot` at `dist/`. AppID can be the test ID. **The three mini-programs' `project.config.json` may share a copied AppID — DevTools can't open two projects with the same AppID at once, and real-device/upload needs distinct AppIDs.** To reach a local backend, enable "不校验合法域名" in DevTools 详情 → 本地设置. Pinned to **Vite 4** (Taro 4.0.9's React plugin peers `vite@^4`); needs `@babel/preset-react` + `@babel/plugin-proposal-class-properties` + `@babel/plugin-proposal-object-rest-spread` + `@babel/plugin-transform-runtime` installed (babel-preset-taro peers, added to devDependencies).

### Web admin (Manager — the only active web frontend)

```bash
cd fronted/Manager && npm install && npm run dev    # port 3000
npm run lint    # tsc --noEmit
npm run build   # vite build
```

The `fronted/Customer`, `fronted/Rider`, `fronted/Merchant` web apps are **deprecated** (replaced by mini-programs). They still build/run the same way if you need to reference the old implementation, but should not be extended.

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

**Test accounts** (seeded by `init_data`, phone/password): `13800000001/customer`, `13800000002/merchant`, `13800000003/rider`, `13800000004/manager` (manager account gets the `admin` role).

**Production settings**: `DJANGO_SETTINGS_MODULE=config.settings_prod` switches SQLite → Postgres (via `DB_NAME`/`DB_USER`/`DB_PASSWORD`/`DB_HOST`/`DB_PORT` env vars) and adds file+console logging. `.env.example` at repo root lists the expected vars (`SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `CORS_ALLOW_ALL`, DB vars).

## Architecture

### Backend (`src/elm/`)

Django project root is `config/` (not `elm/`) — `manage.py`, `config/settings.py`, `config/urls.py`, `config/asgi.py`/`wsgi.py`.

**Auth**: custom user model `accounts.User(AbstractUser)` with `username=None` — login is by `phone` (`USERNAME_FIELD`), not username or email. JWT via `djangorestframework-simplejwt`; `login`/`register`/`me` are function-based `@api_view` views in `accounts/views.py`. RBAC is DB-driven: `Role` (with a `permissions` JSONField list of permission-code strings) and `UserRole` join table, checked via `User.has_role()` / `get_roles()`. See `docs/03-rbac-design.md` for the 4 fixed roles (customer/merchant/rider/admin) and their permission codes and data-isolation rules — merchant and rider roles are not meant to coexist on one account.

**Wired apps** (mounted in `config/urls.py` under `/api/v1/`): 10 of 13 apps are wired — `accounts`, `merchants`, `products`, `orders`, `addresses`, `reviews`, `riders`, `admin_panel`, `uploads`, `sessions` (websocket). `orders/urls.py` splits into customer/merchant/rider sub-routes; `merchants/urls.py` has public + merchant-only sections; `products/urls.py` has public list + merchant CRUD; `reviews/urls.py` has public list + merchant reply.

**Unwired apps** (models/tests exist but no URL wiring): `promotions`, `payments`, `notifications`, `common`. Don't assume these have working HTTP endpoints.

**Seed data**: `init_data` seeds roles + 4 test accounts + 1 sample merchant; `add_more_data` (idempotent, `get_or_create`) adds 20 merchants / 10 customers / 10 riders + products/orders/reviews/coupons — full run yields ~21 merchants, 98 products, 11 riders, 11 customers, ~19 orders (order/review counts are randomized per run). Both commands `reconfigure` stdout to UTF-8 at the top of `handle()` — the Windows console defaults to GBK and previously crashed with `UnicodeEncodeError` on the `✓`/emoji output, which silently truncated seeding at ~5 merchants. Reset with `manage.py flush --no-input` then re-run both.

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
    ├── store.ts           ← deleted — no app uses store.ts anymore (all migrated to real API)
    ├── api/                ← all 4 apps: api/config.ts (axios instance + auth interceptors), api/index.ts (domain API modules)
    ├── contexts/AuthContext.tsx  ← all 4 apps: JWT login/logout, role-checked on login (customer/merchant/rider/admin)
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

#### Mini-programs (`miniprogram/customer/`, `miniprogram/merchant/`, `miniprogram/rider/`)

Three **standalone Taro 4 + React** apps ported from the corresponding web frontends — they do not share code with `fronted/` or with each other (Taro can't consume the web DOM components or `@shared`; each is its own npm project with own `node_modules`, `dist/`). Structure is Taro's page-folder convention: `src/pages/<name>/index.tsx` + `index.config.ts`, routing via `src/app.config.ts` (`pages` list + 4-tab `tabBar`), entry `src/app.tsx` wraps `AuthProvider`. Merchant and Rider were scaffolded by copying the customer/merchant skeleton (build chain, config, api/config.ts http wrapper) and rewriting pages — so the build details below apply to all three.

Per-app specifics:
- **customer** — 11 pages; tabs 首页/订单/购物车/我的. Cross-page cart state uses a module-level singleton `src/cartStore.ts` (store page → checkout page). Coupons page hits `/user/coupons/` on the **unwired** `promotions` app, so it degrades to an empty state. Order-progress is a static timeline, not wired to real status.
- **merchant** — 6 pages; tabs 订单/商品/数据/我的 + `login` + `product-edit`. `api/index.ts` exposes store/product-CRUD/order-transition/review modules. Orders page does accept/reject/prepare/ready; products has category sidebar + toggle/delete and navigates to `product-edit` (replaces the web modal form); profile is store settings with open/closed toggle + `Taro.showModal({editable:true})` field edits. Stats tab is **mock** (no analytics backend). Login guards `merchant` role.
- **rider** — 5 pages; tabs 待接单/我的配送/历史/我的 + `login`. available (work-status toggle + search + grab), deliveries (pickup/deliver + exception bottom-sheet), history (delivered orders from `mine`), profile (rider card + logout). Exception-report is **toast-only** (no backend endpoint). Reuses merchant's tabbar png icons (not rider-specific). Login guards `rider` role.

Porting map from the web app (apply the same when adding pages):

| Web (React DOM) | Mini-program (Taro) |
|-----------------|----------------------|
| `axios` instance | `Taro.request` wrapper `src/api/config.ts` exporting `http.get/post/patch/delete` (returns response body directly, mirrors old axios `response.data` interceptor; 401 clears token) |
| `localStorage` | `Taro.getStorageSync`/`setStorageSync`/`removeStorageSync` |
| `toast()` from `@shared` | `src/utils/toast.ts` → `Taro.showToast({icon:'none'})` |
| `showModal()` from `@shared` (JSX form body) | `Taro.showModal` — for single-field edits use `{editable:true}`; multi-field forms become a dedicated page (see merchant `product-edit`) |
| single-page `currentRoute` state | multi-page + `tabBar`; navigate with `Taro.navigateTo`/`switchTab`/`reLaunch`; reload-on-focus via `useDidShow` |
| `div`/`span`/`h1`/`p` → `View`/`Text`; `img` → `Image`; `input onChange` → `Input onInput` (`e.detail.value`) |
| `lucide-react` icons | emoji placeholders (library incompatible); swap to font/image icons later |
| Tailwind className | kept as-is; `weapp-tailwindcss` compiles utilities into `dist/app-origin.wxss` and escapes class names + px→rpx |

Non-obvious build detail: Taro's Vite compiler ignores the file-based `postcss.config.js`, so Tailwind is injected via an inline Vite plugin in `config/index.ts` (`injectTailwind`) — without it `@tailwind` directives pass through raw and no utilities are generated. `tailwind.config.js` sets `corePlugins.preflight: false` (preflight targets html/body, invalid in mini-programs).

### Key Conventions

**Manager web admin** (and the deprecated web frontends):
- **Icons**: `lucide-react` everywhere, no emoji in UI messages
- **Modals**: never browser `prompt()`/`alert()` — use `showModal()` from `@shared`
- **Notifications**: `toast()` from `@shared`, never `alert()`
- **Sub-page routing**: a `currentRoute` state string, conditionally rendered — no React Router

**Mini-programs** (Taro): icons are emoji placeholders (lucide-react is DOM-only); modals/toasts use `Taro.showModal`/`Taro.showToast` (see the porting map above); routing is real multi-page + `tabBar`, not a `currentRoute` string.

**All clients**: use the hex color values from `DESIGN.md` (Primary `#0085FF`, Promo `#FF5000`, Success `#00B578`), not Tailwind color names like `blue-500`.

## Known Issues & Incomplete Work

Non-obvious gaps worth knowing before touching related code (full audit in `docs/问题.txt`):

**Mini-programs (active clients):**
- **Merchant 小程序**: stats tab (数据) is entirely mock — no backend analytics model. product-edit has no image upload (needs `/uploads`); profile's 评价管理/账号设置 menu items are toast-only (reviewAPI backend exists, page not built yet).
- **Rider 小程序**: exception-report bottom-sheet is toast-only (no backend endpoint); profile's 资质/站点/历史/设置 menu items are toast-only. Reuses merchant's tabbar png icons.
- **Customer 小程序**: coupons page hits the unwired `promotions` app (empty state); order-progress is a static timeline, not real status.

**Manager (active web admin)**: DashboardTab and UsersTab wire to real backend (dashboard stats, user list/ban/unban). AuditTab (merchant applications), FinanceTab (settlements), BannersTab remain mock-only — no backend models exist.

**Deprecated web frontends** (`fronted/Customer|Rider|Merchant` — kept for reference, not maintained): Rider web wired orders but StatisticsTab stayed mock; Customer web had non-functional Settings/readOnly search/decorative cart checkboxes/hardcoded favorites + a lingering `store.ts` import in `BottomNav.tsx`; Merchant web's CampaignsPage/DataTab were mock. These gaps are superseded by the mini-program status above — don't spend effort fixing the deprecated web apps.

**Backend**: 3 of 13 Django apps (`promotions`, `payments`, `notifications`, `common`) have no URL wiring despite having models/tests — don't assume an endpoint exists without checking `config/urls.py`. Channels uses `InMemoryChannelLayer`, not production-safe for multi-worker deployments. Order stock-restore on cancel/reject was added mid-session; earlier commits may not have it.
