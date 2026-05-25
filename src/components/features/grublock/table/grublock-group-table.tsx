"use client";

import { GrubPacBoxTable } from "@/components/ui/grublock-box-table";
import type { GrubLockBox, GrubLockGroup } from "@/types/domain/grublock";
import { convertGrubLockBoxesToTableRows } from "./grublock-box-table-adapter";

interface GrubLockGroupTableProps {
  group: GrubLockGroup;
  selectedIds?: Set<string>;
  loadingRowIds?: Set<string>;
  statusOverrides?: Record<string, "locked" | "unlocked">;
  activeLockDetailsRowId?: string;
  onRowSelect?: (id: string, selected: boolean) => void;
  onSelectAll?: (ids: string[], selected: boolean) => void;
  onRowClick?: (box: GrubLockBox) => void;
  onViewDetailsClick?: (box: GrubLockBox) => void;
  onViewInGrubPacsClick?: (box: GrubLockBox) => void;
  onLockButtonClick?: (box: GrubLockBox, buttonElement: HTMLElement | null) => void;
  onUnlockButtonClick?: (box: GrubLockBox, buttonElement: HTMLElement | null) => void;
}

export function GrubLockGroupTable({
  group,
  selectedIds = new Set(),
  loadingRowIds,
  statusOverrides = {},
  activeLockDetailsRowId,
  onRowSelect,
  onSelectAll,
  onRowClick,
  onViewDetailsClick,
  onViewInGrubPacsClick,
  onLockButtonClick,
  onUnlockButtonClick,
}: GrubLockGroupTableProps) {
  const boxes = group.items ?? [];
  const effectiveBoxes = boxes.map((box) => {
    const nextStatus = statusOverrides[box.id];
    if (!nextStatus || nextStatus === box.status) {
      return box;
    }

    return {
      ...box,
      status: nextStatus,
    };
  });
  const tableData = convertGrubLockBoxesToTableRows(effectiveBoxes);

  const handleSelectionChange = (newIds: Set<string>) => {
    const allBoxIds = boxes.map((b) => b.id);
    const wasAllSelected = allBoxIds.every((id) => selectedIds.has(id));
    const isNowAllSelected = allBoxIds.every((id) => newIds.has(id));
    const isNowNoneSelected = allBoxIds.every((id) => !newIds.has(id));

    if ((wasAllSelected && isNowNoneSelected) || (!wasAllSelected && isNowAllSelected)) {
      if (onSelectAll) {
        onSelectAll(allBoxIds, isNowAllSelected);
      }
    } else if (onRowSelect) {
      for (const id of allBoxIds) {
        const wasSelected = selectedIds.has(id);
        const isNowSelected = newIds.has(id);
        if (wasSelected !== isNowSelected) {
          onRowSelect(id, isNowSelected);
          break;
        }
      }
    }
  };

  const handleRowClick = (row: any) => {
    const box = effectiveBoxes.find((b) => b.id === row.id);
    if (box && onRowClick) {
      onRowClick(box);
    }
  };

  const handleLockDetailsClick = (row: { id: string }, buttonElement: HTMLElement | null) => {
    const box = effectiveBoxes.find((item) => item.id === row.id);
    if (!box) {
      return;
    }

    if (box.status === "locked") {
      onLockButtonClick?.(box, buttonElement);
      return;
    }

    onUnlockButtonClick?.(box, buttonElement);
  };

  const handleViewDetailsClick = (row: { id: string }) => {
    const box = effectiveBoxes.find((item) => item.id === row.id);
    if (!box) return;
    onViewDetailsClick?.(box);
  };

  const handleViewInGrubPacsClick = (row: { id: string }) => {
    const box = effectiveBoxes.find((item) => item.id === row.id);
    if (!box) return;
    onViewInGrubPacsClick?.(box);
  };

  if (boxes.length === 0) {
    return (
      <div className="bg-white p-8 text-center text-[var(--color-neutral-light)]">
        {group.emptyMessage || "All active GrubLock boxes are assigned :)"}
      </div>
    );
  }

  return (
    <div className="bg-white">
      <GrubPacBoxTable
        data={tableData}
        columns={["name", "status", "battery", "handler", "lockDetails", "actions"]}
        selectable={true}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        onRowClick={handleRowClick}
        onLockDetailsClick={handleLockDetailsClick}
        onViewDetailsClick={handleViewDetailsClick}
        onViewInGrubPacsClick={handleViewInGrubPacsClick}
        loadingRowIds={loadingRowIds}
        activeLockDetailsRowId={activeLockDetailsRowId}
      />
    </div>
  );
}