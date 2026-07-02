"use client";

import { useState } from "react";
import Image from "next/image";
import HelpCard from "./components/HelpCard";
import HelpWriteToUs from "./components/HelpWriteToUs";
import HelpSearchInput from "./components/HelpSearchInput";
import FeedbackModal from "./modals/FeedbackModal";
import { Skeleton } from "@/components/ui/skeleton";
import LoadingDetails from "@/components/ui/LoadingDetails";
import { getIconUrl } from "./utils/getIconUrl";
import { useHelpCategories, useHelpSearch } from "./hooks/useHelpHooks";
import type { HelpSearchSuggestion } from "@/types";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function HelpScreen() {
  const router = useRouter();
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const { categories, isLoading } = useHelpCategories();
  const { searchResults, isSearching, searchError, setSearchError, handleSearchChange } = useHelpSearch();

  const handleSearchSelect = (item: HelpSearchSuggestion) => {
    if (item.faqId && item.categoryName) {
      const category = categories.find((c) => c.name === item.categoryName);
      if (category) {
        router.push(
          `/help/${category.id}?name=${encodeURIComponent(category.name)}&openFaq=${item.faqId}`
        );
        return;
      }
    }
    if (item.href) router.push(item.href);
  };

  if (isLoading) {
    return <LoadingDetails entity="help articles" />;
  }

  return (
    <div className="flex flex-col px-6 h-full overflow-hidden">
      {/* Header — always visible */}
      <header className="mb-6 flex-shrink-0">
        <h1 className="text-[length:var(--gp-heading-size-lg)] font-[var(--gp-font-weight-heading)] leading-[var(--gp-heading-line-height-lg)] text-[var(--color-neutral-primary)]">How can we help?</h1>
      </header>

      {/* Search bar — always visible */}
      <div className="flex-shrink-0">
        <HelpSearchInput data={searchResults} isSearching={isSearching} onSelect={handleSearchSelect} onSearchChange={handleSearchChange} />
        {searchError && (
          <Alert variant="error" className="mt-3" onClick={() => setSearchError(null)}>
            <AlertDescription>{searchError}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Cards grid */}
      <section className="mt-8 mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 flex-1 overflow-y-auto min-h-0">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`skeleton-card-${i}`}
                className="flex flex-col items-center justify-center border border-[var(--color-stroke-neutral)] rounded-lg bg-white p-8 w-full h-60"
              >
                <Skeleton variant="default" width={80} height={80} className="mb-4 rounded-md" />
                <Skeleton variant="text" width={140} height={18} />
              </div>
            ))
          : categories.map((category) => (
              <HelpCard
                key={category.id}
                icon={
                  category?.icon?.bucket_key ? (
                    <Image
                      src={getIconUrl(category.icon.bucket_key)}
                      alt={category.icon?.name || category.name}
                      width={80}
                      height={80}
                      className="h-20 w-20 shrink-0 object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="h-20 w-20 shrink-0" />
                  )
                }
                title={category.name}
                onClick={() =>
                  router.push(`/help/${category.id}?name=${encodeURIComponent(category.name)}`)
                }
              />
            ))}
      </section>

      {/* Write to us banner — always visible */}
      <div className="mt-auto flex-shrink-0">
        <HelpWriteToUs className="mt-8" onClick={() => setIsFeedbackModalOpen(true)} />
      </div>

      <FeedbackModal
        open={isFeedbackModalOpen}
        onCloseAction={() => setIsFeedbackModalOpen(false)}
        onFeedbackAction={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  );
}

