import React from "react";

export const getResourceTooltipContent = (count: number, resourceType: "drivers" | "boxes") => {
  if (count > 0) {
    return (
      <div className="text-[var(--color-stroke-brand)] text-sm font-normal hover:underline cursor-pointer">
        View list
      </div>
    );
  }

  const messages = {
    drivers: {
      title: "No assigned employees.",
      action: "Check list to assign >>",
    },
    boxes: {
      title: "No assigned GrubPacs.",
      action: "Open GrubPacs to assign >>",
    },
  };

  const message = messages[resourceType];

  return (
    <div>
      <div className="text-[var(--color-stroke-brand)] text-sm">
        {message.title}
      </div>
      <div className="text-[var(--gp-color-brand-primary)] italic text-sm font-semibold hover:underline">
        {message.action}
      </div>
    </div>
  );
};

export const getManagerTooltipContent = (hasManager: boolean) => {
  return hasManager ? (
    <div className="text-[var(--color-stroke-brand)] text-sm font-normal hover:underline cursor-pointer">
      View details
    </div>
  ) : (
    <div className="text-[var(--color-stroke-brand)] text-sm font-normal hover:underline cursor-pointer">
      Assign Manager
    </div>
  );
};

