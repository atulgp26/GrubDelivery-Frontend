"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaAngleLeft } from "react-icons/fa6";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/skeleton";
import logsService from "@/services/logs";
import type { ApiSystemLog } from "@/types/domain/system-logs";
import type { BoxDetailsItem } from "@/types/domain/grubpacs";

function formatTimestamp(isoString?: string): string {
  if (!isoString) return "-";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "-";
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en", { month: "short" });
  const year = String(d.getFullYear()).slice(-2);
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  const secs = String(d.getSeconds()).padStart(2, "0");
  return `${day} ${month} '${year}, ${hours}:${mins}:${secs}`;
}

function mapOwnershipLog(log: ApiSystemLog, index: number): BoxDetailsItem {
  const metadata = (log.metadata ?? {}) as {
    transfer_mode?: string;
    box_count?: string | number;
    recipient_email?: string;
  };
  const boxLabel =
    log.subject?.name ||
    (typeof metadata.box_count !== "undefined"
      ? `${metadata.box_count} GrubPac(s)`
      : "GrubPac");
  const recipient = metadata.recipient_email ? ` | ${metadata.recipient_email}` : "";
  const mode = metadata.transfer_mode ? ` (${metadata.transfer_mode})` : "";

  return {
    id: index + 1,
    timestamp: formatTimestamp(log.createdAt ?? log.created_at),
    name: boxLabel,
    code: log.subject?.id || log.id,
    status: log.description || "Ownership transfer",
    actionStatus: log.type || "Ownership",
    subStatus: `${log.actor?.name || "Account"}${mode}${recipient}`,
  };
}

export default function TransferDetailsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<BoxDetailsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      const response = await logsService.getList({
        category: "Profile",
        limit: 100,
        filters: [{ category: "Profile", types: ["Ownership"] }],
      });

      if (cancelled) return;

      if (response.success && response.data?.logs) {
        const ownershipLogs = response.data.logs.filter(
          (log) => (log.type ?? "").toLowerCase() === "ownership",
        );
        setRows(ownershipLogs.map(mapOwnershipLog));
      } else {
        setRows([]);
      }
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6 w-full">
      <h1
        className="flex gap-2 items-center font-semibold text-[var(--color-neutral-primary)] mb-8 cursor-pointer w-fit"
        style={{ fontSize: "24px", lineHeight: "32px" }}
        onClick={() => router.push("/transfer-ownership")}
      >
        <FaAngleLeft className="w-5 h-5" />
        Details
      </h1>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell className="!text-[var(--gp-color-text-neutral-light)] text-[14px] font-normal !w-[210px]">
              Time stamp
            </TableCell>
            <TableCell className="!text-[var(--gp-color-text-neutral-light)] text-[14px] font-normal !w-[240px]">
              Box changed
            </TableCell>
            <TableCell className="!text-[var(--gp-color-text-neutral-light)] text-[14px] font-normal">
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell className="!w-[210px]">
                    <Skeleton height={20} width={160} />
                  </TableCell>
                  <TableCell className="!w-[240px]">
                    <Skeleton height={36} width={180} />
                  </TableCell>
                  <TableCell>
                    <Skeleton height={36} width={220} />
                  </TableCell>
                </TableRow>
              ))
            : rows.length === 0
              ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-[16px] text-[var(--color-neutral-secondary)] py-8"
                  >
                    No ownership transfer details found.
                  </TableCell>
                </TableRow>
              )
              : rows.map((item, index) => (
                  <TableRow key={`${item.id}-${index}`}>
                    <TableCell className="text-[16px] text-[var(--color-neutral-secondary)] !w-[210px]">
                      {item.timestamp}
                    </TableCell>
                    <TableCell className="!w-[240px]">
                      <div className="flex flex-col gap-1">
                        <span className="text-[16px] font-semibold text-[var(--color-neutral-secondary)]">
                          {item.name || `BOX-${item.code || item.id}`}
                        </span>
                        <span className="text-[14px] text-[var(--gp-color-text-neutral-light)]">
                          #{item.code || item.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-[16px] text-[var(--color-neutral-secondary)]">
                          {item.actionStatus || item.status}
                        </span>
                        <span className="text-[14px] text-[var(--gp-color-text-neutral-light)]">
                          {item.subStatus || ""}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
        </TableBody>
      </Table>
    </div>
  );
}
