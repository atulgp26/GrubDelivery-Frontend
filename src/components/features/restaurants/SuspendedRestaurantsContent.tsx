"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import LoadingDetails from "@/components/ui/LoadingDetails";
import { FiArrowLeft, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import FilterButton from "@/components/ui/FilterButton";
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from "@/components/ui/Table";
import TableCheckbox from "@/components/ui/TableCheckbox";
import Pagination from "@/components/ui/Pagination";
import type { Restaurant } from "@/types/domain/restaurants";
import { IoChevronBack } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaCheck } from "react-icons/fa";

interface SuspendedRestaurantsContentProps {
  restaurants?: Restaurant[];
  onActivate?: (restaurantId: string) => void;
  onActivateAll?: (restaurantIds: string[]) => void;
  onDelete?: (restaurantId: string) => void;
  onDeleteSelection?: (restaurantIds: string[]) => void;
  isLoading?: boolean;
}

const PAGE_SIZE = 50;

export default function SuspendedRestaurantsContent({
  restaurants = [],
  onActivate,
  onActivateAll,
  onDelete,
  onDeleteSelection,
  isLoading = false,
}: SuspendedRestaurantsContentProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const filteredRestaurants = useMemo(() => {
    if (!searchTerm) return restaurants;
    const lowered = searchTerm.toLowerCase();
    return restaurants.filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(lowered) ||
        restaurant.address.toLowerCase().includes(lowered)
    );
  }, [restaurants, searchTerm]);

  const totalEntries = filteredRestaurants.length;
  const totalPages = Math.ceil(totalEntries / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalEntries);
  const paginatedData = filteredRestaurants.slice(startIndex, endIndex);

  const handleRowSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIds(
      e.target.checked ? new Set(paginatedData.map((r) => r.id)) : new Set()
    );
  };

  const allSelected =
    paginatedData.length > 0 &&
    paginatedData.every((restaurant) => selectedIds.has(restaurant.id));

  const handleActivate = (restaurantId: string) => {
    if (onActivate) {
      onActivate(restaurantId);
    }
  };

  const handleActivateAll = () => {
    if (onActivateAll) {
      const idsToActivate = selectedIds.size > 0 
        ? Array.from(selectedIds)
        : filteredRestaurants.map((r) => r.id);
      onActivateAll(idsToActivate);
      if (selectedIds.size > 0) {
        setSelectedIds(new Set());
      }
    }
  };

  const handleDelete = (restaurantId: string) => {
    if (onDelete) {
      onDelete(restaurantId);
    }
  };

  const handleDeleteSelectionAction = () => {
    if (selectedIds.size > 0) {
      if (onDeleteSelection) {
        onDeleteSelection(Array.from(selectedIds));
      } else if (onDelete) {
        Array.from(selectedIds).forEach((id) => {
          onDelete(id);
        });
      }
      setSelectedIds(new Set());
    }
  };

  const handleActivateSelection = () => {
    if (onActivateAll && selectedIds.size > 0) {
      onActivateAll(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">

          <IoChevronBack className="w-6 h-6 text-[var(--color-stroke-brand)]" onClick={() => router.back()} />
          

          <h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">
            Suspended restaurants
          </h1>
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={handleActivateAll}
          className="!text-base font-medium"
          disabled={restaurants.length === 0}
        >
          <span>ACTIVATE ALL</span>
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <SearchInput
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          onClear={() => {
            setSearchTerm("");
            setCurrentPage(1);
          }}
          placeholder="Search restaurant"
          className="w-[240px]"
        />
        <div className="flex items-center gap-4">
          <span className="font-normal text-[14px] leading-[22px] text-[#6B7971]">
            {totalEntries} entries
          </span>
          <FilterButton
            open={showFilterModal}
            handleFilterClick={() => setShowFilterModal(!showFilterModal)}
          />
        </div>
      </div>

      {totalEntries > 0 && (
        <Pagination
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={totalEntries}
          onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          onNext={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        />
      )}

      <div className={cn("overflow-x-auto relative min-h-[400px]", isLoading && "opacity-60")}>
        {!restaurants.length && isLoading ? (
          <LoadingDetails entity="suspended restaurants" />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell className="w-12 px-2 py-3">
                    <TableCheckbox checked={allSelected} onChange={handleSelectAll} />
                  </TableHeaderCell>
                  <TableHeaderCell className="px-4 py-3 text-left flex-1 min-w-0">
                    Name
                  </TableHeaderCell>
                  <TableHeaderCell className="px-4 py-3 text-left flex-1 min-w-0">
                    Address
                  </TableHeaderCell>
                  <TableHeaderCell className="px-4 py-3 text-left w-32">Added</TableHeaderCell>
                  <TableHeaderCell className="px-4 py-3 text-left w-32">Suspended</TableHeaderCell>
                  <TableHeaderCell className="px-4 py-3 text-left w-40">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-[var(--color-stroke-brand)]">
                      {searchTerm ? "No restaurants match your search." : "No suspended restaurants found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((restaurant) => {
                    return (
                      <TableRow key={restaurant.id}>
                        <TableCell className="px-2 py-4 align-top">
                          <TableCheckbox
                            checked={selectedIds.has(restaurant.id)}
                            onChange={(e) => handleRowSelect(restaurant.id, e.target.checked)}
                          />
                        </TableCell>
                        <TableCell className="px-4 py-4 align-top flex-1 min-w-0">
                          <div className="flex flex-col">
                            <span className="text-base font-semibold text-[var(--color-neutral-secondary)] whitespace-normal break-all">
                              {restaurant.name}
                            </span>
                            <span className="text-sm font-normal text-[var(--color-stroke-brand)]">
                              (and {restaurant.boxes} boxes, {restaurant.drivers} drivers, {restaurant.manager ? 1 : 0} manager)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 align-top flex-1 min-w-0">
                          <span className="text-base font-normal text-[var(--color-neutral-secondary)]">
                            {restaurant.address}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4 align-middle w-32">
                          <span className="text-base font-normal text-[var(--color-neutral-secondary)]">
                            {restaurant.updated}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4 align-middle w-32">
                          <span className="text-base font-normal text-[var(--color-neutral-secondary)]">
                            {restaurant.updated}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4 align-middle w-40">
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              variant="neutral"
                              appearance="outlined"
                              onClick={() => handleActivate(restaurant.id)}
                              className="!text-sm !px-3 !py-1 whitespace-nowrap font-medium"
                            >
                              ACTIVATE
                            </Button>
                            <button
                              type="button"
                              onClick={() => handleDelete(restaurant.id)}
                              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--color-neutral-secondary-bg)] transition-colors text-[var(--color-stroke-brand)] flex-shrink-0"
                              aria-label="Delete restaurant"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[1px] z-10 transition-opacity duration-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--gp-color-brand-primary)]"></div>
              </div>
            )}
          </>
        )}
      </div>

      {totalEntries > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={totalEntries}
          onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          onNext={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        />
      )}

      {selectedIds.size > 0 && (
        <div 
          className="fixed bottom-1 bg-[var(--color-neutral-secondary-bg)] border border-[var(--color-box-border)] text-[var(--color-stroke-brand)] rounded-lg shadow-lg flex items-center justify-between px-6 py-3 z-50"
          style={{ left: 'var(--table-action-bar-left, 1rem)', right: '1rem' }}
        >
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="neutral"
              appearance="outlined"
              className="flex gap-2 !border cursor-pointer !border-[var(--color-box-border)] bg-white px-4 py-2 rounded-md !text-base font-medium items-center text-[var(--color-neutral-secondary)]"
              onClick={handleClearSelection}
            >
              <RxCross2 className="text-lg" />
              {selectedIds.size} SELECTED
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              onClick={handleDeleteSelectionAction}
              variant="neutral"
              appearance="ghost"
              className="flex leading-none items-center gap-2 text-[var(--color-neutral-secondary)] font-medium uppercase"
            >
              <RiDeleteBinLine className="w-5 h-5 text-[var(--color-neutral-secondary)]" />
              DELETE SELECTION
            </Button>
            <Button
              type="button"
              onClick={handleActivateSelection}
              variant="primary"
              className="flex items-center gap-2 uppercase font-medium"
            >
              <FaCheck   />
              Activate Selection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

