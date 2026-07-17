"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { flattenWrappedGroupRecord } from "@/lib/utils/groupedResponse";
import type { Tab } from "./types";
import { TopNavBar } from "../components/TopNavBar";
import { LogsView } from "./LogsView";
import { TrackView } from "./TrackView";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { showError, showSuccess } from "@/components/ui/toast";
import DeleteBoxModal from "../modals/DeleteBoxModal";
import ActivateBoxModal from "../modals/ActivateBoxModal";
import grubpacService from "@/services/grubpacs";
import {
  apiGrubPacToSuspendedItem,
  type ApiGrubPac,
  type GrubPacListData,
  type SuspendedGrubPacItem,
} from "@/types/domain/grubpacs";

const SUSPENDED_TABS: { id: Tab; label: string }[] = [
  { id: "logs", label: "LOGS" },
  { id: "track", label: "TRACK" },
];

interface SuspendedBoxDetailsPageProps {
  boxId?: string;
}

function SuspendedDetailsSkeleton() {
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

export default function SuspendedBoxDetailsPage({ boxId }: SuspendedBoxDetailsPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("logs");
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [camFullscreen, setCamFullscreen] = useState(false);
  const [feedFullscreen, setFeedFullscreen] = useState(false);
  const isFullscreen = mapFullscreen || camFullscreen || feedFullscreen;

  const [suspendedBoxes, setSuspendedBoxes] = useState<SuspendedGrubPacItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await grubpacService.getList({
          status: "suspended",
          limit: 50,
        });
        if (res.success && res.data) {
          const flat: GrubPacListData = res.data;
          const grouped = (flat as { groups?: Record<string, unknown> }).groups;

          if (grouped && typeof grouped === "object") {
            const items = flattenWrappedGroupRecord<ApiGrubPac>(grouped).map((item) =>
              apiGrubPacToSuspendedItem(item),
            );
            setSuspendedBoxes(items);
          } else {
            const items = ((flat as { boxes?: ApiGrubPac[] }).boxes ?? []).map((item) =>
              apiGrubPacToSuspendedItem(item),
            );
            setSuspendedBoxes(items);
          }
        } else {
          setSuspendedBoxes([]);
          if (res.error) {
            showError(res.error);
          }
        }
      } catch (error) {
        console.error("[SuspendedBoxDetailsPage] load failed:", error);
        showError("Failed to load suspended GrubPacs.");
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, []);

  useEffect(() => {
    const targetId = String(boxId ?? "").trim();
    if (!targetId) return;

    let cancelled = false;
    void (async () => {
      const response = await grubpacService.getDetails(targetId);
      if (cancelled || !response.success || !response.data) return;
      const item = apiGrubPacToSuspendedItem(response.data);
      setSuspendedBoxes((prev) => {
        const without = prev.filter((box) => String(box.id) !== String(item.id));
        return [item, ...without];
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [boxId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const selectedBox = boxId
    ? suspendedBoxes.find((b) => String(b.id) === boxId)
    : suspendedBoxes[0];

  if (isLoading) {
    return <SuspendedDetailsSkeleton />;
  }

  if (!selectedBox) {
    return (
      <div className="flex w-full h-screen overflow-hidden bg-white border border-[#e0e3e1]">
        <div className="w-60 shrink-0 flex flex-col border-r border-[#e0e3e1] overflow-hidden">
          <div className="p-4 border-b border-[#e0e3e1] shrink-0">
            <button
              onClick={() => router.push("/grubpacs/suspended")}
              className="flex items-center gap-2 h-8 px-3 border border-[#6b7971] rounded-lg text-xs font-semibold text-[#6b7971] uppercase tracking-wide hover:bg-[#f7f8f7] transition-colors cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="#6b7971" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              GO BACK
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-[#03130a]">No suspended GrubPac found</h2>
            <p className="text-sm text-[#6b7971]">The selected suspended box is unavailable right now.</p>
          </div>
        </div>
      </div>
    );
  }

  const boxName = selectedBox.name ?? "BOX";
  const boxCode = selectedBox.code;
  const identifier = selectedBox.identifier;

  const handleActivateConfirm = async () => {
    if (!selectedBox) return;
    setIsActivating(true);
    try {
      const res = await grubpacService.reactivate([String(selectedBox.id)]);
      if (!res.success) {
        showError(res.error ?? "Failed to activate GrubPac.");
        return;
      }
      showSuccess("GrubPac activated successfully.", "");
      router.push("/grubpacs/suspended");
    } catch (error) {
      console.error("[SuspendedBoxDetailsPage] activate failed:", error);
      showError("Failed to activate GrubPac.");
    } finally {
      setIsActivating(false);
      setActivateOpen(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBox) return;
    try {
      const res = await grubpacService.delete([String(selectedBox.id)]);
      if (!res.success) {
        showError(res.error ?? "Failed to delete GrubPac.");
        return;
      }
      showSuccess("GrubPac deleted successfully.", "");
      router.push("/grubpacs/suspended");
    } catch (error) {
      console.error("[SuspendedBoxDetailsPage] delete failed:", error);
      showError("Failed to delete GrubPac.");
    }
  };

  return (
    <div className="flex w-full h-screen overflow-hidden bg-white border border-[#e0e3e1]">
      {/* ── Left sidebar ── */}
      <div className="w-60 shrink-0 flex flex-col border-r border-[#e0e3e1] overflow-hidden">
        {/* Go back */}
        <div className="p-4 border-b border-[#e0e3e1] shrink-0">
          <button
            onClick={() => router.push("/grubpacs/suspended")}
            className="flex items-center gap-2 h-8 px-3 border border-[#6b7971] rounded-lg text-xs font-semibold text-[#6b7971] uppercase tracking-wide hover:bg-[#f7f8f7] transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="#6b7971" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            GO BACK
          </button>
        </div>

        {/* Suspended box list */}
        <div className="flex-1 overflow-y-auto">
          {suspendedBoxes.length === 0 ? (
            <div className="p-4 text-xs text-[#6b7971]">No suspended boxes</div>
          ) : (
            suspendedBoxes.map((box) => {
              const isActive = String(box.id) === String(selectedBox?.id);
              return (
                <button
                  key={box.id}
                  onClick={() => router.push(`/grubpacs/suspended/details?id=${box.id}`)}
                  className={`flex items-center w-full min-h-[82px] border-b border-[#e0e3e1] transition-colors text-left ${
                    isActive
                      ? "bg-[#eff1f0] border-r-2 border-r-[#cb3301]"
                      : "bg-white hover:bg-[#f7f8f7] border-r border-r-transparent"
                  }`}
                >
                  <div className="flex flex-1 items-start gap-2 px-4 py-3 min-w-0">
                    {/* Suspended icon */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10" stroke="#6b7971" strokeWidth="1.5" />
                      <path d="M9 9h2v6H9V9zm4 0h2v6h-2V9z" fill="#6b7971" />
                    </svg>
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="font-semibold text-sm text-[#37493f] truncate leading-6">
                        {box.name ?? "BOX"}
                      </span>
                      {box.code && (
                        <span className="text-xs text-[#6b7971] truncate">#{box.code}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Nav bar (Logs + Track only) */}
        {!isFullscreen && (
          <TopNavBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={SUSPENDED_TABS}
          />
        )}

        {/* Title row */}
        <div className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Name + subtitle */}
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-2">
                {isFullscreen && (
                  <button
                    onClick={() => {
                      setMapFullscreen(false);
                      setCamFullscreen(false);
                      setFeedFullscreen(false);
                    }}
                    className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg hover:bg-[#f7f8f7] transition-colors cursor-pointer"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M12.5 5L7.5 10L12.5 15" stroke="#37493f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
                <span className="font-semibold text-2xl text-[#03130a] leading-8">
                  {boxName}
                </span>
                {/* Suspended badge */}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#fff0e6] text-[#cb3301] border border-[#ffc5a3]">
                  Suspended
                </span>
              </div>
              {identifier && (
                <span className="text-sm text-[#6b7971]">{identifier}</span>
              )}
              {!identifier && boxCode && (
                <span className="text-sm text-[#6b7971]">#{boxCode}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="primary"
                appearance="solid"
                size="md"
                onClick={() => setActivateOpen(true)}
                className="text-white font-medium"
              >
                ACTIVATE
              </Button>

              {/* 3-dot menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#e0e3e1] hover:bg-[#f7f8f7] transition-colors cursor-pointer"
                  aria-label="More actions"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="5" r="1.25" fill="#37493f" />
                    <circle cx="10" cy="10" r="1.25" fill="#37493f" />
                    <circle cx="10" cy="15" r="1.25" fill="#37493f" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg border border-[#e0e3e1] shadow-md z-20">
                    <button
                      onClick={() => { setMenuOpen(false); setDeleteOpen(true); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[#e53935] hover:bg-[#fff5f2] rounded-lg transition-colors cursor-pointer"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4h12M5.333 4V2.667h5.334V4M6.667 7.333v4M9.333 7.333v4M3.333 4l.667 9.333h8l.667-9.333" stroke="#e53935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Delete box
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
          {activeTab === "track" ? (
            <TrackView
              isOnline={false}
              mapFullscreen={mapFullscreen}
              onMapFullscreenChange={setMapFullscreen}
              camFullscreen={camFullscreen}
              onCamFullscreenChange={setCamFullscreen}
              feedFullscreen={feedFullscreen}
              onFeedFullscreenChange={setFeedFullscreen}
            />
          ) : (
            <LogsView />
          )}
        </div>
      </div>

      {/* Modals */}
      <ActivateBoxModal
        open={activateOpen}
        onClose={() => setActivateOpen(false)}
        onActivate={handleActivateConfirm}
        boxNames={[boxName]}
        hasRestaurantAssignment={false}
        loading={isActivating}
      />

      <DeleteBoxModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDelete={handleDeleteConfirm}
        boxName={boxName}
      />
    </div>
  );
}
