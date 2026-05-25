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
import { CheckboxCell, TextCell } from "@/components/ui/data-table-cells";

export type GrubPacBoxColumnId = "name" | "status" | "power" | "driver" | "added";

export interface GrubPacBoxRow {
	id: string;
	name: string;
	/** Subtitle e.g. "#DL12345 | DL2BD1234 | da Pizza Place" */
	identifier?: string;
	/** Power status: "ON" | "OFF" */
	power: "ON" | "OFF";
	/** Assigned driver name, if any */
	driver?: string;
	added: string;
	/** When true, shows lock icon; when false, shows greylock */
	isLocked?: boolean;
}

export interface GrubPacBoxTableProps {
	data: GrubPacBoxRow[];
	/** Column IDs to display. Omit "driver" to hide the driver column. */
	columns: GrubPacBoxColumnId[];
	/** @deprecated Use columns array instead - omit "driver" to hide. When false, driver column is hidden. */
	showDriverColumn?: boolean;
	/** When true, shows checkboxes for row selection (Table 3 variant). When false, no checkboxes (Table 1/2 variants). */
	selectable?: boolean;
	selectedIds?: Set<string>;
	onSelectionChange?: (ids: Set<string>) => void;
	onRowClick?: (row: GrubPacBoxRow) => void;
	className?: string;
}

/* ========================
   Predefined column definitions
   ======================== */
interface ColumnDef {
	id: GrubPacBoxColumnId;
	header: string;
	width?: string | number;
	hasCheckbox?: boolean;
	centered?: boolean;
}

const COLUMN_DEFS: Record<GrubPacBoxColumnId, ColumnDef> = {
	name: { id: "name", header: "Name", hasCheckbox: false },
	status: { id: "status", header: "", width: 10, centered: true },
	power: { id: "power", header: "Power", width: 160, centered: true },
	driver: { id: "driver", header: "Driver", width: 60, centered: true },
	added: { id: "added", header: "Added", width: 120, centered: true },
};

/* ========================
   Component
   ======================== */
export function GrubPacBoxTable({
	data,
	columns,
	showDriverColumn = true,
	selectable = false,
	selectedIds: controlledSelectedIds,
	onSelectionChange,
	onRowClick,
	className,
}: GrubPacBoxTableProps) {
	const [internalSelectedIds, setInternalSelectedIds] = React.useState<Set<string>>(new Set());

	// Filter columns: respect showDriverColumn for backward compatibility
	const effectiveColumns = React.useMemo(() => {
		if (showDriverColumn === false && columns.includes("driver")) {
			return columns.filter((c) => c !== "driver");
		}
		return columns;
	}, [columns, showDriverColumn]);

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
	const showCheckbox = selectable && effectiveColumns.includes("name");

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

	const colDefs = effectiveColumns.map((id) => COLUMN_DEFS[id]);

	const handleRowClick = (row: GrubPacBoxRow, e: React.MouseEvent) => {
		const target = e.target as HTMLElement;
		const ignoreClick = target.closest('input[type="checkbox"]') || target.closest("button");
		if (ignoreClick) return;
		onRowClick?.(row);
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
					const groupPadding =
						col.id === "status" ? "pr-2" :
						col.id === "power" ? "pl-2 pr-6" :
						col.id === "driver" ? "pl-6 pr-2" :
						col.id === "added" ? "pl-2" : "";
					return (
						<DataTableHeaderCell
							key={col.id}
							width={col.width}
							className={`${col.centered ? "text-center" : ""} ${groupPadding}`.trim()}
						>
							{col.header}
						</DataTableHeaderCell>
					);
				})}
			</DataTableHeader>

			<DataTableBody>
				{data.map((row) => (
					<DataTableRow
						key={row.id}
						className={onRowClick ? "cursor-pointer hover:bg-[#F7F8F7]" : ""}
						onClick={(e) => handleRowClick(row, e)}
					>
						{colDefs.map((col) => {
							const groupPadding =
								col.id === "status" ? "pr-1" :
								col.id === "power" ? "pl-1 pr-6" :
								col.id === "driver" ? "pl-6 pr-1" :
								col.id === "added" ? "pl-1" : "";
							return (
								<DataTableCell
									key={col.id}
									width={col.width}
									className={`${col.centered ? "text-center" : ""} ${groupPadding}`.trim()}
								>
									{renderCell(col.id, row, { selectedIds, toggleRow, showCheckbox })}
								</DataTableCell>
							);
						})}
					</DataTableRow>
				))}
			</DataTableBody>
		</DataTable>
	);
}

interface RenderCellCallbacks {
	selectedIds: Set<string>;
	toggleRow: (id: string) => void;
	showCheckbox: boolean;
}

function renderCell(
	columnId: GrubPacBoxColumnId,
	row: GrubPacBoxRow,
	callbacks: RenderCellCallbacks
): React.ReactNode {
	switch (columnId) {
		case "name":
			return (
				<div className="flex items-start gap-[var(--gp-space-xl)]">
					{callbacks.showCheckbox && (
						<CheckboxCell
							checked={callbacks.selectedIds.has(row.id)}
							onChange={() => callbacks.toggleRow(row.id)}
							className="mt-0.5"
						/>
					)}
					<div className="flex items-start gap-[var(--gp-space-s)]">
						<img
							src={row.isLocked ? "/lock.svg" : row.isLocked === false ? "/greylock.svg" : "/sidebar/Grublock.svg"}
							alt=""
							className="size-6 shrink-0 mt-0.5"
							aria-hidden
						/>
						<div className="flex flex-col gap-[2px]">
							<span
								className="font-[var(--gp-font-heading)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]"
								style={{ fontWeight: 600 }}
							>
								{row.name}
							</span>
							{row.identifier && (
								<span
									className="font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)]"
									style={{ fontWeight: 400 }}
								>
									{row.identifier}
								</span>
							)}
						</div>
					</div>
				</div>
			);

		case "status":
			return (
				<div className="flex items-center justify-center h-4 w-4">
					<img
						src="/Employee/exclamation-triangle.svg"
						alt=""
						className="size-6 shrink-0"
						aria-hidden
					/>
				</div>
			);

		case "power":
			return (
				<div className="flex items-center justify-center">
					<span
						className={`inline-flex items-center justify-center px-[7px]  rounded-full border text-[14px] leading-[22px] font-[var(--gp-font-text)] font-normal ${
							row.power === "ON"
								? "bg-[#DCECD4] border-[#5CA940] text-[#479F29]"
								: "bg-white border-[#C1C7C4] text-[var(--gp-color-text-neutral-secondary)]"
						}`}
					>
						{row.power}
					</span>
				</div>
			);

		case "driver": {
			const hasDriver = !!row.driver;
			const borderColor = hasDriver ? "#FFE3D9" : "#C1C7C4";
			return (
				<div className="flex items-start justify-center pt-0.5">
					<div
						className="inline-flex items-center justify-center px-[10px] py-[5px] rounded-full border bg-white shrink-0"
						style={{ borderColor }}
					>
						<img
							src="/Group/Table/Grouped/Table/Default/Table/Row/Table/Cell/Assigned/users.svg"
							alt=""
							className={`size-4 shrink-0 ${hasDriver ? "" : "opacity-60 [filter:grayscale(100%)]"}`}
							aria-hidden
						/>
					</div>
				</div>
			);
		}

		case "added":
			return (
				<TextCell>
					<span
						className="font-[var(--gp-font-text)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]"
						style={{ fontWeight: 400 }}
					>
						{row.added}
					</span>
				</TextCell>
			);

		default:
			return null;
	}
}
