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
import {
	TextCell,
	ActionCell,
} from "@/components/ui/data-table-cells";
import { Button } from "@/components/ui/Button";

export type ResourceReassignColumnId = "name" | "address" | "updated" | "added" | "actions";

export interface ResourceReassignRow {
	id: string;
	name: string;
	address: string;
	updated: string;
	added: string;
	resources?: {
		boxes?: number;
		drivers?: number;
		managers?: number;
	};
}

export interface ResourceReassignTableProps {
	data: ResourceReassignRow[];
	columns: ResourceReassignColumnId[];
	selectedId?: string | null;
	onSelectRestaurant?: (row: ResourceReassignRow) => void;
	onRowClick?: (row: ResourceReassignRow) => void;
	className?: string;
}

/* ========================
   Predefined column definitions
   ======================== */
interface ColumnDef {
	id: ResourceReassignColumnId;
	header: string;
	width?: string | number;
	/** Whether to center align the column content */
	centered?: boolean;
}

const COLUMN_DEFS: Record<ResourceReassignColumnId, ColumnDef> = {
	name: { id: "name", header: "Name" },
	address: { id: "address", header: "Address" },
	updated: { id: "updated", header: "Updated", width: 120, centered: false },
	added: { id: "added", header: "Added", width: 120, centered: false },
	actions: { id: "actions", header: "", width: 128, centered: false },
};

/* ========================
   Component
   ======================== */
export function ResourceReassignTable({
	data,
	columns,
	selectedId,
	onSelectRestaurant,
	onRowClick,
	className,
}: ResourceReassignTableProps) {

	const colDefs = columns.map((id) => COLUMN_DEFS[id]);

	const callbacks: CellCallbacks = {
		onSelectRestaurant,
	};

	const handleRowClick = (row: ResourceReassignRow, e: React.MouseEvent) => {
		// Don't trigger row click if clicking on interactive elements
		const target = e.target as HTMLElement;
		const ignoreClick = target.closest('button') || target.closest('[role="menuitem"]');
		
		if (ignoreClick) {
			return;
		}
		
		onRowClick?.(row);
	};

	return (
		<DataTable className={className}>
			{/* Header */}
			<DataTableHeader>
				{colDefs.map((col) => {
					return (
						<DataTableHeaderCell 
							key={col.id} 
							width={col.width}
							className={col.centered ? "text-center" : undefined}
						>
							{col.header}
						</DataTableHeaderCell>
					);
				})}
			</DataTableHeader>

			{/* Body */}
			<DataTableBody>
				{data.map((row, index) => (
					<DataTableRow 
						key={row.id}
						className={`h-[104px] ${selectedId === row.id ? "bg-[#EFF1F0]" : ""} ${onRowClick ? "cursor-pointer hover:bg-[#F7F8F7]" : ""}`}
						onClick={(e) => handleRowClick(row, e)}
					>
						{colDefs.map((col) => (
							<DataTableCell 
								key={col.id} 
								width={col.width}
								className={col.centered ? "text-center" : undefined}
							>
								{renderCell(col.id, row, index, {
									selectedId,
									...callbacks,
								})}
							</DataTableCell>
						))}
					</DataTableRow>
				))}
			</DataTableBody>
		</DataTable>
	);
}

interface CellCallbacks {
	onSelectRestaurant?: (row: ResourceReassignRow) => void;
}

interface RenderCellCallbacks extends CellCallbacks {
	selectedId?: string | null;
}

function renderCell(
	columnId: ResourceReassignColumnId,
	row: ResourceReassignRow,
	rowIndex: number,
	callbacks: RenderCellCallbacks
): React.ReactNode {
	switch (columnId) {
		case "name":
			return (
				<div className="flex flex-col gap-1">
					<span 
						className="font-[var(--gp-font-heading)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]"
						style={{ fontWeight: 600 }}
					>
						{row.name}
					</span>
					{row.resources && (
						<span 
							className="font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)]"
							style={{ fontWeight: 400 }}
						>
							{formatResourceString(row.resources)}
						</span>
					)}
				</div>
			);

		case "address":
			return (
				<TextCell>
					<div className="text-wrap break-words leading-[24px] line-clamp-2">
						<span 
							className="font-[var(--gp-font-text)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]"
							style={{ fontWeight: 400 }}
						>
							{row.address}
						</span>
					</div>
				</TextCell>
			);

		case "updated":
			return (
				<div className="w-full">
					<span 
						className="font-[var(--gp-font-text)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]"
						style={{ fontWeight: 400 }}
					>
						{row.updated}
					</span>
				</div>
			);

		case "added":
			return (
				<div className="w-full">
					<span 
						className="font-[var(--gp-font-text)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]"
						style={{ fontWeight: 400 }}
					>
						{row.added}
					</span>
				</div>
			);

		case "actions":
			return renderActions(row, rowIndex, callbacks);

		default:
			return null;
	}
}

function formatResourceString(resources: { boxes?: number; drivers?: number; managers?: number }): string {
	const parts: string[] = [];
	
	if (resources.boxes && resources.boxes > 0) {
		parts.push(`${resources.boxes} ${resources.boxes === 1 ? "box" : "boxes"}`);
	}
	if (resources.drivers && resources.drivers > 0) {
		parts.push(`${resources.drivers} ${resources.drivers === 1 ? "driver" : "drivers"}`);
	}
	if (resources.managers && resources.managers > 0) {
		parts.push(`${resources.managers} ${resources.managers === 1 ? "manager" : "managers"}`);
	}
	
	if (parts.length === 0) return "";
	
	return `(and ${parts.join(", ")})`;
}

function renderActions(
	row: ResourceReassignRow,
	rowIndex: number,
	callbacks: RenderCellCallbacks
): React.ReactNode {
	const isSelected = callbacks.selectedId === row.id;
	
	return (
		<ActionCell className="justify-end w-full">
			<Button
				variant="primary"
				appearance="outlined"
				size="sm"
				state={isSelected ? "press" : "default"}
				onClick={() => callbacks.onSelectRestaurant?.(row)}
				className={`w-[92px] h-[32px] font-medium ${
					isSelected 
						? "bg-[rgb(var(--theme-100))] border-[rgb(var(--theme-700))] text-[rgb(var(--theme-700))] ring-2 ring-[rgb(var(--neutral-300))]"
						: "bg-white"
				}`}
			>
				<span>{isSelected ? "SELECTED" : "SELECT"}</span>
			</Button>
		</ActionCell>
	);
}
