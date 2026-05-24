# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
