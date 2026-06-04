# 🍔 GrubPac Frontend

Welcome to the next-generation management interface for the GrubPac ecosystem. This frontend is built with performance, scalability, and user experience at its core.

---

## ⚠️ Compatibility Warning

> [!IMPORTANT]
> **Branch Compatibility**: The current branch `staged/0.0.6` is strictly designed to work with the **backend branch `stage/0.0.6`**. Mismatched versions may lead to API inconsistencies or unexpected behavior.

---

## 🚀 Getting Started

To get the project up and running locally, follow these steps:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Launch Development Server**:
   ```bash
   npm run dev
   ```

3. **Access the App**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Changelog

### Version `0.0.6` (compared to `staged/0.0.5`)

This release achieves a major milestone in platform performance, moving from an API-heavy polling model to a lean, property-driven architecture:

- **High-Performance API Integration**:
  - **Payload Stripping**: Fully integrated with the backend 0.0.6 response pruning. Deprecated and removed references to `employees[]`, `permissions[]`, and `config` keys from the main box data model, reducing JSON parsing overhead.
  - **Lazy Employee Loading**: Re-engineered the `EditDetailsModal` and `PermissionModal` to fetch excluded/shared employee lists lazily only when requested. This eliminates redundant API calls on component mount.
- **Improved Type Safety**:
  - **Domain Model Cleanup**: Updated `ApiGrubPac` and `GrubPacItem` types to reflect the optimized backend response, removing dead properties and enforcing strict count-based metrics for blocked permissions.
- **UI Performance**:
  - **Modal Optimization**: Eliminated expensive re-fetches when toggling permissions by passing `permissions_blocked_count` as a direct prop from the parent list view.

### Version `0.0.5` (compared to `staged/0.0.4`)

This update focuses on bulk recovery operations and standardized management of suspended assets:

- **Enhanced Suspended Management**:
  - **"Activate All" Logic**: Implemented the bulk reactivation workflow for suspended boxes, matching the patterns used in Employee and Restaurant modules.
  - **Intelligent Recovery Modal**: Introduced a dynamic activation modal that identifies previously assigned locations and offers reassignment options during the reactivation process.
- **Standardized Bulk Actions**:
  - Unified the reactivation API consumption to use the new `/delivery/grubpac/suspended/summary` endpoint for precise item counting and relationship verification.
- **Refined Permissions Component**:
  - Updated the "Permissions" column in the main list to display precise `<count> EXCLUDED` counts directly from the optimized API response.

### Version `0.0.4` (compared to `staged/0.0.2`)

This update introduces significant performance optimizations, advanced data grouping, and new observability features:

- **Performance & Payload Optimization**:
  - **Lazy-Loaded Grouping**: Refactored `GrubLock` and `GrubPacs` lists to use a "fetch-what-you-need" pattern. The initial page load now performs a single unified fetch, while detailed group data is paginated on-demand, drastically reducing initial payload sizes.
  - **Pagination Robustness**: Integrated `isPageLoading` states across all grouped modules to provide seamless skeleton loader feedback during data transitions.
- **GrubLock & GrubPacs Management**:
  - **Standardized Grouping**: Migrated all grouped views to use the `box` table's restaurant ID as the primary key, ensuring consistent data mapping between the frontend and backend.
  - **Intelligent UI**: Accordion headers now display the group's name dynamically and hide pagination controls (Previous/Next) when a group contains no items, preventing invalid navigation states.
- **New Features & Observability**:
  - **Employee Logs**: Launched the new Employee Logs module with dedicated UI services and search capabilities.
  - **Account Clarity**: Added `employee_display_id` to the personal account section and updated the client ID format to use the `#<value>` convention.
- **Bug Fixes**:
  - **Filter Consistency**: Fixed a critical issue where the employee list failed to pass `restaurant_id`, ensuring accurate filtering for restaurant-specific staff.
  - **State Synchronization**: Resolved race conditions in `useGrubLockQuery` and `useGrubPacsData` hooks that caused UI inconsistencies when rapidly switching between grouped and flat views.

### Version `0.0.2` (compared to `stage` branch)

---

## 🛠️ Technical Specifications

- **Framework**: [Next.js](https://nextjs.org)
- **Typography**: [Geist Family](https://vercel.com/font)
- **Deployment**: Optimized for Vercel

---

© 2024 GrubPac. All rights reserved.
