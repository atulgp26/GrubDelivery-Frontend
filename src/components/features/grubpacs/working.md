# GrubPacs Working Flow (Production Guide)

This document explains the complete GrubPacs frontend working flow in this codebase, including navigation, API integration, state handling, list/details/edit behavior, and production hardening recommendations.

Scope:
- Module: GrubPacs (active + suspended)
- Stack context: Next.js App Router + client components + service layer over Axios
- Source of truth: Current implementation in `src/app`, `src/components/features/grubpacs`, `src/services`, `src/types/domain/grubpacs.ts`

---

## 1. Overall System Flow

### 1.1 End-to-End User Journey

1. User opens app routes.
2. Middleware checks authentication cookie (`AUTH_COOKIE_NAME=true`).
3. If unauthenticated, user is redirected to `/auth`.
4. After login, user navigates using sidebar to GrubPacs module (`/grubpacs`).
5. GrubPacs landing page shows information panel and CTA to list (`/grubpacs/list`).
6. List screen loads active boxes from API (`GET /food/grubpac` with `status=active`).
7. User can search/filter/group/select rows and perform actions (suspend, apply settings, delete paths, etc.).
8. User can open details view (`/grubpacs/details?id=<boxId>`) for per-box settings/logs/track.
9. User can switch to suspended list (`/grubpacs/suspended`) and suspended details (`/grubpacs/suspended/details?id=<boxId>`), then reactivate or delete.

### 1.2 Role-Based Flow (Current State)

Current frontend route access is authentication-based, not role-gated:
- Implemented guard: authenticated vs unauthenticated.
- Not implemented in route guard: admin/manager/driver-specific route restrictions for GrubPacs.
- Practical effect: all authenticated users can open GrubPacs routes; permission enforcement is expected primarily from backend API authorization.

---

## 2. Navigation Flow

## 2.1 Route Map

Dashboard routes:
- `/grubpacs` -> info panel landing.
- `/grubpacs/list` -> active list (`GrubPacsListScreen`).
- `/grubpacs/suspended` -> suspended list (`SuspendedGrubPacsList`).

Fullscreen routes:
- `/grubpacs/details?id=<id>` -> active box details (`BoxSettingsPage`).
- `/grubpacs/suspended/details?id=<id>` -> suspended box details (`SuspendedBoxDetailsPage`).

### 2.2 Route Connections

- Sidebar item points to `/grubpacs`.
- Landing CTA (`KNOW MORE`) points to `/grubpacs/list`.
- Active list row click pushes `/grubpacs/details?id=<row.id>`.
- Suspended list row click pushes `/grubpacs/suspended/details?id=<row.id>`.
- Details sidebars allow moving between box ids by updating query `id`.
- Details pages provide "GO BACK" actions to list/suspended list.

### 2.3 Guards / Middleware / Access Logic

Middleware (`src/middleware.ts`):
- Public paths: `/api`, `/reset-password`, `/`.
- Guest-only path: `/auth` (redirects authenticated users to `/dashboard`).
- Protected paths: everything else requires auth cookie.
- On missing auth cookie: redirect to `/auth`.

DashboardLayout (`src/components/layout/DashboardLayout.tsx`) adds client-side auth fallback:
- Re-checks auth cookie on mount/page visibility/pageshow.
- Redirects to `/auth` if cookie missing.

Role-based guard:
- Not present for GrubPacs routes in middleware/layout.

---

## 3. API Flow and Integration

All core GrubPacs list/search/mutation flows are API-driven through:
- Service: `src/services/grubpacs.ts`
- URLs: `src/services/urls/grubpacs.ts`
- HTTP wrapper: `src/services/httpClient.ts`
- Request execution/interceptors: `src/services/request.ts`

## 3.1 Endpoints and Request Shapes

### List boxes
- API: `GET /food/grubpac`
- Service: `grubpacService.getList(params)`
- Query params (examples):
  - `status=active|suspended|deleted`
  - `group_by=power_status|restaurants`
  - `power_status`, `connection_status`, `health_status`, `grublock_status`
  - `restaurant_assigned`, `vehicle_assigned`, `ioniser_status`, `dual_zone_status`
  - `zone1_min/max`, `zone2_min/max`, `limit`, `page`, `restaurant_id`, `employee_id`
- Response handling:
  - Accepts flat (`boxes`) or grouped (`groups`) response shape.
  - Maps API objects to UI domain models using `apiGrubPacToItem` and `apiGrubPacToSuspendedItem`.
- Error handling:
  - Returns normalized `{ success: false, error }` from request wrapper.
  - UI shows toast error and fallback state.

### Search boxes
- API: `GET /food/grubpac/search`
- Service: `grubpacService.search({ query, limit, status })`
- Response handling:
  - Debounced client search (`300ms`) merges search ids with table data.
- Error handling:
  - Stores search error in hook state; falls back to empty result.

### Update box details
- API: `PUT /food/grubpac`
- Service: `grubpacService.update(payload)`
- Body (sanitized):
  - `id`, `name`, optional `box_id`, `vehicle_number`, `restaurant_ids`, `blocked_employee_ids`, `access_mode`
- Response handling:
  - On success: success toast + optional `onUpdatedAction` refetch.
  - On failure: error toast.

### Suspend boxes
- API: `PATCH /food/grubpac/suspend`
- Service: `grubpacService.suspend(ids)`
- Body: `{ ids: string[] }`
- Response handling:
  - Clears selected ids from UI.
  - Closes modal.
  - Shows success toast.
  - Refetches list if callback provided.
- Error handling:
  - Toast error from API message or fallback.

### Reactivate boxes
- API: `PATCH /food/grubpac/reactivate`
- Service: `grubpacService.reactivate(ids)`
- Body: `{ ids: string[] }`
- Response handling:
  - Suspended list/details remove or navigate back after reactivation.
  - Shows success toast.
- Error handling:
  - Toast error.

### Delete boxes
- API: `DELETE /food/grubpac`
- Service: `grubpacService.delete(ids)`
- Body: `{ ids: string[] }`
- Response handling:
  - Removes rows from local list or redirects after delete.
  - Success toast.
- Error handling:
  - Toast error.

### Apply box actions/settings
- API: `PATCH /food/grubpac/action`
- Service: `grubpacService.action(payload)`
- Body includes `ids` and action fields, for example:
  - `power_status`, `ioniser_status`
  - `dual_zone_status`, `zone1_temp`, `zone2_temp`
  - `assign_restaurant_id`, `vehicle_number`
  - sensor/device toggles (`camera_status`, `advert_screen_status`, etc.)
- Response handling:
  - List action bar and details settings editor both call this endpoint.
- Error handling:
  - Error toast or inline alert banner depending on screen.

### Remove employees from boxes
- API: `PATCH /food/grubpac/remove/employee`
- Service: `grubpacService.removeEmployeeFromBoxes(payload)`
- Body: `{ box_ids: string[], employee_ids: string[] }`

## 3.2 Request and Response Infrastructure

- Axios instance adds `Authorization: Bearer <token>` when token exists.
- `401` responses (except login) clear auth cookies and redirect to `/auth`.
- All service calls receive normalized `ApiResponse<T>` envelope with `success`, `status`, optional `data`, and `error`.
- Query string builder removes empty/null values and serializes arrays with repeated keys.

## 3.3 No-Dummy-Data Rule (Current Reality)

Core runtime flows are API-based for list/search/mutations.

Current exceptions in UI data sources that still use mock files:
- Edit Details modal option lists (`mockEditDetailsData.ts`) for restaurant and excluded employee selections.
- Reassign Group modal list (`mockReassignRestaurantsData.ts`).

Production recommendation:
- Replace these mock-backed option sources with API-backed dropdown/list endpoints.

---

## 4. List Page Flow (Active + Suspended)

## 4.1 Active List (`/grubpacs/list`)

Main orchestrator: `useGrubPacsListState` + `useGrubPacsListHandlers`

Flow:
1. Build API params from UI filters (`useGrubPacsFilters` + grouped/offline states).
2. Fetch list via `useGrubPacsData(apiParams)` with enforced `status=active`.
3. If response grouped, map groups; else map flat boxes.
4. If search term exists, run debounced search hook and intersect/fallback merge results.
5. Render either:
   - grouped collapses by restaurant/unassigned, or
   - ungrouped sections: Powered on / Powered off.
6. Table rows are mapped via `mapGrubPacItemsToDataRows`.
7. Row interactions:
   - click row -> details route
   - checkbox -> select for bulk action
   - action menu -> edit/suspend/remove pathways
8. Action bar uses selected ids to open apply/suspend/reassign/delete modals and triggers APIs.

### Filtering / Search / Grouping
- Search: `useGrubPacSearch` with `300ms` debounce, status `active`.
- Grouping toggle:
  - grouped: uses `group_by=restaurants`
  - ungrouped: uses `group_by=power_status`
- Filter params map into API query where possible.
- Some filters also run client-side checks on mapped rows.

### Pagination
- Active list currently does not expose a dedicated pagination control in this screen.
- API supports `limit/page` in service layer.

### Loading / Empty / Error States
- Loading: skeleton-like pulse rows during data fetch/switch.
- Empty: informational empty state texts/components.
- Error: toast via `showError`.

### Table Structure and Interactions
- Columns: Name, status icon/tooltip, power, battery, settings, handler, actions.
- Hover/tooltips:
  - lock status tooltip
  - global/power/handler status tooltips
- Selection:
  - header select-all + row-level checkboxes
- Row click is ignored when click originates from interactive controls (checkbox/button/menu).

## 4.2 Suspended List (`/grubpacs/suspended`)

Flow:
1. Fetch suspended data with `status=suspended`.
2. Map to suspended table rows.
3. Optional grouping by restaurant (client-side group map).
4. Search uses `useGrubPacSearch` with `status=suspended`.
5. Includes pagination UI (client-side page slicing, page size 50).
6. Actions:
   - Activate all
   - Activate selected/row
   - Delete selected/row

Loading/error:
- `isLoading` spinner-state rendering for table area.
- API failures -> toast error.

---

## 5. Details Page Flow

## 5.1 Active Details (`/grubpacs/details?id=<id>`)

Component: `BoxSettingsPage`

Flow:
1. Read `id` from route `searchParams`.
2. Fetch active list (`useGrubPacsData`) and resolve selected box by matching id; fallback to first box.
3. Render left sidebar (box list) and right panel (tabs + content).
4. Tab options: `settings`, `logs`, `track`.
5. If selected box appears offline, show OfflineView instead of OnlineSettingsView.
6. Sidebar click updates route id and shows switch skeleton until data settles.
7. Title row exposes actions: edit details, suspend, delete, permissions, settings edit/apply.

State handling:
- Local state for active tab, fullscreen toggles, modals, status alerts.
- Settings draft snapshot + change detection to avoid unnecessary action API call.

Actions available:
- Edit details modal -> update API path.
- Suspend modal -> suspend API path.
- Delete modal -> delete API path.
- Permission modal (UI workflow).
- Apply settings confirm modal -> action API path.
- GrubLock actions (lock/unlock/emergency unlock) are handled via GrubLock service flow.

## 5.2 Suspended Details (`/grubpacs/suspended/details?id=<id>`)

Component: `SuspendedBoxDetailsPage`

Flow:
1. Load suspended list (`status=suspended`).
2. Select by route id or fallback first item.
3. Render tabs: `logs`, `track` only.
4. Actions:
   - Activate (`PATCH /reactivate`)
   - Delete (`DELETE /food/grubpac`)
5. Sidebar lets user switch between suspended boxes via query id.

---

## 6. Edit Flow

Primary edit entry points:
- From active list row action -> opens `EditDetailsModal`.
- From active details title row -> opens same modal.

## 6.1 Form Structure

Current form fields:
- Name
- Box id
- Vehicle number
- Restaurant multi-select
- Permission mode options
- Excluded employee list (secondary view)

Validation and payload shaping:
- Requires valid `grubpacId`.
- Basic required checks for name/box id at UI level.
- Restaurant/blocked employee ids are ULID-validated before payload inclusion.
- Payload omits empty optional fields.

## 6.2 API Integration for Update

Sequence:
1. User submits form.
2. Modal builds `update` payload.
3. Calls `grubpacService.update(payload)` -> `PUT /food/grubpac`.
4. On success:
   - optional parent refetch callback
   - success toast
   - modal closes
5. On error:
   - error toast from response/fallback message

## 6.3 Current Gaps

- Restaurant and excluded employee option datasets are currently mock-backed in modal.
- Reassign modal also uses mock-backed restaurant list.

Production improvement:
- Replace these option sources with API calls (searchable endpoints + pagination).

---

## 7. Component and Folder Structure

High-level module organization under `src/components/features/grubpacs`:
- `GrubPacsListScreen.tsx`, `SuspendedGrubPacsList.tsx`, `SuspendedGrubPacsScreen.tsx`
- `details/` active/suspended details page implementations and tab views
- `hooks/` state/data/search/action hooks
- `modals/` confirmation/action/edit modals
- `table/` active and suspended tables
- `components/` reusable feature-specific UI blocks (TopNavBar, ActionBar, EmptyState, etc.)
- `utils/` mappers and display helpers
- `data/` mock and sample data files (should be minimized for production runtime)

Cross-module structure:
- Routes: `src/app/(dashboard)/grubpacs/*`, `src/app/(fullscreen)/grubpacs/*`
- Services: `src/services/grubpacs.ts`, URL constants, generic request/http clients
- Domain types/mappers: `src/types/domain/grubpacs.ts`
- Shared UI primitives: `src/components/ui/*`

Reusability patterns:
- Hooks encapsulate fetch + transform + UI state orchestration.
- Service layer encapsulates endpoint and payload sanitization.
- Modals are composable and controlled from screen state.
- Mapper converts API DTOs into table/detail-friendly shape.

---

## 8. State Management

Current strategy (module-local, no global store for GrubPacs):
- React local state (`useState`) for UI flags, selected rows, modal visibility, tab/fullscreen state.
- Custom hooks for feature state composition (`useGrubPacsListState`, `useGrubPacsListHandlers`).
- Derived/computed state via `useMemo`.
- Side effects/fetching in `useEffect` + service calls.

Data flow pattern:
1. Screen builds filter/search params.
2. Hook fetches API data via service.
3. Domain mapper converts response DTO to UI model.
4. Table/details components receive mapped props.
5. Action handlers call mutation APIs and then refetch or locally prune/update selection.

Not used in GrubPacs runtime:
- Dedicated global store (e.g., Zustand/Redux).
- Query cache library in this specific feature path.

---

## 9. Error Handling and UX Improvements

## 9.1 Current Error Handling

- Global request normalization catches malformed envelopes and Axios/network errors.
- `401` handling auto-clears auth and redirects to `/auth`.
- Feature-level failures commonly surfaced using toasts (`showError`, `showSuccess`).
- Some detail pages use inline alert banners for settings apply status.

## 9.2 Current Loading UX

- Active list: pulse placeholders while fetching/switching.
- Active details: full page and right-panel skeletons.
- Suspended details: skeleton layout while loading.

## 9.3 Production Improvements (Recommended)

1. Add standardized inline error placeholders for list/details panes in addition to toast.
2. Add retry CTA for failed list loads and failed details load.
3. Use consistent skeleton components in all list surfaces.
4. For mutations, disable duplicate submit buttons and show per-button loading indicators consistently.
5. Add post-mutation revalidation consistency (query invalidation or unified refetch policy).
6. Replace remaining mock option data with API-backed fetches and loading/empty/error states.
7. Improve empty states with contextual actions (clear filters, refresh, navigate).

---

## 10. Best Practices and Improvements

### 10.1 UI/UX
- Standardize copy and status labels (ONLINE/OFFLINE vs ON/OFF across screens).
- Add visible breadcrumb/context in fullscreen details for easier orientation.
- Add explicit form field validation hints (not only toast on save).

### 10.2 Performance
- Avoid fetching full active list again in details when only one id is needed; add dedicated `getById` endpoint integration when available.
- Introduce cache-aware data fetching (shared cache between list and details) to reduce duplicate network calls.
- Add virtualization for very large grouped tables if expected data size grows.

### 10.3 Code Structure
- Consolidate repeated suspend/reactivate/delete success/error handling into shared action helper.
- Isolate filter-to-query mapping rules into testable utility.
- Introduce typed modal state discriminated unions for safer transitions.

### 10.4 API Handling
- Enforce stricter payload typing for all action fields and document backend enum contracts.
- Add explicit pagination contract handling in active list UI.
- Add optimistic updates where safe (then rollback on failure).

### 10.5 Scalability
- Move feature fetch/mutation to a query library pattern for cache, retries, invalidation, and stale-while-revalidate behavior.
- Add telemetry hooks around critical actions (suspend, activate, apply settings, delete).
- Expand permissions model on frontend once role matrix is finalized.

---

## 11. Sequence / Flow Explanations (Step-by-Step)

## 11.1 View Details (Active List -> Details)

1. User clicks a row in active list table.
2. `router.push('/grubpacs/details?id=<rowId>')` executes.
3. Details route resolves query `id`.
4. `BoxSettingsPage` loads list data via `useGrubPacsData`.
5. Selected box is resolved by id; skeleton is shown while loading.
6. UI renders settings/logs/track with selected box context.

Failure path:
- If load fails: toast error shown.
- If id not found: fallback "No GrubPac found" view shown.

## 11.2 Apply Settings (Active List Bulk Action)

1. User selects one or more rows.
2. User chooses action (power/ioniser/temperature) from action bar.
3. Apply Settings modal opens with selected count + action descriptor.
4. On confirm, handler builds `ActionGrubPacBody` payload.
5. Calls `PATCH /food/grubpac/action`.
6. On success:
   - selection cleared
   - modal closed
   - success toast
   - optional refetch
7. On error: error toast and selection remains.

## 11.3 Apply Settings (Active Details)

1. User enters settings edit mode from title row.
2. Draft changes tracked against snapshot.
3. User clicks apply, confirmation modal opens.
4. Changed fields only are packed into action payload with `ids=[boxId]`.
5. Calls `PATCH /food/grubpac/action`.
6. On success: snapshot updated, edit mode exits, success alert shown.
7. On failure: error alert shown, draft remains for correction/retry.

## 11.4 Suspend Boxes

1. User opens suspend modal from row action, selection action bar, or details.
2. Confirm suspend.
3. Handler composes ids and calls `PATCH /food/grubpac/suspend` with `{ ids }`.
4. On success:
   - selected ids removed from selection state
   - modal closes
   - success toast
   - list refetch
5. On error: error toast, modal stays actionable.

## 11.5 Reactivate Suspended Boxes

1. User clicks ACTIVATE (row/selected/all/details).
2. Confirm activation modal path (where applicable).
3. Calls `PATCH /food/grubpac/reactivate` with `{ ids }`.
4. On success:
   - rows removed from suspended list or navigate back
   - success toast
5. On error: error toast.

## 11.6 Edit GrubPac Details

1. User opens Edit Details modal.
2. User updates fields and submits.
3. Modal validates required basics and sanitizes ids.
4. Calls `PUT /food/grubpac`.
5. On success:
   - optional refetch callback runs
   - success toast shown
   - modal closes
6. On failure: error toast, modal remains open.

## 11.7 Delete GrubPac

1. User triggers delete from suspended row/details (or other modal pathways).
2. Confirm delete modal.
3. Calls `DELETE /food/grubpac` with `{ ids }`.
4. On success:
   - row removed or navigation to list
   - success toast
5. On failure:
   - error toast
   - no destructive local update

---

## 12. Production Readiness Checklist for This Module

1. Keep list/details/actions fully API-driven (already true for core runtime).
2. Remove/replace remaining mock-backed option datasets in edit/reassign flows.
3. Implement role-aware frontend capability flags where required by product policy.
4. Add consistent inline retries and failure placeholders.
5. Add robust pagination UX for active list when backend page volume grows.
6. Add tests for filter-to-query mapping and action payload builders.
7. Track key action telemetry and error rates for operations.

---

## 13. Key Files Reference

Routing and guards:
- `src/middleware.ts`
- `src/app/(dashboard)/grubpacs/page.tsx`
- `src/app/(dashboard)/grubpacs/list/page.tsx`
- `src/app/(dashboard)/grubpacs/suspended/page.tsx`
- `src/app/(fullscreen)/grubpacs/details/page.tsx`
- `src/app/(fullscreen)/grubpacs/suspended/details/page.tsx`

Core screens:
- `src/components/features/grubpacs/GrubPacsListScreen.tsx`
- `src/components/features/grubpacs/SuspendedGrubPacsList.tsx`
- `src/components/features/grubpacs/details/BoxSettingsPage.tsx`
- `src/components/features/grubpacs/details/SuspendedBoxDetailsPage.tsx`

Hooks and mappings:
- `src/components/features/grubpacs/hooks/useGrubPacsListState.ts`
- `src/components/features/grubpacs/hooks/useGrubPacsListHandlers.ts`
- `src/components/features/grubpacs/hooks/useGrubPacsData.ts`
- `src/components/features/grubpacs/hooks/useGrubPacSearch.ts`
- `src/components/features/grubpacs/hooks/useSuspendedGrubPacs.ts`
- `src/components/features/grubpacs/utils/grubpac-mapper.ts`
- `src/types/domain/grubpacs.ts`

Services and infra:
- `src/services/grubpacs.ts`
- `src/services/urls/grubpacs.ts`
- `src/services/httpClient.ts`
- `src/services/request.ts`
- `src/lib/errors.ts`

UI and feedback:
- `src/components/ui/toast.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/features/grubpacs/table/grubpac-data-table.tsx`
- `src/components/features/grubpacs/table/grubpac-suspended-box-table.tsx`

---

This document should be updated whenever:
- endpoint contracts change,
- role/permission policies are introduced on frontend,
- list/details fetch strategies are optimized,
- or mock-backed option sources are replaced with production APIs.
