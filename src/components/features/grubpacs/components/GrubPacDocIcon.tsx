import React from "react";

export default function GrubPacDocIcon({ status }: { status?: string }) {
  let border = "border-gray-200";
  let bg = "bg-gray-50";
  let text = "text-gray-400";
  if (status === "DISCONNECTED") {
    border = "border-red-500";
    bg = "bg-white";
    text = "text-red-500";
  } else if (status === "CONNECTED") {
    border = "border-green-500";
    bg = "bg-white";
    text = "text-green-500";
  }
  return (
    <span
      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border ${border} ${bg}`}
    >
      <svg
        className={`w-6 h-6 ${text}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" />
        <path d="M9 12h6M9 16h6M9 8h6" stroke="currentColor" />
        <path d="M15 4v4a1 1 0 001 1h4" stroke="currentColor" />
        <path d="M9 16l2 2 4-4" stroke="currentColor" />
      </svg>
    </span>
  );
}
