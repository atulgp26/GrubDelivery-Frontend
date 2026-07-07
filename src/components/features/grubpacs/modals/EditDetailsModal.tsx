"use client";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { MdDone } from "react-icons/md";
import { showError, showSuccess } from "@/components/ui/toast";
import { FiSearch } from "react-icons/fi";
import TableCheckbox from "@/components/ui/TableCheckbox";
import { flattenWrappedGroupRecord } from "@/lib/utils/groupedResponse";
import { TextField } from "@/components/ui/text-field";
import grubpacService from "@/services/grubpacs";
import employeeService from "@/services/employees";
import { getApiErrorMessage } from "@/lib/errors";
import PermissionRadioIcon from "@/components/features/grubpacs/components/PermissionRadioIcon";
import FigIcon from "@/components/ui/FigIcon";
import { mockPermissionOptions } from "@/components/features/grubpacs/data/mockEditDetailsData";
import type {
  ApiGrubPac,
  GrubPacListFlatResponse,
  GrubPacListGroupedResponse,
  GrubPacListData,
  UpdateGrubPacBody,
} from "@/types/domain/grubpacs";
import { formatDate } from "@/lib/utils/date";

type RestaurantOption = {
  value: string;
  label: string;
  boxes: string;
};

type ExcludedEmployee = {
  id: string;
  name: string;
  code: string;
  joinDate: string;
  added: string;
};

type FormBaseline = {
  name: string;
  vehicleNumber: string;
  permissionOption: "anyone" | "all" | "restaurants";
  selectedRestaurants: string[];
  selectedEmployees: string[];
};

type PermissionOptionValue = "anyone" | "all" | "restaurants";

function toPermissionOption(
  accessMode?: "public" | "all_employees" | "restaurant_employees",
): PermissionOptionValue {
  if (accessMode === "all_employees") return "all";
  if (accessMode === "restaurant_employees") return "restaurants";
  return "anyone";
}

function extractBoxesFromListData(data: GrubPacListData): ApiGrubPac[] {
  const grouped = (data as GrubPacListGroupedResponse).groups;
  if (grouped && typeof grouped === "object") {
    return flattenWrappedGroupRecord<ApiGrubPac>(grouped as Record<string, unknown>);
  }
  return (data as GrubPacListFlatResponse).boxes ?? [];
}

function formatRelativeUpdatedDate(value?: string): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffInDays = Math.round((todayStart.getTime() - dateStart.getTime()) / 86400000);

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";

  return formatDate(date);
}

function formatJoinedDate(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return formatDate(date);
}

const ULID_REGEX = /^[0-9A-HJKMNP-TV-Z]{26}$/i;

// ── Icons ───────────────────────────────────────────────────────────────────

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6 9L12 15L18 9" stroke="#FE480B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DropdownOptionCheckbox = ({ checked }: { checked: boolean }) => (
  <span
    className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
      checked
        ? "border-[var(--gp-color-brand-primary)] bg-[var(--gp-color-brand-primary)]"
        : "border-[var(--gp-color-border-strong)] bg-white"
    }`}
  >
    {checked && (
      <Image
        src="/dropdown/Filter%20item/check.svg"
        alt=""
        width={12}
        height={12}
        aria-hidden
      />
    )}
  </span>
);

function PermissionListCheckbox({
  checked,
  indeterminate = false,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const active = checked || indeterminate;

  return (
    <label className="inline-flex h-6 w-6 cursor-pointer items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={`inline-flex h-5 w-5 items-center justify-center rounded-[5px] border transition-colors ${
          active ? "border-[#79867E] bg-[#79867E]" : "border-[#98A19A] bg-white"
        }`}
      >
        {checked && (
          <Image
            src="/dropdown/Filter%20item/check.svg"
            alt=""
            width={12}
            height={12}
            aria-hidden
          />
        )}
        {!checked && indeterminate && (
          <span className="h-[2px] w-2.5 rounded-full bg-white" />
        )}
      </span>
    </label>
  );
}

// ── Restaurant multi-select dropdown ────────────────────────────────────────

function GrubpacMultiSelect({
  options,
  selected,
  onChange,
}: {
  options: RestaurantOption[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const filtered = options.filter((r) =>
    r.label.toLowerCase().includes(search.toLowerCase())
  );

  const getDisplayLabel = () => {
    if (selected.length === 0) return null;
    const first = options.find((r) => r.value === selected[0]);
    if (!first) return null;
    return first.label;
  };

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  const allSelected = filtered.length > 0 && filtered.every((r) => selected.includes(r.value));
  const someSelected = filtered.some((r) => selected.includes(r.value));

  const displayLabel = getDisplayLabel();
  const extraSelectedCount = selected.length > 1 ? selected.length - 1 : 0;

  const dropdownContent = (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="bg-white rounded-[var(--gp-radius-base)] border border-[var(--gp-color-border-neutral)] shadow-[4px_4px_8px_0px_rgba(0,0,0,0.12),0px_0px_4px_0px_rgba(0,0,0,0.10)] flex flex-col max-h-[260px]"
    >
          {/* Search */}
          <div className="p-2 border-b border-[var(--gp-color-border-neutral)]">
            <div className="flex items-center gap-2 px-3 h-[36px] rounded-[var(--gp-radius-base)] border border-[var(--gp-color-border-neutral)] bg-white">
              <FiSearch className="size-4 shrink-0 text-[var(--gp-color-text-neutral-light)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="flex-1 outline-none font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)] placeholder:text-[var(--gp-color-text-neutral-light)] bg-transparent"
              />
            </div>
          </div>

          {/* Options */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--gp-color-border-neutral)]">
            {filtered.map((opt) => {
              const isChecked = selected.includes(opt.value);
              return (
                <div
                  key={opt.value}
                  onClick={() => toggle(opt.value)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    isChecked ? "bg-[#FFE3D8]" : "hover:bg-[#FFF3EE]"
                  }`}
                >
                  <DropdownOptionCheckbox checked={isChecked} />
                  <div className="min-w-0 flex-1">
                    <p
                      title={opt.label}
                      className="font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)] truncate"
                    >
                      {opt.label}
                    </p>
                    <p className="font-[var(--gp-font-text)] text-[12px] leading-[18px] text-[var(--gp-color-text-neutral-tertiary)]">
                      ({opt.boxes})
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {selected.length > 0 && (
            <div className="border-t border-[var(--gp-color-border-neutral)] px-4 py-3 flex items-center gap-3">
              <TableCheckbox checked={false} indeterminate={someSelected && !allSelected} onChange={() => {}} />
              <span className="font-[var(--gp-font-text)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]">
                {selected.length} selected
              </span>
            </div>
          )}
    </div>
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full h-[48px] text-left px-4 flex items-center justify-between rounded-[var(--gp-radius-base)] border transition-colors bg-[var(--gp-color-bg-white)] ${
          open
            ? "border-[var(--gp-color-brand-primary)] shadow-[0_0_0_4px_rgba(254,87,32,0.15)]"
            : "border-[var(--gp-color-border-neutral)] hover:border-[var(--gp-color-brand-primary)]"
        }`}
      >
        <span
          title={displayLabel ?? "Select restaurant"}
          className="min-w-0 flex flex-1 items-center gap-1 font-[var(--gp-font-text)] text-[16px] leading-[24px]"
          style={{ color: displayLabel ? "var(--gp-color-text-neutral-secondary)" : "var(--gp-color-text-neutral-light)" }}
        >
          {displayLabel ? (
            <>
              <span className="truncate">{displayLabel}</span>
              {extraSelectedCount > 0 && (
                <span className="shrink-0 text-[16px] leading-[24px]">
                  (+{extraSelectedCount})
                </span>
              )}
            </>
          ) : (
            <span className="truncate">Select restaurant</span>
          )}
        </span>
        <ChevronDownIcon className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && typeof document !== "undefined" && createPortal(dropdownContent, document.body)}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function EditDetails({
  open,
  onCloseEditModalAction,
  grubpacId,
  initialName,
  initialBoxId,
  initialVehicleNumber,
  initialRestaurantIds,
  initialBlockedEmployeeIds,
  initialAccessMode,
  initialBlockedCount,
  onUpdatedAction,
}: {
  open: boolean;
  onCloseEditModalAction: () => void;
  grubpacId?: string;
  initialName?: string;
  initialBoxId?: string;
  initialVehicleNumber?: string;
  initialRestaurantIds?: string[];
  initialBlockedEmployeeIds?: string[];
  initialAccessMode?: "public" | "all_employees" | "restaurant_employees";
  initialBlockedCount?: number;
  onUpdatedAction?: () => Promise<void> | void;
}) {
  const [name, setName] = useState(initialName ?? "");
  const [inputCode, setInputCode] = useState(initialBoxId ?? "");
  const [vehicleNumber, setVehicleNumber] = useState(initialVehicleNumber ?? "");
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>(initialRestaurantIds ?? []);
  const [permissionSearchTerm, setPermissionSearchTerm] = useState("");
  const [showPermissionSearch, setShowPermissionSearch] = useState(false);
  const [permissionOption, setPermissionOption] = useState<"anyone" | "all" | "restaurants">(
    initialAccessMode === "all_employees"
      ? "all"
      : initialAccessMode === "restaurant_employees"
      ? "restaurants"
      : "anyone"
  );
  const [showExcludedList, setShowExcludedList] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(initialBlockedEmployeeIds ?? []);
  const [checkedExcludedEmployees, setCheckedExcludedEmployees] = useState<string[]>([]);
  const [showPermissionSection, setShowPermissionSection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [restaurantOptions, setRestaurantOptions] = useState<RestaurantOption[]>([]);
  const [excludedEmployees, setExcludedEmployees] = useState<ExcludedEmployee[]>([]);
  const [excludedCount, setExcludedCount] = useState(initialBlockedCount ?? initialBlockedEmployeeIds?.length ?? 0);
  const [baseline, setBaseline] = useState<FormBaseline>({
    name: (initialName ?? "").trim(),
    vehicleNumber: (initialVehicleNumber ?? "").trim(),
    permissionOption:
      initialAccessMode === "all_employees"
        ? "all"
        : initialAccessMode === "restaurant_employees"
        ? "restaurants"
        : "anyone",
    selectedRestaurants: [...(initialRestaurantIds ?? [])],
    selectedEmployees: [...(initialBlockedEmployeeIds ?? [])],
  });

  useEffect(() => {
    const nextPermissionOption: PermissionOptionValue = toPermissionOption(initialAccessMode);

    setName(initialName ?? "");
    setInputCode(initialBoxId ?? "");
    setVehicleNumber(initialVehicleNumber ?? "");
    setSelectedRestaurants(initialRestaurantIds ?? []);
    setSelectedEmployees(initialBlockedEmployeeIds ?? []);
    setCheckedExcludedEmployees([]);
    setPermissionOption(nextPermissionOption);
    setExcludedCount(initialBlockedCount ?? initialBlockedEmployeeIds?.length ?? 0);
    setBaseline({
      name: (initialName ?? "").trim(),
      vehicleNumber: (initialVehicleNumber ?? "").trim(),
      permissionOption: nextPermissionOption,
      selectedRestaurants: [...(initialRestaurantIds ?? [])],
      selectedEmployees: [...(initialBlockedEmployeeIds ?? [])],
    });
  }, [initialAccessMode, initialBlockedEmployeeIds, initialBoxId, initialName, initialRestaurantIds, initialVehicleNumber, initialBlockedCount, open]);

  useEffect(() => {
    let cancelled = false;

    async function loadEditDetails() {
      if (!open || !grubpacId) return;

      const response = await grubpacService.getEditDetails(grubpacId);
      if (!response.success || !response.data) {
        if (!cancelled) {
          showError(response.error ?? "Failed to load GrubPac edit details.");
        }
        return;
      }

      const details = response.data;
      const nextPermissionOption = toPermissionOption(details.access_mode);
      const restaurantIds = details.restaurant_ids ?? [];
      const blockedIds = details.blocked_employee_ids ?? [];
      const vehicle = details.vehicle_number ?? "";
      const boxTag = details.box_id ?? "";

      if (cancelled) return;

      setName(details.name ?? "");
      setInputCode(boxTag);
      setVehicleNumber(vehicle);
      setSelectedRestaurants(restaurantIds);
      setSelectedEmployees(blockedIds);
      setCheckedExcludedEmployees([]);
      setPermissionOption(nextPermissionOption);
      setExcludedCount(details.permissions_blocked_count ?? blockedIds.length);
      setBaseline({
        name: (details.name ?? "").trim(),
        vehicleNumber: vehicle.trim(),
        permissionOption: nextPermissionOption,
        selectedRestaurants: [...restaurantIds],
        selectedEmployees: [...blockedIds],
      });
    }

    void loadEditDetails();

    return () => {
      cancelled = true;
    };
  }, [open, grubpacId]);

  useEffect(() => {
    let cancelled = false;

    async function loadDropdowns() {
      if (!open) return;

      const response = await grubpacService.getDropdowns();
      if (!response.success || !response.data) {
        if (!cancelled) {
          showError(response.error ?? "Failed to load GrubPac dropdown data.");
        }
        return;
      }

      const restaurants = Array.isArray(response.data.restaurants)
        ? response.data.restaurants.map((restaurant) => ({
            value: restaurant.id,
            label: restaurant.name,
            boxes: `${restaurant._count?.boxes ?? 0} boxes`,
          }))
        : [];

      if (!cancelled) {
        setRestaurantOptions(restaurants);
      }
    }

    void loadDropdowns();

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    let cancelled = false;

    async function loadBlockedEmployees() {
      if (!open || !grubpacId || !showExcludedList) return;

      const accessModeValue: "public" | "all_employees" | "restaurant_employees" =
        permissionOption === "all"
          ? "all_employees"
          : permissionOption === "restaurants"
          ? "restaurant_employees"
          : "public";

      const permissionEmployeesResponse = await employeeService.getPermissionList({
        with_permission_for_box_id: grubpacId,
        with_employees_for_access_mode: accessModeValue,
      });

      if (!permissionEmployeesResponse.success || !permissionEmployeesResponse.data) {
        if (!cancelled) {
          setExcludedEmployees([]);
        }
        return;
      }

      const mappedEmployees: ExcludedEmployee[] = (permissionEmployeesResponse.data.employees ?? [])
        .map((employee) => {
          const firstName = (employee.first_name ?? "").trim();
          const lastName = (employee.last_name ?? "").trim();
          const fullName = `${firstName} ${lastName}`.trim();
          const code = employee.employee_display_id ?? employee.employee_id ?? employee.id;

          if (!employee.id) return null;

          return {
            id: employee.id,
            name: fullName || "Unknown Employee",
            code,
            joinDate: formatJoinedDate(employee.joining_date),
            added: formatRelativeUpdatedDate(employee.updated_at ?? employee.created_at),
          };
        })
        .filter((employee): employee is ExcludedEmployee => employee !== null);

      if (!cancelled) {
        setExcludedEmployees(mappedEmployees);
        setSelectedEmployees(mappedEmployees.map((employee) => employee.id));
      }
    }

    void loadBlockedEmployees();

    return () => {
      cancelled = true;
    };
  }, [open, grubpacId, showExcludedList, permissionOption]);

  // Keep restaurant selection independent from permission choice.
  const handleGrubpacChange = (vals: string[]) => {
    setSelectedRestaurants(vals);
  };

  const onClose = () => {
    setShowExcludedList(false);
    setShowPermissionSection(false);
    onCloseEditModalAction();
  };

  const handleSave = async () => {
    if (!grubpacId) {
      showError("Unable to update GrubPac: missing GrubPac ID.");
      return;
    }

    if (isSaving) return;

    try {
      setIsSaving(true);
      const validRestaurantIds = selectedRestaurants.filter((id) => ULID_REGEX.test(id));
      const validBlockedEmployeeIds = selectedEmployees.filter((id) => ULID_REGEX.test(id));
      const accessModeValue: "public" | "all_employees" | "restaurant_employees" =
        permissionOption === "all"
          ? "all_employees"
          : permissionOption === "restaurants"
          ? "restaurant_employees"
          : "public";

      const payload: UpdateGrubPacBody = {
        id: grubpacId,
        access_mode: accessModeValue,
        blocked_employee_ids: validBlockedEmployeeIds,
        vehicle_number: vehicleNumber.trim() || null,
        restaurant_ids: validRestaurantIds,
      };

      const trimmedName = name.trim();
      if (trimmedName) {
        payload.name = trimmedName;
      }

      const response = await grubpacService.update(payload);
      if (!response.success) {
        showError(response.error ?? "Failed to update GrubPac details.");
        return;
      }

      if (onUpdatedAction) {
        await onUpdatedAction();
      }

      setBaseline({
        name: name.trim(),
        vehicleNumber: vehicleNumber.trim(),
        permissionOption,
        selectedRestaurants: [...selectedRestaurants],
        selectedEmployees: [...selectedEmployees],
      });

      showSuccess("GrubPac details updated successfully!", "Changes will reflect across all associated records.");
      if (showPermissionSection || showExcludedList) {
        setShowExcludedList(false);
        setShowPermissionSection(false);
      } else {
        onClose();
      }
    } catch (error) {
      showError(getApiErrorMessage(error, "Failed to update GrubPac details."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmChanges = async () => {
    if (!grubpacId) {
      showError("Unable to update permissions for this GrubPac.");
      return;
    }

    const employeeIds = Array.from(new Set(checkedExcludedEmployees.filter((id) => id.trim().length > 0)));

    if (employeeIds.length === 0) {
      showError("Select at least one employee to remove access.");
      return;
    }

    try {
      const response = await grubpacService.removeEmployeeFromBoxes({
        box_ids: [grubpacId],
        employee_ids: employeeIds,
      });

      if (!response.success) {
        showError(response.error ?? "Failed to remove access for selected employees.");
        return;
      }

      if (onUpdatedAction) {
        await onUpdatedAction();
      }

      showSuccess(
        "Permissions updated successfully!",
        "Access removed for selected employees.",
      );
      setShowExcludedList(false);
      onClose();
    } catch (error) {
      showError(getApiErrorMessage(error, "Failed to remove access for selected employees."));
    }
  };

  // Employees data (excluded list)
  const employees = excludedEmployees.filter((emp) => {
    const q = permissionSearchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.code.toLowerCase().includes(q)
    );
  });

  const handleSelectAll = (checked: boolean) => {
    setCheckedExcludedEmployees(checked ? employees.map((e) => e.id) : []);
  };
  const handleSelectEmployee = (id: string, checked: boolean) => {
    setCheckedExcludedEmployees((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    );
  };
  const isAllSelected = employees.length > 0 && checkedExcludedEmployees.length === employees.length;
  const isIndeterminate = checkedExcludedEmployees.length > 0 && !isAllSelected;

  const displayBoxTag = inputCode.trim()
    ? inputCode.trim().startsWith("#")
      ? inputCode.trim()
      : `#${inputCode.trim()}`
    : "";

  const normalizeStringArray = (values: string[]) => [...new Set(values)].sort();
  const hasChanges =
    name.trim() !== baseline.name ||
    vehicleNumber.trim() !== baseline.vehicleNumber ||
    permissionOption !== baseline.permissionOption ||
    JSON.stringify(normalizeStringArray(selectedRestaurants)) !==
      JSON.stringify(normalizeStringArray(baseline.selectedRestaurants)) ||
    JSON.stringify(normalizeStringArray(selectedEmployees)) !==
      JSON.stringify(normalizeStringArray(baseline.selectedEmployees));

  const isFormValid = name.trim() !== "";

  // Lock body scroll while modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const permissionOptions = mockPermissionOptions.map((option) => ({
    ...option,
    excludedLabel: `${excludedCount} EXCLUDED`,
  }));

  // ── Single modal (swaps content between main form and excluded list) ──────
  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-[604px]"
      height="h-auto max-h-[90vh]"
      modalClassName="overflow-hidden"
      noXPadding
      hideClose={true}
      closeOnOutsideClick={false}
    >
      {showExcludedList ? (
        /* ── Excluded list view ─────────────────────────────────────────── */
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="px-6 pt-5 pb-4 shrink-0">
            <div className="mb-6 flex items-center justify-between">
              <Button
                variant="neutral"
                appearance="ghost"
                onClick={() => setShowExcludedList(false)}
                className="rounded-lg flex items-center justify-center gap-2 text-[var(--gp-color-text-neutral-secondary)]"
              >
                <FigIcon name="left-arrow" size={20} />
                <span className="text-xl ml-1 font-medium">BACK</span>
              </Button>
              <Button
                variant="neutral"
                appearance="ghost"
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg flex items-center justify-center mb-2"
              >
                <FigIcon name="x" size={26} />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="font-[var(--gp-font-heading)] text-[24px] leading-[32px] font-semibold text-[var(--gp-color-text-neutral-primary)]">
                Remove access from...
              </h2>
              <button
                type="button"
                onClick={() => setShowPermissionSearch((v) => !v)}
                className="flex items-center gap-2 font-[var(--gp-font-interactive)] text-[16px] font-medium text-[var(--gp-color-text-brand)] hover:opacity-80 transition-opacity"
              >
                <FiSearch className="size-4" />
                SEARCH
              </button>
            </div>
            {showPermissionSearch && (
              <input
                type="text"
                value={permissionSearchTerm}
                onChange={(e) => setPermissionSearchTerm(e.target.value)}
                placeholder="Search employee"
                className="h-9 px-3 rounded-lg border border-[var(--gp-color-border-neutral)] text-sm w-full"
                autoFocus
              />
            )}
          </div>

          {/* Table header */}
          <div className="shrink-0 px-6 py-3 flex items-center gap-4 border-b border-[var(--gp-color-border-neutral)]">
            <PermissionListCheckbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <span className="font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)]">Name</span>
            <span className="font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)] ml-auto">Added</span>
          </div>

          {/* Employee rows — max 5 rows visible, then scroll */}
          <div className="overflow-y-auto divide-y divide-[var(--gp-color-border-neutral)]" style={{ maxHeight: "calc(5 * 78px)" }}>
            {employees.length === 0 ? (
              <div className="px-6 py-8 text-center font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)]">
                No employees match your search.
              </div>
            ) : (
            employees.map((emp) => {
              const checked = checkedExcludedEmployees.includes(emp.id);
              return (
                <div key={emp.id} className="px-6 py-4 flex items-center gap-4">
                  <PermissionListCheckbox
                    checked={checked}
                    onChange={(e) => handleSelectEmployee(emp.id, e.target.checked)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-[var(--gp-font-heading)] text-[16px] leading-[24px] font-semibold text-[var(--gp-color-text-neutral-secondary)] break-words whitespace-normal">
                      {emp.name}
                    </p>
                    <p className="font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)] break-all whitespace-normal">
                      #{emp.code} | Joined {emp.joinDate}
                    </p>
                  </div>
                  <span className="font-[var(--gp-font-text)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)] shrink-0">
                    {emp.added}
                  </span>
                </div>
              );
            })
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-[var(--gp-color-border-neutral)] px-6 py-4 flex items-center justify-between gap-4">
            <span className="font-[var(--gp-font-text)] text-[18px] leading-[28px] text-[var(--gp-color-text-neutral-secondary)]">
              {excludedCount} employees excluded.
            </span>
            <Button
              variant="primary"
              appearance="outlined"
              onClick={handleConfirmChanges}
              className="h-[48px] px-6 font-[var(--gp-font-interactive)] text-[16px] font-medium text-[var(--gp-color-text-brand)] border-[var(--gp-color-brand-border)] hover:bg-[var(--gp-color-bg-brand-secondary)]"
            >
              CONFIRM CHANGES
            </Button>
          </div>
        </div>
      ) : (
        /* ── Main edit view ──────────────────────────────────────────────── */
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Scrollable content */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto px-6 pb-6">

        <div className="flex justify-end pt-4">
          <Button
            variant="neutral"
            appearance="ghost"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg flex items-center justify-center"
          >
            <FigIcon name="x" size={26} />
          </Button>
        </div>

        {/* Title */}
        {!showPermissionSection && (
          <div className="flex flex-col gap-1">
            <h1 className="font-[var(--gp-font-heading)] text-[24px] leading-[32px] font-semibold text-[var(--gp-color-text-neutral-primary)]">
              Edit GrubPac details
            </h1>
            <p className="font-[var(--gp-font-text)] text-[18px] leading-[28px] text-[var(--gp-color-text-neutral-secondary)]">
              Changes will reflect across all associated records.
            </p>
          </div>
        )}

        {/* Basic details */}
        <div className="flex flex-col gap-3">
          <span className="font-[var(--gp-font-text)] text-[18px] leading-[28px] text-[var(--gp-color-text-neutral-secondary)]">
            Basic details
          </span>
          <div className="grid grid-cols-2 gap-4">
            <TextField
              value={displayBoxTag}
              readOnly
              disabled
              placeholder="Tag"
              hasHoverEffect={false}
              containerClassName="flex-1"
              inputContainerClassName="bg-[var(--gp-color-bg-neutral-secondary)] border-[var(--gp-color-border-neutral-secondary)]"
              className="text-[var(--gp-color-text-neutral-light)] disabled:opacity-100"
            />
            <TextField
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Box name"
              hasHoverEffect
              state="press"
              containerClassName="flex-1"
            />
          </div>
        </div>

        {/* Assigned restaurant + vehicle */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <span className="font-[var(--gp-font-text)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]">
              Assigned restaurant{" "}
              <span className="text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)]">(optional)</span>
            </span>
            <GrubpacMultiSelect
              options={restaurantOptions}
              selected={selectedRestaurants}
              onChange={handleGrubpacChange}
            />
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-[var(--gp-font-text)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]">
              Assigned vehicle{" "}
              <span className="text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)]">(optional)</span>
            </span>
            <TextField
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              placeholder="Vehicle number"
              hasHoverEffect
              state="press"
            />
          </div>
        </div>

        {/* Who can connect */}
        <div className="flex flex-col gap-4">
          <span className="font-[var(--gp-font-text)] text-[18px] leading-[28px] text-[var(--gp-color-text-neutral-secondary)]">
            Who can connect with the box?
          </span>

          {!showPermissionSection ? (
            <Button
              variant="primary"
              appearance="outlined"
              onClick={() => setShowPermissionSection(true)}
              className="w-auto self-start h-[48px] px-4 flex items-center gap-2 font-[var(--gp-font-interactive)] text-[16px] font-medium text-[var(--gp-color-text-brand)] border-[var(--gp-color-brand-border)] hover:bg-[var(--gp-color-bg-brand-secondary)]"
            >
              MANAGE PERMISSIONS
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          ) : (
            <div className="flex flex-col gap-4">
              {permissionOptions.map((opt) => {
                const isSelected = permissionOption === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPermissionOption(opt.value)}
                    className="flex items-start gap-3 text-left w-full cursor-pointer"
                  >
                    <PermissionRadioIcon checked={isSelected} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-[var(--gp-font-text)] text-[18px] leading-[28px] font-medium ${isSelected ? "text-[var(--gp-color-text-neutral-primary)]" : "text-[var(--gp-color-text-neutral-secondary)]"}`}>
                          {opt.title}
                        </span>
                        {opt.excludedLabel && isSelected && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCheckedExcludedEmployees([]);
                              setShowExcludedList(true);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                setCheckedExcludedEmployees([]);
                                setShowExcludedList(true);
                              }
                            }}
                            className="shrink-0 inline-flex items-center h-[28px] font-[var(--gp-font-interactive)] text-[14px] leading-[28px] font-medium text-[var(--gp-color-text-brand)] hover:underline"
                          >
                            {opt.excludedLabel}
                          </span>
                        )}
                      </div>
                      <p className="font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)] mt-0.5">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
              <div className="border-t border-[var(--gp-color-border-neutral)]" />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--gp-color-border-neutral)] px-6 py-4 shrink-0">
        <Button
          variant="primary"
          appearance="solid"
          size="xl"
          onClick={handleSave}
          disabled={!isFormValid || isSaving || !hasChanges}
          className={`w-full gap-3 ${
            isFormValid && !isSaving && hasChanges
              ? "bg-[var(--gp-color-brand-primary)] border-[var(--gp-color-brand-border)] text-white"
              : "bg-[var(--gp-color-bg-neutral-secondary)] border-[var(--gp-color-border-neutral)] text-[var(--gp-color-text-disabled)]"
          }`}
        >
          <MdDone className="size-5" />
          {isSaving ? "SAVING..." : "SAVE CHANGES"}
        </Button>
      </div>
        </div>
      )}
    </Modal>
  );
}
