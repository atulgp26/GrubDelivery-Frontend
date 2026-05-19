"use client";

import { useState, useMemo, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import SearchWithSuggestions from "@/components/ui/SearchWithSuggestions";
import FilterButton from "@/components/ui/FilterButton";
import Pagination from "@/components/ui/Pagination";
import { ResourceReassignTable, type ResourceReassignRow } from "@/components/ui/resource-reassign-table";
import type { ReassignEmployeeModalProps, ReassignRestaurant } from "../types";
import { useDebounce } from "@/lib/hooks/useDebounce";

export type { ReassignEmployeeModalProps };

interface ModalState {
  searchTerm: string;
  selectedRestaurant: ReassignRestaurant | null;
  currentPage: number;
  showFilterModal: boolean;
}

const initialState: ModalState = {
  searchTerm: "",
  selectedRestaurant: null,
  currentPage: 1,
  showFilterModal: false,
};

export default function ReassignEmployeeModal({
  open,
  onClose,
  onConfirm,
  restaurants: propRestaurants = [],
  totalEntries = 0,
  onFetchRestaurants,
  loading = false,
  sourceEmployeeName,
  pageSize = 50,
}: ReassignEmployeeModalProps) {
  const [state, setState] = useState<ModalState>(initialState);
  const debouncedSearch = useDebounce(state.searchTerm, 300);

  useEffect(() => {
    if (!open) {
      setState(initialState);
    }
  }, [open]);

  const totalPages = Math.max(1, Math.ceil((totalEntries || 0) / pageSize));
  const paginatedRestaurants = propRestaurants;

  useEffect(() => {
    if (!open || !onFetchRestaurants) return;
    onFetchRestaurants(debouncedSearch.trim(), state.currentPage);
  }, [debouncedSearch, onFetchRestaurants, open, state.currentPage]);

  const tableData: ResourceReassignRow[] = paginatedRestaurants.map((r) => ({
    id: r.id,
    name: r.name,
    address: r.address ?? "—",
    updated: r.updated ?? "—",
    added: r.added ?? "—",
    resources: {
      boxes: r.boxes ?? 0,
    },
  }));

  const handleSelectRestaurant = (restaurant: ReassignRestaurant) => {
    setState((prev) => ({
      ...prev,
      selectedRestaurant: prev.selectedRestaurant?.id === restaurant.id ? null : restaurant,
    }));
  };

  useEffect(() => {
    if (state.selectedRestaurant && !paginatedRestaurants.some((r) => r.id === state.selectedRestaurant?.id)) {
      setState((prev) => ({ ...prev, selectedRestaurant: null }));
    }
  }, [paginatedRestaurants, state.selectedRestaurant]);

  const isSelectionValid = Boolean(
    state.selectedRestaurant && paginatedRestaurants.some((r) => r.id === state.selectedRestaurant?.id),
  );

  const handleConfirm = () => {
    if (state.selectedRestaurant) {
      onConfirm(state.selectedRestaurant);
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
      closeOnOutsideClick={true}
    >
      <div
        className="flex flex-col h-full px-6 pt-8 pb-4 min-h-[480px]"
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
            <SearchWithSuggestions<ReassignRestaurant>
              data={paginatedRestaurants}
              value={state.searchTerm}
              onChange={(e) => setState((prev) => ({ ...prev, searchTerm: e.target.value, currentPage: 1 }))}
              onSelect={(restaurant) => {
                setState((prev) => ({
                  ...prev,
                  searchTerm: restaurant.name,
                  selectedRestaurant: restaurant,
                  currentPage: 1,
                }));
              }}
              getLabel={(restaurant) => restaurant.name}
              getSubLabel={(restaurant) => restaurant.address ?? ""}
              placeholder="Search restaurant"
              clearable={true}
              minChars={1}
              openOnFocus={false}
              className="w-full"
              onClear={() => setState((prev) => ({ ...prev, searchTerm: "", currentPage: 1 }))}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] leading-[22px] text-[#6B7971] font-normal">
              {totalEntries} entries
            </span>
            <FilterButton
              open={state.showFilterModal}
              handleFilterClick={() =>
                setState((prev) => ({ ...prev, showFilterModal: !prev.showFilterModal }))
              }
            />
          </div>
        </div>

        {totalEntries > 0 && (
          <div className="mb-4">
            <Pagination
              currentPage={state.currentPage}
              pageSize={pageSize}
              totalItems={totalEntries}
              onPrev={() => setState((prev) => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
              onNext={() => setState((prev) => ({ ...prev, currentPage: Math.min(totalPages, prev.currentPage + 1) }))}
            />
          </div>
        )}

        <div className="overflow-hidden mb-4">
          <div className="overflow-y-auto max-h-[286px]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-[var(--color-neutral-secondary)]">Loading restaurants...</div>
              </div>
            ) : tableData.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-[var(--color-stroke-brand)]">No restaurants found.</div>
              </div>
            ) : (
              <ResourceReassignTable
                data={tableData}
                columns={["name", "address", "updated", "added", "actions"]}
                selectedId={state.selectedRestaurant?.id ?? null}
                onSelectRestaurant={(row) => {
                  const rest = paginatedRestaurants.find((r) => r.id === row.id);
                  if (rest) handleSelectRestaurant(rest);
                }}
                onRowClick={() => {}}
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-stroke-neutral)] mt-auto">
          <div className="text-lg text-[var(--color-neutral-secondary)]">
            {state.selectedRestaurant ? (
              <span>{state.selectedRestaurant.name} selected.</span>
            ) : (
              <span>No restaurant selected yet!</span>
            )}
          </div>
          <Button
            variant="primary"
            appearance="outlined"
            state="press"
            size="lg"
            disabled={!isSelectionValid}
            onClick={handleConfirm}
            className="w-1/2 font-medium"
          >
            <span>CONFIRM ASSIGNMENT</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}

