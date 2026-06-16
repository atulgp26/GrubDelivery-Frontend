import { useState, useEffect, type ReactNode } from "react";
import type { AccordionProps } from "@/types";
import supportService from "@/services/support";

function renderAttachments(attachments?: string[]) {
  if (!attachments || attachments.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {attachments.map((file) => {
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
  );
}

function renderHelpAnswer(answer: string) {
  const blocks = answer.split(/\n\n+/);
  const elements: ReactNode[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];
    const stepMatch = block.match(/^(\d+)\.\s+([^:]+):\s*\n?([\s\S]*)/);
    if (stepMatch) {
      const [, , heading, body] = stepMatch;
      elements.push(
        <div key={i}>
          <p className="font-semibold">{heading}:</p>
          <p className="pl-4 mt-1">{body.trim()}</p>
        </div>
      );
    } else if (block.trim()) {
      elements.push(<p key={i}>{block.trim()}</p>);
    }
    i++;
  }

  return (
    <div className="flex flex-col gap-4 text-[#5D6C63] text-[16px] text-base leading-[var(--gp-text-line-height-md)] break-words">
      {elements}
    </div>
  );
}

export default function Accordion({
  items,
  helpaccordian,
  className = "",
  escalation,
  openIndex,
}: AccordionProps) {
  const [open, setOpen] = useState<number>(openIndex ?? 0);

  useEffect(() => {
    if (openIndex !== undefined) setOpen(openIndex);
  }, [openIndex]);
  return (
    <div className={`border-t border-b border-[var(--color-stroke-neutral)] divide-y divide-[var(--color-stroke-neutral)] ${className}`}>
      {items.map((item, i) => (
        <div key={i}>
          <button
            className="w-full flex items-center gap-3 py-4 px-2 focus:outline-none"
            onClick={() => setOpen(open === i ? -1 : i)}
            aria-expanded={open === i}
          >
            <span className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-md ${helpaccordian ? "" : "bg-white text-[var(--color-brand-default)]"}`}>
              {item.icon}
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
              <span className={helpaccordian ? "font-semibold text-[14px] text-[var(--color-neutral-primary)] text-left" : "font-medium text-sm text-[var(--color-neutral-primary)] flex-1 text-left"}>{item.question}</span>
              <span className={`shrink-0 ${helpaccordian ? "text-[var(--color-neutral-light)]" : "text-[var(--color-stroke-brand)]"} pr-2`}>
                <svg className={`w-5 h-5 transition-transform ${open === i ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </span>
            </div>
          </button>
          {
            escalation?
            <>
          {open === i && (
            <div className={`w-[600px] ${escalation?"grid grid-cols-6":""} ${helpaccordian? "px-2 pb-6 whitespace-pre-line text-[var(--color-neutral-secondary)] text-base" : `px-12 pb-6 text-sm text-gray-700 whitespace-pre-line`}`}>
              <div className="flex flex-col gap-6 col-span-1">
              <span className="text-[var(--color-stroke-brand)] text-sm leading-relaxed">Subject :</span>
              <span className="text-[var(--color-stroke-brand)] text-sm leading-relaxed">Body :</span>
              </div>
              <div className="flex flex-col gap-6 col-span-5">
              <span className="text-[var(--color-neutral-secondary)] ">{item.subject}</span>
              <span className="text-[var(--color-neutral-secondary)] leading-loose text-base pb-1">{item.body}</span>
              </div>
            </div>
          )}
            </>
            :
            <>
          {open === i && (
            <div className={helpaccordian ? "pl-12 pr-6 pb-6 text-[var(--color-neutral-primary)] break-words" : "px-2 pb-6 text-sm text-gray-700 whitespace-pre-line break-words"}>
              {helpaccordian ? (typeof item.answer === "string" ? renderHelpAnswer(item.answer) : item.answer) : item.answer}
              {renderAttachments(item.attachments)}
            </div>
          )}
            </>
          }
        </div>
      ))}
    </div>
  );
}
