# PR — feat/complete-workflow

## Summary

Closes the gaps that prevented the end-to-end tender flow from working:

- JWT auth + bcrypt password hashing; protected backend routes.
- Frontend wired to the correct backend endpoints (commitments, revealed offers, files).
- `acceptOffer` ABI fixed to take `_selectedOfferor`.
- Per-offer Accept, Claim refund, Emergency unlock, Extend bidding, State approve actions.
- Dedicated Authenticator page + role-guarded route.
- Dashboard workflow phase badges; reusable countdown hook.

## QA checklist

1. **Register** as `owner`, `contractor`, `authenticator` from different MetaMask accounts.
2. As owner, **deploy** a contract with short durations.
3. As contractor, **upload PDF → commit offer** → appears in ContractDetails commitments.
4. After unlock, **reveal offer** → appears in revealed-offers, sorted by amount.
5. After grace, owner **Analyze bids** → suggested winner badge.
6. Owner clicks per-offer **Accept** → `acceptOffer(address)` succeeds.
7. Authenticator opens `/authenticator` → **Approve state**.
8. Owner clicks **Start contract** → backend `startTime` updates, Dashboard switches to "Ends in".
9. After duration, winner clicks **Claim refund** → safety deposit returned.

## Backend changes

- `controllers/auth.controller.js` (bcrypt + JWT + `me`)
- `middleware/auth.js` (new)
- `routes/auth.routes.js`, `routes/contract.routes.js`, `routes/commitment.routes.js`, `routes/revealedOffer.routes.js`, `routes/file.routes.js`
- `package.json` (`bcryptjs`, `jsonwebtoken`)
- `.env.example` (`JWT_SECRET`, `JWT_EXPIRES_IN`)
- Deleted: `routes/owner.js`

## Frontend changes

- `utils/api.js` (interceptors)
- `context/WalletContext.jsx` (`authToken`, `logout()`)
- `pages/Login.jsx`, `pages/Signup.jsx` (store token, parse `{message}`)
- `pages/ContractDetails.jsx` (commitments + revealed-offer lists; refund / unlock / extend actions)
- `pages/Authenticator.jsx` (new)
- `pages/Dashboard.jsx` (phase badges)
- `components/Navbar.jsx` (authenticator link)
- `components/ui/Modal.jsx` (new)
- `hooks/useCountdown.js` (new)
- `utils/contractABI.js` (`acceptOffer(address)`)
- `App.jsx` (`/authenticator` route)
