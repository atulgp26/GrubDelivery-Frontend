import { useState, useRef, useEffect } from "react";

export function useGrubPacsMenu() {
  const [menuOpen, setMenuOpen] = useState<string | number | null>(null);
  const menuRefs = useRef<Record<string | number, HTMLDivElement | null>>({});

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuOpen &&
        menuRefs.current[menuOpen] &&
        !menuRefs.current[menuOpen]?.contains(event.target as Node)
      ) {
        setMenuOpen(null);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const toggleMenu = (id: string | number | null) => {
    setMenuOpen(menuOpen === id ? null : id);
  };

  const closeMenu = () => {
    setMenuOpen(null);
  };

  return {
    menuOpen,
    menuRefs,
    toggleMenu,
    closeMenu,
  };
}

