import React from 'react'
import Image from 'next/image'
import Button from './Button';

interface FilterButtonProps {
  open: boolean;
  handleFilterClick: () => void;
}

const FilterButton = ({ open, handleFilterClick }: FilterButtonProps) => {
  return (
    <div
      className={`rounded-lg relative inline-block`}
    >
      <Button
        type="button"
        variant="neutral"
        appearance="ghost"
        state="press"
        onClick={handleFilterClick}
        className={`group flex items-center gap-2 h-8 px-2 py-2 rounded-lg border transition-all duration-200 focus-visible:outline-none ${open
            ? "border-[#6B7971] bg-[#EFF1F0] text-[#6B7971] shadow-[0_0_0_2px_rgba(107,121,113,0.35)]"
            : "border-[#6B7971] bg-white text-[#6B7971]"
          }`}
      >
        <div className="w-6 h-6 flex items-center justify-center">
          <Image src="/Section filter/filter/filter.svg" alt="Filter" width={16} height={16} className="text-[#6B7971]" />
        </div>
        <span
          className={`text-[14px] font-medium leading-4 text-[#6B7971] uppercase ${open ? "underline decoration-1 underline-offset-2" : ""}`}
        >
          Filter
        </span>
      </Button>
    </div>
  )
}

export default FilterButton
