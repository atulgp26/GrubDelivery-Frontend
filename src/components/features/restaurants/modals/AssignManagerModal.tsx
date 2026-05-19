"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import CheckBox from "@/components/ui/CheckBox";
import Pagination from "@/components/ui/Pagination";
import { IoChevronBack } from "react-icons/io5";
import { AddManagerTable, type AddManagerRow } from "@/components/ui/add-manager-table";
import { useDebounce } from "@/lib/hooks/useDebounce";

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
  onSearchManagers?: (query: string, page: number) => void;
  totalManagers?: number;
  managers?: Manager[];
  loading?: boolean;
  restaurantName?: string;
  pageSize?: number;
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

export default function AssignManagerModal({
  open,
  onClose,
  onConfirm,
  onSearchManagers,
  totalManagers,
  managers = [],
  loading = false,
  restaurantName,
  pageSize = 50,
}: AssignManagerModalProps) {
  const [state, setState] = useState<ModalState>(initialState);
  const [showLoadingSkeleton, setShowLoadingSkeleton] = useState(false);
  const loadingStartedAtRef = useRef<number | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousDebouncedSearchRef = useRef<string | null>(null);
  const debouncedSearchTerm = useDebounce(state.searchTerm, 300);
  const usesServerSearch = Boolean(onSearchManagers);

  useEffect(() => {
    if (!open) {
      setState(initialState);
      setShowLoadingSkeleton(false);
      loadingStartedAtRef.current = null;
      previousDebouncedSearchRef.current = null;
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    }
  }, [open]);

  useEffect(() => {
    if (!open || !onSearchManagers) return;

    const trimmedQuery = debouncedSearchTerm.trim();

    // Skip the first effect run for each modal-open cycle to avoid duplicate initial fetch.
    if (previousDebouncedSearchRef.current === null) {
      previousDebouncedSearchRef.current = trimmedQuery;
      return;
    }

    if (previousDebouncedSearchRef.current === trimmedQuery) return;

    previousDebouncedSearchRef.current = trimmedQuery;
    setState((prev) => ({ ...prev, currentPage: 1 }));
    onSearchManagers(trimmedQuery, 1);
  }, [debouncedSearchTerm, onSearchManagers, open]);

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

  const filteredManagers = useMemo(() => {
    if (usesServerSearch) return managers;

    let filtered = managers;

    if (state.searchTerm.trim()) {
      const searchLower = state.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (manager) =>
          manager.name.toLowerCase().includes(searchLower) ||
          manager.phone?.toLowerCase().includes(searchLower) ||
          manager.email?.toLowerCase().includes(searchLower) ||
          manager.employeeId?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [managers, state.searchTerm, state.hideAssigned, usesServerSearch]);

  const totalItems = usesServerSearch ? (totalManagers ?? 0) : filteredManagers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedManagers = filteredManagers;

  // Transform Manager data to AddManagerRow format
  const tableData: AddManagerRow[] = useMemo(() => {
    return paginatedManagers.map((manager) => ({
      id: manager.id,
      name: manager.name.length > 25 ? `${manager.name.substring(0, 25)}...` : manager.name,
      identifier: manager.employeeId
        ? `#${manager.employeeId}${manager.joinedDate ? ` | Joined ${manager.joinedDate}` : ''}`
        : '',
      contactInfo: {
        phone: manager.phone || '',
        email: manager.email || '',
      },
      added: manager.added || "Today",
    }));
  }, [paginatedManagers]);

  const handleSelectManager = (row: AddManagerRow) => {
    // Find the original manager from the row
    const manager = paginatedManagers.find(m => m.id === row.id);
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
            Ready to assign a manager to your restaurant?
          </h2>
          <p className="text-[var(--color-neutral-secondary)] font-normal text-lg">
            Select a manager from the list. Managers suspended or already assigned to a restaurant aren&apos;t visible here.
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="w-64">
            <SearchInput
              value={state.searchTerm}
              onChange={(e) => {
                setState((prev) => ({ ...prev, searchTerm: e.target.value, currentPage: 1 }));
              }}
              placeholder="Search manager"
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
                onSearchManagers?.(state.searchTerm.trim(), nextPage);
              }}
              onNext={() => {
                const nextPage = Math.min(totalPages, state.currentPage + 1);
                if (nextPage === state.currentPage) return;
                setState((prev) => ({ ...prev, currentPage: nextPage }));
                onSearchManagers?.(state.searchTerm.trim(), nextPage);
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
                <div className="text-[var(--color-neutral-secondary)]">No managers found.</div>
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
              <span>{state.selectedManager.name.length > 25 ? `${state.selectedManager.name.substring(0, 25)}...` : state.selectedManager.name} selected.</span>
            ) : (
              <span>No manager selected yet!</span>
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

