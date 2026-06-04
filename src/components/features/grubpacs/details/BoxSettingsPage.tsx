"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { showError } from "@/components/ui/toast";
import { getContextualErrorMessage } from "@/lib/errors";
import type { BoxSettingsData } from "@/components/features/grubpacs/data/mockBoxSettingsData";
import type { Tab } from "./types";
import { getBoxState, getDefaultSettings } from "../utils/boxSettingsUtils";
import { useGrubPacsData } from "@/components/features/grubpacs/hooks/useGrubPacsData";
import { BoxSidebarItem } from "../components/BoxSidebar";
import { TopNavBar } from "../components/TopNavBar";
import { TitleRow } from "../components/TitleRow";
import { OnlineSettingsView, type OnlineSettingsEditDraft } from "./OnlineSettingsView";
import { OfflineView } from "./OfflineView";
import { LogsView } from "./LogsView";
import { TrackView } from "./TrackView";
import EditDetails from "../modals/EditDetailsModal";
import SuspendBoxModal from "../modals/SuspendBoxModal";
import DeleteBoxModal from "../modals/DeleteBoxModal";
import PermissionModal from "../modals/PermissionModal";
import SettingsApplyConfirmModal from "../modals/SettingsApplyConfirmModal";
import GrubLockModals from "@/components/features/grublock/components/GrubLockModals";
import { useGrubLockModals } from "@/components/features/grublock/hooks/useGrubLockModals";
import { defaultBoxFilters } from "@/components/features/shared/filter/BoxFilterModal";
import grublockService from "@/services/grublock";
import grubpacService from "@/services/grubpacs";
import type { ActionGrubPacBody } from "@/types/domain/grubpacs";
import type { GrubLockBox, Recipient } from "@/types/domain/grublock";

interface BoxSettingsPageProps {
  boxId?: string;
  pinSelectedOnLoad?: boolean;
  backPath?: string;
}

const SIDEBAR_SWITCH_SKELETON_MIN_MS = 200;

function toTempNumber(value: string | number | null | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toOnOffStatus(value: unknown): "on" | "off" {
  return String(value ?? "").trim().toLowerCase() === "on" ? "on" : "off";
}

function hasDraftChanges(current: OnlineSettingsEditDraft, initial: OnlineSettingsEditDraft): boolean {
  return (
    current.power_status !== initial.power_status ||
    current.ioniser_status !== initial.ioniser_status ||
    current.dual_zone_status !== initial.dual_zone_status ||
    current.camera_status !== initial.camera_status ||
    current.advert_screen_status !== initial.advert_screen_status ||
    current.zone1_temp !== initial.zone1_temp ||
    current.zone2_temp !== initial.zone2_temp
  );
}

function BoxSettingsPageSkeleton() {
  return (
    <div className="flex w-full h-screen overflow-hidden bg-white border border-[#e0e3e1]">
      <div className="w-60 shrink-0 flex flex-col border-r border-[#e0e3e1] overflow-hidden">
        <div className="p-4 border-b border-[#e0e3e1] shrink-0">
          <Skeleton height={32} width={100} className="rounded-lg" />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} height={82} className="rounded-xl" />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="h-14 border-b border-[#e0e3e1] px-6 flex items-center gap-4">
          <Skeleton height={24} width={120} className="rounded-md" />
          <Skeleton height={24} width={120} className="rounded-md" />
          <Skeleton height={24} width={120} className="rounded-md" />
        </div>

        <div className="px-6 pt-6 pb-4 shrink-0 space-y-3">
          <Skeleton height={34} width={320} className="rounded-md" />
          <Skeleton height={20} width={210} className="rounded-md" />
        </div>

        <div className="flex-1 min-h-0 px-6 pb-6">
          <Skeleton height="100%" className="rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function BoxDetailsPanelSkeleton() {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="h-14 border-b border-[#e0e3e1] px-6 flex items-center gap-4">
        <Skeleton height={24} width={120} className="rounded-md" />
        <Skeleton height={24} width={120} className="rounded-md" />
        <Skeleton height={24} width={120} className="rounded-md" />
      </div>

      <div className="px-6 pt-6 pb-4 shrink-0 space-y-3">
        <Skeleton height={34} width={320} className="rounded-md" />
        <Skeleton height={20} width={210} className="rounded-md" />
      </div>

      <div className="flex-1 min-h-0 px-6 pb-6">
        <Skeleton height="100%" className="rounded-2xl" />
      </div>
    </div>
  );
}

export default function BoxSettingsPage({ boxId, pinSelectedOnLoad = false, backPath }: BoxSettingsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("settings");
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [camFullscreen, setCamFullscreen] = useState(false);
  const [feedFullscreen, setFeedFullscreen] = useState(false);
  const isFullscreen = mapFullscreen || camFullscreen || feedFullscreen;

  const [editOpen, setEditOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [grublockStatus, setGrublockStatus] = useState<"LOCKED" | "UNLOCKED">("UNLOCKED");
  const [recipient, setRecipient] = useState<Recipient>({ countryCode: "IN" });
  const [statusAlert, setStatusAlert] = useState<{
    variant: "success" | "error";
    title: string;
    description: string;
  } | null>(null);

  const [isSettingsEditMode, setIsSettingsEditMode] = useState(false);
  const [isSettingsEntryLoading, setIsSettingsEntryLoading] = useState(false);
  const [isSettingsConfirmOpen, setIsSettingsConfirmOpen] = useState(false);
  const [isSettingsApplying, setIsSettingsApplying] = useState(false);
  const [isSidebarSwitchLoading, setIsSidebarSwitchLoading] = useState(false);
  const [pendingBoxId, setPendingBoxId] = useState<string | null>(null);
  const settingsEntryTimerRef = useRef<number | null>(null);
  const sidebarSwitchStartedAtRef = useRef<number>(0);
  const sidebarSwitchHideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!statusAlert) return;
    const timeout = window.setTimeout(() => setStatusAlert(null), 3500);
    return () => clearTimeout(timeout);
  }, [statusAlert]);

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

  const { grubpacsData, isLoading , refetch} = useGrubPacsData();

  const sidebarBoxes = useMemo(() => {
    if (!pinSelectedOnLoad) return grubpacsData;
    if (!boxId) return grubpacsData;

    const selectedIndex = grubpacsData.findIndex((item) => String(item.id) === String(boxId));
    if (selectedIndex <= 0) return grubpacsData;

    const selectedItem = grubpacsData[selectedIndex];
    return [selectedItem, ...grubpacsData.slice(0, selectedIndex), ...grubpacsData.slice(selectedIndex + 1)];
  }, [grubpacsData, boxId, pinSelectedOnLoad]);

  const selectedBoxCandidate =
    (boxId ? sidebarBoxes.find((b) => String(b.id) === boxId) : undefined) ?? sidebarBoxes[0];

  const hasSelectedBox = Boolean(selectedBoxCandidate);
  const selectedBox =
    selectedBoxCandidate ??
    ({
      id: "",
      name: "",
      code: "",
      boxId: "",
      status: "OFFLINE",
      locked: false,
    } as (typeof sidebarBoxes)[number]);

  const showFullPageSkeleton = isLoading && sidebarBoxes.length === 0;
  const showRightPanelSkeleton = (isLoading && sidebarBoxes.length > 0) || isSidebarSwitchLoading;

  const defaultSettings = getDefaultSettings(selectedBox.id);

  const settingsData: BoxSettingsData = {
    ...defaultSettings,
    boxId: selectedBox.id,
    hardware: {
      ...defaultSettings.hardware,
      power: {
        status:
          String(selectedBox.power ?? selectedBox.powerStatus ?? "").toUpperCase() === "ON"
            ? "ON"
            : "OFF",
        connected: String(selectedBox.status ?? "").toUpperCase() === "ONLINE",
      },
      grublock: {
        status: selectedBox.locked ? "LOCKED" : "UNLOCKED",
      },
      extThermostat: {
        temp: selectedBox.extThermostatTemp
          ? String(selectedBox.extThermostatTemp)
          : defaultSettings.hardware.extThermostat.temp,
      },
    },
    zone1: {
      set: (selectedBox.zone1Min as string) ?? defaultSettings.zone1.set,
      actual: (selectedBox.zone1Temp as string) ?? defaultSettings.zone1.actual,
    },
    zone2: {
      set: (selectedBox.zone2Min as string) ?? defaultSettings.zone2.set,
      actual: (selectedBox.zone2Temp as string) ?? defaultSettings.zone2.actual,
    },
  };

  const cameraStatusValue = String((selectedBox as Record<string, unknown>).camera_status ?? "");
  const advertScreenStatusValue = String(
    (selectedBox as Record<string, unknown>).advert_screen_status ?? "",
  );

  const initialSettingsDraft = useMemo<OnlineSettingsEditDraft>(() => {
    const selectedBoxRecord = selectedBox as Record<string, unknown>;

    return {
      power_status: toOnOffStatus(settingsData.hardware.power.status),
      ioniser_status: toOnOffStatus(settingsData.hardware.ioniser.status),
      dual_zone_status: toOnOffStatus(settingsData.hardware.dualZone.status),
      camera_status: toOnOffStatus(selectedBoxRecord.camera_status),
      advert_screen_status: toOnOffStatus(selectedBoxRecord.advert_screen_status),
      zone1_temp: toTempNumber(settingsData.zone1.set),
      zone2_temp: toTempNumber(settingsData.zone2.set),
    };
  }, [
    selectedBox.id,
    selectedBox.power,
    selectedBox.powerStatus,
    settingsData.hardware.power.status,
    settingsData.hardware.ioniser.status,
    settingsData.hardware.dualZone.status,
    settingsData.zone1.set,
    settingsData.zone2.set,
    cameraStatusValue,
    advertScreenStatusValue,
  ]);

  const [settingsDraft, setSettingsDraft] = useState<OnlineSettingsEditDraft>(initialSettingsDraft);
  const [settingsSnapshot, setSettingsSnapshot] = useState<OnlineSettingsEditDraft>(
    initialSettingsDraft,
  );

  useEffect(() => {
    if (isSettingsApplying) return;
    setSettingsDraft(initialSettingsDraft);
    setSettingsSnapshot(initialSettingsDraft);
    setIsSettingsEditMode(false);
    setIsSettingsEntryLoading(false);
    setIsSettingsConfirmOpen(false);
    setIsSettingsApplying(false);
  }, [initialSettingsDraft]);

  useEffect(() => {
    return () => {
      if (settingsEntryTimerRef.current !== null) {
        window.clearTimeout(settingsEntryTimerRef.current);
      }
      if (sidebarSwitchHideTimerRef.current !== null) {
        window.clearTimeout(sidebarSwitchHideTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isSidebarSwitchLoading) return;
    if (!pendingBoxId) {
      setIsSidebarSwitchLoading(false);
      return;
    }

    if (String(boxId ?? "") === pendingBoxId && !isLoading) {
      const elapsed = Date.now() - sidebarSwitchStartedAtRef.current;
      const remaining = Math.max(0, SIDEBAR_SWITCH_SKELETON_MIN_MS - elapsed);

      if (sidebarSwitchHideTimerRef.current !== null) {
        window.clearTimeout(sidebarSwitchHideTimerRef.current);
      }

      sidebarSwitchHideTimerRef.current = window.setTimeout(() => {
        setIsSidebarSwitchLoading(false);
        setPendingBoxId(null);
        sidebarSwitchHideTimerRef.current = null;
      }, remaining);
    }
  }, [boxId, isLoading, isSidebarSwitchLoading, pendingBoxId]);

  const boxState = getBoxState(selectedBox.status);
  const isOnline = boxState === "online";

  useEffect(() => {
    setGrublockStatus(settingsData.hardware.grublock.status);
  }, [settingsData.hardware.grublock.status, boxId]);

  const selectedGrubLockBox = useMemo<GrubLockBox>(
    () => ({
      id: String(selectedBox.id),
      name: selectedBox.name || "BOX",
      boxId: selectedBox.boxId || String(selectedBox.id),
      status: grublockStatus === "LOCKED" ? "locked" : "unlocked",
    }),
    [selectedBox.id, selectedBox.name, selectedBox.boxId, grublockStatus],
  );

  const isGrubLockModalOpen =
    modalState.isLockBoxModalOpen ||
    modalState.isUnlockBoxModalOpen ||
    modalState.isEditDetailsModalOpen ||
    modalState.isEmergencyUnlockModalOpen;

  const canApplySettingsChanges = useMemo(
    () => hasDraftChanges(settingsDraft, settingsSnapshot),
    [settingsDraft, settingsSnapshot],
  );

  const handleOpenGrubLockFlow = (buttonElement: HTMLElement | null) => {
    if (!buttonElement) return;
    if (grublockStatus === "UNLOCKED") {
      openLockBoxModal(selectedGrubLockBox, buttonElement);
      return;
    }
    openUnlockBoxModal(selectedGrubLockBox, buttonElement);
  };

  const handleLockSubmit = async (nextRecipient: Recipient) => {
    if (!nextRecipient.name || !nextRecipient.phone) return;
    const response = await grublockService.lockBox(String(selectedBox.id), {
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
    setGrublockStatus("LOCKED");
    setStatusAlert({
      variant: "success",
      title: "Box locked successfully!",
      description:
        "An OTP will be sent to the recipient when the delivery person initiates the drop-off.",
    });
  };

  const handleEditSave = async (nextRecipient: Recipient) => {
    if (!nextRecipient.name || !nextRecipient.phone) return;
    await grublockService.updateRecipient(String(selectedBox.id), {
      name: nextRecipient.name,
      phone: nextRecipient.phone,
      countryCode: nextRecipient.countryCode || "IN",
      keepLocked: true,
    });
    setRecipient(nextRecipient);
  };

  const handleEmergencyUnlockRequest = async (reason: string) => {
    const response = await grublockService.emergencyUnlockBox(String(selectedBox.id), reason);
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

    setGrublockStatus("UNLOCKED");
    setStatusAlert({
      variant: "success",
      title: "Emergency unlock successful!",
      description: "The box has been unlocked without OTP verification.",
    });
  };

  const handleStartSettingsEdit = () => {
    if (!isOnline || isSettingsEditMode) return;

    if (activeTab !== "settings") {
      setActiveTab("settings");
    }

    if (settingsEntryTimerRef.current !== null) {
      window.clearTimeout(settingsEntryTimerRef.current);
    }

    setIsSettingsEntryLoading(true);
    settingsEntryTimerRef.current = window.setTimeout(() => {
      setIsSettingsEntryLoading(false);
      setIsSettingsEditMode(true);
      setSettingsDraft(settingsSnapshot);
    }, 650);
  };

  useEffect(() => {
    if (searchParams.get("editSettings") !== "1") return;
    if (!hasSelectedBox || !isOnline || isSettingsEditMode || isSettingsEntryLoading) return;
    handleStartSettingsEdit();
  }, [searchParams, hasSelectedBox, isOnline, isSettingsEditMode, isSettingsEntryLoading]);

  const handleCancelSettingsEdit = () => {
    setSettingsDraft(settingsSnapshot);
    setIsSettingsEditMode(false);
    setIsSettingsConfirmOpen(false);
  };



const handleConfirmApplySettings = async () => {
  if (!canApplySettingsChanges) {
    setIsSettingsConfirmOpen(false);
    return;
  }

  try {
    setIsSettingsApplying(true);

    const payload: ActionGrubPacBody = { ids: [String(selectedBox.id)] };

    if (settingsDraft.power_status !== settingsSnapshot.power_status)
      payload.power_status = settingsDraft.power_status;
    if (settingsDraft.ioniser_status !== settingsSnapshot.ioniser_status)
      payload.ioniser_status = settingsDraft.ioniser_status;
    if (settingsDraft.dual_zone_status !== settingsSnapshot.dual_zone_status)
      payload.dual_zone_status = settingsDraft.dual_zone_status;
    if (settingsDraft.camera_status !== settingsSnapshot.camera_status)
      payload.camera_status = settingsDraft.camera_status;
    if (settingsDraft.advert_screen_status !== settingsSnapshot.advert_screen_status)
      payload.advert_screen_status = settingsDraft.advert_screen_status;
    if (settingsDraft.zone1_temp !== settingsSnapshot.zone1_temp && settingsDraft.zone1_temp > 0)
      payload.zone1_temp = settingsDraft.zone1_temp;
    if (settingsDraft.zone2_temp !== settingsSnapshot.zone2_temp && settingsDraft.zone2_temp > 0)
      payload.zone2_temp = settingsDraft.zone2_temp;

    const response = await grubpacService.action(payload);

    if (!response.success) {
      setStatusAlert({
        variant: "error",
        title: "Failed to apply settings",
        description: response.error ?? "Unable to apply settings. Please try again.",
      });
      setIsSettingsConfirmOpen(false);
      return;
    }

    await refetch();
const appliedDraft = { ...settingsDraft };  
setIsSettingsConfirmOpen(false);
setIsSettingsEditMode(false);
setSettingsDraft(appliedDraft);             
setSettingsSnapshot(appliedDraft);          
setStatusAlert({
  variant: "success",
  title: "Settings applied successfully!",
  description: "Changes will reflect shortly.",
});
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to apply settings.";
    setStatusAlert({
      variant: "error",
      title: "Failed to apply settings",
      description: message,
    });
    setIsSettingsConfirmOpen(false);
  } finally {
    // setIsSettingsApplying(false);
  }
};

  const handleSidebarBoxClick = (targetId: string | number) => {
    const nextId = String(targetId);
    if (nextId === String(selectedBox.id)) return;

    if (sidebarSwitchHideTimerRef.current !== null) {
      window.clearTimeout(sidebarSwitchHideTimerRef.current);
      sidebarSwitchHideTimerRef.current = null;
    }
    sidebarSwitchStartedAtRef.current = Date.now();

    setPendingBoxId(nextId);
    setIsSidebarSwitchLoading(true);
    const query = new URLSearchParams({ id: String(nextId) });
    if (backPath) {
      query.set("from", backPath);
    }
    router.push(`/grubpacs/details?${query.toString()}`);
  };

  const handleGoBack = () => {
    if (backPath) {
      router.push(backPath);
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/grubpacs/list");
  };

  if (showFullPageSkeleton) {
    return <BoxSettingsPageSkeleton />;
  }

  if (!hasSelectedBox) {
    return (
      <div className="flex w-full h-screen overflow-hidden bg-white border border-[#e0e3e1]">
        <div className="w-60 shrink-0 flex flex-col border-r border-[#e0e3e1] overflow-hidden">
          <div className="p-4 border-b border-[#e0e3e1] shrink-0">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 h-8 px-3 border border-[#6b7971] rounded-lg text-xs font-semibold text-[#6b7971] uppercase tracking-wide hover:bg-[#f7f8f7] transition-colors cursor-pointer"
            >
              <Image src="/GrubPac/Box-settings/arrow-narrow-left.svg" alt="" width={16} height={16} />
              GO BACK
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-[#03130a]">No GrubPac found</h2>
            <p className="text-sm text-[#6b7971]">The selected box is unavailable right now.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen overflow-hidden bg-white border border-[#e0e3e1]">
      {statusAlert && (
        <div className="fixed top-2 left-2 right-2 z-[9999]">
          <Alert
            variant={statusAlert.variant}
            appearance="solid"
            onDismiss={() => setStatusAlert(null)}
            autoDismiss={true}
            dismissTime={3500}
            className="px-6 py-3"
          >
            <AlertTitle className="text-[18px] font-semibold whitespace-nowrap">
              {statusAlert.title}
            </AlertTitle>
            <AlertDescription className="text-[16px] flex-1" truncate title={statusAlert.description}>
              {statusAlert.description}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="w-60 shrink-0 flex flex-col border-r border-[#e0e3e1] overflow-hidden">
        <div className="p-4 border-b border-[#e0e3e1] shrink-0">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 h-8 px-3 border border-[#6b7971] rounded-lg text-xs font-semibold text-[#6b7971] uppercase tracking-wide hover:bg-[#f7f8f7] transition-colors cursor-pointer"
          >
            <Image src="/GrubPac/Box-settings/arrow-narrow-left.svg" alt="" width={16} height={16} />
            GO BACK
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sidebarBoxes.map((box) => (
            <BoxSidebarItem
              key={box.id}
              item={box}
              isActive={String(box.id) === String(selectedBox.id)}
              onClick={() => handleSidebarBoxClick(box.id)}
            />
          ))}
        </div>
      </div>

      {showRightPanelSkeleton ? (
        <BoxDetailsPanelSkeleton />
      ) : (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {!isFullscreen && <TopNavBar activeTab={activeTab} onTabChange={setActiveTab} />}

          <div className="px-6 pt-6 pb-4 shrink-0">
            <TitleRow
              box={selectedBox}
              settings={settingsData}
              isOnline={isOnline}
              grublockStatus={grublockStatus}
              isGrubLockActive={isGrubLockModalOpen}
              isSettingsEditing={isSettingsEditMode}
              isSettingsEntryLoading={isSettingsEntryLoading}
              canApplySettingsChanges={canApplySettingsChanges}
              isApplyingSettings={isSettingsApplying}
              onGrubLockClick={(event) => handleOpenGrubLockFlow(event.currentTarget)}
              onSettingsClick={handleStartSettingsEdit}
              onSettingsApplyAction={() => setIsSettingsConfirmOpen(true)}
              onSettingsCancelAction={handleCancelSettingsEdit}
              onBack={
                mapFullscreen
                  ? () => setMapFullscreen(false)
                  : camFullscreen
                  ? () => setCamFullscreen(false)
                  : feedFullscreen
                  ? () => setFeedFullscreen(false)
                  : undefined
              }
              onEdit={() => setEditOpen(true)}
              onSuspend={() => setSuspendOpen(true)}
              onDelete={() => setDeleteOpen(true)}
              onPermission={() => setPermissionOpen(true)}
            />
          </div>

          <div className="flex-1 min-h-0">
            {activeTab === "track" ? (
              <TrackView
                isOnline={isOnline}
                mapFullscreen={mapFullscreen}
                onMapFullscreenChange={setMapFullscreen}
                camFullscreen={camFullscreen}
                onCamFullscreenChange={setCamFullscreen}
                feedFullscreen={feedFullscreen}
                onFeedFullscreenChange={setFeedFullscreen}
              />
            ) : activeTab === "logs" ? (
              <LogsView />
            ) : isOnline ? (
              <OnlineSettingsView
                settings={settingsData}
                grublockStatus={grublockStatus}
                isEditMode={isSettingsEditMode}
                isEditEntryLoading={isSettingsEntryLoading}
                editDraft={settingsDraft}
                onEditDraftChange={setSettingsDraft}
              />
            ) : (
              <OfflineView boxState={boxState} />
            )}
          </div>
        </div>
      )}

      <EditDetails
        open={editOpen}
        onCloseEditModalAction={() => setEditOpen(false)}
        grubpacId={String(selectedBox.id)}
        initialName={selectedBox.name ?? ""}
        initialBoxId={selectedBox.boxId ?? ""}
        initialVehicleNumber={selectedBox.code ?? ""}
      />
      <SuspendBoxModal
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        boxName={selectedBox.code ?? selectedBox.name ?? "BOX-2456"}
      />
      <DeleteBoxModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        boxName={selectedBox.code ?? selectedBox.name ?? "BOX-2456"}
      />
      <PermissionModal
        open={permissionOpen}
        onClose={() => setPermissionOpen(false)}
        onEdit={() => {
          setPermissionOpen(false);
          setEditOpen(true);
        }}
        accessMode={selectedBox.accessMode ?? "public"}
        grubpacId={String(selectedBox.id)}
        excludedCount={selectedBox.permissionsBlockedCount ?? selectedBox.blockedEmployeeIds?.length ?? 0}
      />

      <SettingsApplyConfirmModal
        open={isSettingsConfirmOpen}
        onCloseAction={() => setIsSettingsConfirmOpen(false)}
        onConfirmAction={handleConfirmApplySettings}
        isSubmitting={isSettingsApplying}
        boxName={selectedBox.name ?? selectedBox.code ?? "BOX"}
      />

      <GrubLockModals
        modalState={modalState}
        showFilterModal={false}
        filterState={defaultBoxFilters}
        selectedIds={new Set([String(selectedBox.id)])}
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
}
