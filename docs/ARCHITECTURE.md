# Architecture

High-level shape of the system.

## Components

- **`smart_contracts/`** — Solidity contract (`BudgetContract.sol`) implementing the commit-reveal tender flow, safety deposits, and authenticator-gated state approval.
- **`backend/`** — Express API. Wraps Mongo persistence, JWT auth, Pinata/IPFS pinning, and a small set of blockchain helpers that forward to the deployed contract.
- **`frontend/`** — Vite + React 19 SPA. Talks to the backend over `/api/*` and to MetaMask for on-chain interactions via ethers v6.

## Trust boundaries

| Boundary | Authority |
| --- | --- |
| Owner (deployer) | Deploys contract, accepts offers, resets, sets authenticator |
| Authenticator | Calls `stateApproved()` after acceptance (decoupled from owner) |
| Offeror | Commits + reveals bids with safety deposit |
| Backend | Holds `JWT_SECRET`, `PINATA_JWT`, server wallet for relayed txs |

## Data flow (commit / reveal)

1. Owner deploys `BudgetContract` with budget, durations, min bid, deposit.
2. Offeror posts `commitOffer(hash)` with `msg.value == safetyDepositAmount`.
3. After `unlockTime`, offerors call `revealOffer(amount, nonce)`.
4. After `unlockTime + gracePeriod`, owner calls `acceptOffer(addr)`; losing deposits refunded.
5. Authenticator calls `stateApproved()`; owner calls `startContract()`.
6. After `contractDuration`, accepted offeror reclaims their deposit.

## Database

MongoDB collections, all keyed by lowercase Ethereum addresses to avoid
checksum-casing duplicates:

- `contracts` — off-chain mirror of contract config + timing windows.
- `commitments` — `(contractAddress, offeror)` unique.
- `revealedoffers` — `(contractAddress, offeror)` unique.
- `wallets` — connected wallet addresses.
- `users` — bcrypt-hashed credentials, `password` excluded from default queries.
