import { useEffect, useState } from "react";
import RestaurantDetailsModal from "@/components/features/shared/modals/RestaurantDetailsModal";
import RestaurantResourcesModal, {
  type Employee as ResourceEmployee,
  type GrubPac as ResourceGrubPac,
  type ResourceTabType,
} from "@/components/features/restaurants/modals/RestaurantResourcesModal";
import ReassignResourcesModal from "@/components/features/restaurants/modals/ReassignResourcesModal";
import employeeService from "@/services/employees";
import grubpacService from "@/services/grubpacs";
import foodService from "@/services/food";
import BoxDetailsModal from "../modals/BoxDetailsModal";
import GrubLockFilterModal from "../modals/GrubLockFilterModal";
import UnlockBoxModal from "../modals/UnlockBoxModal";
import EmergencyUnlockModal from "../modals/EmergencyUnlockModal";
import LockBoxModal from "../modals/LockBoxModal";
import HaveEmergencyModal from "../modals/HaveEmergencyModal";
import ApplySettingsModal from "../modals/ApplySettingsModal";
import type { ModalState } from "../hooks/useGrubLockModals";
import type { Recipient } from "@/types/domain/grublock";
import type { FilterState } from "@/components/features/shared/filter/BoxFilterModal";
import {
  apiEmployeeToEmployee,
  isBoxesGroupedResponse,
  isRestaurantsGroupedResponse,
  type ApiEmployee,
} from "@/types/domain/employees";
import type { ApiGrubPac, GrubPacListData } from "@/types/domain/grubpacs";
import type { Restaurant, RestaurantData } from "@/types/domain/restaurants";
import { flattenWrappedGroupRecord, getWrappedGroupArray } from "@/lib/utils/groupedResponse";
import { showError, showSuccess } from "@/components/ui/toast";
import { getContextualErrorMessage } from "@/lib/errors";

interface GrubLockModalsProps {
  modalState: ModalState;
  showFilterModal: boolean;
  filterState: FilterState;
  selectedIds: Set<string>;
  recipient?: Recipient;
  isLocking?: boolean;
  isEditingRecipient?: boolean;
  isEmergencyUnlocking?: boolean;
  onCloseGroupDetailsModal: () => void;
  onCloseBoxDetailsModal: () => void;
  onCloseUnlockBoxModal: () => void;
  onCloseEmergencyUnlockModal: () => void;
  onCloseLockBoxModal: () => void;
  onCloseHaveEmergencyModal: () => void;
  onCloseApplySettingsModal: () => void;
  onCloseFilterModal: () => void;
  onApplyFilter: (filters: FilterState) => void;
  onEmergencyUnlock: () => void;
  onOpenEmergencyUnlockModal: (
    preservePosition?: { top?: string; left?: string; right?: string; bottom?: string },
    anchorButtonElement?: HTMLElement | null,
  ) => void;
  onHaveEmergencyUnlock: () => void;
  onApplySettings: () => void;
  onOpenEditDetailsModal: () => void;
  onCloseEditDetailsModal: () => void;
  onLockSubmit?: (recipient: Recipient) => Promise<void> | void;
  onEditSave?: (recipient: Recipient) => Promise<void> | void;
  onEmergencyUnlockRequest?: (
    reason: string,
  ) => Promise<"apply" | "direct" | false | void> | "apply" | "direct" | false | void;
  onRefreshData?: () => Promise<void> | void;
}

export default function GrubLockModals({
  modalState,
  showFilterModal,
  filterState,
  selectedIds,
  recipient,
  isLocking = false,
  isEditingRecipient = false,
  isEmergencyUnlocking = false,
  onCloseGroupDetailsModal,
  onCloseBoxDetailsModal,
  onCloseUnlockBoxModal,
  onCloseEmergencyUnlockModal,
  onCloseLockBoxModal,
  onCloseHaveEmergencyModal,
  onCloseApplySettingsModal,
  onCloseFilterModal,
  onApplyFilter,
  onEmergencyUnlock,
  onOpenEmergencyUnlockModal,
  onHaveEmergencyUnlock,
  onApplySettings,
  onOpenEditDetailsModal,
  onCloseEditDetailsModal,
  onLockSubmit,
  onEditSave,
  onEmergencyUnlockRequest,
  onRefreshData,
}: GrubLockModalsProps) {
  const [showGroupedRestaurantResourcesModal, setShowGroupedRestaurantResourcesModal] = useState(false);
  const [groupedRestaurantResourcesTab, setGroupedRestaurantResourcesTab] =
    useState<ResourceTabType>("grubpacs");
  const [resourceEmployees, setResourceEmployees] = useState<ResourceEmployee[]>([]);
  const [resourceGrubPacs, setResourceGrubPacs] = useState<ResourceGrubPac[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [showReassignResourcesModal, setShowReassignResourcesModal] = useState(false);
  const [reassignRestaurants, setReassignRestaurants] = useState<Restaurant[]>([]);
  const [reassignRestaurantsLoading, setReassignRestaurantsLoading] = useState(false);
  const [reassignSubmitting, setReassignSubmitting] = useState(false);
  const [selectedReassignBoxIds, setSelectedReassignBoxIds] = useState<string[]>([]);

  // FIX: Track the real GrubPac count fetched from the API
  const [realGrubPacCount, setRealGrubPacCount] = useState<number | null>(null);

  const selectedGroup = modalState.selectedGroup;
  const groupItems = selectedGroup?.items ?? [];
  const firstItem = groupItems[0];
  const employeeCount = new Set(
    groupItems.flatMap((item) => item.restaurantEmployeeIds ?? []),
  ).size;

  const extractGrubPacs = (data: GrubPacListData): ApiGrubPac[] => {
    const groupedData = (data as { groups?: Record<string, unknown> }).groups;
    if (groupedData && typeof groupedData === "object") {
      return flattenWrappedGroupRecord<ApiGrubPac>(groupedData);
    }

    return (data as { boxes?: ApiGrubPac[] }).boxes ?? [];
  };

  const fetchAllRestaurantBoxes = async (restaurantId: string): Promise<ApiGrubPac[]> => {
    const boxMap = new Map<string, ApiGrubPac>();
    let page = 1;
    let expectedCount: number | undefined;

    while (page <= 250) {
      const response = await grubpacService.getList({ restaurant_id: restaurantId, page });
      if (!response.success || !response.data) {
        throw new Error(response.error ?? "Failed to fetch boxes");
      }

      const data = response.data as GrubPacListData & { count?: number };
      const boxes = extractGrubPacs(data);

      if (typeof data.count === "number" && Number.isFinite(data.count)) {
        expectedCount = data.count;
      }

      if (boxes.length === 0) {
        break;
      }

      boxes.forEach((box) => {
        boxMap.set(box.id, box);
      });

      if (expectedCount !== undefined && boxMap.size >= expectedCount) {
        break;
      }

      page += 1;
    }

    return Array.from(boxMap.values());
  };

  const fetchRestaurantResources = async (restaurantId?: string) => {
    if (!restaurantId) {
      setResourceEmployees([]);
      setResourceGrubPacs([]);
      return;
    }

    setResourcesLoading(true);
    setResourceEmployees([]);
    setResourceGrubPacs([]);

    try {
      const [employeesResponse, allRestaurantBoxes] = await Promise.all([
        employeeService.getList({ query: "emp", limit: 50, restaurant_id: restaurantId }),
        fetchAllRestaurantBoxes(restaurantId),
      ]);

      if (employeesResponse.success && employeesResponse.data) {
        const employeeData = employeesResponse.data;
        let employees: ApiEmployee[] = [];

        if (isRestaurantsGroupedResponse(employeeData)) {
          employees = flattenWrappedGroupRecord<ApiEmployee>(employeeData.groups as Record<string, unknown>);
        } else if (isBoxesGroupedResponse(employeeData)) {
          employees = [
            ...getWrappedGroupArray<ApiEmployee>(employeeData.groups.connected),
            ...getWrappedGroupArray<ApiEmployee>(employeeData.groups.disconnected),
            ...getWrappedGroupArray<ApiEmployee>(employeeData.groups.managers),
          ];
        } else {
          employees = employeeData.employees ?? [];
        }

        const uniqueEmployees = new Map<string, ResourceEmployee>();
        employees.forEach((employee) => {
          const mapped = apiEmployeeToEmployee(employee);
          uniqueEmployees.set(employee.id, {
            id: mapped.id,
            name: mapped.name,
            employeeId: mapped.employeeId,
            joinedDate: mapped.joinedDate,
            phone: mapped.phone,
            email: mapped.email,
            role: mapped.role,
            boxCount: mapped.boxCount,
            added: mapped.added,
            isAvailable: employee.status === "active",
          });
        });
        setResourceEmployees(Array.from(uniqueEmployees.values()));
      } else {
        setResourceEmployees([]);
      }

      const mappedBoxes: ResourceGrubPac[] = allRestaurantBoxes.map((box) => {
        const restaurantName = box.restaurants?.[0]?.name ?? box.restaurant_boxes?.[0]?.restaurant?.name;
        const detailsParts = [box.box_id, box.vehicle_number, restaurantName].filter(Boolean);
        const powerStatus = (box.power_status ?? "").toLowerCase();

        return {
          id: box.id,
          name: box.name,
          details: detailsParts.join(" | "),
          power: powerStatus === "on" ? "on" : powerStatus === "off" ? "off" : "warning",
          driver: undefined,
          added: new Date(box.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
          }),
          isLocked: box.lock?.lock_status === "locked",
          isOffline: powerStatus === "off",
        };
      });
      setResourceGrubPacs(mappedBoxes);

      // FIX: Update the real count once we have the actual data from the API
      setRealGrubPacCount(mappedBoxes.length);
    } catch {
      setResourceEmployees([]);
      setResourceGrubPacs([]);
      showError("Failed to fetch restaurant resources");
    } finally {
      setResourcesLoading(false);
    }
  };

  const mapRestaurantData = (restaurant: RestaurantData): Restaurant => ({
    id: restaurant.id,
    name: restaurant.name,
    address: restaurant.full_address,
    manager: restaurant.manager
      ? [restaurant.manager.first_name, restaurant.manager.last_name].filter(Boolean).join(" ") || null
      : null,
    drivers: restaurant._count?.employees ?? 0,
    boxes: restaurant._count?.boxes ?? 0,
    suspended_boxes: restaurant._count?.suspended_boxes ?? 0,
    updated: restaurant.updated_at
      ? new Date(restaurant.updated_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        })
      : "-",
    status: restaurant.status === "suspended" ? "suspended" : "active",
    city: restaurant.city,
    state: restaurant.state,
    pincode: restaurant.pincode,
    line_one: restaurant.line_one,
    line_two: restaurant.line_two,
    latitude: restaurant.latitude,
    longitude: restaurant.longitude,
    google_place_id: restaurant.google_place_id,
  });

  const fetchActiveRestaurantsForReassign = async () => {
    setReassignRestaurantsLoading(true);
    try {
      const response = await foodService.getRestaurants({
        status: "active",
        limit: 50,
        page: 1,
      });

      if (response.success && response.data?.restaurants) {
        setReassignRestaurants(response.data.restaurants.map(mapRestaurantData));
      } else {
        setReassignRestaurants([]);
      }
    } catch {
      setReassignRestaurants([]);
      showError("Failed to fetch restaurants");
    } finally {
      setReassignRestaurantsLoading(false);
    }
  };

  const openReassignResourcesModal = async (boxIds: string[]) => {
    const sourceRestaurantId = firstItem?.restaurantIds?.[0];
    let ids = boxIds;

    if (ids.length === 0) {
      if (!sourceRestaurantId) {
        showError("Unable to resolve source restaurant");
        return;
      }

      try {
        const allBoxes = await fetchAllRestaurantBoxes(sourceRestaurantId);
        ids = allBoxes.map((box) => box.id);
      } catch (error) {
        showError(error instanceof Error ? error.message : "Failed to fetch all boxes");
        return;
      }
    }

    if (ids.length === 0) {
      showError("No boxes available for reassignment");
      return;
    }

    setSelectedReassignBoxIds(Array.from(new Set(ids)));
    setShowGroupedRestaurantResourcesModal(false);
    setShowReassignResourcesModal(true);
    void fetchActiveRestaurantsForReassign();
  };

  const handleConfirmReassignResources = async (restaurant: Restaurant | null) => {
    if (!restaurant) return;
    if (selectedReassignBoxIds.length === 0) {
      showError("No boxes selected for reassignment");
      return;
    }

    setReassignSubmitting(true);
    try {
      const response = await grubpacService.reassign({
        ids: selectedReassignBoxIds,
        restaurant_id: restaurant.id,
      });

      if (!response.success) {
        showError(
          getContextualErrorMessage(
            "assignment.box",
            response,
            "Could not reassign box(es). Please try again.",
          ),
        );
        return;
      }

      showSuccess("Boxes reassigned successfully!", "");
      setShowReassignResourcesModal(false);
      setSelectedReassignBoxIds([]);
      await onRefreshData?.();
    } catch (error) {
      showError(
        getContextualErrorMessage(
          "assignment.box",
          error,
          "Could not reassign box(es). Please try again.",
        ),
      );
    } finally {
      setReassignSubmitting(false);
    }
  };

  const openGroupedResourcesModal = (tab: ResourceTabType) => {
    const restaurantId = firstItem?.restaurantIds?.[0];
    setGroupedRestaurantResourcesTab(tab);
    setShowGroupedRestaurantResourcesModal(true);
    void fetchRestaurantResources(restaurantId);
  };

  // FIX: Fetch real count as soon as the group details modal opens so the correct
  // number is shown immediately — not only after the user clicks VIEW LIST.
  useEffect(() => {
    if (modalState.isGroupDetailsModalOpen) {
      const restaurantId = firstItem?.restaurantIds?.[0];
      if (restaurantId) {
        void fetchRestaurantResources(restaurantId);
      }
    } else {
      // Reset when modal closes so stale count doesn't show on next open
      setRealGrubPacCount(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalState.isGroupDetailsModalOpen, firstItem?.restaurantIds?.[0]]);

  const groupedRestaurant = selectedGroup
    ? {
        name: String(firstItem?.restaurantName ?? selectedGroup.name ?? "Restaurant"),
        status: firstItem?.restaurantStatus ?? "active",
        createdOn: firstItem?.restaurantCreatedOn ?? "-",
        address: firstItem?.restaurantAddress ?? String(selectedGroup.name ?? "-"),
        resources: [
          {
            label: "GrubPacs",
            // FIX: Use realGrubPacCount if available (fetched from API), otherwise fall back to groupItems.length
            count: realGrubPacCount ?? groupItems.length,
            onViewList: () => openGroupedResourcesModal("grubpacs"),
          },
          {
            label: "employees",
            count: employeeCount,
            onViewList: () => openGroupedResourcesModal("employees"),
          },
        ],
      }
    : null;

  return (
    <>
      <GrubLockFilterModal
        open={showFilterModal}
        onClose={onCloseFilterModal}
        initialFilters={filterState}
        onApply={onApplyFilter}
      />

      {groupedRestaurant && (
        <RestaurantDetailsModal
          open={modalState.isGroupDetailsModalOpen && !showGroupedRestaurantResourcesModal}
          onClose={onCloseGroupDetailsModal}
          restaurant={groupedRestaurant}
          onEdit={onCloseGroupDetailsModal}
          onDelete={onCloseGroupDetailsModal}
        />
      )}

      {groupedRestaurant && (
        <RestaurantResourcesModal
          open={showGroupedRestaurantResourcesModal}
          onClose={() => setShowGroupedRestaurantResourcesModal(false)}
          restaurantName={groupedRestaurant.name}
          tab={groupedRestaurantResourcesTab}
          grubPacs={resourceGrubPacs}
          employees={resourceEmployees}
          onReassignBoxes={openReassignResourcesModal}
          onEditList={openReassignResourcesModal}
          loading={resourcesLoading}
        />
      )}

      <ReassignResourcesModal
        open={showReassignResourcesModal}
        onClose={() => {
          setShowReassignResourcesModal(false);
          setSelectedReassignBoxIds([]);
        }}
        onConfirm={handleConfirmReassignResources}
        restaurants={reassignRestaurants}
        loading={reassignRestaurantsLoading || reassignSubmitting}
        sourceRestaurantName={groupedRestaurant?.name}
      />

      {modalState.selectedBox && modalState.isBoxDetailsModalOpen && (
        <BoxDetailsModal
          open={modalState.isBoxDetailsModalOpen}
          onClose={onCloseBoxDetailsModal}
          box={modalState.selectedBox}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      )}

      {modalState.selectedBox && modalState.isUnlockBoxModalOpen && (
        <UnlockBoxModal
          open={modalState.isUnlockBoxModalOpen}
          onClose={onCloseUnlockBoxModal}
          recipient={recipient}
          onEdit={onOpenEditDetailsModal}
          onEmergencyUnlock={() =>
            onOpenEmergencyUnlockModal(
              modalState.unlockModalPosition,
              modalState.buttonElement,
            )
          }
          positionClass="items-start justify-end"
          top={modalState.unlockModalPosition.top}
          left={modalState.unlockModalPosition.left}
          right={modalState.unlockModalPosition.right}
          bottom={modalState.unlockModalPosition.bottom}
        />
      )}

      {modalState.selectedBox && (
        <LockBoxModal
          open={modalState.isEditDetailsModalOpen}
          onClose={onCloseEditDetailsModal}
          mode="edit"
          initialValues={recipient}
          onSubmit={async (recipientValues) => {
            await onEditSave?.(recipientValues);
            onCloseEditDetailsModal();
          }}
          isSubmitting={isEditingRecipient}
          positionClass="items-start justify-end"
          top={modalState.editDetailsModalPosition.top}
          left={modalState.editDetailsModalPosition.left}
          right={modalState.editDetailsModalPosition.right}
          bottom={modalState.editDetailsModalPosition.bottom}
        />
      )}

      <EmergencyUnlockModal
        open={modalState.isEmergencyUnlockModalOpen}
        onClose={onCloseEmergencyUnlockModal}
        onUnlock={async (reason: string) => {
          const result = await onEmergencyUnlockRequest?.(reason);
          if (result === "apply") {
            onEmergencyUnlock();
          }
        }}
        isSubmitting={isEmergencyUnlocking}
        selectedCount={selectedIds.size || 1}
        top={modalState.emergencyUnlockModalPosition.top}
        right={modalState.emergencyUnlockModalPosition.right}
        left={modalState.emergencyUnlockModalPosition.left}
        bottom={modalState.emergencyUnlockModalPosition.bottom}
        positionClass="items-start justify-end"
      />

      {modalState.selectedBox && (
        <LockBoxModal
          open={modalState.isLockBoxModalOpen}
          onClose={onCloseLockBoxModal}
          mode="lock"
          initialValues={{ countryCode: recipient?.countryCode || "IN" }}
          onSubmit={async (recipientValues) => {
            await onLockSubmit?.(recipientValues);
            onCloseLockBoxModal();
          }}
          isSubmitting={isLocking}
          positionClass="items-start justify-end"
          top={modalState.lockBoxModalPosition.top}
          left={modalState.lockBoxModalPosition.left}
          right={modalState.lockBoxModalPosition.right}
          bottom={modalState.lockBoxModalPosition.bottom}
        />
      )}

      <HaveEmergencyModal
        open={modalState.isHaveEmergencyModalOpen}
        onClose={onCloseHaveEmergencyModal}
        onEmergencyUnlock={onHaveEmergencyUnlock}
        isMultiSelect={selectedIds.size > 1}
        positionClass="items-start justify-end"
        top={modalState.haveEmergencyModalPosition.top}
        left={modalState.haveEmergencyModalPosition.left}
        right={modalState.haveEmergencyModalPosition.right}
        bottom={modalState.haveEmergencyModalPosition.bottom}
      />

      <ApplySettingsModal
        open={modalState.isApplySettingsModalOpen}
        onClose={onCloseApplySettingsModal}
        selectedCount={selectedIds.size}
        settingType={modalState.settingType}
        onApply={onApplySettings}
      />
    </>
  );
}