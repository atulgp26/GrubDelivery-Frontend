"use client";
import React, { useEffect, useMemo } from "react";
import InfoPanel from "@/components/ui/InfoPanel";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useGrubPacsData } from "@/components/features/grubpacs/hooks/useGrubPacsData";

const GrubPacsPage = () => {
  const router = useRouter();
  const { totalEntries, isLoading } = useGrubPacsData({ limit: 1 });

  const hasGrubPacs = totalEntries > 0;

  useEffect(() => {
    if (!isLoading && hasGrubPacs) {
      router.replace("/grubpacs/list");
    }
  }, [hasGrubPacs, isLoading, router]);

  if (isLoading || hasGrubPacs) {
    return null;
  }

  return (
    <div>
      <InfoPanel
        title="GrubPacs"
        description="New boxes might take some time to show up here. Browse help section for queries."
        image={undefined}
        name="No boxes to see"
        topRight={
          <Link
            href="/grubpacs/list"
            className="text-[var(--color-primary-click-border)] font-medium cursor-pointer"
          >
            <Button variant="primary" appearance="ghost" className="hover:underline">
              KNOW MORE
            </Button>
          </Link>
        }
        buttons={[
          {
            text: (
              <>
                <span className="flex items-center text-base font-medium gap-2">
                  GO TO HELP
                  <Image src="/arrow-up-right.svg" alt="" width={20} height={20} />
                </span>

              </>
            ),
            className: "!px-4 !py-2 rounded-lg font-medium !text-base flex items-center justify-center",
            variant: "primary",
            appearance: "solid",
            state: "press",
            onClick: () => { },
          },
          {
            text: (
              <>
                <span className="flex items-center text-base font-medium gap-2">
                  <Image src="/GrubPac/mail.svg" alt="" width={18} height={18} className="inline-block align-middle" />
                  CONTACT SUPPORT
                </span>
              </>
            ),
            className: "font-medium flex items-center justify-center",
            variant: "primary",
            appearance: "outlined",
            state: "press",
            onClick: () => router.push("/help"),
          },
        ]}
      />
    </div>
  );
};

export default GrubPacsPage; 