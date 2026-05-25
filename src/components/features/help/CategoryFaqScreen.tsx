"use client";

import { useState } from "react";
import Link from "next/link";
import FigIcon from "@/components/ui/FigIcon";
import HelpFaqAccordion from "./components/HelpFaqAccordion";
import FeedbackModal from "./modals/FeedbackModal";
import { Button } from "@/components/ui/Button";
import HelpSearchBar from "@/components/ui/HelpSearchBar";
import { Skeleton } from "@/components/ui/skeleton";
import { highlightMatch } from "@/lib/utils/highlightMatch";
import { useCategoryFaqs } from "./hooks/useHelpHooks";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CategoryFaqScreenProps {
  categoryId: string;
  categoryName: string;
  openFaqId?: string;
}

export default function CategoryFaqScreen({ categoryId, categoryName, openFaqId }: CategoryFaqScreenProps) {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const {
    faqItems,
    isLoading,
    searchValue,
    searchResults,
    isSearching,
    searchFocused,
    setSearchFocused,
    openIndex,
    setOpenIndex,
    handleSearchChange,
    handleClear,
    searchError,
    setSearchError,
  } = useCategoryFaqs(categoryId, categoryName, openFaqId);

  return (
    <div>
      {/* Header row */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <>
              <Skeleton variant="default" width={32} height={32} className="rounded-md" />
              <Skeleton variant="text" width={150} height={20} />
            </>
          ) : (
            <>
              <Link href="/help" className="text-gray-500 transition hover:text-[var(--color-neutral-primary)]">
                <Button variant="neutral" appearance="ghost" className="btn-size-md-sm !p-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
              </Link>
              <h1 className="text-lg font-semibold text-[var(--color-neutral-primary)]">{categoryName}</h1>
            </>
          )}
        </div>
        {searchError && (
          <Alert variant="error" className="mt-3" onClick={() => setSearchError(null)}>
            <AlertDescription>{searchError}</AlertDescription>
          </Alert>
        )}
        {isLoading ? (
          <Skeleton variant="button" width={140} height={36} />
        ) : (
          <Button
            variant="primary"
            appearance="ghost"
            className="cursor-pointer flex items-center gap-2"
            size="md"
            onClick={() => setIsFeedbackModalOpen(true)}
          >
            <FigIcon name="Settings/pen-line" className="w-[20px] h-[20px]" /> <span>WRITE TO US</span>
          </Button>
        )}
      </div>

      {/* Search bar */}
      <div className="mb-2 relative">
        {isLoading ? (
          <Skeleton variant="default" width="100%" height={44} className="rounded-lg" />
        ) : (
          <>
            <HelpSearchBar
              value={searchValue}
              onChange={handleSearchChange}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              placeholder="Search support"
              className="w-full"
              clearable
              onClear={handleClear}
            />
            {searchFocused && searchValue.trim().length > 0 && !isSearching && (
              <div className="absolute left-0 right-0 mt-2 overflow-hidden rounded-lg border border-[var(--color-stroke-neutral)] bg-white shadow-lg z-20">
                {searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-[var(--color-neutral-secondary)]">
                    No results found
                  </div>
                ) : (
                  searchResults.map((faq) => (
                    <button
                      key={faq.id}
                      type="button"
                      className="w-full px-4 py-3 flex items-start text-left hover:bg-[var(--color-neutral-secondary-bg)] focus:bg-[var(--color-neutral-secondary-bg)] focus:outline-none border-b border-b-[var(--color-stroke-neutral)] last:border-b-0 transition-colors"
                      onMouseDown={() => {
                        const idx = faqItems.findIndex((item) => item.id === faq.id);
                        if (idx !== -1) {
                          // Reset first so selecting the same suggestion can reopen reliably.
                          setOpenIndex(undefined);
                          window.requestAnimationFrame(() => setOpenIndex(idx));
                        }
                        handleClear();
                      }}
                    >
                      <span className="text-[14px] font-normal text-[#37493F]">{highlightMatch(faq.question, searchValue)}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
      {searchError && (
        <Alert variant="error" className="mt-3" onClick={() => setSearchError(null)}>
          <AlertDescription>{searchError}</AlertDescription>
        </Alert>
      )}

      {/* FAQ accordion */}
      {isLoading ? (
        <div className="border-t border-b border-[var(--color-stroke-neutral)] divide-y divide-[var(--color-stroke-neutral)]">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`skeleton-faq-${i}`} className="flex items-center gap-3 py-4 px-2">
              <Skeleton variant="default" width={32} height={32} className="rounded-md shrink-0" />
              <Skeleton variant="text" width="60%" height={18} className="flex-1" />
              <Skeleton variant="default" width={20} height={20} className="shrink-0" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <HelpFaqAccordion items={faqItems} openIndex={openIndex} />
        </div>
      )}

      <FeedbackModal
        open={isFeedbackModalOpen}
        onCloseAction={() => setIsFeedbackModalOpen(false)}
        onFeedbackAction={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  );
}
