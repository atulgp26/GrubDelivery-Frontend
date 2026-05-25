import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import TableCheckbox from "@/components/ui/TableCheckbox";
import React, { type ReactNode } from 'react';
import type { GrubPacItem } from "@/components/features/grubpacs/hooks/useGrubPacsListState";

interface SuspendedGroundfloorProps {
  data: GrubPacItem[];
  renderRow: (item: GrubPacItem) => ReactNode;
  selectedItems: (string | number)[];
  onSelectItem: (id: string | number, checked: boolean) => void;
}

const SuspendedGroundfloor = ({data, renderRow, selectedItems, onSelectItem}: SuspendedGroundfloorProps) => {
  // Calculate select all state for this section
  const isAllSelected = data.length > 0 && data.every((item: GrubPacItem) => selectedItems.includes(item.id));
  const isIndeterminate = data.some((item: GrubPacItem) => selectedItems.includes(item.id)) && !isAllSelected;
  
  const handleSelectAll = (checked: boolean) => {
    // Toggle all items in this section
    data.forEach((item: GrubPacItem) => {
      const isCurrentlySelected = selectedItems.includes(item.id);
      if (checked && !isCurrentlySelected) {
        onSelectItem(item.id, true);
      } else if (!checked && isCurrentlySelected) {
        onSelectItem(item.id, false);
      }
    });
  };

  return (
    <div className="bg-white rounded-lg">
        <Table >
          <TableHead>
            <TableRow>
              <TableCell className="w-12 !pl-4">
                <TableCheckbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
            <TableCell className="!text-[var(--color-stroke-brand)] text-sm font-normal">
              Name
            </TableCell>
            <TableCell className="!text-[var(--color-stroke-brand)] text-sm font-normal text-right">
              Added
            </TableCell>
            <TableCell className="!text-[var(--color-stroke-brand)] text-sm font-normal text-right">
              Suspended
            </TableCell>
            <TableCell className="text-right">
              <span></span>
            </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  className="text-center text-gray-400 py-12 text-lg font-medium"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item: GrubPacItem) => renderRow(item))
            )}
          </TableBody>
        </Table>
      </div>
  )
}

export default SuspendedGroundfloor
