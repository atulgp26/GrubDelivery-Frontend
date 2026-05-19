"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import Collapse from "./Collapse";
import { Table, TableBody, TableCell, TableHead, TableRow } from "./Table";
import type { CollapseTableProps } from "@/types";
import { cn } from "@/lib/utils/cn";

export default function CollapseTable<T extends Record<string, unknown>>({
  title,
  columns,
  data,
  rowKey,
  defaultOpen = false,
  open,
  onOpenChange,
  emptyState,
  collapseProps,
  tableClassName,
  contentClassName,
  rowClassName,
  onRowClick,
}: CollapseTableProps<T>) {
  const rows = useMemo(() => data ?? [], [data]);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const isControlled = typeof open === "boolean";
  const resolvedOpen = isControlled ? (open as boolean) : internalOpen;

  const handleToggle = () => {
    const next = !resolvedOpen;
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const resolvedEmptyState = emptyState ?? (
    <div className="text-sm text-[var(--color-neutral-light)]">No records found.</div>
  );

  const contentWrapperClass = cn("px-4 py-4", contentClassName);

  return (
    <Collapse
      title={title}
      open={resolvedOpen}
      onClick={handleToggle}
      {...collapseProps}
    >
      <div className={contentWrapperClass}>
        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <Table className={cn("min-w-full", tableClassName)}>
              <TableHead>
                <tr className="bg-[var(--color-neutral-secondary-bg)]">
                  {columns.map((column, columnIndex) => {
                    const columnId = column.key ?? columnIndex;
                    return (
                      <th
                        key={`${String(columnId)}-header`}
                        className={cn(
                          "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--color-neutral-light)]",
                          column.className,
                        )}
                        style={column.width ? { width: column.width } : undefined}
                        scope="col"
                      >
                        {column.header}
                      </th>
                    );
                  })}
                </tr>
              </TableHead>
              <TableBody>
                {rows.map((row, rowIndex) => {
                  const rowClasses = cn(
                    onRowClick ? "cursor-pointer" : "",
                    rowClassName?.(row, rowIndex),
                  );
                  return (
                    <TableRow
                      key={rowKey(row, rowIndex)}
                      className={rowClasses}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                    >
                      {columns.map((column, columnIndex) => {
                        const columnId = column.key ?? columnIndex;
                        return (
                          <TableCell
                            key={`${String(columnId)}-${rowIndex}`}
                            className={cn(
                              "px-4 py-3 text-sm text-[var(--color-neutral-primary)]",
                              column.className,
                            )}
                            style={column.width ? { width: column.width } : undefined}
                          >
                            {
                              column.render
                                ? column.render(row)
                                : ((row[column.key as keyof T] as unknown as ReactNode) ?? null)
                            }
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-6">{resolvedEmptyState}</div>
        )}
      </div>
    </Collapse>
  );
}

