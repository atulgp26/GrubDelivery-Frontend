# Error Messaging QA Matrix

This matrix validates contextual error handling rollout for OTP, assignment, employee lifecycle, box lock/unlock, and load/fetch flows.

## Prerequisites
- Backend/stub can return controlled status, code, and message fields.
- Verify in toast/alert surfaces where each flow renders errors.

## OTP Verification Scenarios

| Flow | Simulated backend response | Expected user message |
|---|---|---|
| Login OTP verify | status=410, message contains "expired" | OTP expired. Please request a new OTP and try again. |
| Login OTP verify | status=422, message contains "invalid" | OTP does not match. Please re-check the code and try again. |
| Login OTP verify | status=429, message contains "too many attempts" | Too many OTP attempts. Please wait and request a new OTP. |
| Profile OTP verify | status=422, message contains "format" | OTP format is invalid. Please enter a valid 4-digit OTP. |
| Transfer OTP verify | status=400, backend returns specific non-generic text | Backend text is shown directly (not replaced by fallback). |
| Any OTP verify | generic backend "Invalid OTP" with no details | We could not verify the OTP. Please try again or request a new OTP. |
| OTP resend | status=429 | OTP resend limit reached. Please wait before requesting a new OTP. |
| OTP resend | generic failure | Unable to resend OTP right now. Please try again. |

## Assignment / Reassignment Scenarios

| Flow | Simulated backend response | Expected user message |
|---|---|---|
| Manager assignment | status=409, message contains "already assigned" | Could not assign manager due to a conflict. The manager may already be assigned. |
| Employee reassignment | status=422, message contains "validation" | Could not assign employee. Please review the selection and try again. |
| Box reassignment | status=409, message contains "conflict" | Could not assign box due to a conflict. The box may already be assigned. |
| Resource reassignment | status=403, message contains "permission" | Could not assign resource due to role or permission restrictions. |
| Driver assignment (if role delivery) | status indicates inactive/suspended | Could not assign driver because the selected driver is inactive. |
| Any assignment | backend returns detailed non-generic reason | Backend text is shown directly (not replaced by fallback). |

## Employee Lifecycle Scenarios

| Flow | Simulated backend response | Expected user message |
|---|---|---|
| Create employee | status=409, message contains "already exists" | Could not create employee due to a conflict. Please verify employee details and try again. |
| Update employee | status=422, message contains "validation" | Could not update employee. Please review the entered details and try again. |
| Activate employee | generic failure | Could not activate employee. Please try again. |
| Suspend employee | generic failure | Could not suspend employee. Please try again. |
| Delete employee | generic failure | Could not delete employee. Please try again. |
| Reactivate employee | generic failure | Could not reactivate employee. Please try again. |

## Box Lock / Unlock Scenarios

| Flow | Simulated backend response | Expected user message |
|---|---|---|
| Lock box | status=409, message contains "already locked" | Could not lock box because it is already locked or in a conflicting state. |
| Unlock box | status=409, message contains "already unlocked" | Could not unlock box because it is already unlocked or in a conflicting state. |
| Update recipient details | status=422, validation failure | Could not update recipient details. Please verify the entered information and try again. |
| Any box action | backend returns detailed non-generic reason | Backend text is shown directly (not replaced by fallback). |

## Load / Fetch Scenarios

| Flow | Simulated backend response | Expected user message |
|---|---|---|
| Logs load | generic load failure | Unable to load logs right now. Please refresh and try again. |
| GrubLock list load | generic load failure | Unable to load GrubLock boxes right now. Please refresh and try again. |
| Boxes load | generic load failure | Unable to load boxes right now. Please refresh and try again. |
| Any load/fetch | status=429 | Too many requests. Please wait and try again. |

## Regression Checks
- Success toasts remain unchanged for successful assignment and OTP verification.
- Modals still close/open correctly after success/failure.
- Loading and disabled states are unaffected during request lifecycle.
- No duplicate message prefixes appear (for example: "Failed to assign manager: Failed to assign manager").

## Current coverage
The contextual resolver is wired in:
- src/lib/errors.ts
- src/components/features/auth/hooks/useAuthActions.ts
- src/components/features/account/hooks/useAccount.ts
- src/components/features/account/hooks/useEditProfile.ts
- src/components/features/transfer-ownership/TransferOwnershipPage.tsx
- src/components/features/transfer-ownership/hooks/useTransferBoxes.ts
- src/components/features/employees/hooks/useEmployeeData.ts
- src/components/features/employees/hooks/useEmployeeBoxes.ts
- src/components/features/employees/EmployeeListScreen.tsx
- src/components/features/employees/EmployeeLogsScreen.tsx
- src/components/features/employees/SuspendedEmployeesScreen.tsx
- src/components/features/employees/components/EmployeeListContent.tsx
- src/components/features/restaurants/components/RestaurantGroupTable.tsx
- src/components/features/restaurants/RestaurantListContent.tsx
- src/components/features/system-logs/SystemLogsScreen.tsx
- src/components/features/grublock/hooks/useGrubLockQuery.ts
- src/components/features/grublock/GrubLockListContent.tsx
- src/components/features/grublock/BoxDetails.tsx
- src/components/features/grublock/components/GrubLockModals.tsx
- src/components/features/grublock/modals/LockBoxModal.tsx
- src/components/features/grubpacs/GrubPacsListScreen.tsx
- src/components/features/grubpacs/details/BoxSettingsPage.tsx
