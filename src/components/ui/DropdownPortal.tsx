import React, { useEffect, useRef, type ReactNode } from "react";

interface DropdownPortalProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
}

export default function DropdownPortal({
  open,
  onClose,
  children,
}: DropdownPortalProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // close when clicked outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) {
        onClose?.();
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);
  
  if (!open) return null;
  
  return (
    <div
      ref={ref}
      className="absolute right-0 mt-2 w-56 bg-white z-50"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}