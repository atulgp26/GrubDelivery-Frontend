"use client";

import * as React from "react";
import {
	DataTable,
	DataTableHeader,
	DataTableHeaderCell,
	DataTableBody,
	DataTableRow,
	DataTableCell,
} from "@/components/ui/data-table";

export type SystemLogColumnId = "timestamp" | "type" | "action";

export interface SystemLogRow {
	id: string;
	timestamp: string;
	type: string;
	subtype?: string;
	action: string;
	category?: string;
	iconSrc?: string;
}

export interface SystemLogsTableProps {
	data: SystemLogRow[];
	columns: SystemLogColumnId[];
	onRowClick?: (row: SystemLogRow) => void;
	emptyStateText?: string;
	className?: string;
}

interface ColumnDef {
	id: SystemLogColumnId;
	header: string;
	width?: string | number;
}

const COLUMN_DEFS: Record<SystemLogColumnId, ColumnDef> = {
	timestamp: { id: "timestamp", header: "Time stamp", width: 220 },
	type: { id: "type", header: "Type", width: 300 },
	action: { id: "action", header: "Action" },
};

const DEFAULT_ICON_SRC = "/Logs/question-circle.svg";

const CATEGORY_ICON_MAP: Record<string, string> = {
	profile: "/Logs/crown.svg",
	employee: "/Logs/team-member.svg",
	restaurant: "/Logs/arrow-down-tray.svg",
	grublock: "/Logs/arrow-left-tray.svg",
	grubpac: "/Logs/arrow-left-tray.svg",
	unknown: DEFAULT_ICON_SRC,
};

const normalizeCategory = (value?: string) =>
	String(value || "")
		.trim()
		.toLowerCase()
		.replace(/[_\-\s]+/g, "");

const resolveLogIcon = (row: SystemLogRow) => {
	if (row.iconSrc) return row.iconSrc;

	const normalized = normalizeCategory(row.category || row.type);
	return CATEGORY_ICON_MAP[normalized] || DEFAULT_ICON_SRC;
};

export function SystemLogsTable({
	data,
	columns,
	onRowClick,
	emptyStateText = "No system logs found.",
	className,
}: SystemLogsTableProps) {
	const colDefs = columns.map((id) => COLUMN_DEFS[id]);

	return (
		<div className="w-full">
			<DataTable className={`table-fixed ${className ?? ""}`}>
				<DataTableHeader>
					{colDefs.map((col) => (
						<DataTableHeaderCell key={col.id} width={col.width}>
							{col.header}
						</DataTableHeaderCell>
					))}
				</DataTableHeader>

				<DataTableBody>
					{data.map((row) => (
						<DataTableRow
							key={row.id}
							onClick={() => onRowClick?.(row)}
							className={onRowClick ? "cursor-pointer hover:bg-[#F7F8F7]" : undefined}
						>
							{colDefs.map((col) => (
								<DataTableCell key={col.id} width={col.width} className="align-top">
									{renderCell(col.id, row)}
								</DataTableCell>
							))}
						</DataTableRow>
					))}
				</DataTableBody>
			</DataTable>

			{data.length === 0 && (
				<div className="py-[var(--gp-space-2xl)] text-center font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)]">
					{emptyStateText}
				</div>
			)}
		</div>
	);
}

function renderCell(columnId: SystemLogColumnId, row: SystemLogRow): React.ReactNode {
	switch (columnId) {
		case "timestamp":
			return (
				<span
					className="block truncate whitespace-nowrap font-[var(--gp-font-text)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]"
					style={{ fontWeight: 600 }}
				>
					{row.timestamp}
				</span>
			);

		case "type":
			return (
				<div className="flex min-w-0 items-start gap-[var(--gp-space-m)]">
					<img
						src={resolveLogIcon(row)}
						alt=""
						className="size-6 shrink-0 mt-[2px]"
						aria-hidden
					/>
					<div className="flex min-w-0 flex-1 flex-col gap-[2px]">
						<span
							className="block truncate whitespace-nowrap font-[var(--gp-font-heading)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]"
							style={{ fontWeight: 400 }}
						>
							{row.type}
						</span>
						{row.subtype && (
							<span
								className="block truncate whitespace-nowrap font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)]"
								style={{ fontWeight: 400 }}
							>
								({row.subtype})
							</span>
						)}
					</div>
				</div>
			);

		case "action":
			return (
				<p
					className="font-[var(--gp-font-text)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)] whitespace-normal break-words"
					style={{ fontWeight: 400 }}
				>
					{row.action}
				</p>
			);

		default:
			return null;
	}
}

export default SystemLogsTable;
