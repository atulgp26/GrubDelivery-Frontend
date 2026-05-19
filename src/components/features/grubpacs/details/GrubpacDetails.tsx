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
const GrubpacDetails = ({transferStatus}: {transferStatus?: unknown}) => {
  return (
    <div>
      <h1 className="flex gap-2 items-center font-semibold text-2xl text-[var(--color-neutral-secondary)] mb-8">
        <FaAngleLeft/>
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
            {mockDetailsData.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="!text-base font-semibold !text-[var(--color-neutral-secondary)]">{item.timestamp}</TableCell>
                <TableCell>
                  <div>
                    <div
                      className="!text-base cursor-pointer font-semibold text-[var(--color-neutral-secondary)]"
                    >
                      {item.name || `BOX-${item.code || item.id}`}
                    </div>
                    <div className="text-sm text-[var(--color-stroke-brand)]">
                      #{item.code || item.id}
                    </div>
                  </div>
                </TableCell>
                {
                transferStatus?
                <TableCell className="!text-base  !text-[var(--color-neutral-secondary)]">
                    <div className="flex flex-col gap-1 !w-[300px]">
                        <h1 className="font-semibold">{(item as { actionStatus?: string }).actionStatus || item.status}</h1>
                        <span className="!text-[var(--color-stroke-brand)]">{(item as { subStatus?: string }).subStatus || ""}</span>
                    </div>
                </TableCell>
                :
                <TableCell className="!text-base font-semibold !text-[var(--color-brand-default)]">{item.status}</TableCell>
                }
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </div>
  );
};
export default GrubpacDetails;