# ConstructManager Pro

## Current State
Frontend-only React SPA with all data in React state (resets on refresh). Features: landing page, auth (demo credentials), multi-project system with passcode access, role-based dashboards (Chief Engineer, Site Engineer, Material Engineer, Site Owner), labour/materials/progress modules, group chat, direct messages, PDF export, nationality/currency selector, autocomplete material DB, inline photo attachments in progress log, floating calculator, notifications panel.

No persistent backend. All data stored in memory.

## Requested Changes (Diff)

### Add
- Motoko backend for persistent data storage
- Real user accounts (register/login with email + password hash)
- Persistent projects, members, roles
- Persistent workers, attendance records
- Persistent materials inventory, GRN/issue transactions
- Persistent progress updates with photo attachments (blob storage)
- Persistent notifications
- Persistent chat messages (project group + DM)
- New color scheme: light grey (#f4f5f7) background, orange (#f97316) accents, white cards, black/dark-grey text
- Nationality selector with flag emoji on sign-up
- Currency preference stored per user
- 40+ material master database pre-loaded in backend

### Modify
- Auth flow: sign-up creates real backend user; login validates against stored credentials
- Projects dashboard: loads from backend
- All CRUD operations call backend actors
- Color scheme across all pages and components

### Remove
- Hardcoded demo credentials as primary auth (keep demo mode as separate sandbox)
- In-memory state as source of truth

## Implementation Plan
1. Backend: user accounts (register, login, profile with nationality/currency/phone), projects (create, join, list, passcode/password), members/roles, workers, attendance, materials (master DB + project inventory, GRN, issues), progress updates, notifications, chat messages
2. Blob storage for progress photos
3. Frontend: wire all components to backend actors; update color scheme to light grey/orange/white/black; keep all existing UI structure and modules
4. Demo mode: pre-seed demo accounts (ce@demo.com etc.) in backend on first load
