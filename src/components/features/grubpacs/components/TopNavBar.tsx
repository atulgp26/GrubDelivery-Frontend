import React from "react";
import type { Tab } from "../details/types";

export const TABS: { id: Tab; label: string }[] = [
  { id: "settings", label: "SETTINGS" },
  { id: "logs", label: "LOGS" },
  { id: "track", label: "TRACK" },
];

export function TopNavBar({
  activeTab,
  onTabChange,
  tabs,
}: {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  tabs?: { id: Tab; label: string }[];
}) {
  const visibleTabs = tabs ?? TABS;
  return (
    <div className="bg-white border-b border-[#e0e3e1] h-16 flex items-center justify-end px-6 shrink-0">
      <div className="flex items-center gap-1">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`h-8 px-4 rounded-lg text-xs font-semibold tracking-wide uppercase whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#ffece6] text-[#cb3301] underline shadow-[0_0_0_2px_rgba(254,87,32,0.4)]"
                : "text-[#6b7971] hover:bg-[#f7f8f7]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
