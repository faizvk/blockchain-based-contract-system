# Frontend

React + Vite + **Tailwind CSS v4** UI for the blockchain contract system.

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev
```

Vite serves on `http://localhost:5173`.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev`     | Local dev server with HMR |
| `npm run build`   | Production build |
| `npm run preview` | Preview the build |
| `npm run lint`    | ESLint |

## Architecture

- **Routing** — `react-router-dom` v7, authenticated routes share a `Layout`.
- **Styling** — Tailwind CSS v4 via `@tailwindcss/vite`. Brand theme tokens live in `src/index.css` under `@theme`.
- **UI primitives** — `src/components/ui/` (`Button`, `Input`, `Card`, `Badge`, `Stat`, `Spinner`, `EmptyState`, `Skeleton`, `Container`).
- **State** — `WalletContext` for wallet + role.
- **API** — `src/utils/api.js` — axios instance honoring `VITE_API_URL`.
- **Resilience** — `ErrorBoundary` wraps the app root.

## Responsive design

All pages are responsive: form grids collapse to single column on mobile, the navbar exposes a hamburger menu below `md`, and tap targets are sized for touch.

## Workflow pages

| Page | Path | Role |
|------|------|------|
| Landing | `/` | public |
| Login | `/login` | public |
| Signup | `/signup/:role` | public |
| Dashboard | `/dashboard` | any auth |
| Owner deploy | `/owner-form` | owner |
| Contract details | `/contract-details/:ca` | any auth |
| Bid form | `/offeror-form/:ca` | contractor |
| Authenticator | `/authenticator` | authenticator |
| 404 | `/404` | public |

## Auth

`utils/api.js` attaches `Authorization: Bearer <token>` from `localStorage.authToken`. On 401 the token is cleared so the next protected request triggers a redirect.
