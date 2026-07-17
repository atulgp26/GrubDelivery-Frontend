"use client";
import React from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { FaAngleLeft } from "react-icons/fa6";
import { useRouter } from "next/navigation";

const GrubpacDetails = ({ transferStatus }: { transferStatus?: unknown }) => {
  const router = useRouter();
  return (
    <div>
      <h1
        className="flex gap-2 items-center font-semibold text-2xl text-[var(--color-neutral-secondary)] mb-8 cursor-pointer w-fit"
        onClick={() => router.push(transferStatus ? "/transfer-ownership" : "/grubpacs")}
      >
        <FaAngleLeft />
        Details
      </h1>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell className="!text-[var(--color-stroke-brand)] text-base font-normal !w-[210px]">
              TimeStamp
            </TableCell>
            <TableCell className="!pr-32 !text-[var(--color-stroke-brand)] text-base font-normal ">
              Box changed
            </TableCell>
            <TableCell className="!text-[var(--color-stroke-brand)] text-base font-normal ">
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={3}
              className="!text-base !text-[var(--color-neutral-secondary)] py-8"
            >
              No box change history available.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default GrubpacDetails;
