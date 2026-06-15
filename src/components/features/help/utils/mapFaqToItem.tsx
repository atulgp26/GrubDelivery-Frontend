import Image from "next/image";
import type { FaqItem, HelpFaqItem } from "@/types";

const DEFAULT_ICON = (
  <Image
    src="/Support/Card/annotation-question.svg"
    alt=""
    width={32}
    height={32}
    className="h-8 w-8 shrink-0"
  />
);

export function mapFaqToItem(faq: FaqItem): HelpFaqItem {
  return {
    id: faq.id,
    icon: DEFAULT_ICON,
    question: faq.question,
    answer: faq.answer,
    attachments: faq.attachments,
  };
}
