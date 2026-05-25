"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FigIcon from "@/components/ui/FigIcon";
import FeedbackModal from "./modals/FeedbackModal";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import supportService from "@/services/support";
import type { FaqAnswerData } from "@/types";

interface FaqAnswerScreenProps {
  faqId: string;
}

export default function FaqAnswerScreen({ faqId }: FaqAnswerScreenProps) {
  const [data, setData] = useState<FaqAnswerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    supportService.getFaqAnswer(faqId).then((res) => {
      if (res.success && res.data) {
        setData(res.data);
      }
    }).finally(() => setIsLoading(false));
  }, [faqId]);

  return (
    <div>
      {/* Header row */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <>
              <Skeleton variant="default" width={32} height={32} className="rounded-md" />
              <Skeleton variant="text" width={200} height={20} />
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
              <h1 className="text-lg font-semibold text-[var(--color-neutral-primary)]">
                {data?.faq.question ?? ""}
              </h1>
            </>
          )}
        </div>
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
            <FigIcon name="Settings/pen-line" className="w-[20px] h-[20px]" /> WRITE TO US
          </Button>
        )}
      </div>

      {/* Answer content */}
      {isLoading ? (
        <div className="border-t border-[var(--color-stroke-neutral)] pt-4 space-y-3">
          <Skeleton variant="text" width="80%" height={18} />
          <Skeleton variant="text" width="65%" height={18} />
          <Skeleton variant="text" width="70%" height={18} />
        </div>
      ) : data ? (
        <div className="border-t border-[var(--color-stroke-neutral)] pt-4">
          <p className="text-[var(--color-neutral-primary)] text-base leading-relaxed whitespace-pre-line">
            {data.answer}
          </p>
        </div>
      ) : (
        <div className="py-8 text-center text-[var(--color-neutral-secondary)] text-sm">
          Could not load the answer. Please try again.
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
