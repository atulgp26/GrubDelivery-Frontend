"use client";

import { use } from "react";
import FaqAnswerScreen from "@/components/features/help/FaqAnswerScreen";

interface Props {
  params: Promise<{ faqId: string }>;
}

export default function FaqAnswerPage({ params }: Props) {
  const { faqId } = use(params);
  return <FaqAnswerScreen faqId={faqId} />;
}
