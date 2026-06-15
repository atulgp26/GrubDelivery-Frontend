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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header row */}
      <div className="mb-6 flex items-center justify-between flex-shrink-0">
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
        <div className="border-t border-[var(--color-stroke-neutral)] pt-4 space-y-3 flex-1 overflow-y-auto min-h-0">
          <Skeleton variant="text" width="80%" height={18} />
          <Skeleton variant="text" width="65%" height={18} />
          <Skeleton variant="text" width="70%" height={18} />
        </div>
      ) : data ? (
        <div className="border-t border-[var(--color-stroke-neutral)] pt-4 flex-1 overflow-y-auto min-h-0">
          <p className="text-[var(--color-neutral-primary)] text-base leading-relaxed whitespace-pre-line">
            {data.answer}
          </p>
          {data.attachments && data.attachments.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {data.attachments.map((file) => {
                const filename = file.split("/").pop() || file;
                return (
                  <button
                    key={file}
                    type="button"
                    onClick={() => supportService.downloadAttachment(file, filename)}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-stroke-neutral)] bg-white px-4 py-2 text-sm text-[var(--color-brand-default)] hover:bg-[var(--color-neutral-secondary-bg)] transition-colors cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M14 10v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2M8 1v10M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {filename}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 text-center text-[var(--color-neutral-secondary)] text-sm flex-1 overflow-y-auto min-h-0">
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
