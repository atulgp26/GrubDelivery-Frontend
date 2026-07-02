"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Modal from "@/components/ui/Modal";
import { flattenWrappedGroupRecord } from "@/lib/utils/groupedResponse";
import { Button } from "@/components/ui/Button";
import grubpacService from "@/services/grubpacs";
import type { ApiGrubPac, GrubPacListData } from "@/types/domain/grubpacs";

type PermissionOption = "anyone" | "all" | "restaurants";

const PERMISSION_OPTIONS: { value: PermissionOption; title: string; description: string }[] = [
  {
    value: "anyone",
    title: "ANYONE can connect",
    description: "No restrictions. Any user can scan and connect.",
  },
  {
    value: "all",
    title: "ALL employees can connect",
    description: "People not added as employees cannot access the GrubPac.",
  },
  {
    value: "restaurants",
    title: "Employees from assigned resaurants only",
    description: "People outside the selected restaurant cannot access the GrubPac.",
  },
];

function ReadOnlyPermissionRadio({ checked }: { checked: boolean }) {
  return (
    <span
      className={`mt-[2px] shrink-0 w-5 h-5 rounded-[4px] border-2 flex items-center justify-center ${
        checked
          ? "border-[var(--gp-color-border-neutral-secondary)] bg-[var(--gp-color-bg-white)]"
          : "border-[var(--gp-color-border-neutral)] bg-[var(--gp-color-bg-neutral-tertiary)]"
      }`}
    >
      {checked && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 10.5L9 14L15 7"
            stroke="var(--gp-color-border-neutral-secondary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

function extractBoxes(data: GrubPacListData): ApiGrubPac[] {
  const grouped = (data as { groups?: Record<string, unknown> }).groups;
  if (grouped && typeof grouped === "object") {
    return flattenWrappedGroupRecord<ApiGrubPac>(grouped);
  }

  return (data as { boxes?: ApiGrubPac[] }).boxes ?? [];
}

export default function PermissionModal({
  open,
  onClose,
  onEdit,
  accessMode = "public",
  excludedCount = 0,
  grubpacId,
}: {
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  accessMode?: "public" | "all_employees" | "restaurant_employees";
  excludedCount?: number;
  grubpacId?: string;
}) {
  const selected: PermissionOption =
    accessMode === "all_employees"
      ? "all"
      : accessMode === "restaurant_employees"
      ? "restaurants"
      : "anyone";

  const resolvedExcludedCount = excludedCount;

  return (
    <Modal open={open} onClose={onClose} width="w-[604px]" height="h-auto" closeOnOutsideClick={true}>
      <div className="flex flex-col gap-6 pt-2">
        <div className="flex flex-col gap-1">
          <h2 className="font-[var(--gp-font-heading)] text-[24px] leading-[32px] font-semibold text-[var(--gp-color-text-neutral-primary)]">
            Permissions
          </h2>
          <p className="font-[var(--gp-font-text)] text-[18px] leading-[28px] text-[var(--gp-color-text-neutral-secondary)]">
            Who can connect with the box?
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {PERMISSION_OPTIONS.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <div
                key={opt.value}
                className="flex items-start gap-3 text-left w-full"
              >
                <ReadOnlyPermissionRadio checked={isSelected} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-[var(--gp-font-text)] text-[18px] leading-[28px] ${
                      isSelected
                        ? "text-[var(--gp-color-text-neutral-primary)]"
                        : "text-[var(--gp-color-text-neutral-secondary)]"
                      }`}
                    >
                      {opt.title}
                    </span>
                    {isSelected ? (
                      <span className="shrink-0 font-[var(--gp-font-interactive)] text-[14px] leading-[16px] font-medium text-[var(--gp-color-text-brand)] uppercase">
                        {resolvedExcludedCount} EXCLUDED
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)]">
                    {opt.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-[var(--gp-color-border-neutral)]" />

        <div className="w-full">
          <Button
            variant="primary"
            appearance="outlined"
            size="lg"
            onClick={onEdit}
            className="w-full h-[56px] gap-3 font-[var(--gp-font-interactive)] text-[16px] leading-[24px] font-medium uppercase"
          >
            <Image
              src="/GrubPac/Dropdown/pen.svg"
              alt=""
              width={22}
              height={22}
            />
            <span>
              EDIT DETAILS
            </span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
