# ConstructManager Pro

## Current State

Version 18 is deployed with a real Motoko/ICP backend. All major modules are functional: auth, projects, workers, attendance, materials, progress, payroll, chat, notifications, audit log. Data persists in the canister. Known gaps:

- SignUpPage has no phone number field (canister + AuthContext both support it, but the form omits it)
- Currency conversion in `currency.ts` uses hardcoded static rates (no live API)
- Passwords are sent and stored as plain text — `pwHash` field is misnamed, no hashing occurs
- `resetMemberPassword` in AuthContext is a no-op stub (300ms delay, no canister call)
- Draft-to-live deployment sync: demo seed key is canister-ID-based but the production canister may diverge from draft; seed needs to be more resilient
- UI polish: dashboards are functional but can be more consistent and visually refined

## Requested Changes (Diff)

### Add
- Phone number field (with country dial code selector) to SignUpPage form
- Client-side SHA-256 password hashing before any canister call (register, login, changePassword, updateProfile)
- Live exchange rate fetching via backend HTTP outcall — new canister method `getExchangeRates()` that fetches from exchangerate-api or open.er-api.com and caches result; frontend calls this on login and caches in sessionStorage for the session
- HTTP outcalls Caffeine component selected for the backend currency fetch
- `resetMemberPassword` implemented as a real `changePassword` canister call setting a temporary password

### Modify
- `currency.ts`: add `fetchLiveRates()` function that calls canister HTTP outcall and falls back to static rates on failure; `convertFromUSD` reads live rates when available
- `SignUpPage.tsx`: add phone + dial code fields; pass phone to `register()`
- `AuthContext.tsx`: hash passwords with SHA-256 (via Web Crypto API) before passing to all canister auth calls; implement `resetMemberPassword` properly
- `canister.ts`: hash passwords before calls (or do it in AuthContext — single place)
- `main.mo`: add `getExchangeRates()` HTTP outcall method that fetches USD rates from open.er-api.com and returns a JSON blob; cache result for 1 hour using stable var
- Demo seed: make seed check more robust — check both localStorage key AND call `seedDemo()` if the canister returns no users on first load

### Remove
- Nothing removed

## Implementation Plan

1. Select `http-outcalls` component for backend currency fetching
2. Add `getExchangeRates()` to `main.mo` — HTTP outcall to `https://open.er-api.com/v6/latest/USD`, cache for 1 hour, return rate map as JSON string
3. Update `currency.ts` — add `fetchLiveRates()` that calls canister and updates a module-level cache; `convertFromUSD` uses live rates when loaded
4. Add phone field to `SignUpPage.tsx` (dial code select + number input, optional)
5. Hash passwords with SHA-256 in `AuthContext.tsx` before every canister auth call
6. Implement `resetMemberPassword` in AuthContext using `canisterChangePassword` with a temp password
7. Deploy and validate build
