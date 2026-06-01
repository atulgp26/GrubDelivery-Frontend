"use client";

import * as React from "react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/text-field";
import { Label } from "@/components/ui/label";
import { PhoneDropdown, COUNTRIES } from "@/components/ui/phone-dropdown";
import { EMAIL_PATTERN } from "@/components/features/auth/validation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Employee, DropdownRestaurant, DropdownRole } from "@/types/domain/employees";
import type { EmployeeFormData } from "../types";
import { useRestaurantGroups } from "@/hooks/useRestaurantGroups";

// ── Icons ────────────────────────────────────────────────────────────────────

const ChevronDownIcon = () => (
  <Image src="/icons/chevron-down.svg" alt="chevron down" width={24} height={24} />
);

const ChevronUpIcon = () => (
  <Image src="/icons/chevron-up.svg" alt="chevron up" width={20} height={20} />
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <polyline points="20,6 9,17 4,12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Default roles (fallback when API roles are not available) ─────────────────

const DEFAULT_ROLES: DropdownRole[] = [
  { id: "manager", name: "Manager", description: "Manages boxes and drivers for the assigned restaurant, or all visible boxes if unassigned." },
  { id: "delivery", name: "Driver", description: "Carries and operates assigned boxes via the mobile app only." },
];

const YMD_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const INDIA_LOCAL_DIGITS = 10;
const FIRST_NAME_MAX_LENGTH = 20;
const LAST_NAME_MAX_LENGTH = 20;
const EMPLOYEE_ID_MAX_LENGTH = 25;
const NAME_SANITIZE_REGEX = /[^\p{L}\s'-]/gu;
const NAME_INVALID_CHAR_REGEX = /[^\p{L}\s'-]/u;

const EMPTY_FORM: EmployeeFormData = {
  firstName: "",
  lastName: "",
  contact: "",
  countryCode: "IN",
  email: "",
  employeeId: "",
  joiningDate: "",
  role: "delivery",
  assignedRestaurant: "",
};

const isSameFormData = (a: EmployeeFormData, b: EmployeeFormData): boolean =>
  a.firstName === b.firstName &&
  a.lastName === b.lastName &&
  a.contact === b.contact &&
  a.countryCode === b.countryCode &&
  a.email === b.email &&
  a.employeeId === b.employeeId &&
  a.joiningDate === b.joiningDate &&
  a.role === b.role &&
  a.assignedRestaurant === b.assignedRestaurant;

const toDigits = (value: string): string => value.replace(/\D/g, "");

const sanitizeContactInput = (value: string): string => {
  let digits = toDigits(value);
  // Strip all leading zeros
  digits = digits.replace(/^0+/, "");
  return digits.slice(0, INDIA_LOCAL_DIGITS);
};

const sanitizeEmployeeIdInput = (value: string): string =>
  value.replace(/\s+/g, "").slice(0, EMPLOYEE_ID_MAX_LENGTH);

const sanitizeNameInput = (value: string, maxLength: number): string =>
  value.replace(NAME_SANITIZE_REGEX, "").slice(0, maxLength);

const normalizeIndianContact = (value: string): string | null => {
  const digits = toDigits(value);
  if (digits.length === INDIA_LOCAL_DIGITS) return digits;
  return null;
};

const formatDateToYmd = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateValue = (value: string): Date | undefined => {
  if (!value) return undefined;

  if (YMD_REGEX.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const parsedYmd = new Date(year, month - 1, day);
    if (!Number.isNaN(parsedYmd.getTime())) return parsedYmd;
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const readableMatch = value.match(/^(\d{1,2})\s+([A-Za-z]+)\s+'(\d{2})$/);
  if (readableMatch) {
    const [, day, monthName, shortYear] = readableMatch;
    const parsedReadable = new Date(`${monthName} ${day}, 20${shortYear}`);
    if (!Number.isNaN(parsedReadable.getTime())) return parsedReadable;
  }

  return undefined;
};

const normalizeJoiningDate = (value: string): string => {
  if (!value) return "";
  if (YMD_REGEX.test(value)) return value;

  const parsed = parseDateValue(value);
  if (!parsed) return "";

  return formatDateToYmd(parsed);
};

// ── Sub-components ────────────────────────────────────────────────────────────

const RoleSelector = ({
  value,
  onValueChange,
  placeholder = "Select role",
  roles = DEFAULT_ROLES,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  roles?: DropdownRole[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedRole = roles.find((r) => r.id === value);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div
          tabIndex={0}
          role="button"
          className={cn(
            "bg-[var(--gp-color-bg-white)] border border-[var(--gp-color-border-neutral)] rounded-[var(--gp-radius-base)] h-[48px] px-4 flex items-center justify-between cursor-pointer transition-colors hover:border-[var(--gp-color-brand-primary)]",
          )}
        >
          <span className={cn(
            "font-[var(--gp-font-text)] text-[18px] leading-[28px]",
            selectedRole ? "text-[var(--gp-color-text-neutral-secondary)]" : "text-[var(--gp-color-text-neutral-light)]",
          )}>
            {selectedRole ? selectedRole.name : placeholder}
          </span>
          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-white border border-[var(--gp-color-border-neutral)] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1),4px_4px_8px_0px_rgba(0,0,0,0.12)] p-0"
        align="start"
        side="bottom"
        style={{ width: "var(--radix-dropdown-menu-trigger-width)" }}
      >
        {roles.map((role) => (
          <DropdownMenuItem
            key={role.id}
            onClick={() => { onValueChange(role.id); setIsOpen(false); }}
            className={cn(
              "flex flex-col items-start gap-1 px-4 py-3 border-t border-[var(--gp-color-border-neutral)] first:border-t-0 cursor-pointer",
              role.id === value
                ? "bg-[#FFD9CC] hover:bg-[#FFD9CC]"
                : "hover:bg-[var(--gp-color-bg-neutral-secondary)]",
            )}
          >
            <span className={cn(
              "font-[var(--gp-font-text)] text-[14px] leading-[22px]",
              role.id === value
                ? "text-[var(--gp-color-text-neutral-primary)] font-medium"
                : "text-[var(--gp-color-text-neutral-secondary)]",
            )}>
              {role.name}
            </span>
            {role.description && (
              <span className="font-[var(--gp-font-text)] text-[12px] leading-[18px] text-[var(--gp-color-text-neutral-tertiary)] whitespace-normal">
                {role.description}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const RestaurantSelector = ({
  value,
  onValueChange,
  placeholder = "Select restaurant",
  restaurants = [],
  disabled = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  restaurants?: DropdownRestaurant[];
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedRestaurant = restaurants.find((r) => r.id === value);
  const filtered = search
    ? restaurants.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : restaurants;

  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setSearch(""); }}>
      <DropdownMenuTrigger asChild>
        <div
          tabIndex={disabled ? -1 : 0}
          role="button"
          className={cn(
            "bg-[var(--gp-color-bg-white)] border border-[var(--gp-color-border-neutral)] rounded-[var(--gp-radius-base)] h-[48px] px-4 flex items-center justify-between transition-colors",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-[var(--gp-color-brand-primary)]"
          )}
        >
          <span className={cn(
            "font-[var(--gp-font-text)] text-[18px] leading-[28px]",
            selectedRestaurant ? "text-[var(--gp-color-text-neutral-secondary)]" : "text-[var(--gp-color-text-neutral-light)]",
          )}>
            {disabled ? "Loading..." : selectedRestaurant ? selectedRestaurant.name : placeholder}
          </span>
          {disabled ? (
            <div className="size-5 border-2 border-[var(--gp-color-brand-primary)] border-t-transparent animate-spin rounded-full" />
          ) : (
            isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-white border border-[var(--gp-color-border-neutral)] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1),4px_4px_8px_0px_rgba(0,0,0,0.12)] p-0 flex flex-col"
        align="start"
        side="bottom"
        style={{ width: "var(--radix-dropdown-menu-trigger-width)", maxHeight: "260px" }}
      >
        {/* Search — sticky top */}
        <div className="px-3 py-2 shrink-0 bg-white z-10">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            onKeyDown={(e) => e.stopPropagation()}
            className="w-full h-8 px-3 border border-[var(--gp-color-border-neutral)] rounded-[var(--gp-radius-base)] text-[14px] text-[var(--gp-color-text-neutral-secondary)] placeholder:text-[var(--gp-color-text-neutral-light)] outline-none focus:border-[var(--gp-color-brand-primary)]"
          />
        </div>
        {/* Scrollable restaurant list */}
        <div className="overflow-y-auto flex-1">
          {filtered.map((restaurant) => (
            <DropdownMenuItem
              key={restaurant.id}
              onClick={() => { onValueChange(restaurant.id); setIsOpen(false); }}
              className={cn(
                "px-4 py-3 border-t border-[var(--gp-color-border-neutral)] cursor-pointer flex-col items-start gap-0.5",
                restaurant.id === value
                  ? "bg-[#FFD9CC] hover:bg-[#FFD9CC]"
                  : "hover:bg-[var(--gp-color-bg-neutral-secondary)]",
              )}
            >
              <span className="font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)]">
                {restaurant.name}
              </span>
              {restaurant.boxes !== undefined && (
                <span className="font-[var(--gp-font-text)] text-[12px] leading-[18px] text-[var(--gp-color-text-neutral-tertiary)]">
                  ({restaurant.boxes} boxes)
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </div>
        {/* Remove restaurant — sticky bottom */}
        <DropdownMenuItem
          onClick={() => { onValueChange(""); setIsOpen(false); }}
          className="px-4 py-3 border-t border-[var(--gp-color-border-neutral)] hover:bg-[var(--gp-color-bg-neutral-secondary)] cursor-pointer flex items-center gap-2 shrink-0 bg-white z-10"
        >
          <Image src="/icons/x.svg" alt="remove" width={16} height={16} />
          <span className="font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)]">
            Remove restaurant
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const DatePicker = ({
  value,
  onValueChange,
  placeholder = "Joining date",
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const selectedDate = React.useMemo(() => parseDateValue(value), [value]);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    top: 0,
    left: 0,
  });

  const updatePanelPosition = React.useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const panelWidth = rect.width;
    const panelHeight = panelRef.current?.offsetHeight ?? 340;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const canOpenBelow = rect.bottom + 8 + panelHeight <= viewportHeight - 12;
    const top = canOpenBelow
      ? rect.bottom + 8
      : Math.max(12, rect.top - panelHeight - 8);

    const nextLeft = Math.min(
      Math.max(12, rect.left),
      viewportWidth - panelWidth - 12,
    );

    setPanelStyle({
      top,
      left: nextLeft,
      width: panelWidth,
    });
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updatePanelPosition();
    const rafId = window.requestAnimationFrame(updatePanelPosition);
    const handleReposition = () => updatePanelPosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen, updatePanelPosition]);

  return (
    <div ref={containerRef} className="relative">
      <TextField
        type="text"
        readOnly
        value={value}
        onFocus={() => {
          setIsOpen(true);
          updatePanelPosition();
        }}
        onClick={() => {
          setIsOpen(true);
          updatePanelPosition();
        }}
        placeholder={placeholder}
        className="pr-4 cursor-pointer"
        trailingIcon={<Image src="/icons/calendar-day.svg" alt="calendar" width={20} height={20} />}
        onTrailingIconClick={() => {
          setIsOpen(true);
          updatePanelPosition();
        }}
        hasHoverEffect={true}
        state="press"
      />
      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-[120]"
            style={panelStyle}
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              disabled={{ after: new Date() }}
              className="w-full rounded-lg border bg-white [--cell-size:2.5rem] p-4"
              classNames={{ root: "w-full" }}
              onSelect={(date) => {
                if (!date) return;
                onValueChange(formatDateToYmd(date));
                setIsOpen(false);
              }}
            />
          </div>,
          document.body,
        )}
    </div>
  );
};

// ── Types ─────────────────────────────────────────────────────────────────────

export type { EmployeeFormData };

export interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => void;
  loading?: boolean;
  employee?: Employee | null;
  restaurants?: DropdownRestaurant[];
  roles?: DropdownRole[];
  isLoadingDropdowns?: boolean;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AddEmployeeModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  employee = null,
  restaurants: propRestaurants,
  roles: propRoles,
  isLoadingDropdowns = false,
}: AddEmployeeModalProps) {
  const isEditMode = Boolean(employee);
  const allRestaurants: DropdownRestaurant[] = propRestaurants ?? [];
  const roles = propRoles ?? DEFAULT_ROLES;

  const [formData, setFormData] = useState<EmployeeFormData>(EMPTY_FORM);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const resolveInitialRestaurantId = React.useCallback(
    (targetEmployee: Employee): string => {
      if (targetEmployee.restaurantId) return targetEmployee.restaurantId;

      const restaurantName = targetEmployee.restaurantName?.trim().toLowerCase();
      if (!restaurantName) return "";

      const match = allRestaurants.find(
        (restaurant) => restaurant.name.trim().toLowerCase() === restaurantName,
      );
      return match?.id ?? "";
    },
    [allRestaurants],
  );

  useEffect(() => {
    if (open && employee) {
      const isoCode = employee.countryDialCode
        ? (COUNTRIES.find((c) => c.dialCode === employee.countryDialCode)?.code ?? "IN")
        : "IN";
      const nextFormData: EmployeeFormData = {
        firstName: employee.name?.split(" ")[0] || "",
        lastName: employee.name?.split(" ").slice(1).join(" ") || "",
        contact: sanitizeContactInput(employee.mobileNumber || employee.phone || ""),
        countryCode: isoCode,
        email: employee.email || "",
        employeeId: sanitizeEmployeeIdInput(employee.employeeId || ""),
        joiningDate: normalizeJoiningDate(employee.joinedDate || ""),
        role: employee.role === "Driver" ? "delivery" : employee.role === "Manager" ? "manager" : employee.role || "delivery",
        assignedRestaurant: resolveInitialRestaurantId(employee),
      };
      setFormData((prev) => (isSameFormData(prev, nextFormData) ? prev : nextFormData));
    } else if (!open) {
      setFormData((prev) => (isSameFormData(prev, EMPTY_FORM) ? prev : EMPTY_FORM));
      setSubmitAttempted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, employee, resolveInitialRestaurantId, allRestaurants]);

  const normalizedContact = normalizeIndianContact(formData.contact);
  const normalizedJoiningDate = normalizeJoiningDate(formData.joiningDate);
  const trimmedFirstName = formData.firstName.trim();
  const trimmedLastName = formData.lastName.trim();
  const trimmedEmail = formData.email.trim();
  const hasEmailInput = trimmedEmail !== "";
  const initialFirstName = (employee?.name?.split(" ")[0] || "").trim();
  const initialLastName = (employee?.name?.split(" ").slice(1).join(" ") || "").trim();
  const isFirstNameChanged = !isEditMode || trimmedFirstName !== initialFirstName;
  const isLastNameChanged = !isEditMode || trimmedLastName !== initialLastName;

  const isFirstNameLengthValid = !isFirstNameChanged || trimmedFirstName.length <= FIRST_NAME_MAX_LENGTH;
  const isLastNameLengthValid = !isLastNameChanged || trimmedLastName.length <= LAST_NAME_MAX_LENGTH;
  const isFirstNameCharacterValid = !isFirstNameChanged || !NAME_INVALID_CHAR_REGEX.test(trimmedFirstName);
  const isLastNameCharacterValid = !isLastNameChanged || !NAME_INVALID_CHAR_REGEX.test(trimmedLastName);
  const isEmailValid = trimmedEmail !== "" && EMAIL_PATTERN.test(trimmedEmail);
  const isContactValid = normalizedContact !== null;
  const isJoiningDateValid = normalizedJoiningDate !== "";

  const isValid =
    trimmedFirstName !== "" &&
    trimmedLastName !== "" &&
    isFirstNameLengthValid &&
    isLastNameLengthValid &&
    isFirstNameCharacterValid &&
    isLastNameCharacterValid &&
    isEmailValid &&
    formData.employeeId.trim() !== "" &&
    isJoiningDateValid &&
    formData.role !== undefined;

  const validationErrors: string[] = [];
  if (trimmedFirstName === "") validationErrors.push("First name");
  if (trimmedLastName === "") validationErrors.push("Last name");
  if (!isFirstNameLengthValid) validationErrors.push(`First name (max ${FIRST_NAME_MAX_LENGTH} characters)`);
  if (!isLastNameLengthValid) validationErrors.push(`Last name (max ${LAST_NAME_MAX_LENGTH} characters)`);
  if (!isFirstNameCharacterValid) validationErrors.push("First name (letters only)");
  if (!isLastNameCharacterValid) validationErrors.push("Last name (letters only)");

  if (!isEmailValid) validationErrors.push("Valid email address");
  if (formData.employeeId.trim() === "") validationErrors.push("Employee ID");
  if (!isJoiningDateValid) validationErrors.push("Joining date");
  if (!formData.role) validationErrors.push("Role");

  const set = (field: keyof EmployeeFormData) => (value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleInputChange =
    (field: keyof EmployeeFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((prev) => ({
        ...prev,
        [field]:
          field === "employeeId"
            ? sanitizeEmployeeIdInput(e.target.value)
            : field === "firstName"
              ? sanitizeNameInput(e.target.value, FIRST_NAME_MAX_LENGTH)
              : field === "lastName"
                ? sanitizeNameInput(e.target.value, LAST_NAME_MAX_LENGTH)
            : e.target.value,
      }));

  const handleSave = () => {
    setSubmitAttempted(true);
    if (!isValid || loading) return;

    onSubmit({
      ...formData,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
contact: normalizedContact ?? "",
      email: trimmedEmail,
      joiningDate: normalizedJoiningDate,
    });
  };

  const handleClose = () => {
    setFormData((prev) => (isSameFormData(prev, EMPTY_FORM) ? prev : EMPTY_FORM));
    setSubmitAttempted(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      width="w-[calc(100vw-1.5rem)] sm:w-[calc(100vw-2rem)] max-w-[604px]"
      height="h-auto max-h-[calc(100vh-1rem)] sm:max-h-[90vh]"
      modalClassName="overflow-hidden"
      noXPadding
      closeOnOutsideClick={false}
    >
      {/* Scrollable form body */}
      <div className="flex-1 min-h-0 flex flex-col gap-6 overflow-y-auto px-4 sm:px-6 pb-6">
        {/* Title */}
        <div className="flex flex-col gap-1">
          <h1 className="font-[var(--gp-font-heading)] text-[24px] font-semibold text-[var(--gp-color-text-neutral-primary)]">
            {isEditMode ? "Edit Employee" : "Who\u2019s on your team?"}
          </h1>
          <p className="font-[var(--gp-font-text)] text-[16px] leading-[28px] text-[var(--gp-color-text-neutral-secondary)]">
            {isEditMode
              ? "Update employee details and role permissions."
              : "Create an account for your employee and assign them their role."}
          </p>
        </div>

        {/* Basic details */}
        <div className="flex flex-col gap-4">
          <Label className="font-[var(--gp-font-text)] text-[18px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]">
            Basic details
          </Label>
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full">
            <div className="flex-1 min-w-0">
              <TextField
                placeholder="First name"
                value={formData.firstName}
                onChange={handleInputChange("firstName")}
                maxLength={FIRST_NAME_MAX_LENGTH}
                hasHoverEffect
                state="press"
              />
            </div>
            <div className="flex-1 min-w-0">
              <TextField
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleInputChange("lastName")}
                maxLength={LAST_NAME_MAX_LENGTH}
                hasHoverEffect
                state="press"
              />
            </div>
          </div>
        </div>

        {/* Contact details */}
        <div className="flex flex-col gap-4">
          <Label className="font-[var(--gp-font-text)] text-[18px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]">
            Contact details
          </Label>
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full">
            <div className="flex-1 min-w-0">
              <PhoneDropdown
                value={formData.countryCode}
                phoneNumber={formData.contact}
                onCountryChange={(country) =>
                  setFormData((prev) => ({ ...prev, countryCode: country.code }))
                }
                onPhoneNumberChange={(phone) =>
                  setFormData((prev) => ({ ...prev, contact: sanitizeContactInput(phone) }))
                }
                placeholder="00000 00000"
                width="100%"
              />
            </div>
            <div className="flex-1 min-w-0">
              <TextField
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange("email")}
                trailingIcon={
                  hasEmailInput ? (
                    <Image
                      src={isEmailValid ? "/Settings/Popup/check.svg" : "/x.svg"}
                      alt={isEmailValid ? "Valid email" : "Invalid email"}
                      width={20}
                      height={20}
                    />
                  ) : undefined
                }
                trailingIconClassName="pointer-events-none"
                hasHoverEffect
                state="press"
              />
            </div>
          </div>
        </div>

        {/* Employment details */}
        <div className="flex flex-col gap-4">
          <Label className="font-[var(--gp-font-text)] text-[18px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]">
            Employment details
          </Label>
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full">
            <div className="flex-1 min-w-0">
              <TextField
                placeholder="Employee ID"
                value={formData.employeeId}
                onChange={handleInputChange("employeeId")}
                maxLength={EMPLOYEE_ID_MAX_LENGTH}
                onKeyDown={(event) => {
                  if (event.key === " ") {
                    event.preventDefault();
                  }
                }}
                hasHoverEffect
                state="press"
              />
            </div>
            <div className="flex-1 min-w-0">
              <DatePicker
                value={formData.joiningDate}
                onValueChange={set("joiningDate")}
                placeholder="Joining date"
              />
            </div>
          </div>
        </div>

        {/* Role + Restaurant */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full">
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <Label className="font-[var(--gp-font-text)] text-[18px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]">
              Role permissions
            </Label>
            <RoleSelector
              value={formData.role}
              onValueChange={set("role")}
              roles={roles}
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <Label className="font-[var(--gp-font-text)] text-[18px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)] flex items-center gap-1">
              Assigned restaurant
              <span className="text-[14px] leading-[22px]">(optional)</span>
            </Label>
            <RestaurantSelector
              value={formData.assignedRestaurant || ""}
              onValueChange={set("assignedRestaurant")}
              placeholder="Select restaurant"
              restaurants={allRestaurants}
              disabled={isLoadingDropdowns}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--gp-color-border-neutral)] px-6 py-4 shrink-0">
        <Button
          variant="primary"
          appearance="solid"
          size="xl"
          onClick={handleSave}
          disabled={loading}
          className={cn(
            "w-full gap-3",
            !loading
              ? "bg-[var(--gp-color-brand-primary)] border-[var(--gp-color-brand-border)] text-[var(--gp-color-text-on-primary)]"
              : "bg-[var(--gp-color-bg-button-primary-disabled)] border-[var(--gp-color-border-neutral)] text-[var(--gp-color-text-disabled)]",
          )}
        >
          <CheckIcon className="size-6" />
          <span>{isEditMode ? "SAVE DETAILS" : "ADD EMPLOYEE"}</span>
        </Button>
        {submitAttempted && !isValid ? (
          <p className="mt-2 text-sm text-red-500">
            Please correct these fields: {validationErrors.length > 0 ? validationErrors.join(", ") : "Invalid values"}.
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
