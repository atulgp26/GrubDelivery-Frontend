"use client";

import { Suspense } from "react";
import GrubLockListScreen from "@/components/features/grublock/GrubLockListScreen";

export default function GrubLockListPage() {
  return (
    <Suspense fallback={null}>
      <GrubLockListScreen />
    </Suspense>
  );
}

