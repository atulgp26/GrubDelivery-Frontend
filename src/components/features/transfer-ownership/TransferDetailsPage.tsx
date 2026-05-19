"use client";

import { useRouter } from "next/navigation";
import { FaAngleLeft } from "react-icons/fa6";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { mockDetailsData } from "@/components/features/grubpacs/data/mockBoxDetails";

export default function TransferDetailsPage() {
  const router = useRouter();

  return (
    <div className="p-6 w-full">
      <h1
        className="flex gap-2 items-center font-semibold text-[var(--color-neutral-primary)] mb-8 cursor-pointer w-fit"
        style={{ fontSize: "24px", lineHeight: "32px" }}
        onClick={() => router.back()}
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
          {mockDetailsData.map((item, index) => (
            <TableRow key={index}>
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
                    {(item as { actionStatus?: string }).actionStatus || item.status}
                  </span>
                  <span className="text-[14px] text-[var(--gp-color-text-neutral-light)]">
                    {(item as { subStatus?: string }).subStatus || ""}
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
