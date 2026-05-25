import { useState } from "react";

export interface UseModalStateReturn<T> {
  modalState: T;
  openModal: (modalType: keyof T, data?: Record<string, unknown>) => void;
  closeModal: (modalType: keyof T) => void;
  updateModalData: (modalType: keyof T, data: Record<string, unknown>) => void;
}

export const useModalState = <T extends Record<string, unknown>>(
  initialState: T
): UseModalStateReturn<T> => {
  const [modalState, setModalState] = useState<T>(initialState);

  const openModal = (modalType: keyof T, data: Record<string, unknown> = {}) => {
    setModalState((prev) => ({
      ...prev,
      [modalType]: {
        ...(prev[modalType] as Record<string, unknown>),
        ...data,
        open: true,
      },
    }));
  };

  const closeModal = (modalType: keyof T) => {
    setModalState((prev) => ({
      ...prev,
      [modalType]: {
        ...(prev[modalType] as Record<string, unknown>),
        open: false,
      },
    }));
  };

  const updateModalData = (modalType: keyof T, data: Record<string, unknown>) => {
    setModalState((prev) => ({
      ...prev,
      [modalType]: {
        ...(prev[modalType] as Record<string, unknown>),
        ...data,
      },
    }));
  };

  return {
    modalState,
    openModal,
    closeModal,
    updateModalData,
  };
};
