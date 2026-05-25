import { useState, useCallback, useMemo } from "react";
import type { SuspendedEmployee } from "../types";

interface EmployeeTableState {
  openIndex: number | null;
  searchTerm: string;
  selectedIds: Set<string>;
  isGrouped: boolean;
  selectedRoles: Array<string | number>;
  showAvailableDriversOnly: boolean;
}

interface EmployeeTableStateActions {
  setOpenIndex: (index: number | null) => void;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
  handleRowSelect: (id: string, selected: boolean) => void;
  clearSelection: () => void;
  setIsGrouped: (grouped: boolean) => void;
  setSelectedRoles: (roles: Array<string | number>) => void;
  setShowAvailableDriversOnly: (show: boolean) => void;
}

interface SuspendedTableStateActions extends EmployeeTableStateActions {
  handleSelectAll: (ids: string[]) => void;
}

const initialState: EmployeeTableState = {
  openIndex: null,
  searchTerm: "",
  selectedIds: new Set(),
  isGrouped: false,
  selectedRoles: [],
  showAvailableDriversOnly: false,
};

// ── Active employees ──────────────────────────────────────────────────────────

export function useEmployeeTableState(): EmployeeTableState & EmployeeTableStateActions {
  const [state, setState] = useState<EmployeeTableState>(initialState);

  const setOpenIndex = useCallback((index: number | null) => {
    setState((prev) => ({ ...prev, openIndex: index }));
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    setState((prev) => ({ ...prev, searchTerm: term }));
  }, []);

  const clearSearch = useCallback(() => {
    setState((prev) => ({ ...prev, searchTerm: "" }));
  }, []);

  const handleRowSelect = useCallback((id: string, selected: boolean) => {
    setState((prev) => {
      const next = new Set(prev.selectedIds);
      if (selected) next.add(id);
      else next.delete(id);
      return { ...prev, selectedIds: next };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedIds: new Set() }));
  }, []);

  const setIsGrouped = useCallback((grouped: boolean) => {
    setState((prev) => ({ ...prev, isGrouped: grouped }));
  }, []);

  const setSelectedRoles = useCallback((roles: Array<string | number>) => {
    setState((prev) => ({ ...prev, selectedRoles: roles }));
  }, []);

  const setShowAvailableDriversOnly = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showAvailableDriversOnly: show }));
  }, []);

  return {
    ...state,
    setOpenIndex,
    setSearchTerm,
    clearSearch,
    handleRowSelect,
    clearSelection,
    setIsGrouped,
    setSelectedRoles,
    setShowAvailableDriversOnly,
  };
}

// ── Suspended employees (adds handleSelectAll + roleOptions) ──────────────────

export function useSuspendedEmployeeTableState(employees: SuspendedEmployee[]) {
  const [state, setState] = useState<EmployeeTableState>(initialState);

  const setOpenIndex = useCallback((index: number | null) => {
    setState((prev) => ({ ...prev, openIndex: index }));
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    setState((prev) => ({ ...prev, searchTerm: term }));
  }, []);

  const clearSearch = useCallback(() => {
    setState((prev) => ({ ...prev, searchTerm: "" }));
  }, []);

  const handleRowSelect = useCallback((id: string, selected: boolean) => {
    setState((prev) => {
      const next = new Set(prev.selectedIds);
      if (selected) next.add(id);
      else next.delete(id);
      return { ...prev, selectedIds: next };
    });
  }, []);

  const handleSelectAll = useCallback((ids: string[]) => {
    setState((prev) => ({ ...prev, selectedIds: new Set(ids) }));
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedIds: new Set() }));
  }, []);

  const setIsGrouped = useCallback((grouped: boolean) => {
    setState((prev) => ({ ...prev, isGrouped: grouped }));
  }, []);

  const setSelectedRoles = useCallback((roles: Array<string | number>) => {
    setState((prev) => ({ ...prev, selectedRoles: roles }));
  }, []);

  const setShowAvailableDriversOnly = useCallback((show: boolean) => {
    setState((prev) => ({ ...prev, showAvailableDriversOnly: show }));
  }, []);

  const roleOptions = useMemo(
    () => [
      { id: "manager", label: "Manager" },
      { id: "driver", label: "Driver" },
    ],
    [],
  );

  return {
    ...state,
    setOpenIndex,
    setSearchTerm,
    clearSearch,
    handleRowSelect,
    handleSelectAll,
    clearSelection,
    setIsGrouped,
    setSelectedRoles,
    setShowAvailableDriversOnly,
    roleOptions,
  };
}
