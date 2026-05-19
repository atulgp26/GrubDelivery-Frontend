import React, { ReactNode } from "react";

export interface HandlerTooltip {
  title: ReactNode;
  subtitle: string;
}

export interface GlobalStatusTooltip {
  title: ReactNode;
  subtitle?: string;
}

export type GlobalStatusValue = "power_off" | "ready" | "critical" | "attention" | "unknown";
export type PowerStatusValue = "on" | "off" | "unknown";
export type HandlerStatusValue = "connected" | "disconnected" | "not_shared" | "offline" | "unknown";

export function getGlobalStatusTooltip(status: GlobalStatusValue): GlobalStatusTooltip {
  switch (status) {
    case "power_off":
      return { title: "Switch on the box for status" };
    case "ready":
      return { title: "Box is ready to go :)" };
    case "critical":
    case "attention":
      return { title: "Check the box!" };
    default:
      return { title: "Status unavailable" };
  }
}

export function getPowerStatusTooltip(status: PowerStatusValue): GlobalStatusTooltip {
  switch (status) {
    case "off":
      return { title: "Bux turned OFF" };
    case "on":
      return { title: "Box turned ON" };
    default:
      return {
        title: (
          <span className="text-[#FE480B] font-semibold italic text-[14px] leading-[22px]">
            Unable to reach the box
          </span>
        ),
        subtitle: "Check your connection",
      };
  }
}

export function getHandlerTooltip(
  status: HandlerStatusValue,
  details?: { name?: string | null; phone?: string | null } | null
): HandlerTooltip {
  if (status === "offline") {
    return {
      title: "Switch on the box to connect",
      subtitle: "",
    };
  }

  switch (status) {
    case "connected": {
      const handlerName = details?.name?.trim() || "handler";
      return {
        title: (
          <>
            Connected with{" "}
            <span className="text-[#FE480B] font-semibold italic text-[14px] leading-[22px]">
              {handlerName}
            </span>
          </>
        ),
        subtitle: details?.phone?.trim() ? `(${details.phone.trim()})` : "",
      };
    }
    case "not_shared":
      return {
        title: "Not visible to anyone",
        subtitle: "Check box permissions >>",
      };
    case "disconnected":
    case "unknown":
    default:
      return {
        title: "Ask handler to connect",
        subtitle: "",
      };
  }
}
