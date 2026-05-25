import Accordion from "@/components/ui/Accordion";
import type { HelpFaqItem } from "@/types";

interface HelpFaqAccordionProps {
  items: HelpFaqItem[];
  openIndex?: number;
}

export default function HelpFaqAccordion({ items, openIndex }: HelpFaqAccordionProps) {
  return <Accordion items={items} helpaccordian openIndex={openIndex} />;
}
