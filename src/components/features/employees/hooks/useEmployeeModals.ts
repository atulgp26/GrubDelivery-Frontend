import { useState } from "react";
import type { Employee } from "@/types/domain/employees";
import type { EmployeeGroup } from "@/types";

export type EmployeeResourceTabType = "boxes";

interface ModalState {
  selectedEmployee: Employee | null;
  selectedGroup: EmployeeGroup | null;
  isDetailsModalOpen: boolean;
  isGroupDetailsModalOpen: boolean;
  isResourcesModalOpen: boolean;
  resourcesModalTab: EmployeeResourceTabType;
}

const initialModalState: ModalState = {
  selectedEmployee: null,
  selectedGroup: null,
  isDetailsModalOpen: false,
  isGroupDetailsModalOpen: false,
  isResourcesModalOpen: false,
  resourcesModalTab: "boxes",
};

export function useEmployeeModals() {
  const [modalState, setModalState] = useState<ModalState>(initialModalState);

  const openDetailsModal = (employee: Employee) => {
    setModalState({
      ...initialModalState,
      selectedEmployee: employee,
      isDetailsModalOpen: true,
    });
  };

  const closeDetailsModal = () => {
    if (!modalState.isResourcesModalOpen) {
      setModalState(initialModalState);
    }
  };

  const openGroupDetailsModal = (group: EmployeeGroup) => {
    setModalState({
      ...initialModalState,
      selectedGroup: group,
      isGroupDetailsModalOpen: true,
    });
  };

  const closeGroupDetailsModal = () => {
    if (!modalState.isResourcesModalOpen) {
      setModalState(initialModalState);
    }
  };

  const openResourcesModal = (employee: Employee, tab: EmployeeResourceTabType = "boxes") => {
    setModalState((prev) => ({
      ...prev,
      selectedEmployee: employee,
      isDetailsModalOpen: false,
      isGroupDetailsModalOpen: false,
      isResourcesModalOpen: true,
      resourcesModalTab: tab,
    }));
  };

  const closeResourcesModal = () => {
    setModalState(initialModalState);
  };

  const closeAllModals = () => {
    setModalState(initialModalState);
  };

  return {
    modalState,
    openDetailsModal,
    closeDetailsModal,
    openGroupDetailsModal,
    closeGroupDetailsModal,
    openResourcesModal,
    closeResourcesModal,
    closeAllModals,
  };
}

