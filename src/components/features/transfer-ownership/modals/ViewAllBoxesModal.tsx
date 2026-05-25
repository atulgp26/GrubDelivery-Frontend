"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import CheckBox from "@/components/ui/CheckBox";
import SearchInput from "@/components/ui/SearchInput";
import FilterButton from "@/components/ui/FilterButton";
import { GrubPacBoxTable } from "@/components/ui/all-boxes-table";
import type { GrubPacBoxRow } from "@/components/ui/all-boxes-table";
import { useTransferBoxes } from "../hooks/useTransferBoxes";

interface ViewAllBoxesModalProps {
  open: boolean;
  onClose: () => void;
  /** Data to display. Falls back to sample data when not provided. */
  data?: GrubPacBoxRow[];
}

export default function ViewAllBoxesModal({ open, onClose, data }: ViewAllBoxesModalProps) {
  const [search, setSearch] = useState("");
  const [showOffline, setShowOffline] = useState(true);

  const shouldFetchFromApi = !data;
  const {
    rows: apiRows,
    isLoading,
    error,
  } = useTransferBoxes({
    search,
    showOffline,
    enabled: open && shouldFetchFromApi,
  });

  const rows = data ?? apiRows;
  const filtered = rows.filter((r) => {
    const matchesSearch =
      search.trim() === "" || r.name.toLowerCase().includes(search.toLowerCase());
    const matchesPower = showOffline ? true : r.power === "ON";
    return matchesSearch && matchesPower;
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-[960px] max-w-full"
      height="h-auto max-h-[90vh]"
      noXPadding
      closeOnOutsideClick={false}
    >
      <div className="flex flex-col w-full h-full overflow-hidden">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-2 pb-0 shrink-0">
          <h1
            className="font-semibold text-[var(--gp-color-text-neutral-primary)]"
            style={{ fontSize: "24px", lineHeight: "32px" }}
          >
            GrubPacs selected for transfer
          </h1>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-4 px-6 pt-4 pb-2 shrink-0">
          <div className="relative w-[280px] max-w-full">
            <SearchInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onClear={() => setSearch("")}
              placeholder="Search box"
              className="w-full"
            />
          </div>

          {/* Entry count */}
          <span className="text-[14px] text-[var(--gp-color-text-neutral-secondary)] whitespace-nowrap">
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
          </span>

          <div className="flex-1" />

          {/* Show offline */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <CheckBox
              checked={showOffline}
              onChange={(e) => setShowOffline(e.target.checked)}
            />
            <span className="text-[14px] text-[var(--gp-color-text-neutral-secondary)]">
              Show offline boxes
            </span>
          </label>

          {/* Filter */}
          <div className="pointer-events-none opacity-60" aria-disabled="true">
            <FilterButton open={false} handleFilterClick={() => {}} />
          </div>
        </div>

        {/* ── Table (read-only, no checkboxes) ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {error ? (
            <div className="px-1 py-3 text-sm text-[var(--notif-error)]">{error}</div>
          ) : null}

          {isLoading ? (
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

          {!isLoading && (
            <GrubPacBoxTable
              data={filtered}
              columns={["name", "power", "added"]}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
