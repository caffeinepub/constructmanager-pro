# ConstructManager Pro – Version 11

## Current State
Version 10 is a comprehensive frontend-only React app with:
- Landing page with open-source badge, demo preview, hero image
- Sign-up (any email, role picker, show password) and login forms
- Projects Dashboard — card grid showing user's projects with role, lock status
- Project-level Team Code (join) and Team Password (access), fully separate
- Role-based dashboards: Chief Engineer, Site Engineer, Materials Engineer, Site Owner
- Labour Management: workers list, attendance 7-day grid, wage calculation, payroll
- Material Management: alphabetical inventory, GRN inward, issue outward, low-stock alerts
- Site Progress: circular progress indicator, milestone history, notes
- Notifications bell: in-app notification center with filters
- Admin Panel (CE): project/user management, passcode changes, audit log
- Demo mode and role-specific User Manual page
- All state is in-memory (React state, no backend persistence)

## Requested Changes (Diff)

### Add
1. **Project Group Chat** — per-project real-time-style group chat accessible from any dashboard. Messages stored in React state (per project). Support text, emoji reactions, @mention display. Show sender name, role badge, timestamp.
2. **Private Messaging** — 1:1 direct messages between project members. Accessible from a DMs panel or member list. Stored per (projectId, userId pair).
3. **PDF Export** — using jsPDF + autoTable:
   - Attendance PDF: worker name, dates, hours, total wage
   - Materials PDF: alphabetical inventory with stock, reorder level, unit price
   - Progress PDF: completion %, milestone history, notes
   - Triggered from "Export PDF" buttons in respective modules
4. **Nationality & Currency Selection** — on sign-up form:
   - Nationality dropdown with flag emoji prefix (e.g. 🇮🇳 India, 🇺🇸 United States, 🇬🇧 United Kingdom, etc. — 20+ countries)
   - Currency preference dropdown: USD ($), EUR (€), GBP (£), INR (₹), JPY (¥), AED (د.إ), SGD (S$), AUD (A$)
   - Currency stored in user profile; all prices/wages shown with correct currency symbol
5. **Phone Number with Country Code** — in user profile and worker add/edit form:
   - Country code selector (+91, +1, +44, etc.)
   - Optional phone number field
6. **Autocomplete Material Database** — master list of 40+ common construction materials (Aggregate, Bricks, Cement, Concrete Blocks, etc.). When Material Engineer types in the Add Material form, show a filtered dropdown. On select, auto-fill name, unit, and a reference USD price. Engineer can override price.
7. **In-App Calculator** — a floating calculator widget accessible from a toolbar button in any dashboard. Supports basic arithmetic. Useful for quick quantity/cost estimation.
8. **Smart Reminder Banner** — if Site Engineer hasn't updated progress in current session (or progress is 0%), show a subtle top-of-dashboard reminder: "You haven't updated progress recently. Tap here to update."
9. **Currency Display** — everywhere wages, material prices, and budgets appear, use the user's chosen currency symbol.

### Modify
- Sign-up form: add nationality and currency fields
- Worker add/edit modal: add phone with country code
- Material add modal: add autocomplete from master DB
- Dashboard headers: add Chat icon (opens group chat panel) alongside existing notification bell
- User profile/settings: show nationality, currency, phone number

### Remove
- Nothing removed; all existing features preserved

## Implementation Plan
1. Add `MASTER_MATERIALS` constant (40+ materials with name, unit, usdPrice)
2. Add `COUNTRIES` list (20+ with flag emoji + dial code) and `CURRENCIES` list
3. Update `AuthContext` user type to include `nationality`, `currency`, `phone`
4. Update `SignUpPage` with nationality and currency selects
5. Create `ChatContext` or add chat state to `ProjectDataContext` — shape: `{ [projectId]: Message[] }` and `{ [dmKey]: Message[] }`
6. Create `GroupChat.tsx` component — slide-in panel with message list, input, emoji picker (basic), send button
7. Create `DirectMessages.tsx` component — member selector + conversation view
8. Add Chat icon to `DashboardLayout` header; clicking opens `GroupChat` panel as a side sheet
9. Add "Export PDF" buttons in:
   - SiteEngineerDashboard Labour tab (attendance export)
   - MaterialsEngineerDashboard Inventory tab
   - SiteEngineerDashboard Progress tab
   - ChiefEngineerDashboard (all of the above)
10. Install/use `jspdf` and `jspdf-autotable` for PDF generation (already available in most Caffeine setups; if not, implement as HTML print)
11. Add autocomplete dropdown to Add Material modal
12. Add country code + phone field to worker form and user profile modal
13. Create floating `Calculator.tsx` widget — fixed bottom-right button, expands to calculator UI
14. Add smart reminder logic in SiteEngineerDashboard
15. Apply currency symbol from user profile wherever prices display
