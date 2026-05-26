# Security Policy

## Supported Versions

The `main` branch is the only actively maintained branch.

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security problems.

Email `faizvk14@gmail.com` with:

- A description of the issue
- Steps to reproduce
- Affected component (backend / frontend / smart contracts)

You should receive an acknowledgment within 72 hours.

## Hardening notes

- **Pinata JWT** is server-side only. Frontend uploads go through
  `POST /api/pinata/upload`. Do not reintroduce `VITE_PINATA_JWT`.
- **`JWT_SECRET`** is mandatory. The backend hard-fails on startup if it's
  missing; do not commit a default.
- **Authenticator role** is on-chain (`BudgetContract.authenticator`).
  The contract owner sets it via `setAuthenticator(address)`; only that
  address can call `stateApproved()`.
- **`acceptOffer(address)`** rejects zero address, unrevealed offerors,
  and offers outside `[minimumBid, totalBudget]`.

## Scope

- Smart contract logic in `smart_contracts/contracts/`
- Backend API auth and validation
- Secrets handling in env files

## Out of scope

- Issues caused by misconfigured local environments
- Vulnerabilities in third-party dependencies (please report upstream)
