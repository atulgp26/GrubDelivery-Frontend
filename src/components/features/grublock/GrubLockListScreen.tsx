"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GrubLockListContent from "./GrubLockListContent";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function GrubLockListScreen() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-6 ml-4">
        <GrubLockListContent />
      </div>
    </QueryClientProvider>
  );
}

