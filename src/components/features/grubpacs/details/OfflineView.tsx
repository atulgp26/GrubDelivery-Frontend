"use client";
import React, { useState } from "react";
import Image from "next/image";
import { StatusBadge } from "../components/BoxSettingsShared";
import type { BadgeVariant, BoxState } from "./types";

const STATUS_CONTENT = {
  offline: {
    title: "Your box is offline",
    lines: [
      "To see details, turn on your box first.",
      "If your details are still not showing up, browse help section for queries.",
    ],
    badge: { label: "OFF", variant: "red" as BadgeVariant },
  },
  unreachable: {
    title: "Your box is unreachable",
    lines: [
      "We are unable to reach your box. Please check your connection.",
      "For further assistance, browse help section for queries.",
    ],
    badge: { label: "UNREACHABLE", variant: "gray" as BadgeVariant },
  },
};

function StatusPanel({ boxState }: { boxState: "offline" | "unreachable" }) {
  const [powerOpen, setPowerOpen] = useState(false);
  const { title, lines, badge } = STATUS_CONTENT[boxState];
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-3 text-center">
        <p className="font-semibold text-lg text-[#03130a]">{title}</p>
        <div className="text-sm text-[#6b7971] space-y-1 max-w-[520px] mx-auto">
          {lines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
      {/* Power row */}
      <div className="bg-[#eff1f0] border border-[#e0e3e1] rounded-lg px-3 py-2 flex items-center gap-3 w-full">
        <Image
          src="/GrubPac/Box-settings/switch.svg"
          alt=""
          width={24}
          height={24}
          className="shrink-0"
        />
        <span className="flex-1 font-semibold text-base text-[#03130a] leading-6">Power</span>
        <StatusBadge label={badge.label} variant={badge.variant} />
        <button
          onClick={() => setPowerOpen(!powerOpen)}
          className="h-7 w-7 flex items-center justify-center rounded cursor-pointer shrink-0"
          aria-label="Toggle power"
        >
          <Image
            src="/GrubPac/Box-settings/chevron-up.svg"
            alt=""
            width={24}
            height={24}
            className={`transition-transform duration-200 ${powerOpen ? "" : "rotate-180"}`}
          />
        </button>
      </div>
    </div>
  );
}

export function OfflineView({ boxState }: { boxState: "offline" | "unreachable" }) {
  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: status panel */}
      <div className="flex-1 h-full px-5">
        <div className="h-full flex items-center justify-center">
          <div className="w-full max-w-[900px]">
            <StatusPanel boxState={boxState} />
          </div>
        </div>
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
