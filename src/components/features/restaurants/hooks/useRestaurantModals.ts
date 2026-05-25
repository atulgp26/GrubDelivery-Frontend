import { useState } from "react";
import type { Restaurant } from "@/types/domain/restaurants";

export type ResourceTabType = "grubpacs" | "employees";

interface ModalState {
  selectedRestaurant: Restaurant | null;
  isDetailsModalOpen: boolean;
  isAssignManagerModalOpen: boolean;
  restaurantForManager: Restaurant | null;
  isResourcesModalOpen: boolean;
  resourcesModalTab: ResourceTabType;
  resourcesModalRoles?: string[];
  resourcesModalAvailableDriversOnly?: boolean;
}

const initialModalState: ModalState = {
  selectedRestaurant: null,
  isDetailsModalOpen: false,
  isAssignManagerModalOpen: false,
  restaurantForManager: null,
  isResourcesModalOpen: false,
  resourcesModalTab: "grubpacs",
  resourcesModalRoles: undefined,
  resourcesModalAvailableDriversOnly: false,
};

export function useRestaurantModals() {
  const [modalState, setModalState] = useState<ModalState>(initialModalState);

  const openDetailsModal = (restaurant: Restaurant) => {
    setModalState({
      ...initialModalState,
      selectedRestaurant: restaurant,
      isDetailsModalOpen: true,
    });
  };

  const closeDetailsModal = () => {
    if (!modalState.isResourcesModalOpen) {
      setModalState(initialModalState);
    }
  };

  const openAssignManagerModal = (restaurant: Restaurant) => {
    setModalState({
      ...initialModalState,
      restaurantForManager: restaurant,
      isAssignManagerModalOpen: true,
    });
  };

  const closeAssignManagerModal = () => {
    setModalState(initialModalState);
  };

  const openResourcesModal = (
    restaurant: Restaurant,
    tab: ResourceTabType = "grubpacs",
    roles?: string[],
    availableDriversOnly = false,
  ) => {
    setModalState((prev) => ({
      ...prev,
      selectedRestaurant: restaurant,
      isDetailsModalOpen: false,
      isResourcesModalOpen: true,
      resourcesModalTab: tab,
      resourcesModalRoles: roles,
      resourcesModalAvailableDriversOnly: availableDriversOnly,
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
    openAssignManagerModal,
    closeAssignManagerModal,
    openResourcesModal,
    closeResourcesModal,
    closeAllModals,
  };
}

