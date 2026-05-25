import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Button } from "./Button";
import FigIcon from "./FigIcon";
import type { ModalProps } from "@/types";

export default function Modal({
  open,
  onClose,
  children,
  width = "max-w-50vw",
  height = "h-auto",
  customClass = "",
  modalClassName = "",
  positionClass = "items-center justify-center",
  top,
  right,
  bottom,
  left,
  noBlur = false,
  closeOnOutsideClick = true,
  noXPadding = false,
  hideClose = false,
  showLogo = false,
  headerLeft,
}: ModalProps) {
  const [isClient, setIsClient] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        closeOnOutsideClick &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose, closeOnOutsideClick]);

  if (!isClient || !open) return null;

  const basePosition = positionClass ?? "items-center justify-center";
  const positionClassWithImportant = basePosition
    .replace("justify-end", "!justify-end")
    .replace("justify-center", "!justify-center")
    .replace("justify-start", "!justify-start")
    .replace("items-center", "!items-center")
    .replace("items-start", "!items-start")
    .replace("items-end", "!items-end");

  // Build inline styles for positioning
  const positionStyles: React.CSSProperties = {};
  if (top) positionStyles.top = top;
  if (right) positionStyles.right = right;
  if (bottom) positionStyles.bottom = bottom;
  if (left) positionStyles.left = left;

  // Only use inset-0 if no specific positioning is provided
  const hasCustomPosition = top || right || bottom || left;
  const insetClass = hasCustomPosition ? "" : "inset-0";
  
  // For custom positioned modals, don't show backdrop
  const shouldShowBackdrop = !hasCustomPosition;

  return createPortal(
    <div
      className={`fixed ${insetClass} z-50 flex ${positionClassWithImportant} ${customClass}`}
      style={{
        backdropFilter: shouldShowBackdrop && !noBlur ? "blur(2px)" : "none",
        backgroundColor: shouldShowBackdrop && !noBlur ? "rgba(0, 0, 0, 0.1)" : "transparent",
        pointerEvents: hasCustomPosition ? "none" : "auto",
        ...positionStyles,
      }}
    >
      <div
        ref={modalRef}
        className={`relative bg-white rounded-lg border border-[var(--color-stroke-neutral)] shadow-[4px_4px_8px_0px_var(--color-notif-shadow-soft),0px_0px_4px_0px_var(--color-notif-shadow-strong)] ${width} ${height} mx-4 p-0 flex flex-col justify-center ${modalClassName}`}
        style={{ pointerEvents: "auto" }}
      >
        {(!hideClose || headerLeft || showLogo) && (
          <div className="flex items-center justify-between shrink-0 px-6 pt-6 pb-2">
            <div className="flex items-center">
              {showLogo && (
                <Image src="/Login-mark.svg" width={56} height={56} alt="logo" />
              )}
              {headerLeft}
            </div>
            {!hideClose && (
              <Button
                variant="neutral"
                appearance="ghost"
                className={`rounded-lg w-8 h-8 p-0 flex items-center justify-center hover:bg-[var(--color-neutral-50)] transition-colors shrink-0 ${headerLeft ? "-translate-y-0.5" : ""}`}
                onClick={onClose}
                aria-label="Close"
              >
                <FigIcon name="x" size={28} />
              </Button>
            )}
          </div>
        )}
        <div
          className={`flex flex-col flex-1 min-h-0 ${
            noXPadding ? "px-0 py-0" : "px-6 py-0 mb-6"
          }`}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
