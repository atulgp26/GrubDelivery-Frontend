"use client";

import { GrubPacBoxTable, type GrubPacBoxRow } from "@/components/ui/all-boxes-table";

export type { GrubPacBoxRow };

interface TransferOwnershipTableProps {
  data: GrubPacBoxRow[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

export default function TransferOwnershipTable({
  data,
  selectedIds,
  onSelectionChange,
}: TransferOwnershipTableProps) {
  return (
    <GrubPacBoxTable
      data={data}
      columns={["name", "status", "power", "added"]}
      selectable
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
    />
  );
}
