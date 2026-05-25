"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import CheckBox from "@/components/ui/CheckBox";
import SearchInput from "@/components/ui/SearchInput";
import FilterButton from "@/components/ui/FilterButton";
import { highlightMatch } from "@/lib/utils/highlightMatch";
import { FaChevronRight } from "react-icons/fa6";
import TransferOwnershipTable from "../table/transfer-ownership-table";
import { useTransferBoxes } from "../hooks/useTransferBoxes";
import type { GrubPacBoxRow } from "../table/transfer-ownership-table";

interface TransferSelectModalProps {
  open: boolean;
  onCloseAction: () => void;
  onNextAction: (payload: { selectedIds: string[]; selectedRows: GrubPacBoxRow[] }) => void;
}

export default function TransferSelectModal({
  open,
  onCloseAction,
  onNextAction,
}: TransferSelectModalProps) {
  const [search, setSearch] = useState("");
  const [showOffline, setShowOffline] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedRowsById, setSelectedRowsById] = useState<Map<string, GrubPacBoxRow>>(new Map());

  const { rows, count, isLoading, error } = useTransferBoxes({
    search,
    showOffline,
    enabled: open,
  });

  const selectedRows = useMemo(
    () =>
      Array.from(selectedIds)
        .map((id) => selectedRowsById.get(id))
        .filter((row): row is GrubPacBoxRow => Boolean(row)),
    [selectedIds, selectedRowsById],
  );
  const visibleRowIds = useMemo(() => new Set(rows.map((row) => row.id)), [rows]);
  const visibleSelectedIds = useMemo(
    () => new Set(Array.from(selectedIds).filter((id) => visibleRowIds.has(id))),
    [selectedIds, visibleRowIds],
  );
  const displayedEntries = count > 0 ? count : rows.length;
  const showSearchDropdown = isSearchFocused && search.trim().length > 0;

  const selectedCount = selectedIds.size;
  const hasSelection = selectedCount > 0;

  useEffect(() => {
    setSelectedRowsById((prev) => {
      const next = new Map(prev);
      for (const row of rows) {
        if (selectedIds.has(row.id)) {
          next.set(row.id, row);
        }
      }
      return next;
    });
  }, [rows, selectedIds]);

  const handleSelectionChange = (ids: Set<string>) => {
    setSelectedIds((prev) => {
      const next = new Set<string>();

      for (const id of prev) {
        if (!visibleRowIds.has(id)) {
          next.add(id);
        }
      }

      for (const id of ids) {
        next.add(id);
      }

      return next;
    });

    setSelectedRowsById((prev) => {
      const next = new Map(prev);

      for (const visibleId of visibleRowIds) {
        if (!ids.has(visibleId)) {
          next.delete(visibleId);
        }
      }

      for (const row of rows) {
        if (ids.has(row.id)) {
          next.set(row.id, row);
        }
      }

      return next;
    });
  };

  const handleNext = () => {
    if (!hasSelection) return;
    onNextAction({ selectedIds: Array.from(selectedIds), selectedRows });
  };

  const handleSearchSuggestionSelect = (row: GrubPacBoxRow) => {
    setSearch(row.name);
    setIsSearchFocused(false);
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setSelectedRowsById(new Map());
    setSearch("");
    setShowOffline(false);
    onCloseAction();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      width="w-[820px] max-w-full"
      height="h-auto max-h-[90vh]"
      modalClassName="overflow-hidden"
    >
      <div className="flex flex-col w-full gap-0 overflow-hidden mt-6">
        {/* Title */}
        <h2
          className="font-semibold text-[var(--color-neutral-primary)] mb-4 shrink-0"
          style={{ fontSize: "24px", lineHeight: "32px" }}
        >
          Select boxes to transfer
        </h2>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-4 shrink-0 flex-wrap">
          <div className="relative w-[280px] max-w-full">
            <SearchInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onClear={() => setSearch("")}
              placeholder="Search box"
              className="w-full"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
            />
            {showSearchDropdown && !isLoading && (
              <div className="absolute left-0 right-0 mt-2 overflow-hidden rounded-lg border border-[var(--color-stroke-neutral)] bg-white shadow-lg z-50 max-h-[280px] overflow-y-auto">
                {error ? (
                  <div className="px-4 py-3 text-sm text-[var(--notif-error)]">Search failed. Please try again.</div>
                ) : rows.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-[var(--color-neutral-secondary)]">No boxes found</div>
                ) : (
                  rows.slice(0, 6).map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      className="w-full px-4 py-3 flex flex-col items-start justify-center gap-0.5 text-left hover:bg-[var(--color-neutral-secondary-bg)] focus:bg-[var(--color-neutral-secondary-bg)] focus:outline-none border-b border-b-[var(--color-stroke-neutral)] last:border-b-0 transition-colors"
                      onMouseDown={() => handleSearchSuggestionSelect(row)}
                    >
                      <div className="w-full text-base font-medium text-[#37493F]">
                        {highlightMatch(row.name, search)}
                      </div>
                      <div className="w-full text-sm text-[#7E8982]">
                        {row.identifier || "-"}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-[var(--color-neutral-secondary)]" style={{ fontSize: "14px" }}>
              {displayedEntries} {displayedEntries === 1 ? "entry" : "entries"}
            </span>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <CheckBox
                checked={showOffline}
                onChange={(e) => setShowOffline(e.target.checked)}
              />
              <span className="text-sm font-medium text-[var(--color-neutral-secondary)]">
                Show offline boxes
              </span>
            </label>

            <div className="pointer-events-none" aria-disabled="true">
              <FilterButton open={false} handleFilterClick={() => {}} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto max-h-[360px] min-h-0 shrink">
          {error ? (
            <div className="px-2 py-6 text-sm text-[var(--notif-error)]">{error}</div>
          ) : null}

          {isLoading && search.trim() === "" ? (
            <div className="space-y-1 overflow-hidden">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="h-[82px] bg-white px-0 py-0 flex items-center"
                >
                  <div className="h-5 w-full rounded bg-[#EFF1F0] animate-pulse" />
                </div>
              ))}
            </div>
          ) : null}

          {!(isLoading && search.trim() === "") && (
            <TransferOwnershipTable
              data={rows}
              selectedIds={visibleSelectedIds}
              onSelectionChange={handleSelectionChange}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-stroke-neutral)] shrink-0 mt-4">
          <span
            className="text-[var(--color-neutral-secondary)]"
            style={{ fontSize: "14px" }}
          >
            {hasSelection
              ? `${selectedCount} ${selectedCount === 1 ? "box" : "boxes"} selected.`
              : "No box selected yet!"}
          </span>

          <Button
            variant="primary"
            appearance="outlined"
            state="press"
            className={`flex items-center justify-center gap-2 h-12 min-w-[374px] px-12 text-base font-medium uppercase transition-colors rounded-lg ${
              !hasSelection
                ? "!bg-[var(--gp-color-bg-button-primary-disabled)] !border-[var(--gp-color-border-neutral)] !text-[var(--gp-color-text-disabled)] pointer-events-none"
                : "!bg-white !border-[var(--gp-color-brand-primary)] !text-[var(--gp-color-brand-primary)] hover:!bg-[var(--gp-color-bg-neutral-secondary)]"
            }`}
            onClick={handleNext}
            disabled={!hasSelection}
          >
            NEXT
            <FaChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
