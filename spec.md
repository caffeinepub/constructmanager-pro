# ConstructManager Pro

## Current State

Version 19 is deployed with a full Motoko/ICP backend canister providing persistent storage. The frontend is a React/Tailwind SPA with:
- Complete authentication (sign-up, login, show/hide password, demo seed via `seedDemo()`)
- RBAC with 4 roles: Chief Engineer, Site Engineer, Materials Engineer, Site Owner
- Multi-tenant projects (Team Code + Team Password verified server-side)
- Labour management: worker CRUD, attendance marking, payroll approval
- Material management: autocomplete from 40+ master DB items, GRN/issue forms, low-stock alerts
- Site progress: daily % updates, inline photo attachments
- Group chat + direct messages (per project)
- Notifications (in-app bell)
- PDF + CSV export in all tabs
- Demo mode (`/demo` page, public sandbox)
- User Manual page
- Floating calculator
- Nationality/currency selector at sign-up with live exchange rates
- Phone + dial code field on sign-up

Known issues:
- Draft build not reflecting properly in live deployment (stale canister ID / seed data)
- Some data may not hydrate correctly after canister redeployment

## Requested Changes (Diff)

### Add
- Ensure all existing features are fully wired, working, and visible end-to-end
- Improve `ensureDemoSeeded()` to always be idempotent and reliable
- Improve landing page to show live role-specific dashboard preview after login
- Audit all 4 role dashboards for completeness and consistency
- Improve error handling and loading states everywhere
- Add Gantt chart visualization (simple CSS-based bar chart) to Site Progress tab
- Improve payroll workflow UI (clearer submission + approval states)
- Add audit log tab to Chief Engineer dashboard (already backed by canister)

### Modify
- Keep exact visual theme: light grey (#f1f5f9) background, orange (#f97316) accents, white cards
- Improve ProjectsDashboard to better show project cards with progress bar
- `ensureDemoSeeded` is called on every load (already idempotent in canister)
- Fix any issues with role routing after login (ensure correct dashboard is navigated to)
- Expand master materials database to 100+ items

### Remove
- Nothing to remove

## Implementation Plan

1. Regenerate Motoko backend with expanded master materials and improved audit log support
2. Rebuild frontend with:
   - Landing page with inline demo preview after login toggle
   - Auth pages (login, signup) — already good, minor polish
   - Projects dashboard — improve cards, progress bars
   - Chief Engineer dashboard — add Audit Log tab, improve payroll approval UI
   - Site Engineer dashboard — add simple Gantt chart to progress tab
   - Materials Engineer dashboard — expand autocomplete to 100+ items
   - Site Owner dashboard — improve financial overview widgets
   - All dashboards: ensure CSV + PDF export buttons work
   - Group chat + DM tabs: verify wiring
   - Notifications bell: verify wiring
3. Validate build (typecheck + lint)
4. Deploy
