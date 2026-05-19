import { useState } from "react";
import type { GrubLockBox } from "@/types/domain/grublock";
import type { GroupCollapseTableGroup } from "@/types/ui";
import {
  calculateActionBarModalPositionAboveButton,
  calculateModalPositionAboveButtonRight,
  calculateModalPositionBelowButtonRight,
} from "../utils/modalPositioning";

export type GrubLockGroup = GroupCollapseTableGroup<GrubLockBox>;

type ModalAnchorPosition = {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
};

const DEFAULT_MODAL_ANCHOR: ModalAnchorPosition = {
  top: "176px",
  right: "24px",
};

function ensureAnchoredPosition(position: ModalAnchorPosition): ModalAnchorPosition {
  if (position.top || position.right || position.bottom || position.left) {
    return position;
  }

  return DEFAULT_MODAL_ANCHOR;
}

export interface ModalState {
  selectedGroup: GrubLockGroup | null;
  isGroupDetailsModalOpen: boolean;
  selectedBox: GrubLockBox | null;
  isBoxDetailsModalOpen: boolean;
  isUnlockBoxModalOpen: boolean;
  unlockModalPosition: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  buttonElement: HTMLElement | null;
  isEmergencyUnlockModalOpen: boolean;
  isLockBoxModalOpen: boolean;
  lockBoxModalPosition: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  isHaveEmergencyModalOpen: boolean;
  haveEmergencyModalPosition: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  emergencyUnlockButtonElement: HTMLElement | null;
  isApplySettingsModalOpen: boolean;
  settingType: string;
  isEditDetailsModalOpen: boolean;
  editDetailsModalPosition: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  emergencyUnlockModalPosition: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
}

const initialModalState: ModalState = {
  selectedGroup: null,
  isGroupDetailsModalOpen: false,
  selectedBox: null,
  isBoxDetailsModalOpen: false,
  isUnlockBoxModalOpen: false,
  unlockModalPosition: {},
  buttonElement: null,
  isEmergencyUnlockModalOpen: false,
  isLockBoxModalOpen: false,
  lockBoxModalPosition: {},
  isHaveEmergencyModalOpen: false,
  haveEmergencyModalPosition: {},
  emergencyUnlockButtonElement: null,
  isApplySettingsModalOpen: false,
  settingType: "",
  isEditDetailsModalOpen: false,
  editDetailsModalPosition: {},
  emergencyUnlockModalPosition: {},
};

export function useGrubLockModals() {
  const [modalState, setModalState] = useState<ModalState>(initialModalState);

  const openGroupDetailsModal = (group: GrubLockGroup) => {
    setModalState((prev) => ({
      ...prev,
      selectedGroup: group,
      isGroupDetailsModalOpen: true,
    }));
  };

  const closeGroupDetailsModal = () => {
    setModalState((prev) => ({
      ...prev,
      selectedGroup: null,
      isGroupDetailsModalOpen: false,
    }));
  };

  const openBoxDetailsModal = (box: GrubLockBox) => {
    setModalState((prev) => ({
      ...prev,
      selectedBox: box,
      isBoxDetailsModalOpen: true,
    }));
  };

  const closeBoxDetailsModal = () => {
    setModalState((prev) => ({
      ...prev,
      selectedBox: null,
      isBoxDetailsModalOpen: false,
    }));
  };

  const openUnlockBoxModal = (box: GrubLockBox, buttonElement: HTMLElement | null) => {
    const position = buttonElement
      ? calculateModalPositionAboveButtonRight(buttonElement, {
          modalWidth: 400,
          modalHeight: 500,
          spacing: 10,
          minMargin: 24,
        })
      : {};

    const anchoredPosition = ensureAnchoredPosition(
      position as ModalState["unlockModalPosition"],
    );

    setModalState((prev) => ({
      ...prev,
      selectedBox: box,
      isUnlockBoxModalOpen: true,
      unlockModalPosition: anchoredPosition,
      buttonElement: buttonElement,
    }));
  };

  const closeUnlockBoxModal = () => {
    setModalState((prev) => ({
      ...prev,
      selectedBox: null,
      isUnlockBoxModalOpen: false,
      unlockModalPosition: {},
      buttonElement: null,
    }));
  };

  const openEmergencyUnlockModal = (
    preservePosition?: { top?: string; left?: string; right?: string; bottom?: string },
    anchorButtonElement?: HTMLElement | null,
  ) => {
    setModalState((prev) => {
      const emergencyAnchor = anchorButtonElement || prev.emergencyUnlockButtonElement;

      const emergencyPosition = emergencyAnchor
        ? calculateActionBarModalPositionAboveButton(emergencyAnchor, {
            modalWidth: 400,
            modalHeight: 360,
            spacing: 1,
            minMargin: 24,
          })
        : {};

      const positionToUse = preservePosition 
        ? preservePosition
        : emergencyAnchor
        ? emergencyPosition
        : prev.haveEmergencyModalPosition.bottom 
        ? prev.haveEmergencyModalPosition
        : prev.unlockModalPosition;

      const anchoredPosition = ensureAnchoredPosition(positionToUse);
      
      return {
        ...prev,
        isEmergencyUnlockModalOpen: true,
        emergencyUnlockModalPosition: anchoredPosition,
        isUnlockBoxModalOpen: false,
        isHaveEmergencyModalOpen: false,
      };
    });
  };

  const closeEmergencyUnlockModal = () => {
    setModalState((prev) => ({
      ...prev,
      isEmergencyUnlockModalOpen: false,
      emergencyUnlockModalPosition: {},
      selectedBox: null,
      buttonElement: null,
    }));
  };

  const openLockBoxModal = (box: GrubLockBox, buttonElement: HTMLElement | null) => {
    const position = buttonElement
      ? calculateModalPositionBelowButtonRight(buttonElement, {
          modalWidth: 400,
          modalHeight: 300,
          spacing: 8,
          minMargin: 24,
        })
      : {};

    const anchoredPosition = ensureAnchoredPosition(
      position as ModalState["lockBoxModalPosition"],
    );

    setModalState((prev) => ({
      ...prev,
      selectedBox: box,
      isLockBoxModalOpen: true,
      lockBoxModalPosition: anchoredPosition,
      buttonElement: buttonElement,
    }));
  };

  const closeLockBoxModal = () => {
    setModalState((prev) => ({
      ...prev,
      isLockBoxModalOpen: false,
      lockBoxModalPosition: {},
      selectedBox: null,
      buttonElement: null,
    }));
  };

  const openHaveEmergencyModal = (buttonElement: HTMLElement | null) => {
    const position = buttonElement
      ? calculateActionBarModalPositionAboveButton(buttonElement, {
          modalWidth: 400,
          modalHeight: 220,
          spacing: 1,
          minMargin: 24,
        })
      : {};

    const anchoredPosition = ensureAnchoredPosition(
      position as ModalState["haveEmergencyModalPosition"],
    );

    setModalState((prev) => ({
      ...prev,
      isHaveEmergencyModalOpen: true,
      haveEmergencyModalPosition: anchoredPosition,
      emergencyUnlockButtonElement: buttonElement,
    }));
  };

  const closeHaveEmergencyModal = () => {
    setModalState((prev) => ({
      ...prev,
      isHaveEmergencyModalOpen: false,
      haveEmergencyModalPosition: {},
      emergencyUnlockButtonElement: null,
    }));
  };

  const openApplySettingsModal = (settingType: string) => {
    setModalState((prev) => ({
      ...prev,
      isApplySettingsModalOpen: true,
      settingType,
    }));
  };

  const closeApplySettingsModal = () => {
    setModalState((prev) => ({
      ...prev,
      isApplySettingsModalOpen: false,
      settingType: "",
    }));
  };

  const openEditDetailsModal = () => {
    setModalState((prev) => ({
      ...prev,
      isEditDetailsModalOpen: true,
      editDetailsModalPosition: ensureAnchoredPosition(prev.unlockModalPosition),
      isUnlockBoxModalOpen: false,
    }));
  };

  const closeEditDetailsModal = () => {
    setModalState((prev) => ({
      ...prev,
      isEditDetailsModalOpen: false,
      editDetailsModalPosition: {},
    }));
  };

  return {
    modalState,
    openGroupDetailsModal,
    closeGroupDetailsModal,
    openBoxDetailsModal,
    closeBoxDetailsModal,
    openUnlockBoxModal,
    closeUnlockBoxModal,
    openEmergencyUnlockModal,
    closeEmergencyUnlockModal,
    openLockBoxModal,
    closeLockBoxModal,
    openHaveEmergencyModal,
    closeHaveEmergencyModal,
    openApplySettingsModal,
    closeApplySettingsModal,
    openEditDetailsModal,
    closeEditDetailsModal,
  };
}

