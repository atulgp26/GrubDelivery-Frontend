import { useState, useRef, useEffect } from "react";
import type { CSSProperties, ChangeEvent, RefObject } from "react";
import Image from "next/image";
import FigIcon from "@/components/ui/FigIcon";
import SearchInput from "./SearchInput";
import type { MultiSelectDropdownProps, MultiSelectOption } from "@/types";

const normalize = (str: string | undefined): string =>
  str?.toLowerCase().replace(/\s+/g, "").replace("#", "") ?? "";

export default function MultiSelectDropdown({
  options = [],
  selected = [],
  setSelected,
  placeholder = "Select box",
  className = "",
  style = {},
  hideComponent = false,
  notificationIcon = false,
  padding = "",
  placeholderColor = "",
  fontsize = "",
  dropdownwidth = "",
  closeSignal,
  onOpenChange,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    // Use capture phase so parent stopPropagation handlers don't block close detection.
    document.addEventListener("mousedown", handleClick, true);
    return () => document.removeEventListener("mousedown", handleClick, true);
  }, [open]);

  // Notify parent when open state changes
  // Notify parent only when `open` changes; avoid depending on callback identity
  const cbRef = useRef<typeof onOpenChange>(onOpenChange);
  useEffect(() => {
    cbRef.current = onOpenChange;
  }, [onOpenChange]);
  useEffect(() => {
    if (typeof cbRef.current === "function") cbRef.current(open);
  }, [open]);

  // External close trigger - incrementing signal closes dropdown
  useEffect(() => {
    if (closeSignal !== undefined) {
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeSignal]);

  // Improved search: case-insensitive, space-insensitive, ignores '#'
  const filteredOptions = options.filter((opt) => {
    const searchNorm = normalize(search);
    const labelNorm = normalize(opt.label);
    const codeNorm = opt.code ? normalize(opt.code) : "";
    return labelNorm.includes(searchNorm) || codeNorm.includes(searchNorm);
  });

  const handleToggle = (id: string | number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((sid) => sid !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  let buttonLabel = placeholder;
  if (selected.length === 1) {
    const sel = options.find((o) => o.id === selected[0]);
    buttonLabel = sel ? sel.label : placeholder;
  } else if (selected.length > 1) {
    const sel = options.find((o) => o.id === selected[0]);
    buttonLabel = sel ? `${sel.label} (+${selected.length - 1})` : `${selected.length} selected`;
  }
  if (selected.length === options.length && options.length > 0) {
    buttonLabel = placeholder;
  }

  const hasSelection = selected.length > 0;

  return (
    <div className={`relative ${className}`} ref={ref} data-multiselect-root="true">
      {/* Dropdown Button */}
      <button
        type="button"
        className={`flex items-center justify-between rounded-[8px] border bg-white ${padding} px-3 py-1.5 text-[14px] font-normal leading-[22px] transition-shadow cursor-pointer hover:border-[#fe5720] hover:bg-[#fafbfa] focus-visible:outline-none ${!style.width ? "w-[200px]" : ""} ${!style.height ? "h-[32px]" : ""} ${
          open
            ? "border-[#fe5720] bg-white shadow-[0_0_0_2px_rgba(254,87,32,0.40)]"
            : hasSelection
              ? "border-[#fe5720] bg-white"
              : "border-[#e0e3e1] bg-white"
        }`}
        style={style as CSSProperties}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className={`truncate select-none text-[14px] leading-[22px] font-normal ${hasSelection ? "text-[#37493f]" : "text-[#a4aca7]"}`}
        >
          {buttonLabel}
        </span>
        <span
          className={`ml-2 flex items-center transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
        >
          <FigIcon name="Settings/Side Nav/Nav/chevron-down" size={16} className="w-4 h-4" />
        </span>
      </button>

      {/* Dropdown Content */}
      {open && (
        <div
          className={`absolute z-20 mt-1 ${dropdownwidth} border border-[#e0e3e1] text-[#37493f] bg-white shadow-[0px_4px_16px_0px_rgba(0,0,0,0.08),0px_0px_4px_0px_rgba(0,0,0,0.04)] rounded-[8px] overflow-hidden animate-fadein`}
          style={{ width: style.width || '200px' }}
        >
          {/* Search */}

          <SearchInput
            type="text"
            value={search}
            icon={
              <>
                <Image src="/search.svg" alt="" width={20} height={20} className="w-5 h-5 absolute left-6 top-[24px] -translate-y-1/2 pointer-events-none" />
              </>
            }
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            clearable={true}
            placeholder="Search"
            className={`${hideComponent ? "hidden" : ""} w-full !py-2 !px-3 border-b !rounded-b-none border-[#e0e3e1] input-wrapper`}
          />


          {/* Options */}
          <div className="max-h-60 overflow-y-auto divide-y divide-[#e0e3e1]">
            {filteredOptions.length === 0 && (
              <div className="px-4 py-2 text-[#a4aca7] text-[14px]">No results found.</div>
            )}
            {filteredOptions.map((opt, idx) => {
              const isChecked = selected.includes(opt.id);
              const isLast = idx === filteredOptions.length - 1;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`flex items-center w-full px-3 py-2 text-[14px] font-normal gap-2 cursor-pointer transition-colors ${isChecked
                    ? "bg-[#fff0eb]"
                    : "hover:bg-[#fafbfa] active:bg-[#f0f2f1] text-[#37493f]"
                    }`}
                  onClick={() => handleToggle(opt.id)}
                >
                  {/* Checkbox */}
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-[4px] border-[1.5px] mr-2 flex-shrink-0 ${isChecked
                      ? "bg-[#fe5720] border-[#fe5720]"
                      : "bg-white border-[#fe5720]"
                      }`}
                  >
                    {isChecked && (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>

                  {/* Label and sublabel */}
                  <div className="flex flex-col gap-0.5 justify-center text-left">
                    <span className={`font-normal text-[14px] leading-[22px] ${isChecked ? "text-[#37493f]" : "text-[#37493f]"}`}>{opt.label}</span>
                    {opt.code && (
                      <span className={`text-[12px] leading-[18px] ${isChecked ? "text-[#6b7971]" : "text-[#a4aca7]"}`}>
                        {opt.code}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Select All + Count Footer (merged) */}
          <div
            className={`${hideComponent ? "hidden" : ""} flex items-center px-3 py-2 border-t border-[#e0e3e1] bg-[#fafbfa] cursor-pointer select-none`}
            onClick={() => {
              const allIds = filteredOptions.map((opt) => opt.id);
              const allSelected =
                allIds.length > 0 && allIds.every((id) => selected.includes(id));
              if (allSelected) {
                setSelected(selected.filter((id) => !allIds.includes(id)));
              } else {
                setSelected(Array.from(new Set([...selected, ...allIds])));
              }
            }}
          >
            <span
              className={`inline-flex items-center justify-center w-5 h-5 rounded-[4px] border-[1.5px] mr-2 flex-shrink-0 ${filteredOptions.length > 0 && (filteredOptions.every((opt) => selected.includes(opt.id)) || filteredOptions.some((opt) => selected.includes(opt.id)))
                  ? "bg-[#7e8982] border-[#7e8982]"
                  : "bg-white border-[#a4aca7]"
                }`}
            >
              {/* Show minus for partial, check for all, nothing for none */}
              {filteredOptions.length > 0 && filteredOptions.every((opt) => selected.includes(opt.id)) && (
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {filteredOptions.length > 0 &&
                !filteredOptions.every((opt) => selected.includes(opt.id)) &&
                filteredOptions.some((opt) => selected.includes(opt.id)) && (
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  stroke="white"
                  strokeWidth={3}
                  viewBox="0 0 24 24"
                >
                  <line x1="6" y1="12" x2="18" y2="12" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
            </span>
            <span className="pl-2 font-normal text-[14px] leading-[22px] text-[#37493f]">
              {filteredOptions.length === 0
                ? "Select All"
                : filteredOptions.every((opt) => selected.includes(opt.id))
                  ? `${filteredOptions.length} selected`
                  : selected.filter((id) => filteredOptions.some((opt) => opt.id === id)).length > 0
                    ? `${selected.filter((id) => filteredOptions.some((opt) => opt.id === id)).length} selected`
                    : "Select All"
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
