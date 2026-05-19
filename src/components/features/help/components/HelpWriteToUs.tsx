import React from "react";
import { Button } from "@/components/ui/Button";

interface HelpWriteToUsProps {
  className?: string;
  onClick?: () => void;
}

export default function HelpWriteToUs({ className = "", onClick }: HelpWriteToUsProps) {
  return (
    <div
      className={`rounded-[var(--Radius-Base,8px)] border border-[var(--Stroke-Coloured---Primary,#F4AD49)] bg-[var(--Background-Coloured---Secondary,#FFECD7)] p-4 flex items-center justify-between ${className}`}
    >
      <div>
        <div className="font-semibold text-[var(--color-neutral-primary)] text-base mb-1">
          Still having doubts?
        </div>
        <div className="text-[var(--color-neutral-primary)] text-sm">
          You can write to us at{" "}
          <a href="mailto:support@grubpac.com" className="italic underline">
            support@grubpac.com
          </a>{" "}
          and we&apos;ll get back to you as soon as possible.
        </div>
      </div>
      <Button
        variant="warning"
        appearance="solid"
        state="press"
        className="text-sm font-semibold px-4 py-2 ml-4 mb-4 rounded-md"
        onClick={onClick}
      >
        <span>WRITE TO US</span>
      </Button>
    </div>
  );
}
