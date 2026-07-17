"use client";
import React from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { MdArrowBackIos } from "react-icons/md";
import { useRouter } from "next/navigation";

const BoxDetails = () => {
  const router = useRouter();
  return (
    <div>
      <h1 className="flex gap-2 items-center text-2xl text-[var(--color-neutral-secondary)]">
        <button
          onClick={() => router.push("/grubpacs")}
          className="p-2 rounded hover:bg-gray-100 transition"
          aria-label="Go back"
        >
          <MdArrowBackIos className="w-6 h-6 text-gray-700" />
        </button>
        Details
      </h1>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell className="!text-[var(--color-stroke-brand)] text-base font-normal ">
              TimeStamp
            </TableCell>
            <TableCell className="!pr-32 !text-[var(--color-stroke-brand)] text-base font-normal ">
              Box changed
            </TableCell>
            <TableCell className="!text-[var(--color-stroke-brand)] text-base font-normal ">
              Action
            </TableCell>
            <TableCell className="w-12">{null}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={4}
              className="!text-[var(--color-neutral-secondary)] py-8"
            >
              No box change history available.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default BoxDetails;
