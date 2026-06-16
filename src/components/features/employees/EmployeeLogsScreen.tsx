"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { format, isValid, parseISO, endOfDay, startOfDay } from "date-fns";
import { useDebounce } from "@/lib/hooks";
import SearchInput from "@/components/ui/SearchInput";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdCalendarToday } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import EmployeeBoxesModal from "@/components/features/employees/modals/EmployeeBoxesModal";
import Pagination from "@/components/ui/Pagination";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	DataTable,
	DataTableBody,
	DataTableCell,
	DataTableHeader,
	DataTableHeaderCell,
	DataTableRow,
} from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";

import { showError, showSuccess } from "@/components/ui/toast";
import { getContextualErrorMessage } from "@/lib/errors";
import { COUNTRIES } from "@/components/ui/phone-dropdown";
import AddEmployeeModal, {
	type EmployeeFormData,
} from "@/components/features/employees/modals/AddEmployeeModal";
import SuspendEmployeeModal from "@/components/features/employees/modals/SuspendEmployeeModal";
import DeleteEmployeeModal from "@/components/features/employees/modals/DeleteEmployeeModal";
import ReactivateEmployeeModal from "@/components/features/employees/modals/ReactivateEmployeeModal";
import employeeService from "@/services/employees";
import employeeLogsService from "@/services/employeeLogs";
import type {
	ApiEmployeeLog,
	EmployeeLogsDropdownData,
	EmployeeLogsListRequest,
} from "@/types/domain/employee-logs";
import type { Employee } from "@/types/domain/employees";
import {
	SystemLogsTable,
	type SystemLogRow,
} from "@/components/ui/system-logs-table";

const PAGE_SIZE = 10;
const MIN_SKELETON_DURATION_MS = 250;
const OPTION_KEY_SEPARATOR = "::";
const EMPLOYEE_LOG_API_CATEGORY = "Employee";

function formatCategoryLabel(category: string): string {
	return category
		.split("_")
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

interface LogCategoryOption {
	id: string;
	label: string;
}

interface AdvancedFilterGroup {
	id: string;
	categoryId: string;
	label: string;
	options: string[];
}

function areStringArraysEqual(left: string[], right: string[]): boolean {
	if (left.length !== right.length) return false;
	return left.every((item, index) => item === right[index]);
}

function toOptionKey(groupId: string, option: string): string {
	return `${groupId}${OPTION_KEY_SEPARATOR}${option}`;
}

function optionFromKey(key: string): string {
	const separatorIndex = key.indexOf(OPTION_KEY_SEPARATOR);
	if (separatorIndex === -1) return key;
	return key.slice(separatorIndex + OPTION_KEY_SEPARATOR.length);
}

function formatLogTimestamp(value: string | undefined): string {
	if (!value) return "-";

	const parsed = parseISO(value);
	if (!isValid(parsed)) return "-";

	return format(parsed, "dd MMM ''yy, HH:mm:ss");
}

function CheckboxOption({
	checked,
	onClick,
	label,
}: {
	checked: boolean;
	onClick: () => void;
	label: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex items-center gap-3 cursor-pointer"
		>
			<span
				className={`flex size-5 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
					checked
						? "border-[#7E8982] bg-[#f6f8f6]"
						: "border-[#A4ACA7] bg-white"
				}`}
			>
				{checked ? (
					<Image
						src="/Employee/Multiselect/check.svg"
						alt="Checked"
						width={16}
						height={16}
					/>
				) : null}
			</span>
			<span className="text-[16px] leading-[28px] text-[#37493F]">
				{label}
			</span>
		</button>
	);
}

function SystemLogsTableSkeleton() {
	return (
		<div className="w-full">
			<DataTable className="table-fixed">
				<DataTableHeader>
					<DataTableHeaderCell width={220}>
						Time stamp
					</DataTableHeaderCell>
					<DataTableHeaderCell width={300}>Type</DataTableHeaderCell>
					<DataTableHeaderCell>Action</DataTableHeaderCell>
				</DataTableHeader>
				<DataTableBody>
					{Array.from({ length: 8 }).map((_, index) => (
						<DataTableRow key={`employee-log-skeleton-${index}`}>
							<DataTableCell width={220} className="align-top">
								<Skeleton className="h-6 w-[170px] rounded" />
							</DataTableCell>
							<DataTableCell width={300} className="align-top">
								<div className="flex items-start gap-3">
									<Skeleton className="mt-[2px] size-6 rounded-full" />
									<div className="flex min-w-0 flex-1 flex-col gap-2">
										<Skeleton className="h-6 w-[180px] rounded" />
										<Skeleton className="h-[22px] w-[120px] rounded" />
									</div>
								</div>
							</DataTableCell>
							<DataTableCell className="align-top">
								<Skeleton className="h-6 w-[92%] rounded" />
							</DataTableCell>
						</DataTableRow>
					))}
				</DataTableBody>
			</DataTable>
		</div>
	);
}

function SystemLogsPaginationSkeleton() {
	return (
		<div className="bg-[#EFF1F0] flex justify-between items-center py-2 px-4 h-[56px] w-full">
			<Skeleton className="h-5 w-[110px] rounded" />
			<div className="flex gap-3">
				<Skeleton className="h-8 w-8 rounded-lg" />
				<Skeleton className="h-8 w-8 rounded-lg" />
			</div>
		</div>
	);
}

export default function EmployeeLogsScreen() {
	const router = useRouter();
	const [showBoxesModal, setShowBoxesModal] = useState(false);
	const searchParams = useSearchParams();
	const employeeIdFromQuery = searchParams.get("employeeId")?.trim() ?? "";
	const employeeNameFromQuery =
		searchParams.get("employeeName")?.trim() ?? "Employee";
	const employeeCodeFromQuery =
		searchParams.get("employeeCode")?.trim() ?? "";
	const employeeStatusFromQuery =
		searchParams.get("status")?.trim() ?? "";
	const employeeJoinedDateFromQuery =
		searchParams.get("joinedDate")?.trim() ?? "";
	const employeePhoneFromQuery = searchParams.get("phone")?.trim() ?? "";
	const employeeEmailFromQuery = searchParams.get("email")?.trim() ?? "";
	const employeeRoleFromQuery = searchParams.get("role")?.trim() ?? "";
	const employeeRestaurantFromQuery =
		searchParams.get("restaurantName")?.trim() ?? "";
	const employeeBoxCountFromQuery =
		searchParams.get("boxCount")?.trim() ?? "";
	const normalizedStatusFromQuery = useMemo<"Active" | "Suspended">(() => {
		return employeeStatusFromQuery.trim().toLowerCase() === "suspended"
			? "Suspended"
			: "Active";
	}, [employeeStatusFromQuery]);

	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 300);
	const [employeeStatus, setEmployeeStatus] =
		useState<"Active" | "Suspended">(normalizedStatusFromQuery);
	const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
	const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);
	const [isActivatingEmployee, setIsActivatingEmployee] = useState(false);
	const [isUpdatingEmployee, setIsUpdatingEmployee] = useState(false);
	const [isSuspendingEmployee, setIsSuspendingEmployee] = useState(false);
	const [isDeletingEmployee, setIsDeletingEmployee] = useState(false);
	const infoButtonRef = useRef<HTMLButtonElement>(null);
	const infoCardRef = useRef<HTMLDivElement>(null);
	const [infoCardStyle, setInfoCardStyle] = useState<React.CSSProperties>({
		top: 0,
		left: 0,
	});
	const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
	const [startDate, endDate] = dateRange;

	const [categoryOptions, setCategoryOptions] = useState<LogCategoryOption[]>(
		[],
	);
	const [typeMapping, setTypeMapping] = useState<Record<string, string[]>>({});
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

	const [appliedOptions, setAppliedOptions] = useState<string[]>([]);
	const [draftOptions, setDraftOptions] = useState<string[]>([]);
	const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

	const [page, setPage] = useState(1);
	const [logs, setLogs] = useState<ApiEmployeeLog[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [isDropdownsReady, setIsDropdownsReady] = useState(false);
	const isSuspendedEmployee = employeeStatus === "Suspended";

	const advancedRef = useRef<HTMLDivElement>(null);

	const advancedFilterGroups = useMemo<AdvancedFilterGroup[]>(() => {
		return categoryOptions.map((item) => ({
			id: item.id,
			categoryId: item.id,
			label: item.label,
			options: typeMapping[item.id] ?? [],
		}));
	}, [categoryOptions, typeMapping]);

	const selectedCategorySet = useMemo(
		() => new Set<string>(selectedCategories),
		[selectedCategories],
	);

	const availableGroups = useMemo(
		() =>
			advancedFilterGroups.filter((group) =>
				selectedCategorySet.has(group.categoryId),
			),
		[advancedFilterGroups, selectedCategorySet],
	);

	const availableOptionSet = useMemo(
		() =>
			new Set(
				availableGroups.flatMap((group) =>
					group.options.map((option) => toOptionKey(group.id, option)),
				),
			),
		[availableGroups],
	);

	const appliedTypesByCategory = useMemo(() => {
		const next = new Map<string, Set<string>>();

		appliedOptions.forEach((item) => {
			if (!availableOptionSet.has(item)) return;

			const separatorIndex = item.indexOf(OPTION_KEY_SEPARATOR);
			if (separatorIndex === -1) return;

			const categoryId = item.slice(0, separatorIndex);
			const optionValue = optionFromKey(item);

			const optionsForCategory = next.get(categoryId) ?? new Set<string>();
			optionsForCategory.add(optionValue);
			next.set(categoryId, optionsForCategory);
		});

		return next;
	}, [appliedOptions, availableOptionSet]);

	useEffect(() => {
		setEmployeeStatus(normalizedStatusFromQuery);
	}, [normalizedStatusFromQuery, employeeIdFromQuery]);

	useEffect(() => {
		const onOutsideClick = (event: MouseEvent) => {
			const target = event.target as Node;

			if (advancedRef.current && !advancedRef.current.contains(target)) {
				setIsAdvancedOpen(false);
			}
		};

		document.addEventListener("mousedown", onOutsideClick);
		return () => document.removeEventListener("mousedown", onOutsideClick);
	}, []);

	const updateInfoCardPosition = useCallback(() => {
		if (!infoButtonRef.current) return;

		const triggerRect = infoButtonRef.current.getBoundingClientRect();
		const viewportWidth = window.innerWidth;
		const cardWidth = Math.min(540, viewportWidth - 32);
		const cardHeight = infoCardRef.current?.offsetHeight ?? 440;
		const viewportHeight = window.innerHeight;

		const top = Math.min(
			Math.max(16, triggerRect.bottom + 10),
			Math.max(16, viewportHeight - cardHeight - 16),
		);
		const maxLeft = Math.max(16, viewportWidth - cardWidth - 16);
		const left = Math.min(Math.max(16, triggerRect.left), maxLeft);

		setInfoCardStyle({ top, left, width: cardWidth });
	}, []);

	useEffect(() => {
		if (!isInfoModalOpen) return;

		updateInfoCardPosition();
		const rafId = window.requestAnimationFrame(updateInfoCardPosition);

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setIsInfoModalOpen(false);
		};

		const handleOutsideClick = (event: MouseEvent) => {
			const target = event.target as Node;
			if (
				!infoCardRef.current?.contains(target) &&
				!infoButtonRef.current?.contains(target)
			) {
				setIsInfoModalOpen(false);
			}
		};

		const handleReposition = () => updateInfoCardPosition();

		document.addEventListener("keydown", handleEscape);
		document.addEventListener("mousedown", handleOutsideClick);
		window.addEventListener("resize", handleReposition);
		window.addEventListener("scroll", handleReposition, true);

		return () => {
			window.cancelAnimationFrame(rafId);
			document.removeEventListener("keydown", handleEscape);
			document.removeEventListener("mousedown", handleOutsideClick);
			window.removeEventListener("resize", handleReposition);
			window.removeEventListener("scroll", handleReposition, true);
		};
	}, [isInfoModalOpen, updateInfoCardPosition]);

	useEffect(() => {
		setAppliedOptions((prev) => {
			const next = prev.filter((item) => availableOptionSet.has(item));
			return areStringArraysEqual(prev, next) ? prev : next;
		});
		setDraftOptions((prev) => {
			const next = prev.filter((item) => availableOptionSet.has(item));
			return areStringArraysEqual(prev, next) ? prev : next;
		});
	}, [availableOptionSet]);

	useEffect(() => {
		let isMounted = true;

		const fetchDropdowns = async () => {
			const response = await employeeLogsService.getDropdowns();
			if (!isMounted) return;

			if (!response.success || !response.data) {
				setIsDropdownsReady(true);
				return;
			}

			const dropdownData = response.data as EmployeeLogsDropdownData;

			const nextCategories = dropdownData.categories.map((category: string) => ({
				id: category,
				label: formatCategoryLabel(category),
			}));

			setCategoryOptions(nextCategories);
			setTypeMapping(dropdownData.mapping ?? {});
			setSelectedCategories(() => {
				return nextCategories.map((option: LogCategoryOption) => option.id);
			});
			setIsDropdownsReady(true);
		};

		void fetchDropdowns();

		return () => {
			isMounted = false;
		};
	}, []);

	const selectedCategoryFilters = useMemo(() => {
		if (selectedCategories.length === 0) return undefined;

		const mergedTypeSet = new Set<string>();

		selectedCategories.forEach((category) => {
			const selectedTypesForCategory = appliedTypesByCategory.get(category);
			const allowedTypes = new Set(typeMapping[category] ?? []);
			const mappedTypes = selectedTypesForCategory
				? [...selectedTypesForCategory].filter(
						(item) =>
							allowedTypes.size === 0 || allowedTypes.has(item),
					)
				: [];

			mappedTypes.forEach((type) => mergedTypeSet.add(type));
		});

		const mergedTypes = [...mergedTypeSet];

		if (mergedTypes.length === 0) {
			return [{ category: EMPLOYEE_LOG_API_CATEGORY }];
		}

		return [{
			category: EMPLOYEE_LOG_API_CATEGORY,
			types: mergedTypes,
		}];
	}, [appliedTypesByCategory, selectedCategories, typeMapping]);

	const queryParams = useMemo<EmployeeLogsListRequest>(() => {
		const searchQuery = debouncedSearch.trim();
		const startIso = startDate ? startOfDay(startDate).toISOString() : undefined;
		const endIso = endDate ? endOfDay(endDate).toISOString() : startDate ? endOfDay(startDate).toISOString() : undefined;

		return {
			limit: PAGE_SIZE,
			page,
			filters: selectedCategoryFilters,
			search: searchQuery || undefined,
			start_date: startIso,
			end_date: endIso,
			subject_id: employeeIdFromQuery || undefined,
		};
	}, [
		startDate,
		endDate,
		debouncedSearch,
		employeeIdFromQuery,
		page,
		selectedCategoryFilters,
	]);

	useEffect(() => {
		if (!isDropdownsReady) return;

		let isActive = true;
		let loadingTimer: ReturnType<typeof setTimeout> | null = null;

		const fetchLogs = async () => {
			const requestStartedAt = Date.now();
			setIsLoading(true);
			setLoadError(null);

			const response = await employeeLogsService.getList(queryParams);
			if (!isActive) return;

			if (response.success && response.data) {
				const nextLogs = response.data.logs ?? [];
				setLogs(nextLogs);
				setTotalCount(
					typeof response.data.total === "number"
						? response.data.total
						: nextLogs.length,
				);
			} else {
				setLogs([]);
				setTotalCount(0);
				setLoadError(
					getContextualErrorMessage(
						"logs.load",
						response,
						"Unable to load logs right now. Please refresh and try again.",
					),
				);
			}

			const elapsed = Date.now() - requestStartedAt;
			const remainingDelay = Math.max(
				0,
				MIN_SKELETON_DURATION_MS - elapsed,
			);

			if (remainingDelay > 0) {
				loadingTimer = setTimeout(() => {
					if (isActive) setIsLoading(false);
				}, remainingDelay);
			} else {
				setIsLoading(false);
			}
		};

		void fetchLogs();

		return () => {
			isActive = false;
			if (loadingTimer) clearTimeout(loadingTimer);
		};
	}, [isDropdownsReady, queryParams]);

	const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

	useEffect(() => {
		setPage(1);
	}, [startDate, endDate, appliedOptions, debouncedSearch]);

	useEffect(() => {
		if (page > pageCount) setPage(pageCount);
	}, [page, pageCount]);

	const tableRows = useMemo<SystemLogRow[]>(() => {
		return logs.map((item) => ({
			id: item.id,
			timestamp: formatLogTimestamp(item.createdAt ?? item.created_at),
			type: item.category,
			subtype: item.type,
			action: item.description?.replace(/\[([^\]]+?), [^\]]+\]/g, (_m, name) => name.trim()),
			category: item.category,
		}));
	}, [logs]);

	const entriesCount = totalCount.toLocaleString("en-US");
	const parsedBoxCount = Number(employeeBoxCountFromQuery);
	const permittedBoxesLabel = Number.isFinite(parsedBoxCount)
		? `${parsedBoxCount} GrubPacs`
		: "-";
	const normalizedEmployeeRole = useMemo<"Manager" | "Driver" | null>(() => {
		const raw = employeeRoleFromQuery.trim().toLowerCase();
		if (raw === "manager") return "Manager";
		if (raw === "driver" || raw === "delivery") return "Driver";
		return null;
	}, [employeeRoleFromQuery]);

	const employeeStatusLabel = useMemo(() => {
		if (employeeStatus === "Active" && normalizedEmployeeRole) {
			return `Active as ${normalizedEmployeeRole}`;
		}

		return employeeStatus;
	}, [employeeStatus, normalizedEmployeeRole]);

	const employeeDetails = useMemo(
		() => ({
			name: employeeNameFromQuery,
			employeeId: employeeCodeFromQuery || employeeIdFromQuery,
			status: employeeStatusLabel,
			joinedDate: employeeJoinedDateFromQuery || undefined,
			phone: employeePhoneFromQuery || undefined,
			email: employeeEmailFromQuery || undefined,
			role: normalizedEmployeeRole ?? undefined,
			restaurantName: employeeRestaurantFromQuery || undefined,
		}),
		[
			employeeCodeFromQuery,
			employeeEmailFromQuery,
			employeeIdFromQuery,
			employeeJoinedDateFromQuery,
			employeeNameFromQuery,
			employeePhoneFromQuery,
			employeeRestaurantFromQuery,
			employeeStatusLabel,
			normalizedEmployeeRole,
		],
	);

	const editableEmployee = useMemo<Employee | null>(() => {
		if (!employeeIdFromQuery) return null;

		const normalizedRole = (() => {
			const raw = employeeRoleFromQuery.trim().toLowerCase();
			if (raw === "delivery" || raw === "driver") return "Driver";
			if (raw === "manager") return "Manager";
			return "Driver";
		})();

		const phoneDigits = employeePhoneFromQuery.replace(/\D/g, "");
		const countryDialCodeMatch = employeePhoneFromQuery.match(/^\+\d{1,3}/);

		return {
			id: employeeIdFromQuery,
			name: employeeNameFromQuery,
			employeeId: employeeCodeFromQuery || employeeIdFromQuery,
			joinedDate: employeeJoinedDateFromQuery,
			phone: employeePhoneFromQuery,
			countryDialCode: countryDialCodeMatch?.[0],
			mobileNumber: phoneDigits ? phoneDigits.slice(-10) : "",
			email: employeeEmailFromQuery,
			role: normalizedRole,
			boxCount: Number.isFinite(parsedBoxCount) ? parsedBoxCount : 0,
			added: "-",
			restaurantName: employeeRestaurantFromQuery || undefined,
			status: employeeStatus,
		};
	}, [
		employeeCodeFromQuery,
		employeeEmailFromQuery,
		employeeIdFromQuery,
		employeeJoinedDateFromQuery,
		employeeNameFromQuery,
		employeePhoneFromQuery,
		employeeRestaurantFromQuery,
		employeeRoleFromQuery,
		employeeStatus,
		parsedBoxCount,
	]);

	const hasRestaurantAssignment = Boolean(employeeRestaurantFromQuery);

	const openActivateConfirmation = () => {
		setIsActionsMenuOpen(false);
		setIsInfoModalOpen(false);
		setIsReactivateModalOpen(true);
	};

	const handleActivateEmployee = async (reassignBackToRestaurants: boolean) => {
		if (!editableEmployee) {
			showError("Employee details are unavailable.");
			return;
		}

		setIsActivatingEmployee(true);
		try {
			const response = await employeeService.reactivate(
				[editableEmployee.id],
				reassignBackToRestaurants,
			);

			if (response.success) {
				showSuccess("Activated", "Employee activated successfully.");
				setEmployeeStatus("Active");
				setIsActionsMenuOpen(false);
				setIsReactivateModalOpen(false);
				return;
			}

			showError(
				getContextualErrorMessage(
					"employee.activate",
					response,
					"Could not activate employee. Please try again.",
				),
			);
		} catch (error) {
			showError(
				getContextualErrorMessage(
					"employee.activate",
					error,
					"Could not activate employee. Please try again.",
				),
			);
		} finally {
			setIsActivatingEmployee(false);
		}
	};

	const handleEditSubmit = async (data: EmployeeFormData) => {
		if (!editableEmployee) {
			showError("Employee details are unavailable.");
			return;
		}

		setIsUpdatingEmployee(true);
		try {
			const dialCode =
				COUNTRIES.find((country) => country.code === data.countryCode)
					?.dialCode ?? data.countryCode;

			const response = await employeeService.update({
				id: editableEmployee.id,
				email: data.email,
				first_name: data.firstName.trim(),
				last_name: data.lastName.trim(),
				country_code: dialCode,
				mobile_number: data.contact,
				employee_id: data.employeeId,
				role: data.role as "manager" | "delivery",
				restaurant_id: data.assignedRestaurant || null,
				joining_date: data.joiningDate,
			});

			if (response.success) {
				showSuccess("Updated", "Employee details updated successfully.");
				setIsEditModalOpen(false);
				return;
			}

			showError(
				getContextualErrorMessage(
					"employee.update",
					response,
					"Could not update employee. Please try again.",
				),
			);
		} catch (error) {
			showError(
				getContextualErrorMessage(
					"employee.update",
					error,
					"Could not update employee. Please try again.",
				),
			);
		} finally {
			setIsUpdatingEmployee(false);
		}
	};

	const handleSuspendConfirm = async () => {
		if (!editableEmployee) {
			showError("Employee details are unavailable.");
			return;
		}

		setIsSuspendingEmployee(true);
		try {
			const response = await employeeService.suspend([editableEmployee.id]);
			if (response.success) {
				showSuccess("Suspended", "Employee suspended successfully.");
				setIsSuspendModalOpen(false);
				return;
			}

			showError(
				getContextualErrorMessage(
					"employee.suspend",
					response,
					"Could not suspend employee. Please try again.",
				),
			);
		} catch (error) {
			showError(
				getContextualErrorMessage(
					"employee.suspend",
					error,
					"Could not suspend employee. Please try again.",
				),
			);
		} finally {
			setIsSuspendingEmployee(false);
		}
	};

	const handleDeleteConfirm = async () => {
		if (!editableEmployee) {
			showError("Employee details are unavailable.");
			return;
		}

		setIsDeletingEmployee(true);
		try {
			const response = await employeeService.delete([editableEmployee.id]);
			if (response.success) {
				showSuccess("Removed", "Employee removed successfully.");
				setIsDeleteModalOpen(false);
				router.push("/employees/list");
				return;
			}

			showError(
				getContextualErrorMessage(
					"employee.delete",
					response,
					"Could not delete employee. Please try again.",
				),
			);
		} catch (error) {
			showError(
				getContextualErrorMessage(
					"employee.delete",
					error,
					"Could not delete employee. Please try again.",
				),
			);
		} finally {
			setIsDeletingEmployee(false);
		}
	};

	const toggleDraftOption = (groupId: string, option: string) => {
		const optionKey = toOptionKey(groupId, option);

		setDraftOptions((prev) => {
			if (prev.includes(optionKey)) {
				return prev.filter((item) => item !== optionKey);
			}
			return [...prev, optionKey];
		});
	};

	const toggleGroupOptions = (groupId: string) => {
		const group = availableGroups.find((item) => item.id === groupId);
		if (!group) return;

		const groupOptionKeys = group.options.map((option) =>
			toOptionKey(group.id, option),
		);
		const allSelected = groupOptionKeys.every((item) =>
			draftOptions.includes(item),
		);

		setDraftOptions((prev) => {
			const next = new Set(prev);

			if (allSelected) {
				groupOptionKeys.forEach((item) => next.delete(item));
			} else {
				groupOptionKeys.forEach((item) => next.add(item));
			}

			return [...next];
		});
	};

	const applyAdvancedFilters = () => {
		setAppliedOptions(
			draftOptions.filter((item) => availableOptionSet.has(item)),
		);
		setIsAdvancedOpen(false);
	};

	const cancelAdvancedFilters = () => {
		setDraftOptions(
			appliedOptions.filter((item) => availableOptionSet.has(item)),
		);
		setIsAdvancedOpen(false);
	};

	const hasDraftAdvancedFilters = draftOptions.some((item) =>
		availableOptionSet.has(item),
	);

	const handleGoBack = () => {
		if (window.history.length > 1) {
			router.back();
			return;
		}
		router.push("/employees");
	};

	return (
		<div className="w-full h-screen overflow-hidden bg-white">
			<div className="p-4 border-b border-[#E0E3E1] shrink-0">
				<button
					type="button"
					onClick={handleGoBack}
					className="flex items-center gap-2 h-8 px-3 border border-[#6B7971] rounded-lg text-xs font-semibold text-[#6B7971] uppercase tracking-wide hover:bg-[#F7F8F7] transition-colors cursor-pointer"
				>
					<Image
						src="/Employee/arrow-narrow-left.svg"
						alt="Go back"
						width={16}
						height={16}
					/>
					GO BACK
				</button>
			</div>

			<div className="flex h-[calc(100vh-65px)] flex-col gap-6 px-6 py-6 overflow-y-auto">
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-center gap-2 min-w-0">
						<button
							ref={infoButtonRef}
							type="button"
							onClick={() => {
								setIsInfoModalOpen((prev) => !prev);
								updateInfoCardPosition();
							}}
							className={`size-9 shrink-0 rounded-[8px] p-2 transition-colors ${
								isInfoModalOpen
									? "bg-[#EFF1F0] shadow-[0_0_0_2px_rgba(121,134,126,0.40)]"
									: "hover:bg-[#F7F8F7]"
							}`}
							aria-label="Open employee details"
							aria-pressed={isInfoModalOpen}
						>
							<Image
								src="/Employee/information-circle.svg"
								alt="Employee details"
								width={20}
								height={20}
							/>
						</button>
						<h1 className="font-[var(--gp-font-heading)] font-semibold text-2xl leading-8 text-[#03130A] truncate">
							{employeeNameFromQuery}
						</h1>
					</div>

					<div className="flex items-center gap-3 shrink-0">
						<div
							className={`flex items-center gap-2 rounded-full border bg-white px-3 py-2 ${
								isSuspendedEmployee ? "border-[#C1C7C4]" : "border-[#FFD9CC]"
							}`}
						>
							<Image
								src={
									isSuspendedEmployee
										? "/Employee/Table/Grouped/Employee/Table/Default/Table/Row/Table/Cell/Assigned/box-gray.svg"
										: "/Employee/Assigned/Box.svg"
								}
								alt={isSuspendedEmployee ? "Not connected" : "Connected"}
								width={16}
								height={16}
							/>
							<span className="text-[14px] leading-[22px] text-[#37493F]">
								{isSuspendedEmployee ? "Not connected" : "Connected"}
							</span>
						</div>
						<DropdownMenu
							open={isActionsMenuOpen}
							onOpenChange={setIsActionsMenuOpen}
						>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									className={`size-9 rounded-[8px] p-2 transition-colors ${
										isActionsMenuOpen
											? "bg-[#EFF1F0] shadow-[0_0_0_2px_rgba(121,134,126,0.40)]"
											: "hover:bg-[#F7F8F7]"
									}`}
									aria-label="More actions"
									aria-pressed={isActionsMenuOpen}
								>
									<Image
										src="/Employee/dots-vertical.svg"
										alt="More actions"
										width={20}
										height={20}
									/>
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="end"
								sideOffset={8}
								className="min-w-[240px] rounded-[8px] border border-[#E0E3E1] bg-white p-0 shadow-[0_0_4px_rgba(0,0,0,0.10),4px_4px_8px_rgba(0,0,0,0.12)]"
							>
								{isSuspendedEmployee ? (
									<DropdownMenuItem
										onSelect={(event) => {
											event.preventDefault();
											openActivateConfirmation();
										}}
										disabled={isActivatingEmployee}
										className="flex cursor-pointer items-center gap-3 px-4 py-3 text-[14px] leading-[22px] text-[#37493F]"
									>
										<Image
											src="/Employee/Employee details/dropdown/Dropdown/trash.svg"
											alt="Activate employee"
											width={20}
											height={20}
										/>
										<span>Activate employee</span>
									</DropdownMenuItem>
								) : (
									<>
										<DropdownMenuItem
											onSelect={(event) => {
												event.preventDefault();
												setIsActionsMenuOpen(false);
												setIsEditModalOpen(true);
											}}
											className="flex cursor-pointer items-center gap-3 px-4 py-3 text-[14px] leading-[22px] text-[#37493F]"
										>
											<Image
												src="/Employee/Employee details/dropdown/Dropdown/pen-line.svg"
												alt="Edit employee"
												width={20}
												height={20}
											/>
											<span>Edit employee details</span>
										</DropdownMenuItem>
										<DropdownMenuItem
											onSelect={(event) => {
												event.preventDefault();
												setIsActionsMenuOpen(false);
												setIsSuspendModalOpen(true);
											}}
											className="flex cursor-pointer items-center gap-3 border-t border-[#E0E3E1] px-4 py-3 text-[14px] leading-[22px] text-[#37493F]"
										>
											<Image
												src="/Employee/Employee details/dropdown/Dropdown/x-circle.svg"
												alt="Suspend employee"
												width={20}
												height={20}
											/>
											<span>Suspend employee</span>
										</DropdownMenuItem>
										<DropdownMenuItem
											onSelect={(event) => {
												event.preventDefault();
												setIsActionsMenuOpen(false);
												setIsDeleteModalOpen(true);
											}}
											className="flex cursor-pointer items-center gap-3 border-t border-[#E0E3E1] px-4 py-3 text-[14px] leading-[22px] text-[#37493F]"
										>
											<Image
												src="/Employee/Employee details/dropdown/Dropdown/trash.svg"
												alt="Delete employee"
												width={20}
												height={20}
											/>
											<span>Delete employee</span>
										</DropdownMenuItem>
									</>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
					<SearchInput
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						onClear={() => setSearch("")}
						placeholder="Search logs"
						className="w-full lg:w-[240px]"
					/>

					<div className="flex w-full flex-wrap items-center gap-3 lg:justify-end lg:gap-4">
						<div className="flex h-5 w-[96px] items-center">
							{isLoading ? (
								<Skeleton className="h-5 w-[96px] rounded" />
							) : (
								<span className="text-[14px] leading-[20px] text-[#6B7971]">
									{`${entriesCount} entries`}
								</span>
							)}
						</div>

						<div className="relative">
							<DatePicker
								selectsRange
								startDate={startDate}
								endDate={endDate}
								onChange={(update: [Date | null, Date | null]) => setDateRange(update)}
								placeholderText="Date range"
								className="pr-10 !w-44 !h-8 cursor-pointer !rounded-lg border border-[#A4ACA7] text-[#37493F] px-3 text-sm outline-none"
								dateFormat="dd MMM yy"
								maxDate={new Date()}
							/>
							{startDate ? (
								<RxCross2
									className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FE5720]"
									onClick={() => setDateRange([null, null])}
								/>
							) : (
								<MdCalendarToday className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FE5720] pointer-events-none" />
							)}
						</div>

						<div ref={advancedRef} className="relative">
							<button
								type="button"
								onClick={() => {
									setDraftOptions(
										appliedOptions.filter((item) =>
											availableOptionSet.has(item),
										),
									);
									setIsAdvancedOpen((prev) => !prev);
								}}
								className={`flex h-8 items-center gap-2 rounded-lg border px-3 text-[14px] font-medium uppercase leading-[16px] cursor-pointer ${
									isAdvancedOpen
										? "border-[#FE5720] bg-white text-[#CB3301] shadow-[0_0_0_2px_rgba(254,87,32,0.4)]"
										: "border-[#6B7971] bg-white text-[#6B7971]"
								}`}
							>
								<Image
									src={
										isAdvancedOpen
											? "/Logs/filter-brand.svg"
											: "/Employee/Section filter/Filter/filter.svg"
									}
									alt="Filter"
									width={16}
									height={16}
									className="shrink-0"
								/>
								Filter
							</button>

							{isAdvancedOpen ? (
								<div className="absolute right-0 top-full z-40 mt-2 w-[600px] max-w-[calc(100vw-48px)] overflow-hidden rounded-xl border border-[#E0E3E1] bg-white shadow-[0_0_4px_rgba(0,0,0,0.10),4px_4px_8px_rgba(0,0,0,0.12)]">
									<div className="max-h-[440px] overflow-y-auto">
										{availableGroups.map((group, index) => {
											const allChecked =
												group.options.every((item) =>
													draftOptions.includes(
														toOptionKey(group.id, item),
													),
												);

											return (
												<div
													key={group.id}
													className={`px-6 py-4 ${
														index > 0
															? "border-t border-[#E0E3E1]"
															: ""
													}`}
												>
													<p className="mb-3 text-[14px] leading-[22px] text-[#37493F]">
														{group.label}
													</p>
													<div className="mb-3">
														<CheckboxOption
															checked={allChecked}
															onClick={() =>
																toggleGroupOptions(group.id)
															}
															label="All selected"
														/>
													</div>
													<div className="grid grid-cols-3 gap-x-6 gap-y-3">
														{group.options.map((item) => (
															<CheckboxOption
																key={`${group.id}-${item}`}
																checked={draftOptions.includes(
																	toOptionKey(group.id, item),
																)}
																onClick={() =>
																	toggleDraftOption(group.id, item)
																}
																label={item}
															/>
														))}
													</div>
												</div>
											);
										})}
									</div>

									<div className="flex items-center justify-between border-t border-[#E0E3E1] px-6 py-3">
										<button
											type="button"
											onClick={cancelAdvancedFilters}
											className="text-[14px] font-medium uppercase leading-4 text-[#6B7971] cursor-pointer"
										>
											Cancel
										</button>
										<button
											type="button"
											onClick={applyAdvancedFilters}
											disabled={!hasDraftAdvancedFilters}
											className={`flex h-10 items-center gap-2 rounded-[12px] border px-4 text-[14px] font-medium uppercase leading-4 ${
												hasDraftAdvancedFilters
													? "border-[#FE5720] text-[#FE5720] cursor-pointer"
													: "border-[#C5CBC8] text-[#A4ACA7] cursor-not-allowed"
											}`}
										>
											<Image
												src="/Employee/Multiselect/check.svg"
												alt="Apply"
												width={16}
												height={16}
											/>
											Filter logs
										</button>
									</div>
								</div>
							) : null}
						</div>
					</div>
				</div>

				{isLoading ? (
					<SystemLogsPaginationSkeleton />
				) : (
					<Pagination
						currentPage={page}
						pageSize={PAGE_SIZE}
						totalItems={totalCount}
						onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
						onNext={() =>
							setPage((prev) => Math.min(pageCount, prev + 1))
						}
						className="w-full"
					/>
				)}

				{isLoading ? (
					<SystemLogsTableSkeleton />
				) : (
					<SystemLogsTable
						data={tableRows}
						columns={["timestamp", "type", "action"]}
						emptyStateText={
							loadError ?? "No logs match the selected filters."
						}
					/>
				)}

				{isInfoModalOpen
					? createPortal(
							<>
								<div className="fixed inset-0 z-[130] bg-[#03130A]/8" />
								<div
									ref={infoCardRef}
										className="fixed z-[131] overflow-hidden rounded-[8px] border border-[#E0E3E1] bg-white shadow-[0_0_4px_rgba(0,0,0,0.10),4px_4px_8px_rgba(0,0,0,0.12)]"
									style={infoCardStyle}
								>
										<div className="px-6 py-6 text-[#37493F]">
											<div className="space-y-3 text-[16px] leading-6">
												<div className="grid min-h-12 grid-cols-[140px_1fr] items-center gap-4">
												<span>Status :</span>
													<div className="flex min-h-12 items-center rounded-[8px] px-4 py-3">
														<span>{employeeDetails.status ?? "-"}</span>
													</div>
											</div>
												<div className="grid min-h-12 grid-cols-[140px_1fr] items-center gap-4">
												<span>Employee ID :</span>
													<div className="flex min-h-12 items-center rounded-[8px] px-4 py-3">
														<span>{employeeDetails.employeeId || "-"}</span>
													</div>
											</div>
												<div className="grid min-h-12 grid-cols-[140px_1fr] items-center gap-4">
												<span>Joining date :</span>
													<div className="flex min-h-12 items-center rounded-[8px] px-4 py-3">
														<span>{employeeDetails.joinedDate ?? "-"}</span>
													</div>
											</div>
												<div className="grid grid-cols-[140px_1fr] items-start gap-4">
												<span>Contact details :</span>
													<div>
														<div className="flex min-h-12 items-center rounded-[8px] px-4 py-3">
															<span>{employeeDetails.email ?? "-"}</span>
														</div>
														<div className="flex min-h-12 items-center rounded-[8px] px-4 py-3">
															<span>{employeeDetails.phone ?? "-"}</span>
														</div>
												</div>
											</div>
												<div className="grid min-h-12 grid-cols-[140px_1fr] items-center gap-4">
												<span>Restaurant :</span>
													<div className="flex min-h-12 items-center rounded-[8px] px-4 py-3">
														<span>{employeeDetails.restaurantName ?? "-"}</span>
													</div>
											</div>
												<div className="grid min-h-12 grid-cols-[140px_1fr] items-center gap-4">
												<span>Permitted boxes :</span>
													<div className="flex min-h-12 items-center justify-between gap-4 rounded-[8px] px-4 py-3">
													<span>{permittedBoxesLabel}</span>
													<button
														type="button"
														 onClick={() => {
    setIsInfoModalOpen(false);
    setShowBoxesModal(true);
  }}
															className="inline-flex items-center gap-1 rounded-[4px] p-[2px] text-[16px] leading-5 font-medium uppercase text-[#6B7971]"
													>
															View list
															<Image
																src="/Employee/Popup/chevron-right.svg"
																alt="View list"
																width={20}
																height={20}
															/>
													</button>
												</div>
											</div>
										</div>

											<div className="mt-3 border-t border-[#E0E3E1] pt-6">
											{isSuspendedEmployee ? (
												<button
													type="button"
													onClick={() => {
														openActivateConfirmation();
													}}
													disabled={isActivatingEmployee}
													className="flex h-14 w-full items-center justify-center gap-3 rounded-[8px] border border-[#FE480B] px-6 py-3 text-[20px] leading-8 font-medium uppercase text-[#FE480B]"
												>
													Activate account
												</button>
											) : (
												<button
													type="button"
													onClick={() => {
														setIsInfoModalOpen(false);
														setIsEditModalOpen(true);
													}}
													className="flex h-14 w-full items-center justify-center gap-3 rounded-[8px] border border-[#FE480B] px-6 py-3 text-[20px] leading-8 font-medium uppercase text-[#FE480B]"
												>
													<Image
														src="/Employee/Popup/pen.svg"
														alt="Edit details"
														width={24}
														height={24}
													/>
													Edit details
												</button>
											)}
											<button
												type="button"
												onClick={() => {
													setIsInfoModalOpen(false);
													setIsDeleteModalOpen(true);
												}}
												className="mt-4 w-full text-center text-[20px] leading-8 font-medium uppercase text-[#6B7971]"
											>
												Delete account
											</button>
										</div>
									</div>
								</div>
							</>,
							document.body,
						)
					: null}

				<AddEmployeeModal
					open={isEditModalOpen}
					onClose={() => setIsEditModalOpen(false)}
					onSubmit={handleEditSubmit}
					loading={isUpdatingEmployee}
					employee={editableEmployee}
				/>

				<SuspendEmployeeModal
					open={isSuspendModalOpen}
					onClose={() => setIsSuspendModalOpen(false)}
					onConfirm={handleSuspendConfirm}
					employeeName={employeeNameFromQuery || "Employee"}
					employeeCount={1}
					loading={isSuspendingEmployee}
				/>

				<DeleteEmployeeModal
					open={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					onConfirm={handleDeleteConfirm}
					onSuspend={() => {
						setIsDeleteModalOpen(false);
						setIsSuspendModalOpen(true);
					}}
					employeeName={employeeNameFromQuery || "Employee"}
					employeeCount={1}
					loading={isDeletingEmployee}
				/>

				<ReactivateEmployeeModal
					open={isReactivateModalOpen}
					onClose={() => setIsReactivateModalOpen(false)}
					onReassign={
						hasRestaurantAssignment
							? () => void handleActivateEmployee(true)
							: undefined
					}
					onActivate={() => void handleActivateEmployee(false)}
					employeeNames={[employeeNameFromQuery || "Employee"]}
					hasRestaurantAssignment={hasRestaurantAssignment}
					loading={isActivatingEmployee}
				/>

				<EmployeeBoxesModal
  open={showBoxesModal}
  onClose={() => setShowBoxesModal(false)}
  employeeId={employeeIdFromQuery}
  employeeName={employeeNameFromQuery}
  onEditList={() => {}}
/>
			</div>
		</div>
	);
}
