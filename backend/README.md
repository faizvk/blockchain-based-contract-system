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

- `/api/auth`
  - `POST /register` → `{ token, role, name, message }`
  - `POST /login` → `{ token, role, name, message }`
  - `GET /me` *(auth)* → `{ user }`
- `/api/contracts`
  - `GET /` — list
  - `GET /:contractAddress` — single contract
  - `POST /storeContractData` *(auth, role=owner)*
  - `POST /:contractAddress/start` *(auth, role=owner)* — persists on-chain `contractStartTime`
- `/api/commitments`
  - `POST /` *(auth, role=contractor)*
  - `GET /:contractAddress`
- `/api/revealed-offers`
  - `POST /` *(auth, role=contractor)*
  - `GET /:contractAddress`
- `/api/files`
  - `POST /` *(auth)* — store base64 PDF
  - `GET /` / `GET /:id` / `GET /contract/:ca`
- `/api/analyze-bids` — Gemini-powered bid analysis
- `/api/wallets` — wallet registry

## Auth

Passwords are hashed with `bcryptjs`. Login/Register issue a JWT signed with `JWT_SECRET` (default 7d expiry). Send it as `Authorization: Bearer <token>`.
