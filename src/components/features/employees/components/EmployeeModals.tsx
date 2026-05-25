"use client";

import EmployeeDetailsModal from "../modals/EmployeeDetailsModal";
import RestaurantDetailsModal from "@/components/features/shared/modals/RestaurantDetailsModal";
import type { useEmployeeModals } from "../hooks/useEmployeeModals";
import type { Employee } from "@/types/domain/employees";

interface EmployeeModalsProps {
  modalState: ReturnType<typeof useEmployeeModals>["modalState"];
  onCloseDetails: () => void;
  onCloseGroupDetails: () => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  onSuspend?: (employee: Employee) => void;
  onViewBoxes?: () => void;
  onEditGroupedRestaurant?: () => void;
  onDeleteGroupedRestaurant?: () => void;
  onViewGroupedGrubPacs?: () => void;
  onViewGroupedEmployees?: () => void;
}

export default function EmployeeModals({
  modalState,
  onCloseDetails,
  onCloseGroupDetails,
  onEdit,
  onDelete,
  onSuspend,
  onViewBoxes,
  onEditGroupedRestaurant,
  onDeleteGroupedRestaurant,
  onViewGroupedGrubPacs,
  onViewGroupedEmployees,
}: EmployeeModalsProps) {
  const groupedRestaurant = modalState.selectedGroup?.items?.[0]
    ? {
        name: modalState.selectedGroup.items[0].restaurantName ?? (typeof modalState.selectedGroup.name === 'string' ? modalState.selectedGroup.name : "Restaurant"),
        status: modalState.selectedGroup.items[0].restaurantStatus,
        createdOn: modalState.selectedGroup.items[0].restaurantAdded,
        address: modalState.selectedGroup.items[0].restaurantAddress,
        resources: [
          {
            label: "GrubPacs",
            count: modalState.selectedGroup.items?.reduce((sum, emp) => sum + (emp.boxCount || 0), 0) ?? 0,
            onViewList: onViewGroupedGrubPacs || (() => {}),
          },
          {
            label: "employees",
            count: modalState.selectedGroup.items?.length ?? 0,
            onViewList: onViewGroupedEmployees || (() => {}),
          },
        ],
      }
    : null;

  return (
    <>
      {modalState.selectedEmployee && (
        <EmployeeDetailsModal
          open={modalState.isDetailsModalOpen && !modalState.isResourcesModalOpen}
          onClose={onCloseDetails}
          employee={{
            name: modalState.selectedEmployee.name,
            employeeId: modalState.selectedEmployee.employeeId,
            status: modalState.selectedEmployee.status || "Active",
            joinedDate: modalState.selectedEmployee.joinedDate,
            phone: modalState.selectedEmployee.phone,
            email: modalState.selectedEmployee.email,
            role: modalState.selectedEmployee.role,
            restaurantName: modalState.selectedEmployee.restaurantName,
            resources: [
              {
                label: "boxes",
                count: modalState.selectedEmployee.boxCount,
                onViewList: onViewBoxes || (() => {}),
              },
            ],
          }}
          onEdit={() => {
            if (onEdit) {
              onEdit(modalState.selectedEmployee!);
            }
          }}
          onDelete={() => {
            if (onDelete) {
              onDelete(modalState.selectedEmployee!);
            }
          }}
        />
      )}

      {modalState.selectedGroup && groupedRestaurant && (
        <RestaurantDetailsModal
          open={modalState.isGroupDetailsModalOpen && !modalState.isResourcesModalOpen}
          onClose={onCloseGroupDetails}
          restaurant={groupedRestaurant}
          onEdit={onEditGroupedRestaurant}
          onDelete={onDeleteGroupedRestaurant}
        />
      )}
    </>
  );
}

