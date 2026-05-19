import React from "react";
import Image from "next/image";
import type { GrubPacItem } from "@/types/domain/grubpacs";
import { getLockSrc, getStatusIconSrc } from "../utils/boxSettingsUtils";

export function BoxSidebarItem({
  item,
  isActive,
  onClick,
}: {
  item: GrubPacItem;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full min-h-[82px] border-b border-[#e0e3e1] transition-colors text-left ${
        isActive
          ? "bg-[#eff1f0]"
          : "bg-white hover:bg-[#f7f8f7] border-r border-r-transparent"
      }`}
    >
      <div className="flex flex-1 items-start gap-2 px-4 py-3 min-w-0">
        <Image
          src={getLockSrc(item)}
          alt=""
          width={24}
          height={24}
          className="shrink-0 mt-0.5"
        />
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <span className="font-semibold text-base text-[#37493f] leading-6 truncate whitespace-nowrap">
            {item.name ?? "BOX"}
          </span>
          <span className="text-sm text-[#6b7971] break-words [overflow-wrap:anywhere]">#{item.code}</span>
        </div>
      </div>
      <div className="pr-4 shrink-0">
        <Image src={getStatusIconSrc(item)} alt="" width={16} height={16} />
      </div>
    </button>
  );
}
