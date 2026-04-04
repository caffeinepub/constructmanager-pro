# ConstructManager Pro

## Current State

A fully-featured frontend-only React app with localStorage persistence. All modules are implemented in the frontend:
- Authentication (sign-up/login) stored in localStorage
- Multi-project dashboard with Team Code + Team Password access
- RBAC: Chief Engineer, Site Engineer, Materials Engineer, Site Owner
- Labour management: add/edit workers, attendance grid, wage calculation, payroll approval
- Material management: autocomplete from master DB (40+ materials), inventory (A-Z), GRN/Issue, low-stock alerts
- Site progress: completion %, notes, multiple photo attachments inline in progress log
- Group chat + DMs (InlineChatPanel, ChatContext)
- PDF export (jsPDF) + CSV export for all modules
- Notifications panel
- Floating calculator
- Demo page with pre-seeded data for all 4 roles
- User manual
- Color scheme: light grey bg (#f4f6f9), orange accent (#f97316), white cards

The Motoko backend (`main.mo`) exists but is not connected to the frontend at all — all data lives in React state + localStorage.

## Requested Changes (Diff)

### Add
- Real backend persistence via Motoko canister for: users, projects, project members, workers, attendance, materials, material transactions, progress entries, chat messages, notifications
- Proper multi-tenancy: each user's data isolated; project access controlled by Team Code + hashed Team Password
- Nationality/currency stored in user profile in backend
- Phone number with country code stored in backend
- Payroll records persisted in backend
- Audit log entries stored in backend
- Backend-enforced RBAC for all mutations

### Modify
- Rebuild Motoko backend with comprehensive stable storage covering all app data models
- Wire frontend to call canister APIs instead of localStorage for all CRUD operations
- Keep all existing UI, visual design, and component structure intact
- Keep demo mode (pre-seeded demo users + projects seeded in canister)
- Keep PDF/CSV export (frontend-only, no change needed)
- Keep group chat + DMs (can remain in frontend state, backed by canister for persistence)

### Remove
- localStorage-based persistence (replaced by canister)
- Static mock data from contexts (replaced by canister calls)

## Implementation Plan

1. **Motoko backend**: Rebuild `main.mo` with stable variables covering:
   - Users table (email, password hash, name, nationality, currency, phone, role)
   - Projects table (id, name, location, teamCode, teamPasswordHash, completionPct, createdBy)
   - ProjectMembers (projectId → userId → role)
   - Workers (projectId, name, skill, wage, phone, email)
   - Attendance (workerId, date, status)
   - Materials (projectId, name, unit, stock, reorderLevel, price)
   - MaterialTransactions (materialId, type, qty, date, by)
   - ProgressEntries (projectId, pct, notes, photos[], date, by)
   - ChatMessages (projectId, senderId, text, timestamp)
   - Notifications (userId, type, content, read)
   - Payroll (projectId, period, total, status, submittedBy)
   - AuditLog (userId, action, module, details, timestamp)

2. **Frontend integration**: Update AuthContext, ProjectDataContext, ChatContext to call canister APIs via generated bindings instead of localStorage

3. **Keep unchanged**: All UI components, visual design, PDF/CSV export logic, autocomplete material database (frontend constant), demo page layout, user manual
