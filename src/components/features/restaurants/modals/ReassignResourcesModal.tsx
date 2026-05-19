"use client";

import { useState, useMemo, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import FilterButton from "@/components/ui/FilterButton";
import Pagination from "@/components/ui/Pagination";
import type { Restaurant } from "@/types/domain/restaurants";
import { ResourceReassignTable, type ResourceReassignRow } from "@/components/ui/resource-reassign-table";
import Image from "next/image";
import { useDebounce } from "@/lib/hooks/useDebounce";

export interface ReassignResourcesModalProps {
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
  onConfirm: (restaurant: Restaurant | null) => void;
  restaurants?: Restaurant[];
  totalEntries?: number;
  onFetchRestaurants?: (query: string, page: number) => void;
  loading?: boolean;
  sourceRestaurantName?: string;
  pageSize?: number;
}

interface ModalState {
  searchTerm: string;
  selectedRestaurant: Restaurant | null;
  currentPage: number;
  showFilterModal: boolean;
}

const initialState: ModalState = {
  searchTerm: "",
  selectedRestaurant: null,
  currentPage: 1,
  showFilterModal: false,
};

export default function ReassignResourcesModal({
  open,
  onClose,
  onBack,
  onConfirm,
  restaurants = [],
  totalEntries = 0,
  onFetchRestaurants,
  loading = false,
  sourceRestaurantName,
  pageSize = 50,
}: ReassignResourcesModalProps) {
  const [state, setState] = useState<ModalState>(initialState);
  const debouncedSearch = useDebounce(state.searchTerm, 300);

  useEffect(() => {
    if (!open) {
      setState(initialState);
    }
  }, [open]);

  const totalPages = Math.max(1, Math.ceil((totalEntries || 0) / pageSize));

  useEffect(() => {
    if (!open || !onFetchRestaurants) return;
    onFetchRestaurants(debouncedSearch.trim(), state.currentPage);
  }, [debouncedSearch, onFetchRestaurants, open, state.currentPage]);

  // Transform Restaurant data to ResourceReassignRow format
  const tableData: ResourceReassignRow[] = useMemo(() => {
    return restaurants.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name.length > 25 ? `${restaurant.name.substring(0, 25)}...` : restaurant.name,
      address: restaurant.address || "—",
      updated: restaurant.updated || "Today",
      added: "Today", // Restaurant type doesn't have added property
      resources: {
        boxes: restaurant.boxes || 0,
        drivers: restaurant.drivers || 0,
        managers: restaurant.manager ? 1 : 0,
      },
    }));
  }, [restaurants]);

  const handleSelectRestaurant = (row: ResourceReassignRow) => {
    // Find the original restaurant from the row
    const restaurant = restaurants.find(r => r.id === row.id);
    if (!restaurant) return;

    setState((prev) => ({
      ...prev,
      selectedRestaurant: prev.selectedRestaurant?.id === restaurant.id ? null : restaurant,
    }));
  };

  const handleConfirm = async () => {
    if (state.selectedRestaurant) {
      await onConfirm(state.selectedRestaurant);
      setState(initialState);
    }
  };

  const handleClose = () => {
    setState(initialState);
    onClose();
  };

  const handleBack = () => {
    setState(initialState);
    if (onBack) {
      onBack();
      return;
    }
    onClose();
  };

  const backButton = (
    <Button
      variant="neutral"
      appearance="ghost"
      className="flex gap-2 items-center rounded-[4px] hover:underline text-[var(--color-neutral-secondary)] -ml-2"
      onClick={handleBack}
    >
      <Image src="/left-arrow.svg" alt="Back" width={20} height={20} />
      <span className="font-[var(--gp-font-interactive)] text-[20px] leading-[32px] font-medium uppercase mt-0.5">
        BACK
      </span>
    </Button>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      width="w-[1200px]"
      height="h-auto max-h-full"
      noXPadding
      closeOnOutsideClick={false}
      headerLeft={backButton}
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
            <SearchInput
              value={state.searchTerm}
              onChange={(e) => {
                setState((prev) => ({ ...prev, searchTerm: e.target.value, currentPage: 1 }));
              }}
              placeholder="Search restaurant"
              clearable={true}
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
              <div className="space-y-3 py-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : tableData.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-[var(--color-stroke-brand)]">No restaurants found.</div>
              </div>
            ) : (
              <ResourceReassignTable
                data={tableData}
                columns={["name", "address", "updated", "added", "actions"]}
                selectedId={state.selectedRestaurant?.id || null}
                onSelectRestaurant={handleSelectRestaurant}
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-stroke-neutral)] mt-auto">
          <div className="text-lg text-[var(--color-neutral-secondary)]">
            {state.selectedRestaurant ? (
              <span>{state.selectedRestaurant.name.length > 25 ? `${state.selectedRestaurant.name.substring(0, 25)}...` : state.selectedRestaurant.name} selected.</span>
            ) : (
              <span>No restaurant selected yet!</span>
            )}
          </div>
          <Button
            variant="primary"
            appearance="outlined"
            state={loading ? "disabled" : "press"}
            size="lg"
            disabled={!state.selectedRestaurant || loading}
            onClick={handleConfirm}
            className="w-1/2 font-medium"
          >
            <span>{loading ? "ASSIGNING..." : "CONFIRM ASSIGNMENT"}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}

