"use client";
import { Button } from "@/components/ui/Button";
import type { PaginationProps } from "@/types";
import FigIcon from "@/components/ui/FigIcon";

const Pagination = ({
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  onPrev,
  onNext,
  className = "",
}: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / (pageSize || 1)));
  const startIndex = (currentPage - 1) * pageSize;
  const pageStart = totalItems === 0 ? 0 : startIndex + 1;
  const pageEnd = Math.min(startIndex + pageSize, totalItems);

  return (
    <div className={`bg-[#EFF1F0] flex justify-between items-center py-2 px-4 h-[56px] ${className}`}>
      <span className="text-sm text-[#6B7971]">{`Showing ${pageStart}-${pageEnd}`}</span>
      <div className="flex gap-3">
        <Button
          variant="neutral"
          appearance="outlined"
          className="flex !px-2 items-center justify-center !bg-white"
          onClick={onPrev}
          disabled={currentPage <= 1}
        >
          <FigIcon name="chevron-left" size={16} />
        </Button>
        <Button
          variant="neutral"
          appearance="outlined"
          className="flex !px-2 items-center justify-center !bg-white"
          onClick={onNext}
          disabled={currentPage >= totalPages}
        >
          <FigIcon name="chevron-right" size={16} />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;


