import { useState, useCallback, useMemo } from "react";

interface UseGrubPacsSearchProps<T> {
  data: T[];
  searchFields?: (keyof T)[];
}

interface UseGrubPacsSearchReturn<T> {
  searchTerm: string;
  handleSearch: (value: string) => void;
  filteredData: T[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useGrubPacsSearch = <T extends Record<string, any>>(
  data: T[],
  searchFields: (keyof T)[] = ["name" as keyof T, "code" as keyof T]
): UseGrubPacsSearchReturn<T> => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    const searchLower = searchTerm.toLowerCase();
    return data.filter((item) =>
      searchFields.some((field) =>
        String(item[field]).toLowerCase().includes(searchLower)
      )
    );
  }, [data, searchTerm, searchFields]);

  return {
    searchTerm,
    handleSearch,
    filteredData,
  };
};
