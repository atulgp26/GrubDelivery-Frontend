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

export type AddManagerColumnId = "name" | "contactInfo" | "added" | "actions";

export interface AddManagerRow {
	id: string;
	name: string;
	identifier: string;
	contactInfo: {
		phone: string;
		email: string;
	};
	added: string;
}

export interface AddManagerTableProps {
	data: AddManagerRow[];
	columns: AddManagerColumnId[];
	selectedId?: string | null;
	onSelectManager?: (row: AddManagerRow) => void;
	onRowClick?: (row: AddManagerRow) => void;
	className?: string;
}

/* ========================
   Predefined column definitions
   ======================== */
interface ColumnDef {
	id: AddManagerColumnId;
	header: string;
	width?: string | number;
	/** Whether to center align the column content */
	centered?: boolean;
}

const COLUMN_DEFS: Record<AddManagerColumnId, ColumnDef> = {
	name: { id: "name", header: "Name" },
	contactInfo: { id: "contactInfo", header: "Contact info" },
	added: { id: "added", header: "Added", width: 210, centered: false },
	actions: { id: "actions", header: "", width: 210, centered: false },
};

/* ========================
   Component
   ======================== */
export function AddManagerTable({
	data,
	columns,
	selectedId,
	onSelectManager,
	onRowClick,
	className,
}: AddManagerTableProps) {

	const colDefs = columns.map((id) => COLUMN_DEFS[id]);

	const callbacks: CellCallbacks = {
		onSelectManager,
	};

	const handleRowClick = (row: AddManagerRow, e: React.MouseEvent) => {
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
						className={`${selectedId === row.id ? "bg-[#EFF1F0]" : ""} ${onRowClick ? "cursor-pointer hover:bg-[#F7F8F7]" : ""}`}
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
	onSelectManager?: (row: AddManagerRow) => void;
}

interface RenderCellCallbacks extends CellCallbacks {
	selectedId?: string | null;
}

function renderCell(
	columnId: AddManagerColumnId,
	row: AddManagerRow,
	rowIndex: number,
	callbacks: RenderCellCallbacks
): React.ReactNode {
	switch (columnId) {
		case "name":
			return (
				<div className="flex flex-col gap-[var(--gp-space-s)]">
					<span 
						className="font-[var(--gp-font-heading)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]"
						style={{ fontWeight: 600 }}
					>
						{row.name}
					</span>
					<span 
						className="font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)]"
						style={{ fontWeight: 400 }}
					>
						{row.identifier}
					</span>
				</div>
			);

		case "contactInfo":
			return (
				<div className="flex flex-col gap-[var(--gp-space-s)]">
					<span 
						className="font-[var(--gp-font-text)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]"
						style={{ fontWeight: 400 }}
					>
						{row.contactInfo.phone}
					</span>
					<span 
						className="font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)]"
						style={{ fontWeight: 400 }}
					>
						{row.contactInfo.email}
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

function renderActions(
	row: AddManagerRow,
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
				onClick={() => callbacks.onSelectManager?.(row)}
				className={`w-[92px] h-[32px] ${
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
