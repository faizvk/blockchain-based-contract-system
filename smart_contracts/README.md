# Smart Contracts

Solidity contracts for the tender / bid evaluation system, managed with Hardhat.

## Setup

```bash
npm install
cp .env.example .env   # fill RPC_URL and PRIVATE_KEY
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm test`     | Run Hardhat test suite |
| `npm run deploy` | Deploy to localhost network |

## Contracts

- `BudgetContract.sol` — commit-reveal sealed bid auction with safety deposits, grace period, and owner approval flow.

## Networks

- `hardhat` — local in-memory network (chainId 1337)
- `sepolia` — Ethereum testnet via Infura (configure via `.env`)
