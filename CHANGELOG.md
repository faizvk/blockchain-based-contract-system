# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Functional audit
- **Backend ABI** synced to current Solidity: 6-arg constructor, `acceptOffer(address)`, plus `startContract`, `stateApproved`, `refundAcceptedOfferorDeposit`, `setAuthenticator`, and previously missing view functions. Ghost `bestOfferor` / `lowestOffer` entries removed.
- **Frontend ABI** also drops ghost entries and gains the authenticator interface.
- **`offer.controller`** rewritten — no longer calls non-existent contract methods and now passes `offerorAddress` to `acceptOffer`.
- **`ContractDetails`** caller fixed to pass `winningFile.walletAddress` string to `handleAcceptOffer`, and revealed offers below `minimumBid` / above `totalBudget` are filtered out.
- **Pinata JWT** moved off the frontend behind a new server-side proxy `POST /api/pinata/upload` (auth-required, 10MB cap).
- **Backend `acceptOffer`** now `require`s a non-zero offeror with a revealed offer within `[minimumBid, totalBudget]`.
- **`stateApproved`** is now `onlyAuthenticator` with an owner-controlled `setAuthenticator(address)` setter on the contract.
- **`resetContract`** refunds outstanding `safetyDeposits` and clears `revealTimes` before deleting per-offeror state.
- **`handleNoValidOffers`** capped at 30 days extension and barred once grace period ends.
- **JWT_SECRET** fallback removed — the backend now hard-fails if it's missing.
- **CORS** explicitly allows the `Authorization` header.
- **File download** Content-Type is inferred from filename, filename is URI-encoded, and the `File` schema gains `contractAddress`/`walletAddress` indexes and timestamps.
- **`/api/analyze-bids`** now requires `owner` role and caps multer file size.
- **`Contract.contractAddress`** index promoted to `unique`; `storeContractData` returns 409 on duplicates and honors client-supplied `unlockTime`/`gracePeriodEnd`.
- **`Signup`** redirects to the role picker on invalid `:role` instead of dead-ending.
- **Backend** dropped unused `body-parser`, `gridfs-stream`, `multer-gridfs-storage`, `ipfs-http-client`, `mongodb` deps; added `axios` + `form-data` for the Pinata proxy.

### Workflow completion
- Backend: bcrypt password hashing + JWT-based auth (`/api/auth/me`, `requireAuth`, `requireRole`).
- Backend: contract / commitment / revealed-offer / file write routes now require auth + role.
- Frontend: axios interceptor attaches `Bearer` token; 401 clears it.
- Frontend: `offerorForm` fixed to call real backend routes (`/api/commitments`, `/api/revealed-offers`, `/api/files`).
- Frontend: `acceptOffer` ABI corrected to accept `_selectedOfferor` address.
- Frontend: `ContractDetails` now lists commitments + revealed offers with per-offer Accept buttons, plus claim-refund, emergency-unlock, and extend-bidding flows.
- Frontend: dedicated `/authenticator` page for state-approval workflow.
- Frontend: Dashboard cards show workflow phase (Bidding / Reveal / In progress / Ended).
- Frontend: `useCountdown` hook extracted for reuse.

### Added (frontend)
- Tailwind CSS v4 via `@tailwindcss/vite`
- Brand theme tokens (Inter + JetBrains Mono fonts)
- UI primitives: Button, Input, Card, Badge, Stat, Spinner, Skeleton, EmptyState, Container
- Navbar, Footer, Layout
- ErrorBoundary at the app root
- Polished 404 NotFound page
- Mobile-responsive layouts across all pages

### Changed (frontend)
- All pages redesigned with Tailwind, removing legacy CSS files
- Routes for authenticated users share a common Layout
- Removed hardcoded Infura URL from Login wallet add-chain flow

### Added
- ISC LICENSE file
- `.env.example` templates for backend, frontend, and smart contracts
- READMEs for backend and smart contracts subdirectories
- Lightweight logger and Ethereum input validators in backend
- `/health` endpoint, 404 handler, and global error middleware
- Production Dockerfile, `.dockerignore`, and docker-compose stack
- GitHub Actions CI workflow (backend, frontend, contracts)
- CONTRIBUTING and SECURITY documentation
- Repo-wide `.editorconfig`, `.prettierrc`, `.nvmrc`

### Changed
- CORS restricted to whitelisted origins via `CORS_ORIGIN`
- Solidity pragma pinned to `0.8.20`
- Refunds use `call()` with checks-effects-interactions instead of `.transfer()`
- Inputs to wallet, commitment, and revealed-offer endpoints are now validated

### Fixed
- Hardcoded Infura URL and private key removed from `backend/utils/blockchain.js`
- Hardcoded credentials removed from `smart_contracts/hardhat.config.js`
- Missing try/catch added to file controller read endpoints
