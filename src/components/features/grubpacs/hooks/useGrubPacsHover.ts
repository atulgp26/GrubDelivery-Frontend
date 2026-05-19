import { useState } from "react";

export function useGrubPacsHover() {
  const [hoveredRow, setHoveredRow] = useState<string | number | null>(null);

  const handleMouseEnter = (id: string | number) => {
    setHoveredRow(id);
  };

  const handleMouseLeave = () => {
    setHoveredRow(null);
  };

  return {
    hoveredRow,
    handleMouseEnter,
    handleMouseLeave,
  };
}

