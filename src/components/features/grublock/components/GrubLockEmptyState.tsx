import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import FigIcon from "@/components/ui/FigIcon";

interface GrubLockEmptyStateProps {
  onGoToHelp: () => void;
  onContactSupport?: () => void;
  topRight?: ReactNode;
}

export default function GrubLockEmptyState({
  onGoToHelp,
  onContactSupport,
  topRight = (
    <button className="text-[var(--color-brand-default,#fe480b)] hover:opacity-80 font-medium text-sm uppercase tracking-wide">
      VIEW ALL BOXES
    </button>
  ),
}: GrubLockEmptyStateProps) {
  return (
    <div className="bg-white flex flex-col gap-6 px-6 py-6 relative h-full">
      {/* Section title */}
      <div className="flex gap-4 items-start relative shrink-0 w-full -mt-8">
        <div className="flex flex-[1_0_0] flex-col items-start justify-center min-h-px min-w-px relative">
          <div className="flex flex-col font-semibold h-10 justify-center relative shrink-0 text-[#03130a] text-2xl w-full">
            <p className="leading-8">GrubLock</p>
          </div>
        </div>
        <div className="flex gap-4 items-center relative shrink-0">
          {topRight && <div className="shrink-0">{topRight}</div>}
        </div>
      </div>

      {/* Centered empty state */}
      <div className="flex flex-1 flex-col gap-6 items-center justify-center relative mt-18 w-full">
        {/* Illustration placeholder */}
        <div className="bg-[#ffd9cc] w-80 h-80 shrink-0" />

        {/* Text */}
        <div className="flex flex-col gap-4 items-center text-center">
          <h3
            className="font-semibold text-[#03130a]"
            style={{ fontSize: "18px", lineHeight: "28px", fontFamily: "Inter" }}
          >
            No boxes to see
          </h3>
          <p
            className="font-normal text-[#37493f]"
            style={{ fontSize: "16px", lineHeight: "24px", fontFamily: "Inter" }}
          >
            Active boxes with GrubLock will show up here. Browse help section for queries.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 items-center">
          <Button
            variant="primary"
            appearance="solid"
            state="press"
            onClick={onGoToHelp}
            className="flex gap-3 h-10 items-center justify-center px-4 py-2 rounded-lg"
          >
            <span
              className="font-medium text-white uppercase"
              style={{ fontSize: "16px", lineHeight: "20px", fontFamily: "Inter" }}
            >
              GO TO HELP
            </span>
            <FigIcon name="arrow-up-right" size={20} />
          </Button>

          <Button
            variant="primary"
            appearance="outlined"
            onClick={onContactSupport}
            className="flex gap-3 h-10 items-center justify-center px-4 py-2 rounded-lg"
          >
            <FigIcon name="GrubPac/mail" size={20} />
            <span
              className="font-medium uppercase"
              style={{ fontSize: "16px", lineHeight: "20px", fontFamily: "Inter" }}
            >
              CONTACT SUPPORT
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
