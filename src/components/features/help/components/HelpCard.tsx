import type { ReactNode } from "react";

interface HelpCardProps {
  icon: ReactNode;
  title: string;
  onClick?: () => void;
  className?: string;
}

export default function HelpCard({ icon, title, onClick, className = "" }: HelpCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center justify-center border border-[var(--color-stroke-neutral)] rounded-lg bg-white hover:border-[var(--color-stroke-neutral)] hover:shadow-md transition-all duration-150 p-8 w-full h-60 ${className}`}
      type="button"
    >
      <span className="mb-4 flex shrink-0 items-center justify-center group-hover:[filter:brightness(0)_saturate(100%)_invert(32%)_sepia(98%)_saturate(2000%)_hue-rotate(350deg)] [&_img]:h-20 [&_img]:w-20">
        {icon}
      </span>
      <span className="text-[length:var(--gp-text-size-md)] font-[var(--gp-font-weight-heading)] leading-[var(--gp-text-line-height-md)] text-[var(--color-neutral-primary)] group-hover:text-[var(--color-neutral-primary)] text-center transition-colors duration-150">{title}</span>
    </button>
  );
}
