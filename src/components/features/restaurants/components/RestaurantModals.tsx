"use client";

import RestaurantDetailsModal from "@/components/features/shared/modals/RestaurantDetailsModal";
import AssignManagerModal from "../modals/AssignManagerModal";
import RestaurantResourcesModal from "../modals/RestaurantResourcesModal";
import type { useRestaurantModals } from "../hooks/useRestaurantModals";
import type { Restaurant } from "@/types/domain/restaurants";
import type { Manager } from "../modals/AssignManagerModal";
import type {
  Employee as ResourceEmployee,
  GrubPac as ResourceGrubPac,
} from "../modals/RestaurantResourcesModal";
import type { FilterState } from "@/components/features/shared/filter/BoxFilterModal";

interface RestaurantModalsProps {
  modalState: ReturnType<typeof useRestaurantModals>["modalState"];
  onCloseDetails: () => void;
  onCloseAssignManager: () => void;
  onCloseResources: () => void;
  onFetchResourceEmployees?: (query: string, page: number, availableDriversOnly?: boolean) => void;
  onFetchResourceGrubPacs?: (params: {
    page: number;
    query: string;
    showOfflineBoxes: boolean;
    filters: FilterState;
  }) => void;
  resourceRefreshToken?: number;
  resourceEmployeeTotalEntries?: number;
  resourceGrubPacTotalEntries?: number;
  onSearchManagers?: (query: string, page: number) => void;
  assignManagerTotalCount?: number;
  assignManagerManagers?: Manager[];
  assignManagerLoading?: boolean;
  resourceEmployees?: ResourceEmployee[];
  resourceGrubPacs?: ResourceGrubPac[];
  resourcesLoading?: boolean;
  onEdit?: (restaurant: Restaurant) => void;
  onDelete?: (restaurant: Restaurant) => void;
  onReassignBoxes?: (boxIds: string[]) => void;
  onEditList?: (boxIds: string[]) => void;
  onViewGrubPacs?: () => void;
  onViewEmployees?: () => void;
  onAssignManager?: (manager: Manager, restaurant: Restaurant) => void;
}

export default function RestaurantModals({
  modalState,
  onCloseDetails,
  onCloseAssignManager,
  onCloseResources,
  onFetchResourceEmployees,
  onFetchResourceGrubPacs,
  resourceRefreshToken,
  resourceEmployeeTotalEntries,
  resourceGrubPacTotalEntries,
  onSearchManagers,
  assignManagerTotalCount,
  assignManagerManagers = [],
  assignManagerLoading = false,
  resourceEmployees = [],
  resourceGrubPacs = [],
  resourcesLoading = false,
  onEdit,
  onDelete,
  onReassignBoxes,
  onEditList,
  onViewGrubPacs,
  onViewEmployees,
  onAssignManager,
}: RestaurantModalsProps) {
  return (
    <>
      {modalState.selectedRestaurant && (
        <RestaurantDetailsModal
          open={modalState.isDetailsModalOpen && !modalState.isResourcesModalOpen}
          onClose={onCloseDetails}
          restaurant={{
            name: modalState.selectedRestaurant.name,
            status: modalState.selectedRestaurant.status || "Active",
            createdOn: modalState.selectedRestaurant.updated,
            address: modalState.selectedRestaurant.address,
            resources: [
              {
                label: "GrubPacs",
                count: modalState.selectedRestaurant.boxes,
                onViewList: onViewGrubPacs || (() => {}),
              },
              {
                label: "employees",
                count: modalState.selectedRestaurant.drivers,
                onViewList: onViewEmployees || (() => {}),
              },
            ],
          }}
          onEdit={() => {
            if (onEdit) {
              onEdit(modalState.selectedRestaurant!);
            }
          }}
          onDelete={() => {
            if (onDelete) {
              onDelete(modalState.selectedRestaurant!);
            }
          }}
        />
      )}

      {modalState.restaurantForManager && (
        <AssignManagerModal
          open={modalState.isAssignManagerModalOpen}
          onClose={onCloseAssignManager}
          onConfirm={(manager: Manager | null) => {
            if (manager && onAssignManager && modalState.restaurantForManager) {
              onAssignManager(manager, modalState.restaurantForManager);
            }
            onCloseAssignManager();
          }}
          onSearchManagers={onSearchManagers}
          totalManagers={assignManagerTotalCount}
          managers={assignManagerManagers}
          loading={assignManagerLoading}
          restaurantName={modalState.restaurantForManager.name}
        />
      )}

      {modalState.selectedRestaurant && (
        <RestaurantResourcesModal
          open={modalState.isResourcesModalOpen}
          onClose={onCloseResources}
          restaurantName={modalState.selectedRestaurant.name}
          tab={modalState.resourcesModalTab}
          initialEmployeeRoles={modalState.resourcesModalRoles}
          initialAvailableDriversOnly={modalState.resourcesModalAvailableDriversOnly}
          grubPacs={resourceGrubPacs}
          employees={resourceEmployees}
          onFetchEmployees={onFetchResourceEmployees}
          onFetchGrubPacs={onFetchResourceGrubPacs}
          refreshToken={resourceRefreshToken}
          employeeTotalEntries={resourceEmployeeTotalEntries}
          grubPacTotalEntries={resourceGrubPacTotalEntries}
          employeePageSize={10}
          grubPacPageSize={10}
          onReassignBoxes={onReassignBoxes || (() => {})}
          onEditList={onEditList || (() => {})}
          loading={resourcesLoading}
        />
      )}
    </>
  );
}

