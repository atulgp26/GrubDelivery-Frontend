import { useState, useCallback } from "react";
import type { GrubLockBox } from "@/types/domain/grublock";
import {
  defaultBoxFilters,
  type FilterState,
} from "@/components/features/shared/filter/BoxFilterModal";

interface GrubLockState {
  selectedIds: Set<string>;
  searchTerm: string;
  filters: FilterState;
  isGrouped: boolean;
  showUnlockedBoxes: boolean;
  showFilterModal: boolean;
  openIndex: number | "all" | null;
}

interface GrubLockStateActions {
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  setSearchTerm: (term: string) => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  setIsGrouped: (grouped: boolean) => void;
  setShowUnlockedBoxes: (show: boolean) => void;
  setShowFilterModal: (show: boolean) => void;
  setOpenIndex: (index: number | "all" | null) => void;
  handleRowSelect: (id: string, selected: boolean) => void;
  handleSelectAll: (ids: string[], selected: boolean) => void;
  handleClearSelection: () => void;
  handleSearchClear: () => void;
}

export function useGrubLockState() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>(defaultBoxFilters);
  const [isGrouped, setIsGrouped] = useState(false);
  const [showUnlockedBoxes, setShowUnlockedBoxes] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | "all" | null>(null);

  const handleRowSelect = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((ids: string[], selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        ids.forEach((id) => next.add(id));
      } else {
        ids.forEach((id) => next.delete(id));
      }
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchTerm("");
  }, []);

  return {
    state: {
      selectedIds,
      searchTerm,
      filters,
      isGrouped,
      showUnlockedBoxes,
      showFilterModal,
      openIndex,
    },
    actions: {
      setSelectedIds,
      setSearchTerm,
      setFilters,
      setIsGrouped,
      setShowUnlockedBoxes,
      setShowFilterModal,
      setOpenIndex,
      handleRowSelect,
      handleSelectAll,
      handleClearSelection,
      handleSearchClear,
    },
  };
}

