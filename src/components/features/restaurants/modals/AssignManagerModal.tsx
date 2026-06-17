// "use client";

// import { useState, useMemo, useEffect, useRef } from "react";
// import Modal from "@/components/ui/Modal";
// import { Button } from "@/components/ui/Button";
// import SearchInput from "@/components/ui/SearchInput";
// import CheckBox from "@/components/ui/CheckBox";
// import Pagination from "@/components/ui/Pagination";
// import { IoChevronBack } from "react-icons/io5";
// import { AddManagerTable, type AddManagerRow } from "@/components/ui/add-manager-table";
// import { useDebounce } from "@/lib/hooks/useDebounce";

// export interface Manager {
//   id: string;
//   name: string;
//   employeeId?: string;
//   joinedDate?: string;
//   phone?: string;
//   email?: string;
//   added?: string;
// }

// export interface AssignManagerModalProps {
//   open: boolean;
//   onClose: () => void;
//   onConfirm: (manager: Manager | null) => void;
//   onSearchManagers?: (query: string, page: number) => void;
//   totalManagers?: number;
//   managers?: Manager[];
//   loading?: boolean;
//   restaurantName?: string;
//   pageSize?: number;
// }

// interface ModalState {
//   searchTerm: string;
//   selectedManager: Manager | null;
//   currentPage: number;
//   hideAssigned: boolean;
//   showBack: boolean;
// }

// const initialState: ModalState = {
//   searchTerm: "",
//   selectedManager: null,
//   currentPage: 1,
//   hideAssigned: false,
//   showBack: false,
// };

// const MIN_SKELETON_DISPLAY_MS = 500;

// export default function AssignManagerModal({
//   open,
//   onClose,
//   onConfirm,
//   onSearchManagers,
//   totalManagers,
//   managers = [],
//   loading = false,
//   restaurantName,
//   pageSize = 50,
// }: AssignManagerModalProps) {
//   const [state, setState] = useState<ModalState>(initialState);
//   const [showLoadingSkeleton, setShowLoadingSkeleton] = useState(false);
//   const loadingStartedAtRef = useRef<number | null>(null);
//   const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const previousDebouncedSearchRef = useRef<string | null>(null);
//   const debouncedSearchTerm = useDebounce(state.searchTerm, 300);
//   const usesServerSearch = Boolean(onSearchManagers);

//   useEffect(() => {
//     if (!open) {
//       setState(initialState);
//       setShowLoadingSkeleton(false);
//       loadingStartedAtRef.current = null;
//       previousDebouncedSearchRef.current = null;
//       if (loadingTimerRef.current) {
//         clearTimeout(loadingTimerRef.current);
//         loadingTimerRef.current = null;
//       }
//     }
//   }, [open]);

//   useEffect(() => {
//     if (!open || !onSearchManagers) return;

//     const trimmedQuery = debouncedSearchTerm.trim();

//     // Skip the first effect run for each modal-open cycle to avoid duplicate initial fetch.
//     if (previousDebouncedSearchRef.current === null) {
//       previousDebouncedSearchRef.current = trimmedQuery;
//       return;
//     }

//     if (previousDebouncedSearchRef.current === trimmedQuery) return;

//     previousDebouncedSearchRef.current = trimmedQuery;
//     setState((prev) => ({ ...prev, currentPage: 1 }));
//     onSearchManagers(trimmedQuery, 1);
//   }, [debouncedSearchTerm, onSearchManagers, open]);

//   useEffect(() => {
//     if (loading) {
//       loadingStartedAtRef.current = Date.now();
//       if (loadingTimerRef.current) {
//         clearTimeout(loadingTimerRef.current);
//         loadingTimerRef.current = null;
//       }
//       setShowLoadingSkeleton(true);
//       return;
//     }

//     if (!showLoadingSkeleton) return;

//     const startedAt = loadingStartedAtRef.current ?? Date.now();
//     const elapsed = Date.now() - startedAt;
//     const remaining = Math.max(0, MIN_SKELETON_DISPLAY_MS - elapsed);

//     if (loadingTimerRef.current) {
//       clearTimeout(loadingTimerRef.current);
//     }

//     loadingTimerRef.current = setTimeout(() => {
//       setShowLoadingSkeleton(false);
//       loadingStartedAtRef.current = null;
//       loadingTimerRef.current = null;
//     }, remaining);

//     return () => {
//       if (loadingTimerRef.current) {
//         clearTimeout(loadingTimerRef.current);
//       }
//     };
//   }, [loading, showLoadingSkeleton]);

//   const filteredManagers = useMemo(() => {
//     if (usesServerSearch) return managers;

//     let filtered = managers;

//     if (state.searchTerm.trim()) {
//       const searchLower = state.searchTerm.toLowerCase();
//       filtered = filtered.filter(
//         (manager) =>
//           manager.name.toLowerCase().includes(searchLower) ||
//           manager.phone?.toLowerCase().includes(searchLower) ||
//           manager.email?.toLowerCase().includes(searchLower) ||
//           manager.employeeId?.toLowerCase().includes(searchLower)
//       );
//     }

//     return filtered;
//   }, [managers, state.searchTerm, state.hideAssigned, usesServerSearch]);

//   const totalItems = usesServerSearch ? (totalManagers ?? 0) : filteredManagers.length;
//   const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
//   const paginatedManagers = filteredManagers;

//   // Transform Manager data to AddManagerRow format
//   const tableData: AddManagerRow[] = useMemo(() => {
//     return paginatedManagers.map((manager) => ({
//       id: manager.id,
//       name: manager.name.length > 25 ? `${manager.name.substring(0, 25)}...` : manager.name,
//       identifier: manager.employeeId
//         ? `#${manager.employeeId}${manager.joinedDate ? ` | Joined ${manager.joinedDate}` : ''}`
//         : '',
//       contactInfo: {
//         phone: manager.phone || '',
//         email: manager.email || '',
//       },
//       added: manager.added || "Today",
//     }));
//   }, [paginatedManagers]);

//   const handleSelectManager = (row: AddManagerRow) => {
//     // Find the original manager from the row
//     const manager = paginatedManagers.find(m => m.id === row.id);
//     if (!manager) return;

//     setState((prev) => ({
//       ...prev,
//       selectedManager: prev.selectedManager?.id === manager.id ? null : manager,
//     }));
//   };

//   const handleConfirm = () => {
//     if (state.selectedManager) {
//       onConfirm(state.selectedManager);
//       setState(initialState);
//     }
//   };

//   const handleClose = () => {
//     setState(initialState);
//     onClose();
//   };

//   return (
//     <Modal
//       open={open}
//       onClose={handleClose}
//       width="w-[1020px]"
//       height="h-auto max-h-full"
//       noXPadding
//       closeOnOutsideClick={true}
//     >
//       {state.showBack && (
//         <div className="px-6 pt-6">
//           <Button
//             variant="neutral"
//             size="lg"
//             className="flex gap-2 group"
//             onClick={() => setState((prev) => ({ ...prev, showBack: false }))}
//           >
//             <IoChevronBack className="w-6 h-6 text-[var(--color-stroke-brand)]" />
//             BACK
//           </Button>
//         </div>
//       )}

//       <div
//         className="flex flex-col h-full px-6 pt-6 pb-4 min-h-[600px]"
//         onClick={(e) => e.stopPropagation()}
//         onMouseDown={(e) => e.stopPropagation()}
//       >
//         <div className="mb-4">
//           <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)] mb-2">
//             Ready to assign a manager to your restaurant?
//           </h2>
//           <p className="text-[var(--color-neutral-secondary)] font-normal text-lg">
//             Select a manager from the list. Managers suspended or already assigned to a restaurant aren&apos;t visible here.
//           </p>
//         </div>

//         <div className="flex items-center justify-between mb-4">
//           <div className="w-64">
//             <SearchInput
//               value={state.searchTerm}
//               onChange={(e) => {
//                 setState((prev) => ({ ...prev, searchTerm: e.target.value, currentPage: 1 }));
//               }}
//               placeholder="Search manager"
//               clearable={true}
//               onClear={() => setState((prev) => ({ ...prev, searchTerm: "", currentPage: 1 }))}
//             />
//           </div>
//           <div className="flex items-center gap-4">
//             <span className="text-sm text-[#99A39D] font-normal">
//               {totalItems} entries
//             </span>
//             <label className="flex items-center gap-1 text-lg text-[var(--color-neutral-secondary)] font-normal">
//               <CheckBox
//                 checked={state.hideAssigned}
//                 onChange={(e) => setState((prev) => ({ ...prev, hideAssigned: e.target.checked }))}
//               />
//               Grouped
//             </label>
//           </div>
//         </div>

//         {totalItems > 0 && (
//           <div className="mb-4">
//             <Pagination
//               currentPage={state.currentPage}
//               pageSize={pageSize}
//               totalItems={totalItems}
//               onPrev={() => {
//                 const nextPage = Math.max(1, state.currentPage - 1);
//                 if (nextPage === state.currentPage) return;
//                 setState((prev) => ({ ...prev, currentPage: nextPage }));
//                 onSearchManagers?.(state.searchTerm.trim(), nextPage);
//               }}
//               onNext={() => {
//                 const nextPage = Math.min(totalPages, state.currentPage + 1);
//                 if (nextPage === state.currentPage) return;
//                 setState((prev) => ({ ...prev, currentPage: nextPage }));
//                 onSearchManagers?.(state.searchTerm.trim(), nextPage);
//               }}
//             />
//           </div>
//         )}

//         <div className="flex-1 overflow-hidden mb-4">
//           <div className="overflow-y-auto max-h-[286px]">
//             {showLoadingSkeleton ? (
//               <div className="space-y-3 py-2">
//                 {[...Array(5)].map((_, i) => (
//                   <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
//                 ))}
//               </div>
//             ) : tableData.length === 0 ? (
//               <div className="flex items-center justify-center py-12">
//                 <div className="text-[var(--color-neutral-secondary)]">No managers found.</div>
//               </div>
//             ) : (
//               <AddManagerTable
//                 data={tableData}
//                 columns={["name", "contactInfo", "added", "actions"]}
//                 selectedId={state.selectedManager?.id || null}
//                 onSelectManager={handleSelectManager}
//               />
//             )}
//           </div>
//         </div>

//         <div className="flex items-center justify-between pt-4 border-t border-[var(--color-stroke-neutral)] mt-auto">
//           <div className="text-lg text-[var(--color-neutral-secondary)]">
//             {state.selectedManager ? (
//               <span>{state.selectedManager.name.length > 25 ? `${state.selectedManager.name.substring(0, 25)}...` : state.selectedManager.name} selected.</span>
//             ) : (
//               <span>No manager selected yet!</span>
//             )}
//           </div>
//           <Button
//             variant="primary"
//             appearance="outlined"
//             state="press"
//             size="lg"
//             disabled={!state.selectedManager}
//             onClick={handleConfirm}
//             className="w-1/2"
//           >
//             <span>CONFIRM ASSIGNMENT</span>
//           </Button>
//         </div>
//       </div>
//     </Modal>
//   );
// }




"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import CheckBox from "@/components/ui/CheckBox";
import Pagination from "@/components/ui/Pagination";
import { IoChevronBack } from "react-icons/io5";
import { AddManagerTable, type AddManagerRow } from "@/components/ui/add-manager-table";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { formatDate } from "@/lib/utils/date";

export interface Manager {
  id: string;
  name: string;
  employeeId?: string;
  joinedDate?: string;
  phone?: string;
  email?: string;
  added?: string;
}

export interface AssignManagerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (manager: Manager | null) => void;
  restaurantName?: string;
  pageSize?: number;
  role?: "manager" | "delivery";
}

interface ModalState {
  searchTerm: string;
  selectedManager: Manager | null;
  currentPage: number;
  hideAssigned: boolean;
  showBack: boolean;
}

const initialState: ModalState = {
  searchTerm: "",
  selectedManager: null,
  currentPage: 1,
  hideAssigned: false,
  showBack: false,
};

const MIN_SKELETON_DISPLAY_MS = 500;

const ROLE_LABELS: Record<string, { label: string; labelPlural: string; groupKey: string; roleFilter: string }> = {
  manager: { label: "Manager", labelPlural: "managers", groupKey: "managers", roleFilter: "manager" },
  delivery: { label: "Driver", labelPlural: "drivers", groupKey: "drivers", roleFilter: "delivery" },
};

export default function AssignManagerModal({
  open,
  onClose,
  onConfirm,
  restaurantName,
  pageSize = 50,
  role = "manager",
}: AssignManagerModalProps) {
  const [state, setState] = useState<ModalState>(initialState);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [totalManagers, setTotalManagers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showLoadingSkeleton, setShowLoadingSkeleton] = useState(false);
  const loadingStartedAtRef = useRef<number | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousDebouncedSearchRef = useRef<string | null>(null);
  const debouncedSearchTerm = useDebounce(state.searchTerm, 300);

  // ─── Fetch employees from API ────────────────────────────────────────────
const roleConfig = ROLE_LABELS[role];
const fetchManagers = useCallback(async (query: string, page: number) => {
  setLoading(true);
  try {
    const params = new URLSearchParams({
      status: "active",
      limit: String(pageSize),
      page: String(page),
      group_by: "boxes",
      role: role === "delivery" ? "delivery" : "manager",
      ...(query ? { search: query } : {}),
    });

    // ── Read auth token from cookie ──────────────────────────────
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("grubpac-auth-token="))
      ?.split("=")[1];
    // ─────────────────────────────────────────────────────────────

    const res = await fetch(`/api/proxy/delivery/employee?${params}`, {
      credentials: "include",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();

    let employeeArray: any[] = [];
    let total = 0;

    if (role === "delivery") {
      const connected = json?.data?.groups?.connected?.array ?? [];
      const disconnected = json?.data?.groups?.disconnected?.array ?? [];
      const allDrivers = [...connected, ...disconnected];
      const seen = new Set<string>();
      employeeArray = allDrivers.filter((emp: { id: string; role?: string }) => {
        if (seen.has(emp.id)) return false;
        seen.add(emp.id);
        return emp.role === "delivery";
      });
      total = json?.data?.groups?.disconnected?.pagination?.total_count ?? employeeArray.length;
    } else {
      employeeArray = json?.data?.groups?.managers?.array ?? [];
      total = json?.data?.groups?.managers?.pagination?.total_count ?? 0;
    }

    const mapped: Manager[] = employeeArray.map((emp: {
      id: string;
      first_name: string;
      last_name: string;
      employee_display_id: string;
      joining_date: string;
      country_code: string;
      mobile_number: string;
      email: string;
      created_at: string;
      role?: string;
    }) => ({
      id: emp.id,
      name: `${emp.first_name} ${emp.last_name}`,
      employeeId: emp.employee_display_id,
      joinedDate: emp.joining_date,
      phone: `${emp.country_code} ${emp.mobile_number}`,
      email: emp.email,
      added: formatDate(emp.created_at) || "Today",
    }));

    setManagers(mapped);
    setTotalManagers(total);
  } catch (err) {
    console.error("Failed to fetch employees:", err);
    setManagers([]);
    setTotalManagers(0);
  } finally {
    setLoading(false);
  }
}, [pageSize, role, roleConfig]);

  // ─── Reset + initial fetch when modal opens ────────────────────────────────
  useEffect(() => {
    if (!open) {
      setState(initialState);
      setManagers([]);
      setTotalManagers(0);
      setShowLoadingSkeleton(false);
      loadingStartedAtRef.current = null;
      previousDebouncedSearchRef.current = null;
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      return;
    }

    previousDebouncedSearchRef.current = "";
    fetchManagers("", 1);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Fetch on search term change ───────────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    const trimmedQuery = debouncedSearchTerm.trim();

    if (previousDebouncedSearchRef.current === trimmedQuery) return;

    previousDebouncedSearchRef.current = trimmedQuery;
    setState((prev) => ({ ...prev, currentPage: 1 }));
    fetchManagers(trimmedQuery, 1);
  }, [debouncedSearchTerm, open, fetchManagers]);

  // ─── Loading skeleton timer ────────────────────────────────────────────────
  useEffect(() => {
    if (loading) {
      loadingStartedAtRef.current = Date.now();
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      setShowLoadingSkeleton(true);
      return;
    }

    if (!showLoadingSkeleton) return;

    const startedAt = loadingStartedAtRef.current ?? Date.now();
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, MIN_SKELETON_DISPLAY_MS - elapsed);

    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }

    loadingTimerRef.current = setTimeout(() => {
      setShowLoadingSkeleton(false);
      loadingStartedAtRef.current = null;
      loadingTimerRef.current = null;
    }, remaining);

    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [loading, showLoadingSkeleton]);

  const totalItems = totalManagers;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // ─── Transform to table rows ───────────────────────────────────────────────
  const tableData: AddManagerRow[] = useMemo(() => {
    return managers.map((manager) => ({
      id: manager.id,
      name: manager.name.length > 25 ? `${manager.name.substring(0, 25)}...` : manager.name,
      identifier: manager.employeeId
        ? `#${manager.employeeId}${manager.joinedDate ? ` | Joined ${manager.joinedDate}` : ""}`
        : "",
      contactInfo: {
        phone: manager.phone || "",
        email: manager.email || "",
      },
      added: manager.added || "Today",
    }));
  }, [managers]);

  const handleSelectManager = (row: AddManagerRow) => {
    const manager = managers.find((m) => m.id === row.id);
    if (!manager) return;

    setState((prev) => ({
      ...prev,
      selectedManager: prev.selectedManager?.id === manager.id ? null : manager,
    }));
  };

  const handleConfirm = () => {
    if (state.selectedManager) {
      onConfirm(state.selectedManager);
      setState(initialState);
    }
  };

  const handleClose = () => {
    setState(initialState);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      width="w-[1020px]"
      height="h-auto max-h-full"
      noXPadding
      closeOnOutsideClick={true}
    >
      {state.showBack && (
        <div className="px-6 pt-6">
          <Button
            variant="neutral"
            size="lg"
            className="flex gap-2 group"
            onClick={() => setState((prev) => ({ ...prev, showBack: false }))}
          >
            <IoChevronBack className="w-6 h-6 text-[var(--color-stroke-brand)]" />
            BACK
          </Button>
        </div>
      )}

      <div
        className="flex flex-col h-full px-6 pt-6 pb-4 min-h-[600px]"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)] mb-2">
            Ready to assign a {roleConfig.label.toLowerCase()} to your restaurant?
          </h2>
          <p className="text-[var(--color-neutral-secondary)] font-normal text-lg">
            Select a {roleConfig.label.toLowerCase()} from the list. {roleConfig.labelPlural.charAt(0).toUpperCase() + roleConfig.labelPlural.slice(1)} suspended or already assigned to a restaurant aren&apos;t visible here.
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="w-64">
            <SearchInput
              value={state.searchTerm}
              onChange={(e) => {
                setState((prev) => ({ ...prev, searchTerm: e.target.value, currentPage: 1 }));
              }}
              placeholder={`Search ${roleConfig.label.toLowerCase()}`}
              clearable={true}
              onClear={() => setState((prev) => ({ ...prev, searchTerm: "", currentPage: 1 }))}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#99A39D] font-normal">
              {totalItems} entries
            </span>
            <label className="flex items-center gap-1 text-lg text-[var(--color-neutral-secondary)] font-normal">
              <CheckBox
                checked={state.hideAssigned}
                onChange={(e) => setState((prev) => ({ ...prev, hideAssigned: e.target.checked }))}
              />
              Grouped
            </label>
          </div>
        </div>

        {totalItems > 0 && (
          <div className="mb-4">
            <Pagination
              currentPage={state.currentPage}
              pageSize={pageSize}
              totalItems={totalItems}
              onPrev={() => {
                const nextPage = Math.max(1, state.currentPage - 1);
                if (nextPage === state.currentPage) return;
                setState((prev) => ({ ...prev, currentPage: nextPage }));
                fetchManagers(state.searchTerm.trim(), nextPage);
              }}
              onNext={() => {
                const nextPage = Math.min(totalPages, state.currentPage + 1);
                if (nextPage === state.currentPage) return;
                setState((prev) => ({ ...prev, currentPage: nextPage }));
                fetchManagers(state.searchTerm.trim(), nextPage);
              }}
            />
          </div>
        )}

        <div className="flex-1 overflow-hidden mb-4">
          <div className="overflow-y-auto max-h-[286px]">
            {showLoadingSkeleton ? (
              <div className="space-y-3 py-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : tableData.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-[var(--color-neutral-secondary)]">No {roleConfig.labelPlural} found.</div>
              </div>
            ) : (
              <AddManagerTable
                data={tableData}
                columns={["name", "contactInfo", "added", "actions"]}
                selectedId={state.selectedManager?.id || null}
                onSelectManager={handleSelectManager}
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-stroke-neutral)] mt-auto">
          <div className="text-lg text-[var(--color-neutral-secondary)]">
            {state.selectedManager ? (
              <span>
                {state.selectedManager.name.length > 25
                  ? `${state.selectedManager.name.substring(0, 25)}...`
                  : state.selectedManager.name}{" "}
                selected.
              </span>
            ) : (
              <span>No {roleConfig.label.toLowerCase()} selected yet!</span>
            )}
          </div>
          <Button
            variant="primary"
            appearance="outlined"
            state="press"
            size="lg"
            disabled={!state.selectedManager}
            onClick={handleConfirm}
            className="w-1/2"
          >
            <span>CONFIRM ASSIGNMENT</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}