"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { FaAngleLeft } from "react-icons/fa6";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { showError } from "@/components/ui/toast";
import { getContextualErrorMessage } from "@/lib/errors";
import grublockService from "@/services/grublock";
import type { GrubLockBox, Recipient } from "@/types/domain/grublock";
import { apiGrubLockToBox } from "./api/mappers";
import { useGrubLockModals } from "./hooks/useGrubLockModals";
import GrubLockModals from "./components/GrubLockModals";
import { defaultBoxFilters } from "@/components/features/shared/filter/BoxFilterModal";

const BoxDetails = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const boxId = searchParams.get("id") || "";
  const [box, setBox] = useState<GrubLockBox | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recipient, setRecipient] = useState<Recipient>({
    countryCode: "IN",
  });
  const [successAlert, setSuccessAlert] = useState<{
    title: string;
    description: string;
    viewDetailsHref?: string;
  } | null>(null);

  const {
    modalState,
    closeGroupDetailsModal,
    closeBoxDetailsModal,
    closeUnlockBoxModal,
    openEmergencyUnlockModal,
    closeEmergencyUnlockModal,
    closeLockBoxModal,
    closeHaveEmergencyModal,
    closeApplySettingsModal,
    openEditDetailsModal,
    closeEditDetailsModal,
  } = useGrubLockModals();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSuccessAlert(null);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [successAlert]);

  useEffect(() => {
    let mounted = true;

    const fetchBox = async () => {
      try {
        setIsLoading(true);
        const targetId = boxId.trim();
        if (!targetId) {
          if (mounted) setBox(null);
          return;
        }

        const res = await grublockService.getDetails(targetId);
        if (!mounted) return;

        if (!res.success || !res.data) {
          setBox(null);
          if (res.error) {
            showError(res.error);
          }
          return;
        }

        setBox(apiGrubLockToBox(res.data));
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchBox();
    return () => {
      mounted = false;
    };
  }, [boxId]);

  const handleLockSubmit = async (nextRecipient: Recipient) => {
    if (!box || !nextRecipient.name || !nextRecipient.phone) return;

    const response = await grublockService.lockBox(box.id, {
      name: nextRecipient.name,
      phone: nextRecipient.phone,
      countryCode: nextRecipient.countryCode || "IN",
    });

    if (!response.success) {
      showError(
        getContextualErrorMessage(
          "box.lock",
          response,
          "Could not lock box. Please try again.",
        ),
      );
      return;
    }

    setRecipient(nextRecipient);
    setBox((prev) =>
      prev
        ? {
            ...prev,
            status: "locked",
          }
        : prev,
    );
    setSuccessAlert({
      title: "Box locked successfully!",
      description:
        "An OTP will be sent to the recipient when the delivery person initiates the drop-off.",
      viewDetailsHref: `/grubpacs/details?id=${box.id}`,
    });
  };

  const handleEditSave = async (nextRecipient: Recipient) => {
    if (!box || !nextRecipient.name || !nextRecipient.phone) return;
    await grublockService.updateRecipient(box.id, {
      name: nextRecipient.name,
      phone: nextRecipient.phone,
      countryCode: nextRecipient.countryCode || "IN",
      keepLocked: true,
    });
    setRecipient(nextRecipient);
  };

  const handleEmergencyUnlockRequest = async (reason: string) => {
    if (!box) return;
    const response = await grublockService.emergencyUnlockBox(box.id, reason);
    if (!response.success) {
      showError(
        getContextualErrorMessage(
          "box.unlock",
          response,
          "Could not unlock box. Please try again.",
        ),
      );
      return;
    }

    setBox((prev) =>
      prev
        ? {
            ...prev,
            status: "unlocked",
          }
        : prev,
    );
    setSuccessAlert({
      title: "Emergency unlock successful!",
      description: "The box has been unlocked without OTP verification.",
      viewDetailsHref: `/grubpacs/details?id=${box.id}`,
    });
  };

  return (
    <div>
      {successAlert && (
        <div className="fixed top-2 left-2 right-2 z-[9999]">
          <Alert variant="success" appearance="solid" className="px-6 py-3">
            <AlertTitle className="text-[18px] font-semibold whitespace-nowrap">
              {successAlert.title}
            </AlertTitle>
            <AlertDescription className="text-[16px] flex-1" truncate title={successAlert.description}>
              {successAlert.description}
            </AlertDescription>
            {successAlert.viewDetailsHref && (
              <Button
                variant="neutral"
                appearance="ghost"
                className="ml-auto flex items-center gap-1 shrink-0 !p-0 text-green-700 hover:text-green-800"
                onClick={() => {
                  const href = successAlert.viewDetailsHref;
                  if (!href) return;
                  setSuccessAlert(null);
                  router.push(href);
                }}
              >
                <span className="font-medium text-[16px] uppercase">VIEW DETAILS</span>
              </Button>
            )}
          </Alert>
        </div>
      )}

      <h1 className="flex gap-2 items-center text-2xl text-[var(--color-neutral-secondary)] mb-6">
        <button onClick={() => router.back()}>
          <FaAngleLeft className="cursor-pointer" />
        </button>
        <span className="mr-auto">Details</span>
      </h1>

      <Table className="bg-white">
        <TableHead>
          <TableRow>
            <TableCell className="!text-[var(--color-neutral-primary)] text-[14px] font-normal">
              Time stamp
            </TableCell>
            <TableCell className="!pr-32 !text-[var(--color-neutral-secondary)] text-[14px] font-normal">
              Box changed
            </TableCell>
            <TableCell className="!text-[var(--color-neutral-primary)] text-[14px] font-normal">
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell className="py-5">
                    <Skeleton height={20} width={160} />
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="space-y-2">
                      <Skeleton height={20} width={120} />
                      <Skeleton height={16} width={160} />
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <Skeleton height={20} width={110} />
                  </TableCell>
                </TableRow>
              ))
            : null}
        </TableBody>
      </Table>

      <GrubLockModals
        modalState={modalState}
        showFilterModal={false}
        filterState={defaultBoxFilters}
        selectedIds={new Set(box ? [box.id] : [])}
        recipient={recipient}
        onCloseGroupDetailsModal={closeGroupDetailsModal}
        onCloseBoxDetailsModal={closeBoxDetailsModal}
        onCloseUnlockBoxModal={closeUnlockBoxModal}
        onCloseEmergencyUnlockModal={closeEmergencyUnlockModal}
        onCloseLockBoxModal={closeLockBoxModal}
        onCloseHaveEmergencyModal={closeHaveEmergencyModal}
        onCloseApplySettingsModal={closeApplySettingsModal}
        onCloseFilterModal={() => {}}
        onApplyFilter={() => {}}
        onEmergencyUnlock={closeEmergencyUnlockModal}
        onOpenEmergencyUnlockModal={openEmergencyUnlockModal}
        onHaveEmergencyUnlock={() => {}}
        onApplySettings={() => {}}
        onOpenEditDetailsModal={openEditDetailsModal}
        onCloseEditDetailsModal={closeEditDetailsModal}
        onLockSubmit={handleLockSubmit}
        onEditSave={handleEditSave}
        onEmergencyUnlockRequest={handleEmergencyUnlockRequest}
      />
    </div>
  );
};

export default BoxDetails;
