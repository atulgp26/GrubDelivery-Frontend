# GrubPacs List Table Working Spec (`/grubpacs/list`)

This document is the implementation spec for how the list table behaves on `/grubpacs/list`.
It focuses on the table columns rendered by `GrubPacDataTable`:
- Name
- Status
- Power
- Battery
- Settings
- Handler

It documents current behavior as implemented in code (including fallbacks and gaps), not intended future behavior.

---

## 1. Data Pipeline (API -> UI Table)

## 1.1 Endpoint and Fetch
- Endpoint used by list screen: `GET /food/grubpac`
- Service call: `grubpacService.getList({ status: "active", ...apiParams })`
- Route: `/grubpacs/list` renders `GrubPacsListScreen`, which renders `GrubPacDataTable`

## 1.2 Response Shapes Accepted
- Flat shape: `{ boxes: ApiGrubPac[], count }`
- Grouped shape: `{ groups: Record<string, ApiGrubPac[] | metadata>, count? }`

## 1.3 Mapping Stages
1. API model (`ApiGrubPac`) -> domain item (`GrubPacItem`) via `apiGrubPacToItem()`
2. Domain item (`GrubPacItem`) -> table row (`GrubPacDataRow`) via `mapGrubPacItemToDataRow()`
3. `GrubPacDataRow` -> UI cell render via `renderCell(columnId, row, callbacks)`

---

## 2. Shared Rules Across Columns

## 2.1 Row Click Behavior
- Clicking a row navigates to `/grubpacs/details?id=<row.id>`.
- Row click is ignored if click started on:
  - a checkbox input
  - a button
  - an element with `role="button"`
- This ensures lock icon click, checkbox click, and actions menu click do not trigger row navigation.

## 2.2 Tooltip Sources
- Status tooltip: `getGlobalStatusTooltip(globalStatusValue)`
- Power tooltip: `getPowerStatusTooltip(powerStatusValue)`
- Handler tooltip: `getHandlerTooltip(handlerStatusValue, handlerDetails)`
- Lock icon tooltip: local `lockTooltipByState`

---

## 3. Name Column

## 3.1 UI Composition
Rendered blocks (left to right):
1. Optional checkbox (if table is selectable and name column is present)
2. Lock icon button with tooltip
3. Main text stack:
   - primary line: box name
   - secondary line: identifier (if available)

## 3.2 API/Data Fields Used
- `ApiGrubPac.name` -> `item.name` -> `row.name`
- `ApiGrubPac.box_display_id` (fallback `box_id`) -> `item.code` -> part of `row.identifier`
- `ApiGrubPac.vehicle_number` + first restaurant name -> `item.location` -> part of `row.identifier`
- `ApiGrubPac.lock.lock_status` -> `item.locked` -> `row.isLocked`
- `ApiGrubPac.lock` presence -> `item.hasLock` -> `row.hasLock`
- `ApiGrubPac.grublock_status` -> `item.grublockStatus` -> `row.grublockStatus`
- `ApiGrubPac.power_status` -> `row.powerStatus` (used in lock fallback)

## 3.3 Identifier Format
- Built as: `#<code> | <location>`
- `code`: `box_display_id` fallback `box_id`
- `location`: joined from `vehicle_number` and restaurant name
- If both absent, identifier is hidden.

## 3.4 Lock Icon + State Mapping

| Computed Lock State | Icon Path | Tooltip Title | Tooltip Subtitle |
|---|---|---|---|
| `locked` | `/sidebar/Grublock.svg` | `Box is locked.` | `Visit GrubLock for details >>` |
| `unlocked` | `/GrubPac/Table/Row/Cell/Grublock-1.svg` | `Box is unlocked.` | `Visit GrubLock for details >>` |
| `not_available` | `/GrubPac/Table/Row/Cell/Grublock-1 2.svg` | `Feature not available` | none |
| `offline` | `/GrubPac/Box-settings/grublock-open.svg` | `Switch on the box to access` | none |

## 3.5 Lock State Priority Logic
```text
lockState = row.grublockStatus ?? fallbackLockState

fallbackLockState:
  if row.powerStatus == "off": "offline"
  else if row.hasLock == false: "not_available"
  else if row.isLocked == false: "unlocked"
  else: "locked"
```

## 3.6 Name Fallbacks and Edge Cases
- If `name` is missing, mapper uses `Box <id>`.
- If lock info is missing:
  - lock present + `isLocked` undefined resolves to `locked` fallback
  - no lock hardware resolves to `not_available`
- Lock icon click stops propagation and calls `onLockIconClick(row)`.

---

## 4. Status Column

Important: This column is global device status (`global_status`), not lifecycle status (`active/suspended/deleted`) and not lock status.

## 4.1 API/Data Fields Used
- `ApiGrubPac.global_status` -> `item.globalStatus` -> `row.globalStatus`

## 4.2 Allowed Status Values
- `power_off`
- `ready`
- `critical`
- `attention`
- any other value -> `unknown`

## 4.3 Status -> UI Mapping

| Status | Icon | Hover Badge BG | Hover Badge Border | Tooltip |
|---|---|---|---|---|
| `power_off` | `/minus-circle.svg` | `#EFF1F0` | `#506157` | `Switch on the box for status` |
| `ready` | `/check-circle.svg` | `#EDF5E9` | `#3B7D24` | `Box is ready to go :)` |
| `critical` | `/exclamation-triangle.svg` | `#FFECE5` | `#AD260B` | `Check the box!` |
| `attention` | `/Employee/exclamation-triangle.svg` | `#FFF6EB` | `#BB812C` | `Check the box!` |
| `unknown` | `/minus-circle.svg` | `#EFF1F0` | `#506157` | `Status unavailable` |

## 4.4 Priority Logic
```text
globalStatusValue =
  if row.globalStatus in [power_off, ready, critical, attention]
    row.globalStatus
  else
    unknown
```

## 4.5 Animations/Indicators
- No blinking/ring animation is implemented.
- Only hover style transition is present.

---

## 5. Power Column

## 5.1 API/Data Fields Used
- `ApiGrubPac.power_status` -> `item.powerStatus` -> normalized to `row.powerStatus`

## 5.2 Normalization
```text
powerStatusValue =
  if lower(power_status) == "on"  -> "on"
  if lower(power_status) == "off" -> "off"
  else                              -> "unknown"
```

## 5.3 Power -> UI Mapping

| Power State | Label | BG | Border | Text | Tooltip |
|---|---|---|---|---|---|
| `on` | `ON` | `#DCECD4` | `#5CA940` | `#479F29` | `Box turned ON` |
| `off` | `OFF` | `#FFE3D9` | `#FE5720` | `#FE480B` | `Bux turned OFF` |
| `unknown` | `??` | `#EFF1F0` | `#C1C7C4` | `#69726D` | `Unable to reach the box` + `Check your connection` |

## 5.4 Icons and Indicators
- No power icon is rendered in this column.
- State is represented by text badge only.

## 5.5 Edge Cases
- Null/empty/unsupported API values display as `??`.
- No staleness timeout logic is implemented (no last-seen freshness check in this table).

---

## 6. Battery Column

## 6.1 API/Data Fields Used
- `ApiGrubPac.battery_percentage` -> `item.battery` -> `row.batteryPercent`
- Derived in mapper from battery percentage -> `row.batteryStatus`
- `row.powerStatus` is used to override display when powered off

## 6.2 Battery Status Derivation (Mapper)
```text
if battery is null/undefined:
  batteryStatus = unknown
else if battery > 50:
  batteryStatus = good
else if battery > 20:
  batteryStatus = warning
else:
  batteryStatus = critical
```

## 6.3 Render Logic
```text
if powerStatus == "off":
  show label "??" in grey badge
else:
  percentValue = parse batteryPercent or numeric value (default 0)
  isAbove50 = percentValue > 50

  if isAbove50:
    use green style
  else:
    style from batteryStatus (good/warning/critical, fallback warning)

  label = batteryPercent ? "<batteryPercent>%" : "??"
```

## 6.4 Battery -> UI Mapping

| Condition | Label | BG | Border | Text |
|---|---|---|---|---|
| `powerStatus == off` | `??` | `#EFF1F0` | `#C1C7C4` | `#69726D` |
| `battery > 50` | `<n>%` | `#DCECD4` | `#5CA940` | `#479F29` |
| `batteryStatus == warning` | `<n>%` | `#FFECD7` | `#F4AD49` | `#F0A433` |
| `batteryStatus == critical` | `<n>%` | `#FFE3D9` | `#FE5720` | `#FE480B` |
| unknown/no value (power on) | `??` | `#FFECD7` | `#F4AD49` | `#F0A433` |

## 6.5 Charging State
- No charging flag or charging icon exists in current API mapping or cell renderer.
- Charging state handling is not implemented.

## 6.6 Edge Cases
- `0` battery is treated as falsy for label and currently displays `??` (not `0%`).
- If API sends non-numeric battery string, parse may produce fallback style behavior.

---

## 7. Settings Column

Important: This section describes the actual `settings` table column (`ioniser` + `zone temp` telemetry rows), not the kebab menu actions column.

## 7.1 API/Data Fields Used
- `ApiGrubPac.ioniser_status` -> `item.ioniser` -> `row.ioniserStatus`
- `ApiGrubPac.zone1_temp`, `ApiGrubPac.zone2_temp` -> `item.zone1Temp/zone2Temp` -> `row.zoneTemp`
- `row.powerStatus` controls whether settings values are populated by mapper

## 7.2 Mapper Rules
```text
if powerStatus == "on":
  ioniserStatus = formatted ioniser text or undefined
  zoneTemp = formatted zone string if zone1 or zone2 exists
else:
  ioniserStatus = undefined
  zoneTemp = undefined
```

- Ioniser formatting examples from mapper:
  - `ioniser_status=on` -> `Ioniser turned ON`
  - `ioniser_status=off` -> `Ioniser turned OFF`

- Zone formatting example:
  - `Zone 1 : <zone1> | Zone 2 : <zone2>`

## 7.3 Settings Cell UI Mapping

| Data Availability | Render |
|---|---|
| both empty and `showEmptySettings=false` | simple `-` |
| `ioniserStatus` present | virus icon + ioniser text |
| `zoneTemp` present | thermometer icon + zone text |
| `showEmptySettings=true` and value missing | render icon row with `-` placeholder |

Icons used:
- `/GrubPac/Table/Row/Cell/virus-covid-19.svg`
- `/GrubPac/Table/Row/Cell/thermometer.svg`

## 7.4 Role Rules for Settings Column
- No role-based visibility logic exists in this column renderer.
- No role-based disabled state or tooltip is implemented.

## 7.5 Related Settings Actions (Actions Menu)
Available row menu items include:
- Edit box details
- Check permissions
- View settings
- Suspend box
- Remove box

Current implementation notes:
- Menu item visibility is not role-gated in frontend.
- `View settings` item has no action callback wired yet.
- No disabled/action-tooltip behavior per role is implemented.

---

## 8. Handler Column

## 8.1 API/Data Fields Used
- `ApiGrubPac.handler_status` -> `item.handlerStatus` -> `row.handlerStatus`
- `ApiGrubPac.handler_details.name` -> `row.handlerName`
- `ApiGrubPac.handler_details.phone` -> `row.handlerPhone`
- `row.powerStatus` and `row.hasHandler` influence final UI state

## 8.2 Handler Status Resolution
```text
if row.powerStatus == "off":
  handlerStatusValue = "offline"
else if row.handlerStatus in [connected, disconnected, not_shared, offline]:
  handlerStatusValue = row.handlerStatus
else if row.hasHandler:
  handlerStatusValue = "connected"
else:
  handlerStatusValue = "disconnected"
```

## 8.3 Handler UI Mapping

| Condition | Icon | Border | Tooltip |
|---|---|---|---|
| powered off OR no handler | `/GrubPac/Table/Row/Cell/users-grey.svg` | `#C1C7C4` | `Switch on the box to connect` (offline) or `Ask handler to connect` |
| handler present and powered on | `/GrubPac/Table/Row/Cell/users-red.svg` | `#FFE3D9` | `Connected with <name>` + optional phone |
| `not_shared` | grey/red chosen by visual rule above | visual rule above | `Not visible to anyone` + `Check box permissions >>` |

Visual icon rule is independent of explicit handler status text:
```text
showGrey = (powerStatus == "off") OR (!hasHandler)
icon = showGrey ? users-grey : users-red
```

## 8.4 Role-Based Access Control
- No role-based rendering or action control exists in this column.
- Tooltip content is status-based, not role-based.

## 8.5 Edge Cases
- If powered off, status is forced to `offline` regardless of API `handler_status`.
- If API status is invalid/missing and `hasHandler=true`, UI infers `connected`.

---

## 9. API Field -> UI Output Mapping Table

| API Field | Intermediate Field | Final Column/UI Output |
|---|---|---|
| `name` | `item.name` | Name primary label |
| `box_display_id` fallback `box_id` | `item.code` | Name identifier `#code` |
| `vehicle_number`, first restaurant name | `item.location` | Name identifier location suffix |
| `grublock_status` | `item.grublockStatus` | Name lock icon state override |
| `lock.lock_status`, `lock` | `item.locked`, `item.hasLock` | Name lock fallback state |
| `global_status` | `item.globalStatus` | Status icon + tooltip |
| `power_status` | `item.powerStatus` | Power badge + Power tooltip |
| `battery_percentage` | `item.battery` | Battery label (`n%` or `??`) + color |
| `ioniser_status` | `item.ioniser` | Settings ioniser row |
| `zone1_temp`, `zone2_temp` | `item.zone1Temp`, `item.zone2Temp` | Settings temperature row |
| `handler_status` | `item.handlerStatus` | Handler tooltip status |
| `handler_details.name`, `handler_details.phone` | `item.handlerDetails` | Handler connected tooltip content |

---

## 10. Role/Permission Reality for `/grubpacs/list`

Frontend role keys exist (`admin`, `manager`, `delivery`, `unknown`) and are available from account profile hooks, but the list table does not currently consume them.

Current behavior:
- Route access is auth-cookie based, not role-based.
- Settings/Handler/actions visibility is not role-gated in table UI.
- No per-role disabled state or per-role tooltip logic exists for row actions.
- Any true permission enforcement is expected from backend API responses.

---

## 11. Known Gaps and Fallback States (Implementation Notes)

1. No telemetry freshness/stale-data indicator exists for power/battery in this table.
2. No charging-state support in battery mapping/rendering.
3. `View settings` row-menu item currently has no click handler.
4. Battery value `0` is currently rendered as `??` due to truthy label check.
5. Lifecycle status (`active/suspended/deleted`) is not shown in the Status column.
6. Role-based UI restrictions are not implemented in this feature table.

---

## 12. Implementation Checklist (If Rebuilding)

1. Implement API fetch from `GET /food/grubpac` with `status=active`.
2. Normalize API values to row model using the same fallback priorities.
3. Recreate each column strictly by the state mappings above.
4. Keep row-click suppression for interactive children.
5. Keep tooltip copy and icon paths consistent with current behavior.
6. Preserve current gaps only if parity is required; otherwise treat section 11 as improvement targets.
