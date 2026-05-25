"use client";
import { useState, useMemo, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import FilterButton from "@/components/ui/FilterButton";
import Pagination from "@/components/ui/Pagination";
import { ResourceReassignTable, type ResourceReassignRow } from "@/components/ui/resource-reassign-table";
import { mockReassignRestaurantsData } from "@/components/features/grubpacs/data/mockReassignRestaurantsData";

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

  useEffect(() => {
    if (!open) {
      setState(initialState);
    }
  }, [open]);

  const filteredData = useMemo(() => {
    if (!state.searchTerm.trim()) return mockReassignRestaurantsData;
    const lower = state.searchTerm.toLowerCase();
    return mockReassignRestaurantsData.filter(
      (r) =>
        r.name.toLowerCase().includes(lower) ||
        r.address.toLowerCase().includes(lower)
    );
  }, [state.searchTerm]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice(
    (state.currentPage - 1) * PAGE_SIZE,
    state.currentPage * PAGE_SIZE
  );

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
              {filteredData.length} entries
            </span>
            <FilterButton open={false} handleFilterClick={() => {}} />
          </div>
        </div>

        {filteredData.length > 0 && (
          <div className="mb-4">
            <Pagination
              currentPage={state.currentPage}
              pageSize={PAGE_SIZE}
              totalItems={filteredData.length}
              onPrev={() =>
                setState((prev) => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))
              }
              onNext={() =>
                setState((prev) => ({ ...prev, currentPage: Math.min(totalPages, prev.currentPage + 1) }))
              }
            />
          </div>
        )}

        <div className="flex-1 overflow-hidden mb-4">
          <div className="overflow-y-auto max-h-[286px]">
            {paginatedData.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-[var(--color-stroke-brand)]">No restaurants found.</div>
              </div>
            ) : (
              <ResourceReassignTable
                data={paginatedData}
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