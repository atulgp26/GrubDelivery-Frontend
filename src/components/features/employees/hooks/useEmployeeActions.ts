import { useState, useCallback } from "react";
import type { Employee } from "@/types/domain/employees";
import type { Restaurant } from "@/types/domain/restaurants";

interface EmployeeActionsState {
  showSuspendModal: boolean;
  showDeleteModal: boolean;
  showReassignModal: boolean;
  actionMenuEmployee: Employee | null;
  reassignSourceEmployees: Employee[];
  selectedRestaurant: Restaurant | null;
}

interface EmployeeActionsActions {
  openSuspendModal: (employee: Employee | null) => void;
  closeSuspendModal: () => void;
  openDeleteModal: (employee: Employee | null) => void;
  closeDeleteModal: () => void;
  openReassignModal: (employees: Employee[]) => void;
  closeReassignModal: () => void;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
}

const initialState: EmployeeActionsState = {
  showSuspendModal: false,
  showDeleteModal: false,
  showReassignModal: false,
  actionMenuEmployee: null,
  reassignSourceEmployees: [],
  selectedRestaurant: null,
};

export function useEmployeeActions() {
  const [state, setState] = useState<EmployeeActionsState>(initialState);

  const openSuspendModal = useCallback((employee: Employee | null) => {
    setState((prev) => ({
      ...prev,
      showSuspendModal: true,
      actionMenuEmployee: employee,
    }));
  }, []);

  const closeSuspendModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showSuspendModal: false,
      actionMenuEmployee: null,
    }));
  }, []);

  const openDeleteModal = useCallback((employee: Employee | null) => {
    setState((prev) => ({
      ...prev,
      showDeleteModal: true,
      actionMenuEmployee: employee,
    }));
  }, []);

  const closeDeleteModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showDeleteModal: false,
      actionMenuEmployee: null,
    }));
  }, []);

  const openReassignModal = useCallback((employees: Employee[]) => {
    setState((prev) => ({
      ...prev,
      showReassignModal: true,
      reassignSourceEmployees: employees,
    }));
  }, []);

  const closeReassignModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showReassignModal: false,
      reassignSourceEmployees: [],
      selectedRestaurant: null,
    }));
  }, []);

  const setSelectedRestaurant = useCallback((restaurant: Restaurant | null) => {
    setState((prev) => ({ ...prev, selectedRestaurant: restaurant }));
  }, []);

  const actions: EmployeeActionsActions = {
    openSuspendModal,
    closeSuspendModal,
    openDeleteModal,
    closeDeleteModal,
    openReassignModal,
    closeReassignModal,
    setSelectedRestaurant,
  };

  return {
    ...state,
    ...actions,
  };
}

