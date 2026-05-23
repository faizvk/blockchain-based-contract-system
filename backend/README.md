# Backend

Node.js + Express API for the blockchain contract system. Provides tender, bid, file, auth, wallet, and AI-evaluation endpoints.

## Setup

```bash
npm install
cp .env.example .env   # fill in values
npm run dev
```

Server listens on `http://localhost:5000` by default.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start`   | Start in production mode |

## Environment

See `.env.example` for the full list of required variables.

## API surface

- `/api/auth` — register / login
- `/api/contracts` — contract CRUD
- `/api/commitments` — sealed bid commitments
- `/api/revealed-offers` — revealed offer records
- `/api/wallets` — wallet registry
- `/api/files` — PDF storage via GridFS
- `/api/offers` — offer queries
- `/api/analyze-bids` — Gemini-powered bid analysis
