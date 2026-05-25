import { useEffect, useState } from "react";
import supportService from "@/services/support";
import { mapFaqToItem } from "../utils/mapFaqToItem";
import { useDebounce } from "@/lib/hooks";
import type { FaqCategory, HelpFaqItem, HelpSearchSuggestion, FaqSearchResult } from "@/types";

export function useHelpCategories() {
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supportService
      .getCategories()
      .then((res) => {
        if (res.success && res.data?.faq_categories) {
          setCategories(res.data.faq_categories);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { categories, isLoading };
}

export function useHelpSearch() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<HelpSearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const debouncedTerm = useDebounce(searchTerm, 300);

  async function fetchSearchResults(term: string) {
    if (!term.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    try {
      const res = await supportService.searchFaqs(term);
      if (res.success && res.data?.faqs) {
        setSearchResults(
          res.data.faqs.map((faq) => ({
            title: faq.question,
            subtitle: faq.category,
            faqId: faq.id,
            categoryName: faq.category,
          }))
        );
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchError("Failed to load search results. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  useEffect(() => {
    fetchSearchResults(debouncedTerm);
  }, [debouncedTerm]);

  function handleSearchChange(term: string) {
    setSearchTerm(term);
    if (term.trim()) {
      setIsSearching(true);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }

  return { searchResults, isSearching, searchError, setSearchError, handleSearchChange };
}

export function useCategoryFaqs(
  categoryId: string,
  categoryName: string,
  openFaqId?: string
) {
  const [faqItems, setFaqItems] = useState<HelpFaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchResults, setSearchResults] = useState<FaqSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | undefined>(undefined);
  const [searchError, setSearchError] = useState<string | null>(null);

  const debouncedTerm = useDebounce(searchValue, 300);

  useEffect(() => {
    setIsLoading(true);
    supportService
      .getFaqs(categoryId)
      .then((res) => {
        if (res.success && res.data?.faqs) {
          const items = res.data.faqs.map(mapFaqToItem);
          setFaqItems(items);
          if (openFaqId) {
            const idx = items.findIndex((item) => item.id === openFaqId);
            if (idx !== -1) setOpenIndex(idx);
          }
        }
      })
      .finally(() => setIsLoading(false));
  }, [categoryId, openFaqId]);

  async function fetchCategorySearch(term: string) {
    if (!term.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    try {
      const res = await supportService.searchFaqs(term);
      if (res.success && res.data?.faqs) {
        setSearchResults(
          res.data.faqs.filter((faq) => faq.category === categoryName)
        );
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchError("Failed to load search results. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  useEffect(() => {
    fetchCategorySearch(debouncedTerm);
  }, [debouncedTerm]);

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    const term = event.target.value;
    setSearchValue(term);
    if (term.trim()) {
      setIsSearching(true);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }

  function handleClear() {
    setSearchValue("");
    setSearchResults([]);
    setIsSearching(false);
  }

  return {
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
  };
}
