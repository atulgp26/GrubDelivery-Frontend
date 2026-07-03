import * as React from "react";

export type EmptyStateType = 
  | "ungrouped-powered-on" 
  | "ungrouped-powered-off" 
  | "grouped-restaurant" 
  | "grouped-restaurant-offline"
  | "grouped-unassigned";

export interface GrubPacEmptyStateProps {
  type: EmptyStateType;
  className?: string;
}

const EMPTY_STATE_MESSAGES: Record<EmptyStateType, string> = {
  "ungrouped-powered-on": "Turn on your GrubPacs to see the list here.",
  "ungrouped-powered-off": "All GrubPacs are powered on.",
  "grouped-restaurant": "No box assigned to this restaurant",
  "grouped-restaurant-offline": "No offline boxes found for this restaurant",
  "grouped-unassigned": "No box left without a restaurant! :)",
};

export function GrubPacEmptyState({ type, className }: GrubPacEmptyStateProps) {
  const message = EMPTY_STATE_MESSAGES[type];

  return (
    <div 
      className={`bg-white border-b border-[var(--gp-color-border-neutral-secondary,#e0e3e1)] flex h-[56px] items-center px-[var(--gp-padding-l,16px)] ${className || ""}`}
    >
      <p 
        className="font-[var(--gp-font-text)] text-[var(--gp-color-text-neutral-secondary,#37493f)]"
        style={{ 
          fontWeight: 400,
          fontSize: 'var(--gp-font-size-small-l, 16px)',
          lineHeight: 'var(--gp-line-height-regular-small-l, 24px)'
        }}
      >
        {message}
      </p>
    </div>
  );
}
