# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ELM is a multi-role food delivery platform. Four independent frontend apps + backend API design:

| App | Directory | Stack |
|-----|-----------|-------|
| Customer | `fronted/Customer/` | React 19 + TS + Vite + Tailwind v4 |
| Rider | `fronted/Rider/` | React 19 + TS + Vite + Tailwind v4 |
| Merchant | `fronted/Merchant/` | React 19 + TS + Vite + Tailwind v4 |
| Manager | `fronted/Manager/` | React 19 + TS + Vite + Tailwind v4 |
| Backend | `src/elm/` | Django 6.0 + DRF (not scaffolded) |
| API specs | `docs/` | 6 design documents |

## Commands

```bash
# Each frontend app is an independent Vite project:
cd fronted/Customer && npm install && npm run dev     # dev server
cd fronted/Rider   && npm install && npm run dev
cd fronted/Merchant && npm install && npm run dev
cd fronted/Manager && npm install && npm run dev

# Type-check (from app directory):
npx tsc --noEmit

# Backend (when scaffolded):
uv sync && uv run manage.py migrate
uv run daphne config.asgi:application --port 8000
```

## Architecture

### Shared Module (`fronted/shared/`)

All four apps import from `@shared` via Vite `resolve.alias`. Contains:

- `Toast.tsx` — `<Toast />` component + `toast(msg)` function
- `Modal.tsx` — `<Modal />` component + `showModal(title, desc, body, onConfirm)` / `closeModal()`
- `types.ts` — shared TypeScript interfaces (`Order`, `Product`, `TabConfig`)
- `index.ts` — barrel export

Each app's `vite.config.ts` maps `@shared` → `../shared/` and each `tsconfig.json` has the corresponding `paths` entry.

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

Full specs in `docs/03-api-design.md`. Envelope: `{"code": 0, "message": "success", "data": {...}}`. Error code ranges: 1xxx auth, 3xxx merchant, 4xxx order, 5xxx rider, 6xxx payment.

When mapping frontend to backend:
- Customer `store.ts` Cart → `POST /api/v1/cart/items/`, Orders → `GET/POST /api/v1/orders/`
- Merchant order actions → `PATCH /api/v1/merchant/orders/{id}/accept/` etc.
- Rider flow → `PATCH /api/v1/rider/orders/{id}/pickup/`, `/deliver/`
