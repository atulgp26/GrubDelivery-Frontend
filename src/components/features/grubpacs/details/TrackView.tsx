"use client";
import React, { useState } from "react";
import Image from "next/image";

type TrackMode = "map" | "live-cam" | "old-feed-list" | "old-feed-playing";
type CamId = "cam1" | "cam2" | "cam3" | "cam4";

const CAMS: { id: CamId; label: string }[] = [
  { id: "cam1", label: "CAM 1" },
  { id: "cam2", label: "CAM 2" },
  { id: "cam3", label: "CAM 3" },
  { id: "cam4", label: "CAM 4" },
];

const MOCK_OLD_FEED: { id: number; date: string; time: string; duration: string }[] = [];

export function TrackView({
  isOnline,
  mapFullscreen = false,
  onMapFullscreenChange,
  camFullscreen = false,
  onCamFullscreenChange,
  feedFullscreen = false,
  onFeedFullscreenChange,
}: {
  isOnline: boolean;
  mapFullscreen?: boolean;
  onMapFullscreenChange?: (v: boolean) => void;
  camFullscreen?: boolean;
  onCamFullscreenChange?: (v: boolean) => void;
  feedFullscreen?: boolean;
  onFeedFullscreenChange?: (v: boolean) => void;
}) {
  const [mode, setMode] = useState<TrackMode>("map");
  const [activeCam, setActiveCam] = useState<CamId>("cam1");

  function enterFullscreen() { onMapFullscreenChange?.(true); }
  function exitFullscreen() { onMapFullscreenChange?.(false); }
  function enterCamFullscreen() { onCamFullscreenChange?.(true); }
  function exitCamFullscreen() { onCamFullscreenChange?.(false); }
  function enterFeedFullscreen() { onFeedFullscreenChange?.(true); }
  function exitFeedFullscreen() { onFeedFullscreenChange?.(false); }

  // ── Offline state ──────────────────────────────────────────────
  if (!isOnline) {
    return (
      <div className="flex h-full overflow-hidden p-4">
        {/* Left: offline message */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          <div className="text-center">
            <p className="font-semibold text-lg text-[#03130a] mb-2">Your box is offline</p>
            <p className="text-sm text-[#6b7971] mb-1">
              To track the box, turn on your box first.
            </p>
            <p className="text-sm text-[#6b7971]">
              If your details are still not showing up, browse help section for queries.
            </p>
          </div>
          <button
            onClick={() => setMode("old-feed-list")}
            className="flex items-center justify-center gap-2 w-full max-w-sm h-12 border border-[#cb3301] rounded-lg text-sm font-semibold text-[#cb3301] uppercase tracking-wide hover:bg-[#fff5f2] transition-colors cursor-pointer"
          >
            BROWSE OLD FEED
            <Image
              src="/GrubPac/Box-settings/chevron-right-brand.svg"
              alt=""
              width={16}
              height={16}
            />
          </button>
        </div>

        {/* Right: closed box image */}
        <div className="shrink-0 flex items-center justify-end h-full overflow-hidden">
          <div
            className="relative"
            style={{ height: "calc(100% - 8rem)", aspectRatio: "1 / 1" }}
          >
            <Image
              src="/GrubPac/Box-settings/grubpac-box-close.png"
              alt="GrubPac box"
              fill
              className="object-contain object-right"
              priority
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Online: MAP view ──────────────────────────────────────────
  if (mode === "map") {
    return (
      <div className="flex h-full overflow-hidden p-4">
        {/* Left: map fills full height */}
        <div className="flex-1 relative overflow-hidden min-w-0">
          <iframe
            src="https://maps.google.com/maps?q=Mumbai&t=&z=14&ie=UTF8&iwloc=B&output=embed"
            className="absolute inset-0 w-full h-full border-0 rounded-xl"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Track Live Location"
          />
          {/* Expand / Compress button overlay */}
          <button
            onClick={mapFullscreen ? exitFullscreen : enterFullscreen}
            className="absolute top-3 right-3 w-9 h-9 bg-black/40 rounded-full flex items-center justify-center hover:bg-black/55 transition-colors cursor-pointer z-10"
            aria-label={mapFullscreen ? "Exit fullscreen" : "Expand map"}
          >
            <Image
              src={mapFullscreen ? "/GrubPac/Box-settings/compress.svg" : "/GrubPac/Box-settings/expand.svg"}
              alt=""
              width={18}
              height={18}
            />
          </button>
          {/* Bottom controls overlay */}
          <div className="absolute bottom-3 right-3 flex gap-2 z-10">
            <button className="w-9 h-9 bg-black/40 rounded-full flex items-center justify-center hover:bg-black/55 transition-colors cursor-pointer">
              <Image src="/GrubPac/Box-settings/location-crosshair.svg" alt="Recenter" width={18} height={18} />
            </button>
            <button className="w-9 h-9 bg-black/40 rounded-full flex items-center justify-center hover:bg-black/55 transition-colors cursor-pointer">
              <Image src="/GrubPac/Box-settings/refresh.svg" alt="Refresh" width={18} height={18} />
            </button>
          </div>
        </div>

        {/* Right: action buttons — hidden in fullscreen */}
        {!mapFullscreen && <RightActions mode="map" onModeChange={setMode} />}
      </div>
    );
  }

  // ── Online: LIVE CAM view ─────────────────────────────────────
  if (mode === "live-cam") {
    // ── Fullscreen cam ──
    if (camFullscreen) {
      return (
        <div className="flex h-full overflow-hidden p-4">
          <div className="flex-1 flex flex-col min-w-0 gap-3 overflow-hidden">
            {/* Video fills remaining height — shrinks to give room to CAM grid */}
            <div className="flex-[1_1_0] min-h-0 relative bg-black rounded-lg overflow-hidden">
              {/* LIVE badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#37493f] rounded px-2.5 py-1 z-10">
                <Image src="/GrubPac/Box-settings/video-brand.svg" alt="" width={14} height={14} />
                <span className="text-xs font-semibold text-white uppercase tracking-wide">LIVE</span>
              </div>
              {/* Compress button */}
              <button
                onClick={exitCamFullscreen}
                className="absolute top-3 right-3 w-9 h-9 rounded-full border border-white/40 bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer z-10"
                aria-label="Exit fullscreen"
              >
                <Image src="/GrubPac/Box-settings/compress.svg" alt="" width={18} height={18} />
              </button>
              {/* Timestamp above orange line */}
              <span className="absolute bottom-4 right-3 text-xs text-white/80 font-medium z-10">
                12 Jan &#39;25 | 11:23 PM
              </span>
              {/* Orange live indicator line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#cb3301] z-10" />
            </div>
            {/* CAM selector — 2x2 grid */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              {CAMS.map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => setActiveCam(cam.id)}
                  className={`flex items-center justify-center gap-2 h-12 rounded-lg border text-sm font-semibold uppercase tracking-wide transition-colors cursor-pointer ${
                    activeCam === cam.id
                      ? "border-[#cb3301] text-[#cb3301] bg-[#fff5f2]"
                      : "border-[#c1c7c4] text-[#6b7971] hover:bg-[#f7f8f7]"
                  }`}
                >
                  <Image
                    src="/GrubPac/Box-settings/video-brand.svg"
                    alt=""
                    width={16}
                    height={16}
                    style={activeCam === cam.id
                      ? { filter: "invert(23%) sepia(97%) saturate(3000%) hue-rotate(10deg) brightness(80%)" }
                      : { opacity: 0.4 }}
                  />
                  {cam.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ── Normal cam ──
    return (
      <div className="flex h-full overflow-hidden p-4 gap-4">
        {/* Left: video + CAM grid */}
        <div className="flex-1 flex flex-col min-w-0 gap-3 overflow-hidden">
          {/* Video area — grows/shrinks to give room to CAM grid */}
          <div className="flex-[1_1_0] min-h-0 relative bg-black rounded-xl overflow-hidden">
            {/* LIVE badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#37493f] rounded px-2.5 py-1 z-10">
              <Image src="/GrubPac/Box-settings/video-brand.svg" alt="" width={14} height={14} />
              <span className="text-xs font-semibold text-white uppercase tracking-wide">LIVE</span>
            </div>
            {/* Expand circle button */}
            <button
              onClick={enterCamFullscreen}
              className="absolute top-3 right-3 w-9 h-9 rounded-full border border-white/40 bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer z-10"
              aria-label="Expand"
            >
              <Image src="/GrubPac/Box-settings/expand.svg" alt="" width={18} height={18} />
            </button>
            {/* Timestamp bottom-right */}
            <span className="absolute bottom-3 right-3 text-xs text-white/80 font-medium z-10">
              12 Jan &#39;25 | 11:23 PM
            </span>
          </div>
          {/* CAM selector — 2x2 grid */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {CAMS.map((cam) => (
              <button
                key={cam.id}
                onClick={() => setActiveCam(cam.id)}
                className={`flex items-center justify-center gap-2 h-12 rounded-lg border text-sm font-semibold uppercase tracking-wide transition-colors cursor-pointer ${
                  activeCam === cam.id
                    ? "border-[#cb3301] text-[#cb3301] bg-[#fff5f2]"
                    : "border-[#c1c7c4] text-[#6b7971] hover:bg-[#f7f8f7]"
                }`}
              >
                <Image
                  src="/GrubPac/Box-settings/video-brand.svg"
                  alt=""
                  width={16}
                  height={16}
                  style={activeCam === cam.id
                    ? { filter: "invert(23%) sepia(97%) saturate(3000%) hue-rotate(10deg) brightness(80%)" }
                    : { opacity: 0.4 }}
                />
                {cam.label}
              </button>
            ))}
          </div>
        </div>
        {/* Right: action buttons */}
        <RightActions mode="live-cam" onModeChange={setMode} />
      </div>
    );
  }

  // ── Online: OLD FEED LIST view ────────────────────────────────
  if (mode === "old-feed-list") {
    return (
      <div className="flex h-full overflow-hidden p-4">
        {/* Left: feed list */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Toolbar */}
          <div className="shrink-0 px-4 pt-4 pb-3 flex items-center gap-3 border-b border-[#e0e3e1]">
            {/* Search date */}
            <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-[#e0e3e1] bg-white">
              <Image src="/GrubPac/Box-settings/search.svg" alt="" width={16} height={16} className="opacity-40" />
              <input
                type="text"
                placeholder="Search date"
                className="text-sm text-[#03130a] placeholder:text-[#c1c7c4] outline-none bg-transparent w-32"
              />
              <Image src="/GrubPac/Box-settings/calendar-day.svg" alt="" width={16} height={16} className="text-[#cb3301]" style={{ filter: "invert(23%) sepia(97%) saturate(3000%) hue-rotate(10deg) brightness(80%)" }} />
            </div>
            <span className="text-sm text-[#6b7971] whitespace-nowrap">200 entries</span>
            <div className="flex-1" />
            {/* Pagination */}
            <span className="text-sm text-[#6b7971]">Showing 1-50</span>
            <div className="flex gap-1">
              <button className="w-8 h-8 border border-[#e0e3e1] rounded flex items-center justify-center hover:bg-[#f7f8f7] cursor-pointer">
                <Image src="/GrubPac/Box-settings/chevron-right.svg" alt="Prev" width={16} height={16} className="rotate-180" />
              </button>
              <button className="w-8 h-8 border border-[#e0e3e1] rounded flex items-center justify-center hover:bg-[#f7f8f7] cursor-pointer">
                <Image src="/GrubPac/Box-settings/chevron-right.svg" alt="Next" width={16} height={16} />
              </button>
            </div>
          </div>

          {/* Feed rows */}
          <div className="flex-1 overflow-y-auto">
            {MOCK_OLD_FEED.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-sm text-[#6b7971]">
                No recordings available
              </div>
            ) : (
            MOCK_OLD_FEED.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-4 px-4 py-3 border-b border-[#e0e3e1] hover:bg-[#f7f8f7] transition-colors"
              >
                {/* Camera icon */}
                <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                  <Image src="/GrubPac/Box-settings/video-brand.svg" alt="" width={20} height={20} className="opacity-40" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#03130a]">
                    {entry.date} | {entry.time}
                  </p>
                  <p className="text-xs text-[#6b7971]">{entry.duration}</p>
                </div>
                <button
                  onClick={() => setMode("old-feed-playing")}
                  className="w-8 h-8 shrink-0 flex items-center justify-center hover:opacity-70 cursor-pointer transition-opacity"
                  aria-label="Play recording"
                >
                  <Image src="/GrubPac/Box-settings/circle-play.svg" alt="Play" width={28} height={28} className="opacity-40" />
                </button>
              </div>
            ))
            )}
          </div>
        </div>

        {/* Right: action buttons */}
        <RightActions mode="old-feed-list" onModeChange={setMode} />
      </div>
    );
  }

  // ── Online: OLD FEED PLAYING view ─────────────────────────────
  if (mode === "old-feed-playing") {
    // ── Fullscreen feed playing ──
    if (feedFullscreen) {
      return (
        <div className="flex h-full overflow-hidden p-4">
          <div className="flex-1 flex flex-col min-w-0 gap-3 overflow-hidden">
            {/* Video fills remaining height */}
            <div className="flex-[1_1_0] min-h-0 relative bg-black rounded-xl overflow-hidden">
              {/* Timestamp top-left */}
              <span className="absolute top-3 left-3 text-sm font-semibold text-white z-10">
                12 Jan &#39;25 | 11:23 PM
              </span>
              {/* Top-right: compress + download */}
              <div className="absolute top-3 right-3 flex gap-2 z-10">
                <button
                  onClick={exitFeedFullscreen}
                  className="w-9 h-9 rounded-full border border-white/40 bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
                >
                  <Image src="/GrubPac/Box-settings/compress.svg" alt="Compress" width={18} height={18} />
                </button>
                <button className="w-9 h-9 rounded-full border border-white/40 bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer">
                  <Image src="/GrubPac/Box-settings/arrow-down-tray.svg" alt="Download" width={18} height={18} />
                </button>
              </div>
              {/* Playback controls center */}
              <div className="absolute inset-0 flex items-center justify-center gap-16 z-10">
                <button className="w-10 h-10 rounded-full border border-white/40 bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer">
                  <Image src="/GrubPac/Box-settings/backward.svg" alt="Rewind" width={18} height={18} />
                </button>
                <button className="w-12 h-12 rounded-full border border-white/40 bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer">
                  <Image src="/GrubPac/Box-settings/play.svg" alt="Play" width={20} height={20} className="ml-0.5" />
                </button>
                <button className="w-10 h-10 rounded-full border border-white/40 bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer">
                  <Image src="/GrubPac/Box-settings/forward.svg" alt="Forward" width={18} height={18} />
                </button>
              </div>
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 z-10">
                <div className="w-full h-1 bg-white/25">
                  <div className="h-full bg-[#cb3301]" style={{ width: "38%" }} />
                </div>
                <div className="px-3 pb-2 pt-1">
                  <span className="text-xs text-white/80">1:48 / 4:32</span>
                </div>
              </div>
            </div>
            {/* CAM selector — 4-col row */}
            <div className="grid grid-cols-4 gap-3 shrink-0">
              {CAMS.map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => setActiveCam(cam.id)}
                  className={`flex items-center justify-center gap-2 h-12 rounded-lg border text-sm font-semibold uppercase tracking-wide transition-colors cursor-pointer ${
                    activeCam === cam.id
                      ? "border-[#cb3301] text-[#cb3301] bg-[#fff5f2]"
                      : "border-[#c1c7c4] text-[#6b7971] hover:bg-[#f7f8f7]"
                  }`}
                >
                  <Image
                    src="/GrubPac/Box-settings/video-brand.svg"
                    alt=""
                    width={16}
                    height={16}
                    style={activeCam === cam.id
                      ? { filter: "invert(23%) sepia(97%) saturate(3000%) hue-rotate(10deg) brightness(80%)" }
                      : { opacity: 0.4 }}
                  />
                  {cam.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ── Normal feed playing ──
    return (
      <div className="flex h-full overflow-hidden p-4 gap-4">
        {/* Left: video + CAM grid */}
        <div className="flex-1 flex flex-col min-w-0 gap-3 overflow-hidden">
          <div className="flex-[1_1_0] min-h-0 relative bg-black rounded-xl overflow-hidden">
            {/* Top-left: expand to fullscreen */}
            <button
              onClick={enterFeedFullscreen}
              className="absolute top-3 left-3 w-9 h-9 rounded-full border border-white/40 bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer z-10"
            >
              <Image src="/GrubPac/Box-settings/expand.svg" alt="Fullscreen" width={18} height={18} />
            </button>
            {/* Top-right: download */}
            <button className="absolute top-3 right-3 w-9 h-9 rounded-full border border-white/40 bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer z-10">
              <Image src="/GrubPac/Box-settings/arrow-down-tray.svg" alt="Download" width={18} height={18} />
            </button>
            {/* Playback controls center */}
            <div className="absolute inset-0 flex items-center justify-center gap-12 z-10">
              <button className="w-10 h-10 rounded-full border border-white/40 bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer">
                <Image src="/GrubPac/Box-settings/backward.svg" alt="Rewind" width={18} height={18} />
              </button>
              <button className="w-12 h-12 rounded-full border border-white/40 bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer">
                <Image src="/GrubPac/Box-settings/play.svg" alt="Play" width={20} height={20} className="ml-0.5" />
              </button>
              <button className="w-10 h-10 rounded-full border border-white/40 bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer">
                <Image src="/GrubPac/Box-settings/forward.svg" alt="Forward" width={18} height={18} />
              </button>
            </div>
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 z-10">
              <div className="w-full h-1 bg-white/25">
                <div className="h-full bg-[#cb3301]" style={{ width: "38%" }} />
              </div>
              <div className="px-3 pb-2 pt-1">
                <span className="text-xs text-white/80">1:48 / 4:32</span>
              </div>
            </div>
          </div>
          {/* CAM selector — 2x2 grid */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {CAMS.map((cam) => (
              <button
                key={cam.id}
                onClick={() => setActiveCam(cam.id)}
                className={`flex items-center justify-center gap-2 h-12 rounded-lg border text-sm font-semibold uppercase tracking-wide transition-colors cursor-pointer ${
                  activeCam === cam.id
                    ? "border-[#cb3301] text-[#cb3301] bg-[#fff5f2]"
                    : "border-[#c1c7c4] text-[#6b7971] hover:bg-[#f7f8f7]"
                }`}
              >
                <Image
                  src="/GrubPac/Box-settings/video-brand.svg"
                  alt=""
                  width={16}
                  height={16}
                  style={activeCam === cam.id
                    ? { filter: "invert(23%) sepia(97%) saturate(3000%) hue-rotate(10deg) brightness(80%)" }
                    : { opacity: 0.4 }}
                />
                {cam.label}
              </button>
            ))}
          </div>
        </div>
        {/* Right: action buttons */}
        <RightActions mode="old-feed-playing" onModeChange={setMode} />
      </div>
    );
  }

  // Fallback (should not be reached)
  return null;
}

// ── Shared right-side action buttons ──────────────────────────────────────────
function RightActions({
  mode,
  onModeChange,
}: {
  mode: TrackMode;
  onModeChange: (m: TrackMode) => void;
}) {
  return (
    <div className="w-[320px] shrink-0 flex flex-col gap-3 px-4 py-4 border-l border-[#e0e3e1]">
      {/* TRACK LIVE LOCATION — solid orange; hidden when already on map */}
      {mode !== "map" && (
        <button
          onClick={() => onModeChange("map")}
          className="flex items-center justify-between w-full h-12 px-4 rounded-lg bg-[#cb3301] text-white text-sm font-semibold uppercase tracking-wide hover:bg-[#b02d01] transition-colors cursor-pointer"
        >
          TRACK LIVE LOCATION
          <Image src="/GrubPac/Box-settings/chevron-right.svg" alt="" width={16} height={16} className="invert" />
        </button>
      )}

      {/* WATCH LIVE CAM — solid when on map, outline otherwise; hidden when already on live-cam */}
      {mode !== "live-cam" && (
        <button
          onClick={() => onModeChange("live-cam")}
          className={`flex items-center justify-between w-full h-12 px-4 rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors cursor-pointer ${
            mode === "map"
              ? "bg-[#cb3301] text-white hover:bg-[#b02d01]"
              : "border border-[#cb3301] text-[#cb3301] hover:bg-[#fff5f2]"
          }`}
        >
          WATCH LIVE CAM
          <Image
            src="/GrubPac/Box-settings/chevron-right.svg"
            alt=""
            width={16}
            height={16}
            className={mode === "map" ? "invert" : ""}
            style={mode !== "map" ? { filter: "invert(23%) sepia(97%) saturate(3000%) hue-rotate(10deg) brightness(80%)" } : {}}
          />
        </button>
      )}

      {/* BROWSE OLD FEED — only on map / live-cam modes */}
      {(mode === "map" || mode === "live-cam") && (
        <button
          onClick={() => onModeChange("old-feed-list")}
          className="flex items-center justify-between w-full h-12 px-4 rounded-lg border border-[#cb3301] text-[#cb3301] text-sm font-semibold uppercase tracking-wide hover:bg-[#fff5f2] transition-colors cursor-pointer"
        >
          BROWSE OLD FEED
          <Image
            src="/GrubPac/Box-settings/chevron-right.svg"
            alt=""
            width={16}
            height={16}
            style={{ filter: "invert(23%) sepia(97%) saturate(3000%) hue-rotate(10deg) brightness(80%)" }}
          />
        </button>
      )}

      {/* Info card — pinned to bottom */}
      {(mode === "map" || mode === "live-cam" || mode === "old-feed-playing") && (
        <>
          <div className="flex-1" />
          <div className="border border-[#e0e3e1] rounded-lg p-4 flex flex-col gap-3">
            {mode === "old-feed-playing" ? (
              <>
                <p className="font-semibold text-sm text-[#03130a]">You are viewing old footage</p>
                <button className="flex items-center justify-between w-full h-10 px-3 border border-[#e0e3e1] rounded-lg text-sm text-[#37493f] hover:bg-[#f7f8f7] transition-colors cursor-pointer">
                  <span>12 Jan &#39;25 | 11:23</span>
                  <Image src="/GrubPac/Box-settings/chevron-down.svg" alt="" width={16} height={16} />
                </button>
              </>
            ) : (
              <>
                <div>
                  <p className="font-semibold text-sm text-[#03130a]">
                    {mode === "map" ? "You are tracking live location" : "You are watching live cam feed"}
                  </p>
                  <p className="text-xs text-[#6b7971]">(Last updated: 2min ago)</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 h-10 border border-[#c1c7c4] rounded-lg text-xs font-medium text-[#37493f] hover:bg-[#f7f8f7] transition-colors cursor-pointer uppercase tracking-wide">
                    SHARE
                    <Image src="/GrubPac/Box-settings/share.svg" alt="" width={14} height={14} />
                  </button>
                  {mode === "map" && (
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 h-10 border border-[#c1c7c4] rounded-lg text-xs font-medium text-[#37493f] hover:bg-[#f7f8f7] transition-colors cursor-pointer uppercase tracking-wide"
                    >
                      MAPS
                      <Image src="/GrubPac/Box-settings/arrow-up-right.svg" alt="" width={14} height={14} />
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
