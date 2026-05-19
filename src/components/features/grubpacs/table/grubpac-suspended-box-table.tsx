"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import {
	DataTable,
	DataTableHeader,
	DataTableHeaderCell,
	DataTableBody,
	DataTableRow,
	DataTableCell,
} from "@/components/ui/data-table";
import {
	CheckboxCell,
	TextCell,
	ActionCell,
	IconButton,
	TrashIcon,
} from "@/components/ui/data-table-cells";

export type SuspendedBoxColumnId = "name" | "added" | "suspended" | "actions";

export interface SuspendedBoxRow {
	id: string;
	name: string;
	/** Subtitle e.g. "#DL12345 | DL2BD1234" */
	identifier?: string;
	added: string;
	suspended: string;
	/** If true, shows grublock-box icon; if false, shows grublock-not-avail icon */
	hasBox?: boolean;
	/** True when the box has a GrubLock attached (lock !== null) */
	hasLock?: boolean;
	/** True when the box has a vehicle number assigned */
	hasVehicle?: boolean;
}

export interface GrubPacSuspendedBoxTableProps {
	data: SuspendedBoxRow[];
	/** Column IDs to display. */
	columns: SuspendedBoxColumnId[];
	/** When true, shows checkboxes for row selection */
	selectable?: boolean;
	selectedIds?: Set<string>;
	onSelectionChange?: (ids: Set<string>) => void;
	onActivate?: (row: SuspendedBoxRow) => void;
	onDelete?: (row: SuspendedBoxRow) => void;
	onRowClick?: (row: SuspendedBoxRow) => void;
	className?: string;
}

/* ========================
   Predefined column definitions
   ======================== */
interface ColumnDef {
	id: SuspendedBoxColumnId;
	header: string;
	width?: string | number;
	hasCheckbox?: boolean;
	centered?: boolean;
}

const COLUMN_DEFS: Record<SuspendedBoxColumnId, ColumnDef> = {
	name: { id: "name", header: "Name", hasCheckbox: false },
	added: { id: "added", header: "Added", width: 210 },
	suspended: { id: "suspended", header: "Suspended", width: 210 },
	actions: { id: "actions", header: "", width: 160 },
};

/* ========================
   Component
   ======================== */
export function GrubPacSuspendedBoxTable({
	data,
	columns,
	selectable = false,
	selectedIds: controlledSelectedIds,
	onSelectionChange,
	onActivate,
	onDelete,
	onRowClick,
	className,
}: GrubPacSuspendedBoxTableProps) {
	const [internalSelectedIds, setInternalSelectedIds] = React.useState<Set<string>>(new Set());

	const selectedIds = controlledSelectedIds ?? internalSelectedIds;
	const setSelectedIds = React.useCallback(
		(next: Set<string>) => {
			onSelectionChange?.(next);
			if (controlledSelectedIds === undefined) {
				setInternalSelectedIds(next);
			}
		},
		[onSelectionChange, controlledSelectedIds]
	);
	const allSelected = data.length > 0 && selectedIds.size === data.length;
	const someSelected = selectedIds.size > 0 && !allSelected;
	const headerCheckboxState: boolean | "indeterminate" = allSelected ? true : someSelected ? "indeterminate" : false;
	const showCheckbox = selectable && columns.includes("name");

	const toggleRow = (id: string) => {
		const next = new Set(selectedIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		setSelectedIds(next);
	};

	const toggleAll = () => {
		if (allSelected) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(data.map((r) => r.id)));
		}
	};

	const colDefs = columns.map((id) => COLUMN_DEFS[id]);

	const handleRowClick = (row: SuspendedBoxRow, e: React.MouseEvent) => {
		const target = e.target as HTMLElement;
		const ignoreClick = target.closest('input[type="checkbox"]') || target.closest("button");
		if (ignoreClick) return;
		onRowClick?.(row);
	};

	const callbacks = {
		selectedIds,
		toggleRow,
		onActivate,
		onDelete,
		showCheckbox,
	};

	return (
		<DataTable className={className}>
			<DataTableHeader>
				{colDefs.map((col) => {
					if (col.id === "name" && showCheckbox) {
						return (
							<DataTableHeaderCell key={col.id}>
								<div className="flex items-center gap-[var(--gp-space-xl)]">
									<CheckboxCell
										checked={headerCheckboxState}
										onChange={toggleAll}
										isHeader
									/>
									<span
										className="font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)]"
										style={{ fontWeight: 400 }}
									>
										{col.header}
									</span>
								</div>
							</DataTableHeaderCell>
						);
					}
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

			<DataTableBody>
				{data.map((row, index) => (
					<DataTableRow
						key={row.id}
						onClick={(e) => handleRowClick(row, e)}
						className="cursor-pointer hover:bg-[#F7F8F7]"
					>
						{colDefs.map((col) => (
							<DataTableCell
								key={col.id}
								width={col.width}
								className={col.centered ? "text-center" : undefined}
							>
								{renderCell(col.id, row, index, callbacks)}
							</DataTableCell>
						))}
					</DataTableRow>
				))}
			</DataTableBody>
		</DataTable>
	);
}

interface RenderCellCallbacks {
	selectedIds: Set<string>;
	toggleRow: (id: string) => void;
	onActivate?: (row: SuspendedBoxRow) => void;
	onDelete?: (row: SuspendedBoxRow) => void;
	showCheckbox: boolean;
}

function renderCell(
	columnId: SuspendedBoxColumnId,
	row: SuspendedBoxRow,
	rowIndex: number,
	callbacks: RenderCellCallbacks
): React.ReactNode {
	switch (columnId) {
		case "name":
			const iconSrc = row.hasBox
				? "/GrubPac/Suspended/Grublock-box.svg"
				: "/GrubPac/Suspended/Grublock-not-avail.svg";
			return (
				<div className="flex items-start gap-[var(--gp-space-xl)] isolate">
					{callbacks.showCheckbox && (
						<CheckboxCell
							checked={callbacks.selectedIds.has(row.id)}
							onChange={() => callbacks.toggleRow(row.id)}
						/>
					)}
					<div className="flex items-start gap-[var(--gp-space-m)] flex-1 min-w-0">
						<img
							src={iconSrc}
							alt="Box status"
							className="w-[24px] h-[24px] shrink-0 mt-[2px]"
						/>
						<div className="flex flex-col gap-[var(--gp-text-spacing-narrow)] flex-1 min-w-0 text-ellipsis overflow-hidden whitespace-pre-wrap">
							<p className="font-[var(--gp-font-heading)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)] overflow-hidden w-full" style={{ fontWeight: 600 }}>
								{row.name}
							</p>
							{row.identifier && (
								<p className="font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)] overflow-hidden w-full" style={{ fontWeight: 400 }}>
									{row.identifier}
								</p>
							)}
						</div>
					</div>
				</div>
			);

		case "added":
			return <TextCell>{row.added}</TextCell>;

		case "suspended":
			return <TextCell>{row.suspended}</TextCell>;

		case "actions":
			return (
				<ActionCell>
					<Button
						variant="primary"
						appearance="outlined"
						size="sm"
						state={rowIndex === 0 ? "press" : "default"}
						onClick={() => callbacks.onActivate?.(row)}
						className="w-[92px] h-[32px] bg-white"
					>
						<span>ACTIVATE</span>
					</Button>
					<IconButton
						icon={<TrashIcon />}
						aria-label="Delete"
						onClick={() => callbacks.onDelete?.(row)}
						className="focus:outline-none bg-white hover:bg-[#EFF1F0] hover:border-2 hover:border-[#C3C9C5] group-hover:bg-[#EFF1F0] group-hover:border-2 group-hover:border-[#C3C9C5] active:bg-[#EFF1F0] active:border-2 active:border-[#C3C9C5]"
					/>
				</ActionCell>
			);

		default:
			return null;
	}
}
