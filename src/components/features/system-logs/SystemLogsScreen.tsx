"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { format, isValid, parseISO } from "date-fns";
import { useDebounce } from "@/lib/hooks";
import SearchInput from "@/components/ui/SearchInput";
import Pagination from "@/components/ui/Pagination";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHeader,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import logsService from "../../../services/logs";
import type {
  ApiSystemLog,
  SystemLogsListRequest,
} from "@/types/domain/system-logs";
import {
  SystemLogsTable,
  type SystemLogRow,
} from "@/components/ui/system-logs-table";
import { getContextualErrorMessage } from "@/lib/errors";
import { MdCalendarToday } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PAGE_SIZE = 50;
const MIN_SKELETON_DURATION_MS = 250;
const OPTION_KEY_SEPARATOR = "::";

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

function categoryTriggerLabel(selected: string[], options: LogCategoryOption[]): string {
  if (selected.length === options.length) return "All categories";
  if (selected.length === 0) return "All categories";

  const labels = options
    .filter((item) => selected.includes(item.id))
    .map((item) => item.label);

  if (labels.length === 1) return labels[0];
  return `${labels[0]} (+${labels.length - 1})`;
}

function CheckboxOption({
  checked,
  onClick,
  label,
  orange = false,
}: {
  checked: boolean;
  onClick: () => void;
  label: string;
  orange?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-3 cursor-pointer">
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
          checked
            ? orange
              ? "border-[#FE5720] bg-[#FE5720]"
              : "border-[#7E8982] bg-[#7E8982]"
            : "border-[#A4ACA7] bg-white"
        }`}
      >
        {checked ? (
          <Image
            src="/Employee/Table/Default/Table/Row/Table/Cell/check.svg"
            alt="Checked"
            width={16}
            height={16}
          />
        ) : null}
      </span>
      <span className="text-[16px] leading-[28px] text-[#37493F]">{label}</span>
    </button>
  );
}

function SystemLogsTableSkeleton() {
  return (
    <div className="w-full">
      <DataTable className="table-fixed">
        <DataTableHeader>
          <DataTableHeaderCell width={220}>Time stamp</DataTableHeaderCell>
          <DataTableHeaderCell width={300}>Type</DataTableHeaderCell>
          <DataTableHeaderCell>Action</DataTableHeaderCell>
        </DataTableHeader>
        <DataTableBody>
          {Array.from({ length: 8 }).map((_, index) => (
            <DataTableRow key={`system-log-skeleton-${index}`}>
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

export default function SystemLogsScreen() {
  const searchParams = useSearchParams();
  const employeeIdFromQuery = searchParams.get("employeeId")?.trim() ?? "";
  const employeeNameFromQuery = searchParams.get("employeeName")?.trim() ?? "";
  const shouldPreselectEmployeeCategory = employeeIdFromQuery.length > 0;

  const [search, setSearch] = useState(employeeNameFromQuery);
  const debouncedSearch = useDebounce(search, 300);

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;

  const [categoryOptions, setCategoryOptions] = useState<LogCategoryOption[]>([]);
  const [typeMapping, setTypeMapping] = useState<Record<string, string[]>>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [appliedOptions, setAppliedOptions] = useState<string[]>([]);
  const [draftOptions, setDraftOptions] = useState<string[]>([]);

  const [categorySearch, setCategorySearch] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<ApiSystemLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDropdownsReady, setIsDropdownsReady] = useState(false);

  const categoryRef = useRef<HTMLDivElement>(null);
  const advancedRef = useRef<HTMLDivElement>(null);

  const allCategoryIds = useMemo(() => categoryOptions.map((item) => item.id), [categoryOptions]);

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
    () => advancedFilterGroups.filter((group) => selectedCategorySet.has(group.categoryId)),
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
    

      const separatorIndex = item.indexOf(OPTION_KEY_SEPARATOR);
      if (separatorIndex === -1) return;

      const categoryId = item.slice(0, separatorIndex);
      const optionValue = optionFromKey(item);

      const categorySet = next.get(categoryId) ?? new Set<string>();
      categorySet.add(optionValue);
      next.set(categoryId, categorySet);
    });

    return next;
  }, [appliedOptions, availableOptionSet]);

  useEffect(() => {
    const onOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (categoryRef.current && !categoryRef.current.contains(target)) {
        setIsCategoryOpen(false);
      }
      if (advancedRef.current && !advancedRef.current.contains(target)) {
        setIsAdvancedOpen(false);
      }
    };

    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  // useEffect(() => {
  //   setAppliedOptions((prev) => {
  //     const next = prev.filter((item) => availableOptionSet.has(item));
  //     return areStringArraysEqual(prev, next) ? prev : next;
  //   });
  //   setDraftOptions((prev) => {
  //     const next = prev.filter((item) => availableOptionSet.has(item));
  //     return areStringArraysEqual(prev, next) ? prev : next;
  //   });
  // }, [availableOptionSet]);

  useEffect(() => {
    let isMounted = true;

    const fetchDropdowns = async () => {
      const response = await logsService.getDropdowns();
      if (!isMounted) return;

      if (!response.success || !response.data) {
        setIsDropdownsReady(true);
        return;
      }

      const nextCategories = response.data.categories.map((category: string) => ({
        id: category,
        label: category,
      }));

      setCategoryOptions(nextCategories);
      setTypeMapping(response.data.mapping ?? {});
      setSelectedCategories((prev) => {
        if (shouldPreselectEmployeeCategory) {
          const employeeCategory = nextCategories.find(
            (option: LogCategoryOption) => option.id.toLowerCase() === "employee",
          );

          if (employeeCategory) {
            return [employeeCategory.id];
          }
        }

        const next = prev.filter((item) =>
          nextCategories.some((option: LogCategoryOption) => option.id === item),
        );
        return areStringArraysEqual(prev, next) ? prev : next;
      });
      setIsDropdownsReady(true);
    };

    void fetchDropdowns();

    return () => {
      isMounted = false;
    };
  }, [shouldPreselectEmployeeCategory]);

  useEffect(() => {
    if (!employeeNameFromQuery) return;
    setSearch(employeeNameFromQuery);
  }, [employeeNameFromQuery]);

const selectedCategoryFilters = useMemo(() => {
  // Get all categories that have applied options
  const categoriesFromAdvanced = Array.from(
    new Set(
      appliedOptions.map((item) => item.slice(0, item.indexOf(OPTION_KEY_SEPARATOR)))
    )
  ).filter(Boolean);

  // Merge selected categories + categories from advanced filter
  const allCategories = Array.from(
    new Set([...selectedCategories, ...categoriesFromAdvanced])
  );

  if (allCategories.length === 0) return undefined;

  return allCategories.map((category) => {
    const selectedTypesForCategory = appliedTypesByCategory.get(category);
    const allowedTypes = new Set(typeMapping[category] ?? []);
    const mappedTypes = selectedTypesForCategory
      ? [...selectedTypesForCategory].filter(
          (item) => allowedTypes.size === 0 || allowedTypes.has(item),
        )
      : [];

    if (mappedTypes.length === 0) {
      return { category };
    }

    return {
      category,
      types: mappedTypes,
    };
  });
}, [appliedTypesByCategory, selectedCategories, appliedOptions, typeMapping]);

  const queryParams = useMemo<SystemLogsListRequest>(() => {
    const searchQuery = debouncedSearch.trim();
    const start = startDate ? format(startDate, "yyyy-MM-dd") : undefined;
    const end = endDate
      ? format(endDate, "yyyy-MM-dd")
      : startDate
        ? format(startDate, "yyyy-MM-dd")
        : undefined;

    return {
      limit: PAGE_SIZE,
      page,
      filters: selectedCategoryFilters,
      search: searchQuery || undefined,
      start_date: start,
      end_date: end,
      actor_id: employeeIdFromQuery || undefined,
    };
  }, [startDate, endDate, debouncedSearch, employeeIdFromQuery, page, selectedCategoryFilters]);

  useEffect(() => {
    if (!isDropdownsReady) return;

    let isActive = true;
    let loadingTimer: ReturnType<typeof setTimeout> | null = null;

    const fetchLogs = async () => {
      const requestStartedAt = Date.now();
      setIsLoading(true);
      setLoadError(null);

      const response = await logsService.getList(queryParams);
      if (!isActive) return;

      if (response.success && response.data) {
        const nextLogs = response.data.logs ?? [];
        setLogs(nextLogs);
        setTotalCount(
          typeof response.data.total === "number" ? response.data.total : nextLogs.length,
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
      const remainingDelay = Math.max(0, MIN_SKELETON_DURATION_MS - elapsed);

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
      if (loadingTimer) {
        clearTimeout(loadingTimer);
      }
    };
  }, [isDropdownsReady, queryParams]);

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [startDate, endDate, selectedCategories, appliedOptions, search]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const tableRows = useMemo<SystemLogRow[]>(() => {
    return logs.map((item) => ({
      id: item.id,
      timestamp: formatLogTimestamp(item.createdAt ?? item.created_at),
      type: item.category,
      subtype: item.type,
      action: item.description,
      category: item.category,
    }));
  }, [logs]);

  const advancedFilteredRows = tableRows;

  const entriesCount = totalCount.toLocaleString("en-US");

  const categoryLabel = categoryTriggerLabel(selectedCategories, categoryOptions);
  const allCategoriesSelected = selectedCategories.length === allCategoryIds.length;
  const partiallySelectedCategories =
    selectedCategories.length > 0 && selectedCategories.length < allCategoryIds.length;
  const filteredCategories = categoryOptions.filter((item) =>
    item.label.toLowerCase().includes(categorySearch.trim().toLowerCase()),
  );

  const toggleAllCategories = () => {
    setSelectedCategories((prev) => {
      if (prev.length === allCategoryIds.length) return [];
      return [...allCategoryIds];
    });
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      return [...prev, id];
    });
  };

  const toggleDraftOption = (groupId: string, option: string) => {
    const optionKey = toOptionKey(groupId, option);

    setDraftOptions((prev) => {
      if (prev.includes(optionKey)) return prev.filter((item) => item !== optionKey);
      return [...prev, optionKey];
    });
  };

  const toggleGroupOptions = (groupId: string) => {
    const group = availableGroups.find((item) => item.id === groupId);
    if (!group) return;

    const groupOptionKeys = group.options.map((option) => toOptionKey(group.id, option));
    const allSelected = groupOptionKeys.every((item) => draftOptions.includes(item));

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
  setAppliedOptions(draftOptions);
  setIsAdvancedOpen(false);
};

  const cancelAdvancedFilters = () => {
   setDraftOptions(appliedOptions);
    setIsAdvancedOpen(false);
  };

const hasDraftAdvancedFilters = draftOptions.length > 0;

  return (
    <div className="flex min-h-[calc(100vh-130px)] flex-col gap-6 px-4 pb-4">
      <div className="flex items-start justify-between">
        <h1 className="h-10 font-[var(--gp-font-heading)] font-semibold text-[24px] leading-[36px] text-[#03130A]">
          System logs
        </h1>
        {/* <button
          type="button"
          className="flex h-10 items-center justify-center px-4 py-2 font-[var(--gp-font-interactive)] text-[16px] font-medium uppercase leading-[20px] text-[#6B7971] cursor-pointer"
        >
          Export
        </button> */}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
        <SearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onClear={() => setSearch("")}
          placeholder="Search log"
          className="w-full lg:w-[240px]"
        />

        <div className="flex w-full flex-wrap items-center gap-3 lg:justify-end lg:gap-4">
          <div className="flex h-5 w-[96px] items-center">
            {isLoading ? (
              <Skeleton className="h-5 w-[96px] rounded" />
            ) : (
              <span className="text-[14px] leading-[20px] text-[#6B7971]">{`${entriesCount} entries`}</span>
            )}
          </div>

          {/* Date Range Picker */}
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

          {/* Category Dropdown */}
          <div ref={categoryRef} className="relative w-full sm:w-[200px]">
            <button
              type="button"
              onClick={() => setIsCategoryOpen((prev) => !prev)}
              className={`flex h-8 w-full items-center justify-between gap-3 rounded-lg border px-3 text-[14px] leading-[20px] cursor-pointer ${
                isCategoryOpen
                  ? "border-[#FE5720] bg-white text-[#37493F] shadow-[0_0_0_2px_rgba(254,87,32,0.4)]"
                  : "border-[#A4ACA7] bg-white text-[#37493F]"
              }`}
            >
              <span>{categoryLabel}</span>
              <Image
                src={isCategoryOpen ? "/Logs/chevron-up-brand.svg" : "/Logs/chevron-down-brand.svg"}
                alt="Toggle categories"
                width={16}
                height={16}
              />
            </button>

            {isCategoryOpen ? (
              <div className="absolute right-0 top-full z-40 mt-2 w-full overflow-hidden rounded-xl border border-[#E0E3E1] bg-white shadow-[0_0_4px_rgba(0,0,0,0.10),4px_4px_8px_rgba(0,0,0,0.12)]">
                <div className="p-3">
                  <div className="flex h-8 items-center gap-2 rounded-[10px] border border-[#A4ACA7] px-3">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <circle cx="7" cy="7" r="5" stroke="#A4ACA7" strokeWidth="1.5" />
                      <path
                        d="M11 11L14 14"
                        stroke="#A4ACA7"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <input
                      value={categorySearch}
                      onChange={(event) => setCategorySearch(event.target.value)}
                      placeholder="Search"
                      className="h-full w-full bg-transparent text-[14px] leading-[22px] text-[#37493F] outline-none placeholder:text-[#A4ACA7]"
                    />
                  </div>
                </div>

                <div>
                  {filteredCategories.map((item) => {
                    const checked = selectedCategorySet.has(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleCategory(item.id)}
                        className={`flex w-full items-center gap-3 border-t border-[#E0E3E1] px-4 py-3 text-left cursor-pointer ${
                          checked ? "bg-[#FFECE6]" : "bg-white"
                        }`}
                      >
                        <span
                          className={`flex size-4 shrink-0 items-center justify-center rounded-[4px] border p-[1px] ${
                            checked
                              ? "border-[#FE5720] bg-[#FE5720]"
                              : "border-[#A4ACA7] bg-white"
                          }`}
                        >
                          {checked ? (
                            <Image
                              src="/Employee/Table/Default/Table/Row/Table/Cell/check.svg"
                              alt="Checked"
                              width={12}
                              height={12}
                            />
                          ) : null}
                        </span>
                        <span className="text-[14px] leading-[22px] text-[#37493F]">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={toggleAllCategories}
                  className="flex w-full items-center gap-2 border-t border-[#A4ACA7] bg-[#EFF1F0] px-4 py-2 text-[14px] leading-[22px] text-[#37493F] cursor-pointer"
                >
                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded-[4px] border p-[1px] ${
                      allCategoriesSelected || partiallySelectedCategories
                        ? "border-[#7E8982] bg-[#7E8982]"
                        : "border-[#A4ACA7] bg-white"
                    }`}
                  >
                    {allCategoriesSelected ? (
                      <Image
                        src="/Employee/Table/Default/Table/Row/Table/Cell/check.svg"
                        alt="All selected"
                        width={12}
                        height={12}
                      />
                    ) : partiallySelectedCategories ? (
                      <Image
                        src="/Logs/minus.svg"
                        alt="Partially selected"
                        width={12}
                        height={12}
                      />
                    ) : null}
                  </span>
                  {selectedCategories.length} selected
                </button>
              </div>
            ) : null}
          </div>

          {/* Advanced Filter */}
          <div ref={advancedRef} className="relative">
        <div className="flex items-center gap-1">
  <button
    type="button"
    onClick={() => {
      setDraftOptions(appliedOptions);
      setIsAdvancedOpen((prev) => !prev);
    }}
    className={`flex h-8 items-center gap-2 rounded-lg border px-3 text-[14px] font-medium uppercase leading-[16px] cursor-pointer ${
      isAdvancedOpen || appliedOptions.length > 0
        ? "border-[#FE5720] bg-white text-[#CB3301] shadow-[0_0_0_2px_rgba(254,87,32,0.4)]"
        : "border-[#6B7971] bg-white text-[#6B7971]"
    }`}
  >
    <Image
      src={isAdvancedOpen || appliedOptions.length > 0 ? "/Logs/filter-brand.svg" : "/Logs/filter.svg"}
      alt="Filter"
      width={isAdvancedOpen || appliedOptions.length > 0 ? 16 : 14}
      height={16}
      className="shrink-0"
    />
    Advanced filter
    {appliedOptions.length > 0 && (
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#FE5720] text-white text-[10px] font-bold">
        {appliedOptions.length}
      </span>
    )}
  </button>

  {appliedOptions.length > 0 && (
    <button
      type="button"
      onClick={() => {
        setAppliedOptions([]);
        setDraftOptions([]);
      }}
      className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-[#FFECE6] cursor-pointer"
    >
      <RxCross2 className="w-4 h-4 text-[#FE5720]" />
    </button>
  )}
</div>

            {isAdvancedOpen ? (
              <div className="absolute right-0 top-full z-40 mt-2 w-[600px] max-w-[calc(100vw-48px)] overflow-hidden rounded-xl border border-[#E0E3E1] bg-white shadow-[0_0_4px_rgba(0,0,0,0.10),4px_4px_8px_rgba(0,0,0,0.12)]">
                <div className="max-h-[440px] overflow-y-auto">
              {advancedFilterGroups.map((group, index) => {
  const allChecked = group.options.every((item) =>
    draftOptions.includes(toOptionKey(group.id, item)),
  );

                    return (
                      <div
                        key={group.id}
                        className={`px-6 py-4 ${index > 0 ? "border-t border-[#E0E3E1]" : ""}`}
                      >
                        <p className="mb-3 text-[14px] leading-[22px] text-[#37493F]">
                          {group.label}
                        </p>
                        <div className="mb-3">
                          <CheckboxOption
                            checked={allChecked}
                            onClick={() => toggleGroupOptions(group.id)}
                            label="All selected"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-x-6 gap-y-3">
                          {group.options.map((item) => (
                            <CheckboxOption
                              key={`${group.id}-${item}`}
                              checked={draftOptions.includes(toOptionKey(group.id, item))}
                              onClick={() => toggleDraftOption(group.id, item)}
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
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path
                        d="M3 8L6.5 11.5L13 5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
          onNext={() => setPage((prev) => Math.min(pageCount, prev + 1))}
          className="w-full"
        />
      )}

      {isLoading ? (
        <SystemLogsTableSkeleton />
      ) : (
        <SystemLogsTable
          data={advancedFilteredRows}
          columns={["timestamp", "type", "action"]}
          emptyStateText={loadError ?? "No logs match the selected filters."}
        />
      )}
    </div>
  );
}