"use client";
import { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import FilterButton from "@/components/ui/FilterButton";
import Pagination from "@/components/ui/Pagination";
import { ResourceReassignTable, type ResourceReassignRow } from "@/components/ui/resource-reassign-table";
import foodService from "@/services/food";
import type { RestaurantData } from "@/types/domain/restaurants";
import { formatDate } from "@/lib/utils/date";
import { useDebounce } from "@/lib/hooks/useDebounce";

interface ModalLocalState {
  searchTerm: string;
  selectedRow: ResourceReassignRow | null;
  currentPage: number;
}

const initialState: ModalLocalState = {
  searchTerm: "",
  selectedRow: null,
  currentPage: 1,
};

const PAGE_SIZE = 50;

function mapRestaurantToReassignRow(r: RestaurantData): ResourceReassignRow {
  return {
    id: r.id,
    name: r.name,
    address: r.full_address || r.line_one || "",
    updated: r.updated_at ? formatDate(r.updated_at) : "-",
    added: r.created_at ? formatDate(r.created_at) : "-",
    resources: {
      boxes: r._count?.boxes ?? 0,
      drivers: r._count?.drivers ?? 0,
      managers: r._count?.managers ?? (r.manager_id ? 1 : 0),
    },
  };
}

export default function ReassignGroupModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (row: ResourceReassignRow) => void;
}) {
  const [state, setState] = useState<ModalLocalState>(initialState);
  const [rows, setRows] = useState<ResourceReassignRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(state.searchTerm, 300);

  const fetchRestaurants = useCallback(async (query: string, page: number) => {
    setLoading(true);
    try {
      const response = await foodService.getRestaurants({
        status: "active",
        query: query.trim() || undefined,
        limit: PAGE_SIZE,
        page,
      });

      if (response.success && response.data?.restaurants) {
        const mapped = response.data.restaurants.map(mapRestaurantToReassignRow);
        setRows(mapped);
        setTotalItems(
          (response.pagination as { total_count?: number } | undefined)?.total_count
            ?? (response.data as { total_count?: number }).total_count
            ?? response.data.count
            ?? mapped.length,
        );
      } else {
        setRows([]);
        setTotalItems(0);
      }
    } catch (err) {
      console.error("[ReassignGroupModal] Failed to fetch restaurants", err);
      setRows([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setState(initialState);
      setRows([]);
      setTotalItems(0);
      return;
    }
    setState((prev) => ({ ...prev, currentPage: 1, selectedRow: null }));
    void fetchRestaurants(debouncedSearch, 1);
  }, [open, debouncedSearch, fetchRestaurants]);
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const handleSelectRow = (row: ResourceReassignRow) => {
    setState((prev) => ({
      ...prev,
      selectedRow: prev.selectedRow?.id === row.id ? null : row,
    }));
  };

  const handleConfirm = () => {
    if (state.selectedRow) {
      onConfirm(state.selectedRow);
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
      width="w-[1200px]"
      height="h-auto max-h-full"
      noXPadding
      closeOnOutsideClick={false}
    >
      <div
        className="flex flex-col h-full px-6 pt-6 pb-4 min-h-[600px]"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)] mb-2">
            Want to reassign your resources to a new restaurant?
          </h2>
          <p className="text-[var(--color-neutral-secondary)] font-normal text-lg">
            Select a restaurant from the list. Check the suspended list in case any restaurant isn&apos;t visible.
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="w-[240px]">
            <SearchInput
              value={state.searchTerm}
              onChange={(e) =>
                setState((prev) => ({ ...prev, searchTerm: e.target.value, currentPage: 1 }))
              }
              placeholder="Search restaurant"
              clearable={true}
              onClear={() => setState((prev) => ({ ...prev, searchTerm: "", currentPage: 1 }))}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] leading-[22px] text-[#6B7971] font-normal">
              {totalItems} entries
            </span>
            <FilterButton open={false} handleFilterClick={() => {}} />
          </div>
        </div>

        {totalItems > 0 && (
          <div className="mb-4">
            <Pagination
              currentPage={state.currentPage}
              pageSize={PAGE_SIZE}
              totalItems={totalItems}
              onPrev={() => {
                const nextPage = Math.max(1, state.currentPage - 1);
                if (nextPage === state.currentPage) return;
                setState((prev) => ({ ...prev, currentPage: nextPage }));
                void fetchRestaurants(debouncedSearch, nextPage);
              }}
              onNext={() => {
                const nextPage = Math.min(totalPages, state.currentPage + 1);
                if (nextPage === state.currentPage) return;
                setState((prev) => ({ ...prev, currentPage: nextPage }));
                void fetchRestaurants(debouncedSearch, nextPage);
              }}
            />
          </div>
        )}

        <div className="flex-1 overflow-hidden mb-4">
          <div className="overflow-y-auto max-h-[286px]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-[var(--color-neutral-secondary)]">Loading restaurants...</div>
              </div>
            ) : rows.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-[var(--color-stroke-brand)]">No restaurants found.</div>
              </div>
            ) : (
              <ResourceReassignTable
                data={rows}
                columns={["name", "address", "updated", "added", "actions"]}
                selectedId={state.selectedRow?.id ?? null}
                onSelectRestaurant={handleSelectRow}
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-stroke-neutral)] mt-auto">
          <div className="text-lg text-[var(--color-neutral-secondary)]">
            {state.selectedRow ? (
              <span>{state.selectedRow.name} selected.</span>
            ) : (
              <span>No restaurant selected yet!</span>
            )}
          </div>
          <Button
            variant="primary"
            appearance="outlined"
            state="press"
            size="lg"
            disabled={!state.selectedRow}
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
