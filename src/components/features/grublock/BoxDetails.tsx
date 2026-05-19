"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { getWrappedGroupArray } from "@/lib/utils/groupedResponse";
import grublockService from "@/services/grublock";
import type { GrubLockBox, Recipient } from "@/types/domain/grublock";
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
    openUnlockBoxModal,
    closeUnlockBoxModal,
    openEmergencyUnlockModal,
    closeEmergencyUnlockModal,
    openLockBoxModal,
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
        const res = await grublockService.getList({ status: "active" });
        const payload = (res.data as {
          boxes?: Array<any>;
          groups?: { locked?: { array?: Array<any> }; unlocked?: { array?: Array<any> } };
        }) || { boxes: [] };
        const boxes = payload.boxes && payload.boxes.length > 0
          ? payload.boxes
          : [
              ...getWrappedGroupArray<any>(payload.groups?.locked),
              ...getWrappedGroupArray<any>(payload.groups?.unlocked),
            ];
        const selectedBox = boxId
          ? boxes.find((item) => item.id === boxId)
          : boxes[0];

        if (!mounted || !selectedBox) return;

        setBox({
          id: selectedBox.id,
          name: selectedBox.name,
          boxId: selectedBox.box_id,
          boxDisplayId: selectedBox.box_display_id,
          boxCode: selectedBox.vehicle_number || undefined,
          boxCode2: selectedBox.box_display_id || undefined,
          restaurantName: selectedBox.restaurant_boxes?.[0]?.restaurant?.name,
          status: selectedBox.grublock_status === "locked" ? "locked" : "unlocked",
          battery: selectedBox.battery_percentage ?? undefined,
          handler: undefined,
          lastUpdated: selectedBox.updated_at,
        });
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

  const isLockModalOpen = useMemo(() => {
    return (
      modalState.isLockBoxModalOpen ||
      modalState.isUnlockBoxModalOpen ||
      modalState.isEditDetailsModalOpen ||
      modalState.isEmergencyUnlockModalOpen
    );
  }, [modalState]);

  const detailsRows = useMemo(() => {
    const fallbackName = "BOX-2456";
    const fallbackCode = "DL12345";
    const fallbackSecondary = "DL2BD1234";
    const resolvedName = box?.name || fallbackName;
    const resolvedCode = box?.boxCode || box?.boxDisplayId || box?.boxId || fallbackCode;
    const resolvedSecondary = box?.boxCode2 || box?.boxDisplayId || fallbackSecondary;
    const resolvedStatus = box ? (box.status === "locked" ? "Box locked" : "Box unlocked") : "Box unlocked";

    return Array.from({ length: 4 }).map(() => ({
      timestamp: "06 Jun '25, 10:45:10",
      name: resolvedName,
      code: resolvedCode,
      secondaryCode: resolvedSecondary,
      status: resolvedStatus,
    }));
  }, [box]);

  const handleLockActionClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!box) return;

    if (box.status === "unlocked") {
      openLockBoxModal(box, e.currentTarget);
      return;
    }

    openUnlockBoxModal(box, e.currentTarget);
  };

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
      viewDetailsHref: `/grublock/details?id=${box.id}`,
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
      viewDetailsHref: `/grublock/details?id=${box.id}`,
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
            : detailsRows.map((item, index) => (
                <TableRow key={`${item.code}-${index}`}>
                  <TableCell className="py-5 !text-base font-semibold !text-[var(--color-neutral-secondary)]">
                    {item.timestamp}
                  </TableCell>
                  <TableCell className="py-5">
                    <div>
                      <div className="!text-base font-semibold text-[var(--color-neutral-secondary)] uppercase">
                        {item.name || `BOX-${item.code || "N/A"}`}
                      </div>
                      <div className="text-[14px] text-[var(--color-neutral-tertiary)]">
                        #{item.code || "N/A"}
                        {item.secondaryCode ? ` | ${item.secondaryCode}` : ""}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 !text-base !font-semibold !text-[var(--color-brand-default)]">
                    {item.status}
                  </TableCell>
                </TableRow>
              ))}
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

