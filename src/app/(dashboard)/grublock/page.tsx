"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import GrubLockEmptyState from "@/components/features/grublock/components/GrubLockEmptyState";
import { Button } from "@/components/ui/Button";
import { useGrubLockQuery } from "@/components/features/grublock/hooks/useGrubLockQuery";

export default function GrubLockPage() {
  const router = useRouter();
  const { data, isLoading } = useGrubLockQuery({ isGrouped: false });

  const hasGrubLockBoxes = useMemo(
    () => (data?.groups ?? []).some((group) => (group.items?.length ?? 0) > 0),
    [data?.groups],
  );

  useEffect(() => {
    if (!isLoading && hasGrubLockBoxes) {
      router.replace("/grublock/list");
    }
  }, [hasGrubLockBoxes, isLoading, router]);

  if (isLoading || hasGrubLockBoxes) {
    return null;
  }

  return (
    <div className="">
      <GrubLockEmptyState
        onGoToHelp={() => router.push("/help")}
        onContactSupport={() => router.push("/help")}
        topRight={
          <Button
            variant="primary"
            appearance="ghost"
            state="press"
            onClick={() => router.push("/grublock/list")}
          >
            <span>VIEW ALL BOXES</span>
          </Button>
        }
      />
    </div>
  );
}
