"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GroupCollapseTable from "@/components/ui/GroupCollapseTable";
import GrubLockListHeader from "./components/GrubLockListHeader";
import GrubLockListToolbar from "./components/GrubLockListToolbar";
import { GrubLockGroupTable } from "./table/grublock-group-table";
import GrubLockListSkeleton from "./components/GrubLockListSkeleton";
import SelectionActionBar from "./components/SelectionActionBar";
import GrubLockModals from "./components/GrubLockModals";
import { useGrubLockModals } from "./hooks/useGrubLockModals";
import { useGrubLockState } from "./hooks/useGrubLockState";
import { useGrubLockGroupTransformation } from "./hooks/useGrubLockGroupTransformation";
import { useGrubLockFilters } from "./hooks/useGrubLockFilters";
import { useGrubLockHandlers } from "./hooks/useGrubLockHandlers";
import { useGrubLockSearch } from "./hooks/useGrubLockSearch";
import type { SearchResult } from "@/components/ui/SearchInputWithDropdown";
import type { GrubLockBox, Recipient } from "@/types/domain/grublock";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { showError } from "@/components/ui/toast";
import grublockService from "@/services/grublock";
import { useGrubLockQuery } from "./hooks/useGrubLockQuery";
import { mapGrubLockFiltersToApiParams } from "./utils/filterParams";
import { getApiErrorMessage, getContextualErrorMessage } from "@/lib/errors";

export default function GrubLockListContent({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedBoxIdFromQuery = searchParams.get("selectBoxId");
  const [recipient, setRecipient] = useState<Recipient>({
    countryCode: "IN",
  });
  const [isLocking, setIsLocking] = useState(false);
  const [isEditingRecipient, setIsEditingRecipient] = useState(false);
  const [isEmergencyUnlocking, setIsEmergencyUnlocking] = useState(false);
  const [emergencyUnlockReason, setEmergencyUnlockReason] = useState("");
  const [loadingRowIds, setLoadingRowIds] = useState<Set<string>>(new Set());
  const [statusOverrides, setStatusOverrides] = useState<Record<string, "locked" | "unlocked">>({});
  const [actionAlert, setActionAlert] = useState<{
    variant: "success" | "error";
    title: string;
    description: string;
    viewDetailsHref?: string;
  } | null>(null);
  const [showLoadErrorAlert, setShowLoadErrorAlert] = useState(false);

  useEffect(() => {
    if (!actionAlert) return;
    const timeout = setTimeout(() => setActionAlert(null), 3000);
    return () => clearTimeout(timeout);
  }, [actionAlert]);

  const { state, actions } = useGrubLockState();
  const { selectedIds, searchTerm, filters, isGrouped, showUnlockedBoxes, showFilterModal, openIndex } = state;
  const {
    setSelectedIds,
    setSearchTerm,
    setFilters,
    setIsGrouped,
    setShowUnlockedBoxes,
    setShowFilterModal,
    setOpenIndex,
    handleRowSelect,
    handleSelectAll,
    handleClearSelection,
    handleSearchClear,
  } = actions;

  const apiParams = useMemo(() => mapGrubLockFiltersToApiParams(filters), [filters]);
  const {
    data: queryData,
    isLoading,
    isFetching,
    isPageLoading,
    isError,
    error,
    refetch,
    refetchGroup,
  } = useGrubLockQuery({
    params: apiParams,
    isGrouped,
    showUnlockedBoxes,
  });
  const groups = queryData?.groups ?? [];
  const totalEntriesFromQuery = queryData?.totalEntries;
  const shouldShowSkeleton = isLoading || isPageLoading || (isGrouped && isFetching);
  const wasGroupedRef = useRef(isGrouped);

  useEffect(() => {
    if (wasGroupedRef.current && !isGrouped) {
      refetch();
    }
    wasGroupedRef.current = isGrouped;
  }, [isGrouped, refetch]);

  useEffect(() => {
    if (!isError) {
      setShowLoadErrorAlert(false);
      return;
    }

    setShowLoadErrorAlert(true);
    const timeout = setTimeout(() => setShowLoadErrorAlert(false), 3000);
    return () => clearTimeout(timeout);
  }, [isError, error]);

  const {
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
  } = useGrubLockModals();

  useEffect(() => {
    if (openIndex !== null) {
      return;
    }

    if (modalState.isBoxDetailsModalOpen) closeBoxDetailsModal();
    if (modalState.isUnlockBoxModalOpen) closeUnlockBoxModal();
    if (modalState.isLockBoxModalOpen) closeLockBoxModal();
    if (modalState.isEditDetailsModalOpen) closeEditDetailsModal();
    if (modalState.isHaveEmergencyModalOpen) closeHaveEmergencyModal();
    if (modalState.isEmergencyUnlockModalOpen) closeEmergencyUnlockModal();
    if (modalState.isApplySettingsModalOpen) closeApplySettingsModal();
  }, [
    openIndex,
    modalState.isApplySettingsModalOpen,
    modalState.isBoxDetailsModalOpen,
    modalState.isEditDetailsModalOpen,
    modalState.isEmergencyUnlockModalOpen,
    modalState.isHaveEmergencyModalOpen,
    modalState.isLockBoxModalOpen,
    modalState.isUnlockBoxModalOpen,
    closeApplySettingsModal,
    closeBoxDetailsModal,
    closeEditDetailsModal,
    closeEmergencyUnlockModal,
    closeHaveEmergencyModal,
    closeLockBoxModal,
    closeUnlockBoxModal,
  ]);

  const { allBoxes, transformedGroups } = useGrubLockGroupTransformation({
    groups,
    isGrouped,
    showUnlockedBoxes,
  });

  const { filteredGroups, totalEntries } = useGrubLockFilters({
    groups: transformedGroups,
    searchTerm,
  });
  const hasGroupedResults = isGrouped
    ? filteredGroups.some((group) => (group.items?.length ?? 0) > 0)
    : true;
  const shouldShowGroupedEmpty = isGrouped && !showUnlockedBoxes && !hasGroupedResults;
  const { results: searchApiResults } = useGrubLockSearch({
    query: searchTerm,
    limit: 50,
    status: "active",
  });

  useEffect(() => {
    if (!selectedBoxIdFromQuery || transformedGroups.length === 0) {
      return;
    }

    const normalizedTargetId = String(selectedBoxIdFromQuery);
    const matchedGroupIndex = transformedGroups.findIndex((group) =>
      (group.items ?? []).some((box) => String(box.id) === normalizedTargetId),
    );

    if (matchedGroupIndex < 0) {
      return;
    }

    const matchedBox = transformedGroups[matchedGroupIndex]?.items?.find(
      (box) => String(box.id) === normalizedTargetId,
    );

    setOpenIndex(matchedGroupIndex);
    if (matchedBox?.name) {
      setSearchTerm(matchedBox.name);
    }
  }, [selectedBoxIdFromQuery, setOpenIndex, setSearchTerm, transformedGroups]);

  const entriesCount = searchTerm ? totalEntries : (totalEntriesFromQuery ?? totalEntries);

  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchTerm || searchTerm.length === 0) {
      return [];
    }

    return searchApiResults.map((item) => {
      const identifier = item.box_display_id ? `(#${item.box_display_id})` : undefined;
      return {
        id: item.id,
        name: item.name,
        identifier,
      };
    });
  }, [searchTerm, searchApiResults]);

  const handleSearchResultClick = (result: SearchResult) => {
    setSearchTerm(result.name ?? "");

    const selectedId = String(result.id);
    const matchedGroupIndex = transformedGroups.findIndex((group) =>
      (group.items ?? []).some((box) => String(box.id) === selectedId),
    );

    if (matchedGroupIndex >= 0) {
      setOpenIndex(matchedGroupIndex);
    }
  };

  const {
    handleGroupClick,
    handleApplySettings,
    handleEmergencyUnlockConfirm,
  } = useGrubLockHandlers({
    selectedIds,
    allBoxes,
    setSelectedIds,
    openGroupDetailsModal,
    openBoxDetailsModal,
    closeApplySettingsModal,
    closeEmergencyUnlockModal,
    openApplySettingsModal,
  });

  const handleRowClick = (box: GrubLockBox) => {
    router.push(`/grubpacs/details?id=${box.id}&pinSelected=1&from=%2Fgrublock%2Flist`);
  };

  const handleEmergencyUnlock = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    openHaveEmergencyModal(e.currentTarget);
  };

  const handleHaveEmergencyUnlock = () => {
    const emergencyButtonAnchor = modalState.emergencyUnlockButtonElement;
    closeHaveEmergencyModal();
    openEmergencyUnlockModal(undefined, emergencyButtonAnchor);
  };

  const handleViewAllBoxes = () => {
    setIsGrouped(false);
    setShowUnlockedBoxes(true);
    setSearchTerm("");
  };

  const handleGroupedChange = (checked: boolean) => {
    setIsGrouped(checked);
    if (checked) {
      setShowUnlockedBoxes(false);
    }
  };

  const mapBoxToRecipient = (box: { consumerFullName?: string; consumerPhone?: string; consumerCountryCode?: string }): Recipient => ({
    name: box.consumerFullName,
    phone: box.consumerPhone,
    countryCode: box.consumerCountryCode || "IN",
  });

  const selectedBoxId = modalState.selectedBox?.id;
  const activeLockDetailsRowId =
    modalState.isUnlockBoxModalOpen ||
      modalState.isEditDetailsModalOpen ||
      modalState.isLockBoxModalOpen ||
      modalState.isHaveEmergencyModalOpen ||
      modalState.isEmergencyUnlockModalOpen
      ? selectedBoxId
      : undefined;

  const addLoadingRows = (ids: string[]) => {
    setLoadingRowIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const removeLoadingRows = (ids: string[]) => {
    setLoadingRowIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  const applyStatusOverride = (ids: string[], status: "locked" | "unlocked") => {
    setStatusOverrides((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] = status;
      });
      return next;
    });
  };

  const clearStatusOverrides = (ids: string[]) => {
    setStatusOverrides((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        delete next[id];
      });
      return next;
    });
  };

  const handleLockSubmit = async (nextRecipient: Recipient) => {
    if (!selectedBoxId || !nextRecipient.name || !nextRecipient.phone) return;

    const targetIds = [selectedBoxId];

    try {
      setIsLocking(true);
      addLoadingRows(targetIds);
      const response = await grublockService.lockBox(selectedBoxId, {
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
      applyStatusOverride(targetIds, "locked");
      setActionAlert({
        variant: "success",
        title: "Box locked successfully!",
        description:
          "An OTP will be sent to the recipient when the delivery person initiates the drop-off.",
        viewDetailsHref: `/grubpacs/details?id=${selectedBoxId}&pinSelected=1&from=%2Fgrublock%2Flist`,
      });
      await refetch();
      clearStatusOverrides(targetIds);
    } catch (submitError) {
      showError(
        getContextualErrorMessage(
          "box.lock",
          submitError,
          "Could not lock box. Please try again.",
        ),
      );
    } finally {
      setIsLocking(false);
      removeLoadingRows(targetIds);
    }
  };

  const handleEditSave = async (nextRecipient: Recipient) => {
    if (!selectedBoxId || !nextRecipient.name || !nextRecipient.phone) return;

    try {
      setIsEditingRecipient(true);
      const response = await grublockService.updateRecipient(selectedBoxId, {
        name: nextRecipient.name,
        phone: nextRecipient.phone,
        countryCode: nextRecipient.countryCode || "IN",
        keepLocked: true,
      });

      if (!response.success) {
        showError(
          getContextualErrorMessage(
            "box.recipient.update",
            response,
            "Could not update recipient details. Please try again.",
          ),
        );
        return;
      }

      setRecipient(nextRecipient);
      await refetch();
    } catch (submitError) {
      showError(
        getContextualErrorMessage(
          "box.recipient.update",
          submitError,
          "Could not update recipient details. Please try again.",
        ),
      );
    } finally {
      setIsEditingRecipient(false);
    }
  };

  const handleEmergencyUnlockApply = async (reason: string) => {
    const emergencyUnlockIds = selectedIds.size > 0
      ? Array.from(selectedIds)
      : selectedBoxId
        ? [selectedBoxId]
        : [];

    if (emergencyUnlockIds.length === 0) {
      setActionAlert({
        variant: "error",
        title: "Emergency unlock failed",
        description: "Please select at least one box to unlock.",
      });
      return false;
    }

    try {
      setIsEmergencyUnlocking(true);
      addLoadingRows(emergencyUnlockIds);
      const response = await grublockService.emergencyUnlock({
        ids: emergencyUnlockIds,
        reason,
      });

      if (!response.success) {
        setActionAlert({
          variant: "error",
          title: "Emergency unlock failed",
          description: getContextualErrorMessage(
            "box.unlock",
            response,
            "Could not unlock box. Please try again.",
          ),
        });
        return false;
      }

      applyStatusOverride(emergencyUnlockIds, "unlocked");
      setActionAlert({
        variant: "success",
        title: "Unlock Request Sent!",
        description:
          "Your emergency unlock request has been sent to the selected box. Please check the boxes to confirm.",
        viewDetailsHref: "/grublock/details",
      });
      setSelectedIds(new Set());
      await refetch();
      clearStatusOverrides(emergencyUnlockIds);
      return true;
    } catch (submitError) {
      setActionAlert({
        variant: "error",
        title: "Emergency unlock failed",
        description: getContextualErrorMessage(
          "box.unlock",
          submitError,
          "Could not unlock box. Please try again.",
        ),
      });
      return false;
    } finally {
      setIsEmergencyUnlocking(false);
      removeLoadingRows(emergencyUnlockIds);
    }
  };

  const handleEmergencyUnlockPrepare = async (reason: string) => {
    const isSingleBoxFlow = selectedIds.size === 0 && Boolean(selectedBoxId);

    if (isSingleBoxFlow) {
      closeEmergencyUnlockModal();
      await handleEmergencyUnlockApply(reason);
      return "direct" as const;
    }

    setEmergencyUnlockReason(reason);
    return "apply" as const;
  };

  const handleApplySettingsWithEmergency = async () => {
    if (modalState.settingType === "EMERGENCY UNLOCK") {
      const reason = emergencyUnlockReason.trim();
      if (!reason) {
        showError("Please provide a reason for emergency unlock.");
        return;
      }
      closeApplySettingsModal();
      setEmergencyUnlockReason("");
      await handleEmergencyUnlockApply(reason);
      return;
    }

    handleApplySettings();
  };

  return (
    <div className={className}>
      {isError && showLoadErrorAlert && (
        <div className={`fixed left-2 right-2 z-[9999] ${actionAlert ? "top-20" : "top-2"}`}>
          <Alert variant="error" appearance="solid" className="px-6 py-3">
            <AlertTitle className="text-[18px] font-semibold whitespace-nowrap">
              Failed to load GrubLock boxes
            </AlertTitle>
            <AlertDescription className="text-[16px] flex-1" truncate title={error instanceof Error ? error.message : "Please try again."}>
              {error instanceof Error ? error.message : "Please try again."}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {actionAlert && (
        <div className="fixed top-2 left-2 right-2 z-[9999]">
          <Alert variant={actionAlert.variant} appearance="solid" className="px-6 py-3">
            <AlertTitle className="text-[18px] font-semibold whitespace-nowrap">
              {actionAlert.title}
            </AlertTitle>
            <AlertDescription className="text-[16px] flex-1" truncate title={actionAlert.description}>
              {actionAlert.description}
            </AlertDescription>
            {actionAlert.variant === "success" && actionAlert.viewDetailsHref && (
              <Button
                variant="neutral"
                appearance="ghost"
                className="ml-auto flex items-center gap-1 shrink-0 !p-0 text-green-700 hover:text-green-800"
                onClick={() => {
                  const href = actionAlert.viewDetailsHref;
                  if (!href) return;
                  setActionAlert(null);
                  router.push(href);
                }}
              >
                <span className="font-medium text-[16px] uppercase">VIEW DETAILS</span>
              </Button>
            )}
          </Alert>
        </div>
      )}

      <div className="space-y-6">
        <GrubLockListHeader onViewAllBoxes={handleViewAllBoxes} />

        <GrubLockListToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchClear={handleSearchClear}
          totalEntries={entriesCount}
          isGrouped={isGrouped}
          onGroupedChange={handleGroupedChange}
          showUnlockedBoxes={showUnlockedBoxes}
          onShowUnlockedBoxesChange={setShowUnlockedBoxes}
          onFilterClick={() => setShowFilterModal(true)}
          isFilterModalOpen={showFilterModal}
          searchResults={searchResults}
          onSearchResultClick={handleSearchResultClick}
        />

        {shouldShowSkeleton ? (
          <GrubLockListSkeleton />
        ) : (
          <>
            {shouldShowGroupedEmpty ? (
              <div className="bg-white rounded-lg p-6 text-center text-[var(--color-neutral-secondary)]">
                No boxes found.
              </div>
            ) : (
              <GroupCollapseTable
                groups={filteredGroups}
                openIndex={openIndex}
                setOpenIndex={setOpenIndex}
                isPageLoading={isPageLoading}
                renderTable={(group) => (
                  <GrubLockGroupTable
                    group={group}
                    selectedIds={selectedIds}
                    loadingRowIds={loadingRowIds}
                    statusOverrides={statusOverrides}
                    activeLockDetailsRowId={activeLockDetailsRowId}
                    onRowSelect={handleRowSelect}
                    onSelectAll={handleSelectAll}
                    onRowClick={handleRowClick}
                  onViewDetailsClick={(box) => {
  router.push(`/grubpacs/details?id=${box.id}&pinSelected=1&from=%2Fgrublock%2Flist`);
}}
                    onViewInGrubPacsClick={(box) => {
                      router.push(`/grubpacs/list?selectBoxId=${encodeURIComponent(String(box.id))}&from=%2Fgrublock%2Flist`);
                    }}
                    onLockButtonClick={(box, buttonElement) => {
                      const isSameBox = modalState.selectedBox?.id === box.id;
                      if (isSameBox) {
                        if (modalState.isEmergencyUnlockModalOpen) {
                          closeEmergencyUnlockModal();
                          return;
                        }
                        if (modalState.isHaveEmergencyModalOpen) {
                          closeHaveEmergencyModal();
                          return;
                        }
                        if (modalState.isEditDetailsModalOpen) {
                          closeEditDetailsModal();
                          return;
                        }
                        if (modalState.isUnlockBoxModalOpen) {
                          closeUnlockBoxModal();
                          return;
                        }
                      }

                      setRecipient(mapBoxToRecipient(box));
                      openUnlockBoxModal(box, buttonElement);
                    }}
                    onUnlockButtonClick={(box, buttonElement) => {
                      const isSameBox = modalState.selectedBox?.id === box.id;
                      if (isSameBox && modalState.isLockBoxModalOpen) {
                        closeLockBoxModal();
                        return;
                      }

                      setRecipient({ countryCode: "IN" });
                      openLockBoxModal(box, buttonElement);
                    }}
                  />
                )}
                tableContainerClass="bg-white"
                noResultsMessage={
                  isGrouped
                    ? "No restaurants found."
                    : searchTerm
                      ? "No boxes match your search."
                      : "No boxes found."
                }
                pageSize={isGrouped ? 50 : 10}
                showPaginationPrev={true}
                showPaginationNext={true}
                onGroupClick={(group) => {
                  if (!isGrouped) return;
                  if (String(group.name).toLowerCase() === "unassigned") return;
                  handleGroupClick(group);
                }}
                onPageChange={refetchGroup}
              />
            )}

            <SelectionActionBar
              selectedCount={selectedIds.size}
              onClearSelection={handleClearSelection}
              onEmergencyUnlock={handleEmergencyUnlock}
              isEmergencyUnlockActive={
                modalState.isHaveEmergencyModalOpen || modalState.isEmergencyUnlockModalOpen
              }
            />
          </>
        )}

        <GrubLockModals
          modalState={modalState}
          showFilterModal={showFilterModal}
          filterState={filters}
          selectedIds={selectedIds}
          recipient={recipient}
          isLocking={isLocking}
          isEditingRecipient={isEditingRecipient}
          isEmergencyUnlocking={isEmergencyUnlocking}
          onCloseGroupDetailsModal={closeGroupDetailsModal}
          onCloseBoxDetailsModal={closeBoxDetailsModal}
          onCloseUnlockBoxModal={closeUnlockBoxModal}
          onCloseEmergencyUnlockModal={closeEmergencyUnlockModal}
          onCloseLockBoxModal={closeLockBoxModal}
          onCloseHaveEmergencyModal={closeHaveEmergencyModal}
          onCloseApplySettingsModal={closeApplySettingsModal}
          onCloseFilterModal={() => setShowFilterModal(false)}
          onApplyFilter={(nextFilters) => {
            setFilters(nextFilters);
            setShowFilterModal(false);
          }}
          onEmergencyUnlock={handleEmergencyUnlockConfirm}
          onOpenEmergencyUnlockModal={openEmergencyUnlockModal}
          onHaveEmergencyUnlock={handleHaveEmergencyUnlock}
          onApplySettings={handleApplySettingsWithEmergency}
          onOpenEditDetailsModal={openEditDetailsModal}
          onCloseEditDetailsModal={closeEditDetailsModal}
          onLockSubmit={handleLockSubmit}
          onEditSave={handleEditSave}
          onEmergencyUnlockRequest={handleEmergencyUnlockPrepare}
          onRefreshData={async () => {
            await refetch();
          }}
        />
      </div>
    </div>
  );
}
