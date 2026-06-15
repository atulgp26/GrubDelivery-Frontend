"use client";

import Button from "@/components/ui/Button";
import CheckBoxDisable from "@/components/ui/CheckBoxDisable";
import DetailsCollapse from "@/components/ui/DetailsCollapse";
import Modal from "@/components/ui/Modal";
import Radio from "@/components/ui/Radio";
import React, { useState, useEffect, useRef } from "react";
import { IoChevronBack } from "react-icons/io5";

interface OptionItem {
  id: string;
  label: string;
  type?: "radio" | "checkbox";
  checked?: boolean;
  disabled?: boolean;
  variant?: string;
}

interface OptionGroup {
  group: string;
  title: string;
  items: OptionItem[];
}

interface MidLevelItem {
  id: string;
  label: string;
  checked?: boolean;
}

interface ExportListModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  footer?: string;
  options?: OptionGroup[];
  midLevelData?: MidLevelItem[];
  onConfirm?: (data: { scope: string; checked: Record<string, boolean> }) => void;
}

const ExportListModal = ({
  open,
  onClose,
  title,
  description,
  footer,
  options = [],
  midLevelData = [],
  onConfirm,
}: ExportListModalProps) => {
  const [scope, setScope] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [openCollapse, setOpenCollapse] = useState("");
  const optionsRef = useRef(JSON.stringify(options));
  const midLevelDataRef = useRef(JSON.stringify(midLevelData));
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      isInitializedRef.current = false;
      return;
    }

    const currentOptionsStr = JSON.stringify(options);
    const currentMidLevelDataStr = JSON.stringify(midLevelData);

    if (
      isInitializedRef.current &&
      optionsRef.current === currentOptionsStr &&
      midLevelDataRef.current === currentMidLevelDataStr
    ) {
      return;
    }

    optionsRef.current = currentOptionsStr;
    midLevelDataRef.current = currentMidLevelDataStr;
    isInitializedRef.current = true;

    const initialChecked: Record<string, boolean> = {};

    if (options.length > 0) {
      options.forEach((group) => {
        group.items.forEach((opt) => {
          if (opt.checked !== undefined) {
            initialChecked[opt.id] = opt.checked;
          } else if (opt.disabled) {
            initialChecked[opt.id] = true;
          }
        });
      });
    }

    if (midLevelData.length > 0) {
      midLevelData.forEach((v) => {
        if (v.checked !== undefined) {
          initialChecked[v.id] = v.checked;
        }
      });
    }

    setChecked(initialChecked);
  }, [open, options, midLevelData]);

  const isPermissionsMode = title && title !== "Customise your export";

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-full sm:w-[92vw] lg:w-[814px]"
      height="max-h-[95vh] sm:max-h-[90vh]"
      positionClass="items-start justify-center pt-[2vh] sm:pt-[5vh]"
    >
      <div className="flex flex-col h-full max-h-[calc(95vh-2rem)] sm:max-h-[calc(90vh-4rem)] overflow-hidden">

        <div className={`${description ? "hidden" : ""} flex-shrink-0 mb-4 sm:mb-6`}>
          <Button
            variant="skip"
            size="mdLg"
            className="flex items-center gap-2 group"
            onClick={onClose}
          >
            <IoChevronBack className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-stroke-brand)]" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide">BACK</span>
          </Button>
        </div>

        <div className="flex-shrink-0 mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-2xl font-semibold text-[var(--color-neutral-primary)] leading-snug">
            {title || "Customise your export"}
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-stroke-brand)] mt-1 leading-relaxed">
            {description || "Select the scope, and details you'd like to include in the export file."}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 -mx-1 px-1">
          {isPermissionsMode && midLevelData.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 mb-2">
              {midLevelData.map((opt) => (
                <div
                  key={opt.id}
                  className="flex items-center border-b border-[var(--color-stroke-neutral)] px-3 sm:px-6 py-3 sm:py-4 gap-2"
                >
                  <CheckBoxDisable checked={checked[opt.id] || false} disabled onChange={() => {}} />
                  <span className="pl-2 sm:pl-3 text-sm sm:text-base text-[var(--color-neutral-secondary)] leading-snug">
                    {opt.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div>
            {options.map((group) => (
              <DetailsCollapse
                key={group.group}
                title={
                  group.items.some((opt) => opt.type === "checkbox")
                    ? `${group.title} (${
                        group.items.filter((opt) => opt.type === "checkbox" && checked[opt.id]).length
                      } of ${group.items.filter((opt) => opt.type === "checkbox").length})`
                    : group.title
                }
                open={openCollapse === group.group}
                onClick={() => setOpenCollapse(openCollapse === group.group ? "" : group.group)}
                exportModal={isPermissionsMode}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  {group.items.map((opt, index) => {
                    const isLastOdd = index === group.items.length - 1 && group.items.length % 2 !== 0;
                    return (
                      <div
                        key={opt.id}
                        className={`flex w-full items-center border-b border-[var(--color-stroke-neutral)] px-3 sm:px-6 py-3 sm:py-4 gap-2 ${
                          isLastOdd ? "col-span-1 sm:col-span-2" : ""
                        }`}
                      >
                        {opt.type === "radio" ? (
                          <Radio
                            checked={scope === opt.id}
                            onChange={() => setScope(opt.id)}
                            variant={opt.variant || "default"}
                          />
                        ) : (
                          <CheckBoxDisable checked={checked[opt.id] || false} disabled onChange={() => {}} />
                        )}
                        <span className="pl-2 sm:pl-3 text-sm sm:text-base text-[var(--color-neutral-secondary)] leading-snug">
                          {opt.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </DetailsCollapse>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[var(--color-stroke-neutral)]">
          <div className="text-sm sm:text-base lg:text-lg text-[var(--color-neutral-secondary)] shrink-0">
            {footer || "Export will be provided in CSV format."}
          </div>
            <Button
            onClick={() => {
              if (onConfirm) {
                onConfirm({ scope, checked });
              } else {
                onClose();
              }
            }}
            variant="outline"
            size="mdLg"
            className="w-full sm:w-auto sm:min-w-[180px] border border-[#FE5720] text-[#FE5720] py-3 rounded-lg lg:w-1/2 flex-shrink-0"
          >
            {isPermissionsMode ? "CLOSE" : "EXPORT NOW"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportListModal;