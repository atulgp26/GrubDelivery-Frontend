"use client";
import { useEffect, useRef, useState } from "react";
import Collapse from "@/components/ui/Collapse";
import type { GroupCollapseTableProps } from "@/types";

export default function GroupCollapseTable<TItem, TGroup extends GroupCollapseTableProps<TItem>["groups"][number]>({
  groups,
  openIndex,
  setOpenIndex,
  renderTable,
  noResultsMessage = "No results found.",
  tableContainerClass = "w-full",
  restaurantTable,
  titleColor,
  pageSize = 50,
  isPageLoading = false,
  onGroupClick,
  onPageChange,
  showPaginationPrev = true,
  showPaginationNext = true,
}: GroupCollapseTableProps<TItem, TGroup>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pages, setPages] = useState<Record<number, number>>({});

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return;
      if (openIndex === null) return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      
      // Don't close if clicking on:
      // 1. Dropdown portals
      // 2. Modals (any element with z-50 or higher, or inside a modal)
      // 3. Search inputs or textareas (including .input-wrapper)
      // 4. Form elements or buttons inside forms/modals
      // 5. Tooltip portals (RadixUI tooltips)
      // 6. Any portaled content
      if (
        target.closest('[data-portal-container="dropdown"]') ||
        target.closest('[data-radix-popper-content-wrapper]') ||
        target.closest('[data-radix-portal]') ||
        target.closest('[data-slot="dropdown-menu-content"]') ||
        target.closest('[data-slot="dropdown-menu-item"]') ||
        target.closest('[role="tooltip"]') ||
        target.closest('[role="dialog"]') ||
        target.closest('[role="menu"]') ||
        target.closest('[role="menuitem"]') ||
        target.closest('[class*="z-50"]') ||
        target.closest('[class*="z-[50]"]') ||
        target.closest('[class*="z-[100]"]') ||
        target.closest('[class*="z-[9999]"]') ||
        target.closest('.input-wrapper') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('form') ||
        (target.closest('button') && (
          target.closest('form') ||
          target.closest('[class*="z-50"]') ||
          target.closest('[class*="z-[50]"]') ||
          target.closest('[role="dialog"]')
        ))
      ) {
        return;
      }
      
      if (!containerRef.current.contains(target)) {
        setPages({});
        setOpenIndex(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openIndex, setOpenIndex]);

  const getPage = (index: number) => pages[index] ?? 1;
  const setPage = (index: number, page: number, group: TGroup) => {
    if (isPageLoading) return;
    if (onPageChange) {
      onPageChange(group, page);
    } else {
      setPages((prev) => ({ ...prev, [index]: page }));
    }
  };

  return (
    <div ref={containerRef}>
      {groups.map((group, index) => {
        const totalItems = group.pagination?.totalItems ?? group.items?.length ?? 0;
        const totalPages = group.pagination?.totalPages ?? Math.ceil(totalItems / pageSize);
        const currentPage = group.pagination?.currentPage ?? getPage(index);
        
        const shouldPaginate = openIndex === index && totalItems > 0;
        const start = onPageChange ? 0 : (currentPage - 1) * pageSize;
        const end = onPageChange ? (group.items?.length ?? 0) : Math.min(start + pageSize, totalItems);
        
        // If we are using backend pagination (onPageChange exists), we don't slice locally
        const visibleItems = onPageChange ? (group.items ?? []) : (group.items ?? []).slice(start, end);

        const pagination = (shouldPaginate && group.items && group.items.length > 0)
          ? {
              rangeText: group.pagination 
                ? (() => {
                    const pg = group.pagination;
                    const startRange = (currentPage - 1) * pg.pageSize + 1;
                    const endRange = (currentPage - 1) * pg.pageSize + (group.items?.length ?? 0);
                    if (isNaN(startRange) || isNaN(endRange)) return "-";
                    return `${startRange}-${endRange}`;
                  })()
                : `${(start || 0) + 1}-${end || 0}`,
              onPrev: () => setPage(index, Math.max(1, currentPage - 1), group),
              onNext: () => setPage(index, Math.min(totalPages, currentPage + 1), group),
              disablePrev: isPageLoading || currentPage <= 1,
              disableNext: isPageLoading || currentPage >= totalPages,
              showPrev: showPaginationPrev,
              showNext: showPaginationNext,
            }
          : undefined;

        const groupForRender = {
          ...group,
          items: visibleItems,
        };

        const emptyMessage = group.emptyMessage ?? noResultsMessage;

        return (
          <Collapse
            key={index}
            title={group.name}
            open={openIndex === index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            onTitleClick={(e) => {
              if (onGroupClick) {
                onGroupClick(group, index);
              }
            }}
            restaurantTable={restaurantTable}
            titleColor={titleColor}
            pagination={pagination}
          >
            {openIndex === index && (
              <div className={tableContainerClass}>
                {isPageLoading ? (
                  <div className="space-y-3 p-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : groupForRender.items && groupForRender.items.length > 0 ? (
                  renderTable(groupForRender as TGroup, index)
                ) : emptyMessage ? (
                  <div className="bg-white border-b border-[var(--color-stroke-neutral)]">
                    <div className="px-6 py-4 text-base text-[var(--color-neutral-secondary)]">
                      {emptyMessage}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </Collapse>
        );
      })}
    </div>
  );
}

