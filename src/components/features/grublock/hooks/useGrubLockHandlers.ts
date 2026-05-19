import { useCallback } from "react";
import { showSuccess } from "@/components/ui/toast";
import type { GrubLockBox } from "@/types/domain/grublock";
import type { GrubLockGroup } from "@/types/domain/grublock";
import type { ModalState } from "./useGrubLockModals";

interface UseGrubLockHandlersProps {
  selectedIds: Set<string>;
  allBoxes: GrubLockBox[];
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  openGroupDetailsModal: (group: GrubLockGroup) => void;
  openBoxDetailsModal: (box: GrubLockBox) => void;
  closeApplySettingsModal: () => void;
  closeEmergencyUnlockModal: () => void;
  openApplySettingsModal: (settingType: string) => void;
}

export function useGrubLockHandlers({
  selectedIds,
  allBoxes,
  setSelectedIds,
  openGroupDetailsModal,
  openBoxDetailsModal,
  closeApplySettingsModal,
  closeEmergencyUnlockModal,
  openApplySettingsModal,
}: UseGrubLockHandlersProps) {
  const handleGroupClick = useCallback(
    (group: GrubLockGroup) => {
      openGroupDetailsModal(group);
    },
    [openGroupDetailsModal]
  );

  const handleRowClick = useCallback(
    (box: GrubLockBox) => {
      openBoxDetailsModal(box);
    },
    [openBoxDetailsModal]
  );

  const handleApplySettings = useCallback(() => {
    closeApplySettingsModal();

    showSuccess(
      "Unlock Request Sent!",
      "Your emergency unlock request has been sent to the selected box. Please check the boxes to confirm.",
      false,
      "/grublock/details",
      "VIEW DETAILS"
    );

    setSelectedIds(new Set());
  }, [selectedIds.size, closeApplySettingsModal, setSelectedIds]);

  const handleEmergencyUnlockConfirm = useCallback(() => {
    closeEmergencyUnlockModal();
    openApplySettingsModal("EMERGENCY UNLOCK");
  }, [closeEmergencyUnlockModal, openApplySettingsModal]);

  return {
    handleGroupClick,
    handleRowClick,
    handleApplySettings,
    handleEmergencyUnlockConfirm,
  };
}

