"use client"
import React from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { mockDetailsData } from "@/components/features/grubpacs/data/mockBoxDetails";
import { FaAngleLeft } from "react-icons/fa6";
import { MdArrowBackIos } from "react-icons/md";
import { useRouter } from "next/navigation";

const BoxDetails = () => {
  const router = useRouter()
  return (
    <div>
      <h1 className="flex gap-2 items-center text-2xl text-[var(--color-neutral-secondary)]">
          <button
            onClick={() => router.push("/departments/suspended")}
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
            {mockDetailsData.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="!text-[var(--color-neutral-secondary)]">{item.timestamp}</TableCell>
                <TableCell>
                  <div>
                    <div
                      className="!text-base cursor-pointer font-semibold text-[var(--color-neutral-secondary)]"
                    >
                      {item.name || `BOX-${item.code || item.id}`}
                    </div>
                    <div className=" text-[var(--color-stroke-brand)]">
                      #{item.code || item.id} | {item.location || "Room 202"}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="!text-[var(--color-brand-default)]">{item.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </div>
  );
};

export default BoxDetails;
