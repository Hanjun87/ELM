# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ELM is a multi-role food delivery platform in early prototype stage. Four independent frontend React apps with varying completeness levels; Django backend is configured but not scaffolded yet.

| App | Directory | Stack | Components | Status |
|-----|-----------|-------|------------|--------|
| Customer | `fronted/Customer/` | React 19 + TS + Vite + Tailwind v4 | 16 | Most complete; many UI flows present but unimplemented |
| Rider | `fronted/Rider/` | React 19 + TS + Vite + Tailwind v4 | 3 | Skeleton only; many dead buttons and empty routes |
| Merchant | `fronted/Merchant/` | React 19 + TS + Vite + Tailwind v4 | 7 | Core flows present; missing inventory management |
| Manager | `fronted/Manager/` | React 19 + TS + Vite + Tailwind v4 | 5 | Basic admin UI; audit tabs partially implemented |
| Backend | `src/elm/` | Django 6.0 + DRF | — | Dependencies configured; no models/views/migrations yet |

**Documentation**: `docs/需求分析.txt` contains full requirements (in Chinese). Former API design docs (01-06) staged for deletion.

## Commands

```bash
# Each frontend app is independent; install deps in each directory first:
cd fronted/Customer && npm install && npm run dev     # port 3000
cd fronted/Rider   && npm install && npm run dev      # port 3000
cd fronted/Merchant && npm install && npm run dev     # port 3000
cd fronted/Manager && npm install && npm run dev      # port 3000

# Type-check (from app directory):
npm run lint    # runs tsc --noEmit

# Backend (when implemented):
uv sync && uv run manage.py migrate
uv run daphne config.asgi:application --port 8000
```

## Known Issues & Incomplete Work

The frontends are at varying completion stages. Many UI elements are non-functional:

**Rider app (most incomplete)**:
- Only 3 components vs Customer's 16; many skeleton screens
- MineTab: all buttons (edit profile, settings, logout) have no `onClick`
- TasksTab: "待取货" and "已完成" sub-tabs render blank (only "进行中" works)
- Exception reporting deletes orders instead of marking them as problematic

**Customer app**:
- Settings/Profile pages: all menu items (personal info, account security, payment, address management, logout) non-functional
- Search bar in Home is `readOnly`; search button doesn't trigger search
- Order review submit button not wired up
- Cart checkboxes are decorative only (`onClick={() => {}}`)
- Favorites list is hardcoded; unfavorite action doesn't work

**Merchant app**:
- No way to manually delist products or edit inventory after initial stock-out
- Top notification bell, account settings, discount campaigns: show toast placeholder, no real logic
- Accept/reject/fulfill logic duplicated between DashboardTab and OrdersTab

**Manager app**:
- "更多操作" button on users, license image viewers: no `onClick`
- Product audit and report handling tabs show empty lists when clicked (only merchant audit tab works)

**Cross-app**:
- Design tokens (`#0085FF`, etc.) hardcoded in components instead of CSS variables
- Shared `Header.tsx` component exists but unused (see Migration section above)

See `docs/问题.txt` for the full audit (in Chinese).

## Architecture

### Shared Module (`fronted/shared/`)

All four apps import from `@shared` via Vite `resolve.alias`. Contains:

- `Toast.tsx` — `<Toast />` component + `toast(msg)` function
- `Modal.tsx` — `<Modal />` component + `showModal(title, desc, body, onConfirm)` / `closeModal()`
- `Header.tsx` — **Implemented but unused**: Fixed top header component ready for adoption (see Migration below)
- `types.ts` — shared TypeScript interfaces (`Order`, `Product`, `TabConfig`)
- `index.ts` — barrel export

Each app's `vite.config.ts` maps `@shared` → `../shared/` and each `tsconfig.json` has the corresponding `paths` entry.

**Migration in progress**: `Header.tsx` exists and is exported from `@shared`, but all four apps still use their own inline header implementations. To adopt the shared header, replace the `<header>` element in each `App.tsx` with `<Header title="..." onBack={...} />` from `@shared`.

### Design System (`fronted/DESIGN.md`)

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#0085FF` | Brand, active tabs, buttons |
| Promo | `#FF5000` | Prices, urgency, badges |
| Success | `#00B578` | Completions, positive trends |
| Background | `#F5F5F5` | Page background |
| Cards | `rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03)]` | White cards |
| Bottom nav | `rounded-t-[20px] shadow-[0_-8px_24px_rgba(0,0,0,0.04)]` | Fixed bottom |

### App Structure (all four follow this pattern)

```
AppName/
├── index.html, package.json, tsconfig.json, vite.config.ts
└── src/
    ├── main.tsx          ← createRoot + render
    ├── index.css         ← @import "tailwindcss"
    ├── App.tsx           ← Header + Tab navigation + <Toast/>
    ├── store.ts          ← Mock data + subscribe/notify pattern
    └── components/       ← One file per tab/route
```

### State Management

Each app uses a simple **reactive store** (not Redux). The pattern:

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

Customer's store is more elaborate with `addToCart()`, `placeOrder()`, etc. The other three use simpler direct-mutation + `forceUpdate` patterns.

### Key Conventions

- **Icons**: `lucide-react` everywhere (no emoji in UI messages)
- **Modals**: never use browser `prompt()`/`alert()` — use `showModal()` from `@shared`
- **Notifications**: use `toast()` from `@shared` — never `alert()`
- **Colors**: always use the design system hex values from `DESIGN.md`, not Tailwind color names like `blue-500`
- **Tab indices**: Customer/Manager use string tab IDs, Merchant uses numeric indices
- **Sub-page routing**: Apps use a `currentRoute` state pattern (not React Router) — set a route string, conditionally render the matching component

### Backend API

Backend is configured but not implemented yet. Django 6.0 dependencies are in `pyproject.toml`, but `src/elm/` contains only an empty `__init__.py`. No models, views, migrations, or URL routing exists yet.

When mapping frontend to backend (future work):
- Customer `store.ts` Cart → `POST /api/v1/cart/items/`, Orders → `GET/POST /api/v1/orders/`
- Merchant order actions → `PATCH /api/v1/merchant/orders/{id}/accept/` etc.
- Rider flow → `PATCH /api/v1/rider/orders/{id}/pickup/`, `/deliver/`

See `docs/需求分析.txt` for complete database schema and role requirements.
