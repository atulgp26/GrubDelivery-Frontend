import { useRef, useEffect } from "react";
import Switch from "@/components/ui/Switch";
import Icon from "./Icon";
import { Button } from "./Button";
import Image from "next/image";
import FigIcon from "@/components/ui/FigIcon";
import type { CollapseProps } from "@/types";

export default function Collapse({
  title,
  titleColor,
  isSettings,
  icon,
  children,
  align = "items-center",
  open = false,
  onClick,
  onTitleClick,
  detailsAccordian = false,
  pagination,
}: CollapseProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;

    el.style.maxHeight = "0px";
    requestAnimationFrame(() => {
      if (open) {
        el.style.maxHeight = el.scrollHeight + "px";
      }
    });
  }, [open, children]);

  const handleHeaderKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div className={`${detailsAccordian ? "" : "bg-[var(--very-light-gray)]"} mb-6`}>
      <div
        role="button"
        tabIndex={0}
        className={`w-full flex ${align} justify-between items-center px-4 py-4 text-left text-base font-normal text-[var(--color-neutral-secondary)] bg-[var(--color-neutral-secondary-bg)] hover:bg-[var(--color-neutral-secondary-bg)] transition focus:outline-none`}
        onClick={onClick}
        onKeyDown={handleHeaderKeyDown}
        aria-expanded={open}
      >
        {(() => {
          const baseColorClass = titleColor ?? "text-[var(--color-neutral-secondary)]";
          const fontWeightClass = detailsAccordian ? "font-semibold" : "font-normal";
          const titleClass = `text-base ${fontWeightClass} ${baseColorClass}`;

          if (icon) {
            return (
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={(e) => {
                  if (onTitleClick) {
                    e.stopPropagation();
                    onTitleClick(e);
                  }
                }}
              >
                <Icon name={icon} />
                <span className={titleClass}>{title}</span>
              </div>
            );
          }

          return (
            <span 
              className={`${titleClass} cursor-pointer`}
              onClick={(e) => {
                if (onTitleClick) {
                  e.stopPropagation();
                  onTitleClick(e);
                }
              }}
            >
              {title}
            </span>
          );
        })()}
        {isSettings ?
          <div className="flex items-center gap-2">
            <span onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 text-[var(--color-neutral-secondary)] text-base font-normal">
              <Switch checked onChange={() => {}} /> ON
            </span>
            <svg
              className={`w-6 h-6 text-[var(--color-neutral-primary)] transform transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div> :
          <div className="flex items-center gap-10">
            {pagination ? (
              <div className="flex items-center gap-3" onClick={(e)=> e.stopPropagation()}>
                <span className="text-sm text-[var(--color-neutral-secondary)]">{pagination?.rangeText ?? ""}</span>
                {pagination?.showPrev !== false && (
                  <Button
                    variant="neutral"
                    appearance="outlined"
                    className="flex !px-2 items-center justify-center !bg-[#FFFFFF]"
                    onClick={(e)=>{ e.stopPropagation(); pagination?.onPrev && pagination.onPrev(); }}
                    disabled={pagination?.disablePrev}
                  >
                    <Image src="/chevron-left.svg" alt="Previous" width={16} height={16} />
                  </Button>
                )}
                {pagination?.showNext !== false && (
                  <Button
                    variant="neutral"
                    appearance="outlined"
                    className="flex !px-2 items-center justify-center !bg-[#FFFFFF]"
                    onClick={(e)=>{ e.stopPropagation(); pagination?.onNext && pagination.onNext(); }}
                    disabled={pagination?.disableNext}
                  >
                    <Image src="/chevron-right.svg" alt="Next" width={16} height={16} />
                  </Button>
                )}
              </div>
            ) : null}
            <FigIcon
              name={open ? "chevron-up" : "Employee/Table/Grouped/Employee/Table/Table/Cell/chevron-down"}
              size={16}
              className="transition-all duration-300"
            />
          </div>
        }
      </div>
      <div
        ref={contentRef}
        className={`transition-all duration-300 bg-white overflow-hidden`}
        style={{ maxHeight: open ? "10000px" : "0px", opacity: open ? 1 : 0 }}
      >
        <div className="px-0 pb-2 pt-1 overflow-visible">{children}</div>
      </div>
    </div>
  );
}