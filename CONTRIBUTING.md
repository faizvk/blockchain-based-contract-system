# Contributing

Thanks for your interest in contributing!

## Workflow

1. Fork the repo and create a branch from `main`.
2. Run the relevant package's install + dev commands.
3. Keep commits focused; use Conventional Commits prefixes (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).
4. Open a PR against `main`.

## Local setup

```bash
# backend
cd backend && cp .env.example .env && npm install && npm run dev

# frontend
cd frontend && cp .env.example .env && npm install && npm run dev

# smart contracts
cd smart_contracts && cp .env.example .env && npm install && npx hardhat compile
```

## Style

- Prettier config lives at the repo root (`.prettierrc`).
- EditorConfig enforces indentation.
- Solidity is pinned to `0.8.20`.

## Reporting issues

Please open a GitHub issue with reproduction steps and environment details.
