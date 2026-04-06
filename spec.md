# ConstructManager Pro

## Current State

Version 22 is deployed with a full Motoko backend (ICP canister), React frontend, 4-step sign-up wizard, role-based dashboards, group chat, PDF/CSV export, autocomplete materials database (113 items), inline progress photos, and multi-tenancy.

The build passes cleanly (no TypeScript or lint errors). The reported issues are runtime/logic bugs:

1. **Dashboard crash when `activeProject` is null** — if a user navigates directly to a dashboard URL (`/dashboard/chief-engineer`, etc.) without entering a project first (e.g., using browser back/forward), `activeProject` is `null`. The dashboard renders anyway and tries to use `activeProject.id` (which throws). There is no redirect-back-to-projects guard.

2. **`ProjectDataContext` NaN canister calls** — `loadAllData` calls `Number(pid)` where `pid` can be `null` (string), resulting in `NaN` being passed as `BigInt` to the canister, causing a crash. The `useEffect` guards `if (projectId)` but the `reloadData` callback does not check.

3. **Demo seed counter mismatch after canister upgrade** — `seedDemo` hardcodes project IDs 1/2/3 and sets `nextProjId := 4` etc., but if the canister was already running (stable vars survived upgrade), `nextProjId` may already be > 4. The seed function correctly early-returns if `ce@demo.com` exists, so this is not a conflict — but if the canister was wiped/redeployed fresh, the seed should work correctly. This is actually fine as-is.

4. **Missing loading skeleton / error state** on Projects Dashboard when the canister call fails — `loadingProjects` state exists but no error state, so on canister unavailability the page shows empty with no explanation.

5. **`ensureDemoSeeded` race** — it runs in `AuthProvider` on every mount but doesn't block `isLoading = false`. If the canister takes time to respond, the user sees the login screen before seeding completes, leading to "User not found" errors when they immediately try the demo credentials.

## Requested Changes (Diff)

### Add
- Guard in all 4 dashboard components: if `!activeProject`, redirect to `/projects` instead of rendering a broken dashboard.
- An error banner on the Projects Dashboard when the canister fetch fails (currently just a toast, page looks empty).
- A `seeding` loading state in AuthContext so login is blocked until `seedDemo()` resolves.

### Modify
- `ProjectDataContext.reloadData`: add `if (!projectId) return;` guard before calling `loadAllData`.
- `AuthProvider` init: await `ensureDemoSeeded()` before setting `isLoading = false` (it already does `await Promise.all([ensureDemoSeeded(), loadLiveRates()])` — verify this correctly awaits both before setting `isLoading = false`).
- Projects Dashboard: add an `error` state; on fetch failure show a visible error card with a retry button instead of just a toast.
- Demo seed timing: the splash/loading screen should stay visible while seeding is in progress.

### Remove
- Nothing removed.

## Implementation Plan

1. Add `if (!activeProject) { navigate({ to: '/projects' }); return null; }` early return to all 4 dashboard files: `ChiefEngineerDashboard.tsx`, `SiteEngineerDashboard.tsx`, `MaterialsEngineerDashboard.tsx`, `SiteOwnerDashboard.tsx`.
2. Add null guard in `ProjectDataContext.reloadData`.
3. Add `error` state and retry button to `ProjectsDashboard.tsx`.
4. Verify `AuthProvider` loading sequence awaits seed before setting `isLoading = false` — fix if needed.
5. Run typecheck and build.
