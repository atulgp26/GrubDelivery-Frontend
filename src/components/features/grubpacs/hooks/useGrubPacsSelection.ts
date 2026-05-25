import { useMemo } from "react";
import type { GrubPacItem } from "@/types/domain/grubpacs";

export interface UseGrubPacsSelectionProps {
  data: GrubPacItem[];
  selectedItems: (string | number)[];
  onSelectAll?: (checked: boolean) => void;
  onSelectItem?: (id: string | number, checked: boolean) => void;
}

export function useGrubPacsSelection({
  data,
  selectedItems,
  onSelectAll,
  onSelectItem,
}: UseGrubPacsSelectionProps) {
  const isAllSelected = useMemo(
    () => data.length > 0 && selectedItems.length === data.length,
    [data.length, selectedItems.length]
  );

  const isIndeterminate = useMemo(
    () => selectedItems.length > 0 && selectedItems.length < data.length,
    [selectedItems.length, data.length]
  );

  const handleSelectAll = (checked: boolean) => {
    onSelectAll?.(checked);
  };

  const handleSelectItem = (id: string | number, checked: boolean) => {
    onSelectItem?.(id, checked);
  };

  return {
    isAllSelected,
    isIndeterminate,
    handleSelectAll,
    handleSelectItem,
  };
}

