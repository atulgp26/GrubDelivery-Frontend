import { useCallback } from "react";
import { showError, showSuccess } from "@/components/ui/toast";
import grubpacService from "@/services/grubpacs";
import { getApiErrorMessage } from "@/lib/errors";
import type { ActionGrubPacBody } from "@/types/domain/grubpacs";
import type { GrubPacGroup, GrubPacItem, ModalState, SelectedState } from "./useGrubPacsListState";

type SectionType = "poweredOn" | "poweredOff";

interface UseGrubPacsListHandlersProps {
  selected: SelectedState;
  setSelected: React.Dispatch<React.SetStateAction<SelectedState>>;
  modalState: ModalState;
  openModal: (type: string, data?: Record<string, unknown>) => void;
  closeModal: (type: string) => void;
  setOpenCheckPermissionsModal: (open: boolean) => void;
  setOpenEditBoxModal: (open: boolean) => void;
  refetchGrubPacs?: () => Promise<void>;
}

export function useGrubPacsListHandlers({
  selected,
  setSelected,
  modalState,
  openModal,
  closeModal,
  setOpenCheckPermissionsModal,
  setOpenEditBoxModal,
  refetchGrubPacs,
}: UseGrubPacsListHandlersProps) {
  const handleSelectAll = useCallback(
    (section: SectionType, checked: boolean, items: GrubPacItem[]): void => {
      setSelected((prev) => ({
        ...prev,
        [section]: checked ? items.map((item) => item.id) : [],
      }));
    },
    [setSelected]
  );

  const handleSelectItem = useCallback(
    (section: SectionType, id: number | string, checked: boolean): void => {
      setSelected((prev) => ({
        ...prev,
        [section]: checked
          ? [...(prev[section] || []), id]
          : (prev[section] || []).filter((itemId) => itemId !== id),
      }));
    },
    [setSelected]
  );

  const onPermissions = useCallback((): void => {
    setOpenCheckPermissionsModal(true);
  }, [setOpenCheckPermissionsModal]);

  const onEditDetails = useCallback((): void => {
    setOpenEditBoxModal(true);
  }, [setOpenEditBoxModal]);

  const handleSuspendBox = useCallback(
    (box?: GrubPacItem): void => {
      if (box) {
        openModal("suspend", {
          box,
          selectedCount: 1,
          fromRemoval: false,
          selectedIds: box.id ? [box.id] : [],
        });
      }
    },
    [openModal]
  );

  const handleReassignBox = useCallback(
    (box: GrubPacItem): void => {
      openModal("reassignGroup", { selected: [box.id], box });
    },
    [openModal]
  );

  const handleReassign = useCallback(
    (section: SectionType, selectedItems: (number | string)[]): void => {
      openModal("reassignGroup", { selected: selectedItems, section });
    },
    [openModal]
  );

  const suspendBoxClick = useCallback(async (): Promise<void> => {
    const modalSelected = modalState.suspend.selectedIds || [];
    const fallbackSelected = [
      ...(selected.poweredOn || []),
      ...(selected.poweredOff || []),
    ];

    let idsToSuspend: (string | number)[] =
      modalSelected.length > 0 ? modalSelected : fallbackSelected;

    if (idsToSuspend.length === 0 && modalState.suspend.box?.id) {
      idsToSuspend = [modalState.suspend.box.id];
    }

    const uniqueIds = Array.from(
      new Set(
        idsToSuspend
          .filter((id) => id !== undefined && id !== null && id !== "")
          .map((id) => String(id))
      )
    );

    if (uniqueIds.length === 0) {
      showError("Select at least one box to suspend.");
      return;
    }

    try {
      const response = await grubpacService.suspend(uniqueIds);
      if (!response.success) {
        showError(response.error ?? "Failed to suspend boxes. Please try again.");
        return;
      }

      const suspendedIds = new Set(uniqueIds);
      setSelected((prev) => ({
        ...prev,
        poweredOn: (prev.poweredOn || []).filter((id) => !suspendedIds.has(String(id))),
        poweredOff: (prev.poweredOff || []).filter((id) => !suspendedIds.has(String(id))),
      }));

      closeModal("suspend");
      showSuccess(
        `${uniqueIds.length} box${uniqueIds.length > 1 ? "es" : ""} suspended successfully!`,
        "Boxes have been temporarily deactivated and will not be available for guest use."
      );

      if (refetchGrubPacs) {
        try {
          await refetchGrubPacs();
        } catch (refetchError) {
          console.error("[grubpacs] Failed to refresh after suspension", refetchError);
        }
      }
    } catch (error) {
      showError(getApiErrorMessage(error, "Failed to suspend boxes. Please try again."));
    }
  }, [
    closeModal,
    modalState.suspend.box,
    modalState.suspend.selectedIds,
    refetchGrubPacs,
    selected.poweredOff,
    selected.poweredOn,
    setSelected,
  ]);

  const handleRemoveBoxes = useCallback(
    (selectedItems: (number | string)[], count: number): void => {
      openModal("boxRemoval", { selected: selectedItems, count });
    },
    [openModal]
  );

  const handleConfirmRemoveBoxes = useCallback(async (): Promise<void> => {
    const modalSelected = modalState.boxRemoval.selected || [];
    const fallbackSelected = [
      ...(selected.poweredOn || []),
      ...(selected.poweredOff || []),
    ];

    const idsToSuspend: (string | number)[] =
      modalSelected.length > 0 ? modalSelected : fallbackSelected;

    const uniqueIds = Array.from(
      new Set(
        idsToSuspend
          .filter((id) => id !== undefined && id !== null && id !== "")
          .map((id) => String(id))
      )
    );

    if (uniqueIds.length === 0) {
      showError("Select at least one box to suspend.");
      return;
    }

    try {
      const response = await grubpacService.suspend(uniqueIds);
      if (!response.success) {
        showError(response.error ?? "Failed to suspend boxes. Please try again.");
        return;
      }

      const suspendedIds = new Set(uniqueIds);
      setSelected((prev) => ({
        ...prev,
        poweredOn: (prev.poweredOn || []).filter((id) => !suspendedIds.has(String(id))),
        poweredOff: (prev.poweredOff || []).filter((id) => !suspendedIds.has(String(id))),
      }));

      closeModal("boxRemoval");
      showSuccess(
        `${uniqueIds.length} box${uniqueIds.length > 1 ? "es" : ""} suspended successfully!`,
        "Boxes have been temporarily deactivated and will not be available for guest use."
      );

      if (refetchGrubPacs) {
        try {
          await refetchGrubPacs();
        } catch (refetchError) {
          console.error("[grubpacs] Failed to refresh after suspension", refetchError);
        }
      }
    } catch (error) {
      showError(getApiErrorMessage(error, "Failed to suspend boxes. Please try again."));
    }
  }, [
    closeModal,
    modalState.boxRemoval.selected,
    refetchGrubPacs,
    selected.poweredOff,
    selected.poweredOn,
    setSelected,
  ]);

  const handleSuspendFromRemoval = useCallback((): void => {
    const count = modalState.boxRemoval.count;
    closeModal("boxRemoval");
    openModal("suspend", {
      selectedCount: count,
      fromRemoval: true,
      selectedIds: modalState.boxRemoval.selected || [],
      box: null,
    });
  }, [modalState.boxRemoval, closeModal, openModal]);

  const handleReassignGroup = useCallback((): void => {
    openModal("reassignGroup");
  }, [openModal]);

  const handleRemoveRoom = useCallback((): void => {
    const totalSelected =
      (selected.poweredOn?.length || 0) + (selected.poweredOff?.length || 0);
    openModal("applySettings", {
      selectedCount: totalSelected,
      settingType: "REMOVE ANY ROOM ASSIGNED",
    });
  }, [selected, openModal]);

  const handleApplySettings = useCallback((): void => {
    const modalSelected = modalState.applySettings.selectedIds || [];
    const fallbackSelected = [
      ...(selected.poweredOn || []),
      ...(selected.poweredOff || []),
    ];
    const idsToApply: (string | number)[] =
      modalSelected.length > 0 ? modalSelected : fallbackSelected;

    const uniqueIds = Array.from(
      new Set(
        idsToApply
          .filter((id) => id !== undefined && id !== null && id !== "")
          .map((id) => String(id))
      )
    );

    if (uniqueIds.length === 0) {
      showError("Select at least one box to apply settings.");
      return;
    }

    const settingType = modalState.applySettings.settingType;

    // Handle future feature: remove vehicle
    if (settingType === "REMOVE ANY ROOM ASSIGNED") {
      closeModal("applySettings");
      showSuccess("Info", "Remove vehicle feature will be implemented in the future");
      return;
    }

    const actionType = modalState.applySettings.actionType;
    const actionValue = modalState.applySettings.actionValue;
    const temperature = modalState.applySettings.temperature;

    let payload: ActionGrubPacBody | null = null;

    if (actionType === "power" && actionValue) {
      payload = {
        ids: uniqueIds,
        power_status: actionValue,
        ioniser_status: actionValue,
      };
    }

    if (actionType === "ioniser" && actionValue) {
      payload = { ids: uniqueIds, ioniser_status: actionValue };
    }

    if (actionType === "temperature" && temperature) {
      const zone1Temp = Number(temperature.zone1);
      if (!Number.isFinite(zone1Temp)) {
        showError("Please provide a valid Zone 1 temperature.");
        return;
      }

      const dualZoneStatus: "on" | "off" = temperature.dualZone ? "on" : "off";
      const payloadBase: ActionGrubPacBody = {
        ids: uniqueIds,
        dual_zone_status: dualZoneStatus,
        zone1_temp: zone1Temp,
      };

      if (dualZoneStatus === "on") {
        const zone2Temp = Number(temperature.zone2);
        if (!Number.isFinite(zone2Temp)) {
          showError("Please provide a valid Zone 2 temperature.");
          return;
        }
        payload = { ...payloadBase, zone2_temp: zone2Temp };
      } else {
        payload = { ...payloadBase, zone2_temp: zone1Temp };
      }
    }

    if (!payload) {
      showError("No valid settings found to apply.");
      return;
    }

    void (async () => {
      try {
        const response = await grubpacService.action(payload);
        if (!response.success) {
          showError(response.error ?? "Failed to apply settings. Please try again.");
          return;
        }

        const appliedIds = new Set(uniqueIds);
        setSelected((prev) => ({
          ...prev,
          poweredOn: (prev.poweredOn || []).filter((id) => !appliedIds.has(String(id))),
          poweredOff: (prev.poweredOff || []).filter((id) => !appliedIds.has(String(id))),
        }));

        closeModal("applySettings");

        if (actionType === "ioniser") {
          const firstBoxId = uniqueIds[0];
          const detailsHref = firstBoxId
            ? `/grublock/details?id=${encodeURIComponent(firstBoxId)}`
            : "/grublock/details";

          showSuccess(
            `Settings applied to ${uniqueIds.length} boxes successfully!`,
            "",
            false,
            detailsHref,
            "VIEW DETAILS",
          );
        } else {
          showSuccess(`Settings applied to ${uniqueIds.length} boxes successfully!`, "");
        }

        if (refetchGrubPacs) {
          try {
            await refetchGrubPacs();
          } catch (refetchError) {
            console.error("[grubpacs] Failed to refresh after applying settings", refetchError);
          }
        }
      } catch (error) {
        showError(getApiErrorMessage(error, "Failed to apply settings. Please try again."));
      }
    })();
  }, [
    closeModal,
    modalState.applySettings.actionType,
    modalState.applySettings.actionValue,
    modalState.applySettings.selectedIds,
    modalState.applySettings.temperature,
    refetchGrubPacs,
    selected.poweredOff,
    selected.poweredOn,
    setSelected,
  ]);

  const handleReassignConfirm = useCallback(
    (group: { name: string }): void => {
      closeModal("reassignGroup");
      const totalSelected =
        (selected.poweredOn?.length || 0) + (selected.poweredOff?.length || 0);
      showSuccess(
        `${totalSelected} boxes reassigned to ${group.name} successfully!`,
        ""
      );
    },
    [selected, closeModal]
  );

  const handleGroupClick = useCallback(
    (group: GrubPacGroup): void => {
      const firstItem = group.items?.[0] ?? null;
      const groupName = String(group.name ?? firstItem?.restaurantName ?? firstItem?.name ?? "Restaurant");
      const employeeCount = new Set(
        (group.items ?? []).flatMap((item) => item.restaurantEmployeeIds ?? []),
      ).size;

      const restaurantIds = Array.from(
        new Set(
          (group.items ?? [])
            .flatMap((item) => (item.restaurantIds ?? []).map(String))
            .filter((id) => id.length > 0),
        ),
      );

      const modalGroup: GrubPacItem = {
        ...(firstItem ?? { id: groupName, name: groupName }),
        name: groupName,
        added: firstItem?.restaurantCreatedOn || firstItem?.added || firstItem?.addedDate || "-",
        location: firstItem?.restaurantAddress || firstItem?.location || groupName,
        restaurantStatus: firstItem?.restaurantStatus,
        restaurantIds,
        resourceBoxCount: group.items?.length ?? 0,
        resourceEmployeeCount: employeeCount,
      };

      openModal("groupModal", { group: modalGroup });
    },
    [openModal]
  );

  const handleViewList = useCallback(
    (group: GrubPacItem | null): void => {
      if (group) {
        openModal("boxListModal", { group });
        closeModal("groupModal");
      }
    },
    [openModal, closeModal]
  );

  const handleReassignAllBoxes = useCallback((): void => {
    openModal("reassignGroup");
    closeModal("boxListModal");
  }, [openModal, closeModal]);

  const handleEditGroupDetails = useCallback(
    (group: GrubPacItem | null): void => {
      if (group) {
        openModal("boxListModal");
        closeModal("groupModal");
      }
    },
    [openModal, closeModal]
  );

  const handleDeleteGroup = useCallback(
    (group: GrubPacItem | null): void => {
      showSuccess("Delete functionality will be implemented", "");
      closeModal("groupModal");
    },
    [closeModal]
  );

  return {
    handleSelectAll,
    handleSelectItem,
    onPermissions,
    onEditDetails,
    handleSuspendBox,
    handleReassignBox,
    handleReassign,
    suspendBoxClick,
    handleRemoveBoxes,
    handleConfirmRemoveBoxes,
    handleSuspendFromRemoval,
    handleReassignGroup,
    handleRemoveRoom,
    handleApplySettings,
    handleReassignConfirm,
    handleGroupClick,
    handleViewList,
    handleReassignAllBoxes,
    handleEditGroupDetails,
    handleDeleteGroup,
  };
}

