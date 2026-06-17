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
	CheckboxCell,
	NameCell,
	TextCell,
	ActionCell,
	IconButton,
	DotsVerticalIcon,
	TrashIcon,
} from "@/components/ui/data-table-cells";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/Button";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export type GroupColumnId = "name" | "address" | "manager" | "drivers" | "boxes" | "updated" | "suspended" | "added" | "actions";

export interface GroupRow {
	id: string;
	name: string;
	address: string;
	manager?: string;
	driverCount: number;
	boxCount: number;
	updated: string;
	suspended?: string;
	added?: string;
	status?: "active" | "suspended";
	hasBoxes?: boolean;
	description?: string;
}

export interface GroupDataTableProps {
	data: GroupRow[];
	columns: GroupColumnId[];
	selectedIds?: Set<string>;
	onSelectionChange?: (ids: Set<string>) => void;
	onEditGroup?: (row: GroupRow) => void;
	onViewDetails?: (row: GroupRow) => void;
	onDeleteGroup?: (row: GroupRow) => void;
	onActivateGroup?: (row: GroupRow) => void;
	onSuspendRestaurant?: (row: GroupRow) => void;
	onReassignResources?: (row: GroupRow) => void;
	onRowClick?: (row: GroupRow) => void;
	onAddManager?: (row: GroupRow) => void;
	onViewManagerDetail?: (row: GroupRow) => void;
	onAssignDrivers?: (row: GroupRow) => void;
	onViewDriversList?: (row: GroupRow) => void;
	onAssignBoxes?: (row: GroupRow) => void;
	onViewBoxesList?: (row: GroupRow) => void;
	className?: string;
}

/* ========================
   Predefined column definitions
   ======================== */
interface ColumnDef {
	id: GroupColumnId;
	header: string;
	width?: string | number;
	hasCheckbox?: boolean;
	centered?: boolean;
}

const COLUMN_DEFS: Record<GroupColumnId, ColumnDef> = {
	name: { id: "name", header: "Name", hasCheckbox: true, width: 280 },
	address: { id: "address", header: "Address", width: 360 },
	manager: { id: "manager", header: "Manager", width: 160, centered: true },
	drivers: { id: "drivers", header: "Drivers", width: 100, centered: true },
	boxes: { id: "boxes", header: "Boxes", width: 100, centered: true },
	updated: { id: "updated", header: "Updated", width: 120, centered: true },
	suspended: { id: "suspended", header: "Suspended", width: 120, centered: true },
	added: { id: "added", header: "Added", width: 120, centered: true },
	actions: { id: "actions", header: "", width: 64 },
};

/* ========================
   Component
   ======================== */
export function GroupDataTable({
	data,
	columns,
	selectedIds: controlledSelectedIds,
	onSelectionChange,
	onEditGroup,
	onViewDetails,
	onDeleteGroup,
	onActivateGroup,
	onSuspendRestaurant,
	onReassignResources,
	onRowClick,
	onAddManager,
	onViewManagerDetail,
	onAssignDrivers,
	onViewDriversList,
	onAssignBoxes,
	onViewBoxesList,
	className,
}: GroupDataTableProps) {
	const [internalSelectedIds, setInternalSelectedIds] = React.useState<Set<string>>(new Set());
	const [openDropdownRowId, setOpenDropdownRowId] = React.useState<string | null>(null);
	const [openManagerTooltipRowId, setOpenManagerTooltipRowId] = React.useState<string | null>(null);
	const [hoverManagerBadgeRowId, setHoverManagerBadgeRowId] = React.useState<string | null>(null);
	const [openDriversTooltipRowId, setOpenDriversTooltipRowId] = React.useState<string | null>(null);
	const [openBoxesTooltipRowId, setOpenBoxesTooltipRowId] = React.useState<string | null>(null);

	// Use controlled selection if provided, otherwise use internal state
	const selectedIds = controlledSelectedIds !== undefined ? controlledSelectedIds : internalSelectedIds;
	const setSelectedIds = onSelectionChange || setInternalSelectedIds;
	const allSelected = data.length > 0 && selectedIds.size === data.length;
	const someSelected = selectedIds.size > 0 && !allSelected;
	const headerCheckboxState: boolean | "indeterminate" = allSelected ? true : someSelected ? "indeterminate" : false;

	const toggleRow = (id: string) => {
		if (onSelectionChange) {
			// Controlled mode
			const next = new Set(selectedIds);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			onSelectionChange(next);
		} else {
			// Uncontrolled mode
			setInternalSelectedIds((prev) => {
				const next = new Set(prev);
				if (next.has(id)) next.delete(id);
				else next.add(id);
				return next;
			});
		}
	};

	const toggleAll = () => {
		if (onSelectionChange) {
			// Controlled mode
			if (allSelected) {
				onSelectionChange(new Set());
			} else {
				onSelectionChange(new Set(data.map((r) => r.id)));
			}
		} else {
			// Uncontrolled mode
			if (allSelected) {
				setInternalSelectedIds(new Set());
			} else {
				setInternalSelectedIds(new Set(data.map((r) => r.id)));
			}
		}
	};

	const colDefs = columns.map((id) => COLUMN_DEFS[id]);

	const callbacks: CellCallbacks = {
		onEditGroup,
		onViewDetails,
		onDeleteGroup,
		onActivateGroup,
		onRowClick,
		onSuspendRestaurant,
		onReassignResources,
		onAddManager,
		onViewManagerDetail,
		onAssignDrivers,
		onViewDriversList,
		onAssignBoxes,
		onViewBoxesList,
	};

	const handleRowClick = (row: GroupRow, e: React.MouseEvent) => {

		// Don't trigger row click if clicking on interactive elements
		const target = e.target as HTMLElement;
		const ignoreClick = target.closest('input[type="checkbox"]') || target.closest('button') || target.closest('[role="menuitem"]');


		if (ignoreClick) {
			return;
		}

		onRowClick?.(row);
	};

	return (
		<div className="w-full overflow-x-auto">
			<DataTable className={cn("min-w-[800px]", className)}>
			{/* Header */}
			<DataTableHeader>
				{colDefs.map((col) => {
					if (col.hasCheckbox) {
						return (
							<DataTableHeaderCell key={col.id} className="pl-[var(--gp-space-xl)]">
								<div className="flex items-center gap-[20px]">
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

			{/* Body */}
			<DataTableBody>
				{data.map((row, index) => (
					<DataTableRow
  key={row.id}
  className={`${openDropdownRowId === row.id ? "bg-[#EFF1F0]" : ""}`}
>
						{colDefs.map((col, idx) => (
							<DataTableCell
								key={col.id}
								width={col.width}
								className={cn(
									col.centered ? "text-center" : undefined,
									idx === 0 ? "pl-[var(--gp-space-xl)]" : undefined
								)}
							>
								{renderCell(col.id, row, index, {
									selectedIds,
									toggleRow,
									setOpenDropdownRowId,
									openManagerTooltipRowId,
									setOpenManagerTooltipRowId,
									hoverManagerBadgeRowId,
									setHoverManagerBadgeRowId,
									openDriversTooltipRowId,
									setOpenDriversTooltipRowId,
									openBoxesTooltipRowId,
									setOpenBoxesTooltipRowId,
									...callbacks,
								})}
							</DataTableCell>
						))}
					</DataTableRow>
				))}
			</DataTableBody>
		</DataTable>
		</div>
	);
}

interface CellCallbacks {
	onEditGroup?: (row: GroupRow) => void;
	onViewDetails?: (row: GroupRow) => void;
	onDeleteGroup?: (row: GroupRow) => void;
	onActivateGroup?: (row: GroupRow) => void;
	onSuspendRestaurant?: (row: GroupRow) => void;
	onReassignResources?: (row: GroupRow) => void;
	 onRowClick?: (row: GroupRow) => void;
	onAddManager?: (row: GroupRow) => void;
	onViewManagerDetail?: (row: GroupRow) => void;
	onAssignDrivers?: (row: GroupRow) => void;
	onViewDriversList?: (row: GroupRow) => void;
	onAssignBoxes?: (row: GroupRow) => void;
	onViewBoxesList?: (row: GroupRow) => void;
}

interface RenderCellCallbacks extends CellCallbacks {
	selectedIds: Set<string>;
	toggleRow: (id: string) => void;
	setOpenDropdownRowId: (id: string | null) => void;
	openManagerTooltipRowId: string | null;
	setOpenManagerTooltipRowId: (id: string | null) => void;
	hoverManagerBadgeRowId: string | null;
	setHoverManagerBadgeRowId: (id: string | null) => void;
	openDriversTooltipRowId: string | null;
	setOpenDriversTooltipRowId: (id: string | null) => void;
	openBoxesTooltipRowId: string | null;
	setOpenBoxesTooltipRowId: (id: string | null) => void;
}

function getManagerDisplayValue(manager: unknown): string | undefined {
	if (!manager) return undefined;

	if (typeof manager === "string") {
		const trimmed = manager.trim();
		return trimmed.length > 0 ? trimmed : undefined;
	}

	if (typeof manager === "object") {
		const record = manager as Record<string, unknown>;
		const fullName = typeof record.full_name === "string" ? record.full_name.trim() : "";
		if (fullName) return fullName;

		const firstName = typeof record.first_name === "string" ? record.first_name.trim() : "";
		const lastName = typeof record.last_name === "string" ? record.last_name.trim() : "";
		const combined = [firstName, lastName].filter(Boolean).join(" ").trim();
		if (combined) return combined;

		const name = typeof record.name === "string" ? record.name.trim() : "";
		if (name) return name;
	}

	return undefined;
}

function renderCell(
	columnId: GroupColumnId,
	row: GroupRow,
	rowIndex: number,
	callbacks: RenderCellCallbacks
): React.ReactNode {
	switch (columnId) {
	case "name":
  const isSuspendedRow = row.status === "suspended";
  return (
    <div className="flex items-start gap-[20px] min-w-0 w-full">
      <CheckboxCell
        checked={callbacks.selectedIds.has(row.id)}
        onChange={() => callbacks.toggleRow(row.id)}
        className="mt-0.5 shrink-0"
      />
      <div
        className="min-w-0 w-full cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          callbacks.onRowClick?.(row);
        }}
      >
        <NameCell
          name={row.name}
          subtitle={row.description || ""}
          className="min-w-0 w-full"
          nameClassName={isSuspendedRow ? "block w-full whitespace-normal break-all" : "truncate block w-full"}
          subtitleClassName={isSuspendedRow ? "block w-full whitespace-normal break-all" : "truncate block w-full"}
        />
      </div>
    </div>
  );

		case "address":
			return (
				<Tooltip>
					<TooltipTrigger asChild>
						<TextCell className="min-w-0 w-full">
							<div className="block max-w-[360px] whitespace-normal break-all leading-[24px] text-[var(--gp-color-text-neutral-secondary)]">
								{row.address}
							</div>
						</TextCell>
					</TooltipTrigger>
					<TooltipPrimitive.Portal>
						<TooltipPrimitive.Content
							side="top"
							sideOffset={4}
							className="bg-white border border-[var(--gp-color-border-neutral-secondary)] rounded-[var(--gp-radius-base)] px-[var(--gp-space-m)] py-[var(--gp-space-s)] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.16)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)] font-normal max-w-[280px] z-[9999]"
						>
							{row.address}
						</TooltipPrimitive.Content>
					</TooltipPrimitive.Portal>
				</Tooltip>
			);

		case "manager": {
			const managerValue = getManagerDisplayValue(row.manager as unknown);
			const hasManager = !!managerValue;
			const tooltipOpen = callbacks.openManagerTooltipRowId === row.id;
			const isHovered = (callbacks.hoverManagerBadgeRowId === row.id || tooltipOpen) && !hasManager;

			return (
				<div className="flex items-center justify-center py-[13px]">
					<Tooltip open={tooltipOpen} onOpenChange={(open) => callbacks.setOpenManagerTooltipRowId(open ? row.id : null)}>
						<TooltipTrigger asChild>
							<div
								onClick={(e) => {
									e.stopPropagation();
									if (hasManager) {
										callbacks.onViewManagerDetail?.(row);
										return;
									}
									callbacks.onAddManager?.(row);
								}}
								onMouseEnter={() => !hasManager && callbacks.setHoverManagerBadgeRowId(row.id)}
								onMouseLeave={() => !hasManager && callbacks.setHoverManagerBadgeRowId(null)}
								className={`inline-flex items-center gap-[var(--gp-space-s)] px-[10px] py-[5px] rounded-full transition-[background-color,border-color] duration-300 cursor-pointer ${hasManager
									? tooltipOpen 
										? "bg-[#F7F8F7] border border-[#FFE3D9]" 
										: "bg-white border border-[#FFE3D9] hover:bg-[#F7F8F7]"
										: isHovered
											? "bg-[#FFD9CC] border border-[#FE5720]"
											: "bg-white border border-[#C1C7C4] hover:bg-[#FFD9CC] hover:border-[#FE5720]"
								}`}
							>
								{!hasManager && (
									<img
										src="/Assigned/plus.svg"
										alt="Add"
										className={`size-4 shrink-0 transition-opacity duration-300 absolute ${isHovered ? "opacity-100" : "opacity-0"}`}
									/>
								)}
								<span
									className={`font-[var(--gp-font-text)] text-[14px] leading-[22px] transition-[margin-left] duration-300 ${isHovered ? "ml-5" : ""}`}
									style={{
										fontWeight: 400,
										fontFeatureSettings: "'frac' 1",
										color: hasManager ? "var(--gp-color-text-neutral-secondary)" : "var(--gp-color-text-neutral-light)"
									}}
								>
									{hasManager ? managerValue : !isHovered ? "No manager" : ""}
									{!hasManager && isHovered && (
										<span style={{ color: "#37493F" }}>
											Add
										</span>
									)}
								</span>
							</div>
						</TooltipTrigger>
					<CustomTooltipContent 
  sideOffset={0} 
  align="start" 
  alignOffset={isHovered ? 10 : 12} 
  horizontalOffset={isHovered ? -7 : -10}
>
  {hasManager ? (
    <span>View details</span>
  ) : (
    <span>Assign Manager</span>
  )}
</CustomTooltipContent>
					</Tooltip>
				</div>
			);
		}

		case "drivers": {
			const driversTooltipOpen = callbacks.openDriversTooltipRowId === row.id;
			const driversHovered = driversTooltipOpen && row.driverCount === 0;

			return (
				<div className="flex items-center justify-center py-[13px]">
					<Tooltip open={driversTooltipOpen} onOpenChange={(open) => callbacks.setOpenDriversTooltipRowId(open ? row.id : null)}>
						<TooltipTrigger asChild>
							<div
						onClick={(e) => {
							e.stopPropagation();
							if (row.driverCount > 0) {
								callbacks.onViewDriversList?.(row);
							} else {
								callbacks.onAssignDrivers?.(row);
							}
						}}
					className={`group/badge inline-flex items-center gap-[var(--gp-space-s)] px-[10px] py-[5px] rounded-full transition-[background-color,border-color] duration-200 cursor-pointer ${
						row.driverCount > 0
							? driversTooltipOpen
								? "border border-[#FE5720] bg-[#FFD9CC]"
								: "bg-white border border-[#FFE3D9] hover:bg-[#FFD9CC] hover:border-[#FE5720]"
							: driversTooltipOpen
								? "border border-[#FE5720] bg-[#FFD9CC]"
								: "bg-white border border-[#C1C7C4] hover:bg-[#FFD9CC] hover:border-[#FE5720]"
					}`}
							>
								<img
									src="/Group/Table/Grouped/Table/Default/Table/Row/Table/Cell/Assigned/users.svg"
									alt="Users"
									className={`size-4 shrink-0 transition-all duration-200 ${
										row.driverCount > 0 
											? '[filter:invert(35%)_sepia(100%)_saturate(7000%)_hue-rotate(5deg)_brightness(100%)_contrast(105%)]' 
										: driversHovered
											? '[filter:invert(35%)_sepia(100%)_saturate(7000%)_hue-rotate(5deg)_brightness(100%)_contrast(105%)]'
											: '[filter:grayscale(100%)_opacity(0.6)] group-hover/badge:[filter:invert(35%)_sepia(100%)_saturate(7000%)_hue-rotate(5deg)_brightness(100%)_contrast(105%)]'
									}`}
								/>
								<span
									className="font-[var(--gp-font-text)] text-[14px] leading-[22px]"
									style={{
										fontWeight: 400,
										color: "black"
									}}
								>
									{row.driverCount}
								</span>
							</div>
						</TooltipTrigger>
				<CustomTooltipContent 
  sideOffset={0} 
  align="start" 
  alignOffset={10} 
  horizontalOffset={-7}
>
  {row.driverCount > 0 ? (
    <span>View list</span>
  ) : (
    <span className="text-[var(--color-stroke-brand)] text-sm font-normal hover:underline cursor-pointer">
      Assign Driver
    </span>
  )}
</CustomTooltipContent>
					</Tooltip>
				</div>
			);
		}

		case "boxes": {
			const boxesTooltipOpen = callbacks.openBoxesTooltipRowId === row.id;
			const boxesHovered = boxesTooltipOpen && row.boxCount === 0;

			return (
				<div className="flex items-center justify-center py-[13px]">
					<Tooltip open={boxesTooltipOpen} onOpenChange={(open) => callbacks.setOpenBoxesTooltipRowId(open ? row.id : null)}>
						<TooltipTrigger asChild>
							<div
						onClick={(e) => {
							e.stopPropagation();
							if (row.boxCount > 0) {
								callbacks.onViewBoxesList?.(row);
							} else {
								callbacks.onAssignBoxes?.(row);
							}
						}}
					className={`group/badge inline-flex items-center gap-[var(--gp-space-s)] px-[10px] rounded-full py-[5px] transition-[background-color,border-color] duration-200 cursor-pointer ${
						row.boxCount > 0
							? boxesTooltipOpen
								? "border border-[#FE5720] bg-[#FFD9CC]"
								: "bg-white border border-[#FFE3D9] hover:bg-[#FFD9CC] hover:border-[#FE5720]"
							: boxesTooltipOpen
								? "border border-[#FE5720] bg-[#FFD9CC]"
								: "bg-white border border-[#C1C7C4] hover:bg-[#FFD9CC] hover:border-[#FE5720]"
					}`}
							>
								<img
									src="/Group/Table/Grouped/Table/Default/Table/Row/Table/Cell/Assigned/Box.svg"
									alt="Box"
									className={`size-4 shrink-0 transition-all duration-200 ${
										row.boxCount > 0 
											? '[filter:invert(35%)_sepia(100%)_saturate(7000%)_hue-rotate(5deg)_brightness(100%)_contrast(105%)]' 
										: boxesHovered
											? '[filter:invert(35%)_sepia(100%)_saturate(7000%)_hue-rotate(5deg)_brightness(100%)_contrast(105%)]'
											: '[filter:grayscale(100%)_opacity(0.6)] group-hover/badge:[filter:invert(35%)_sepia(100%)_saturate(7000%)_hue-rotate(5deg)_brightness(100%)_contrast(105%)]'
									}`}
								/>
								<span
									className="font-[var(--gp-font-text)] text-[14px] leading-[22px]"
									style={{
										fontWeight: 400,
										color: "black"
									}}
								>
									{row.boxCount}
								</span>
							</div>
						</TooltipTrigger>
				<CustomTooltipContent 
  sideOffset={0} 
  align="start" 
  alignOffset={10} 
  horizontalOffset={-7}
>
  {row.boxCount > 0 ? (
    <span>View list</span>
  ) : (
    <div className="flex flex-col gap-[2px]">
      <span className="text-[14px] leading-[22px]">No assigned GrubPacs.</span>
      <span className="text-[14px] font-medium leading-[18px] italic" style={{ color: '#FE5720' }}>Open GrubPacs to assign &gt;&gt;</span>
    </div>
  )}
</CustomTooltipContent>
					</Tooltip>
				</div>
			);
		}

		case "updated":
			return (
				<div className="w-full text-center">
					<span
						className="font-[var(--gp-font-text)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]"
						style={{ fontWeight: 400 }}
					>
						{row.updated}
					</span>
				</div>
			);

		case "suspended":
			return (
				<div className="w-full text-center">
					<span
						className="font-[var(--gp-font-text)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]"
						style={{ fontWeight: 400 }}
					>
						{row.suspended || "-"}
					</span>
				</div>
			);

		case "added":
			return (
				<div className="w-full text-center">
					<span
						className="font-[var(--gp-font-text)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]"
						style={{ fontWeight: 400 }}
					>
						{row.added || "-"}
					</span>
				</div>
			);

		case "actions":
			return renderActions(row, rowIndex, callbacks);

		default:
			return null;
	}
}

// Custom tooltip content
const CustomTooltipContent = ({ children, side = "bottom", sideOffset = 8, align = "start", alignOffset = 0, horizontalOffset = 0, onClick, ...props }: {
	children: React.ReactNode;
	side?: "top" | "right" | "bottom" | "left";
	sideOffset?: number;
	align?: "start" | "center" | "end";
	alignOffset?: number;
	horizontalOffset?: number;
	onClick?: (e: React.MouseEvent) => void;
}) => (
	<TooltipPrimitive.Portal>
		<TooltipPrimitive.Content
			side={side}
			sideOffset={sideOffset}
			align={align}
			alignOffset={alignOffset}
			className={`bg-white border border-[var(--gp-color-border-neutral-secondary)] rounded-[var(--gp-radius-base)] px-[var(--gp-space-m)] py-[var(--gp-space-s)] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.16)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)] font-normal max-w-none z-[9999] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 ${onClick ? 'cursor-pointer hover:bg-[#F7F8F7]' : ''}`}
			style={{ transform: horizontalOffset !== 0 ? `translateX(${horizontalOffset}px)` : undefined }}
			onClick={onClick}
			{...props}
		>
			{children}
			<TooltipPrimitive.Arrow width={14} height={7} className="fill-white stroke-[var(--gp-color-border-neutral-secondary)] stroke-[1px] z-50" />
		</TooltipPrimitive.Content>
	</TooltipPrimitive.Portal>
);

// Dropdown menu icon components
const DropdownIcon = ({ src, alt = "Icon" }: { src: string; alt?: string }) => (
	<img src={src} alt={alt} className="w-[18px] h-[18px] text-[var(--gp-color-text-neutral-secondary)]" />
);

function renderActions(
	row: GroupRow,
	rowIndex: number,
	callbacks: RenderCellCallbacks
): React.ReactNode {
	// For suspended restaurants, show ACTIVATE button and delete button
	if (row.status === "suspended") {
		return (
			<ActionCell className="justify-end w-full">
				<div className="flex items-start gap-[var(--gp-space-m)]">
					<Button
						variant="primary"
						appearance="outlined"
						size="sm"
						state={rowIndex === 0 ? "press" : "default"}
						onClick={() => callbacks.onActivateGroup?.(row)}
						className="w-[92px] h-[32px] bg-white font-medium"
					>
						<span>ACTIVATE</span>
					</Button>
					<IconButton
						icon={<TrashIcon />}
						aria-label="Delete"
						onClick={() => callbacks.onDeleteGroup?.(row)}
						className="focus:outline-none bg-white hover:bg-[#EFF1F0] hover:border-2 hover:border-[#C3C9C5] group-hover:bg-[#EFF1F0] group-hover:border-2 group-hover:border-[#C3C9C5] active:bg-[#EFF1F0] active:border-2 active:border-[#C3C9C5]"
					/>
				</div>
			</ActionCell>
		);
	}

	// For active restaurants, show the normal dropdown menu
	return (
		<ActionCell className="justify-end w-full">
			<DropdownMenu
				modal={false}
				onOpenChange={(open) => callbacks.setOpenDropdownRowId(open ? row.id : null)}
			>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						aria-label="More options"
						className="flex items-center justify-center size-6 rounded-[var(--gp-radius-base)] cursor-pointer focus:outline-none bg-white hover:bg-[#EFF1F0] hover:border-2 hover:border-[#C3C9C5] group-hover:bg-[#EFF1F0] group-hover:border-2 group-hover:border-[#C3C9C5] active:bg-[#EFF1F0] active:border-2 active:border-[#C3C9C5] data-[state=open]:bg-[#EFF1F0] data-[state=open]:border-2 data-[state=open]:border-[#C3C9C5]"
						onClick={(e) => e.stopPropagation()}
					>
						<DotsVerticalIcon className="size-3.5" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					sideOffset={8}
					className="bg-white border border-[var(--gp-color-border-neutral-secondary)] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1),4px_4px_8px_0px_rgba(0,0,0,0.12)] p-0 min-w-[200px]"
				>
					<DropdownMenuItem
						onSelect={() => callbacks.onEditGroup?.(row)}
						className="flex items-center gap-[var(--gp-space-m)] px-[var(--gp-space-l)] py-[var(--gp-space-m)] border-t border-[var(--gp-color-border-neutral-secondary)] first:border-t-0 hover:bg-[var(--gp-color-background-interactive-brand-secondary-button-default)] cursor-pointer text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)] font-normal"
					>
						<DropdownIcon src="/Group/dropdown/Dropdown/pen-line.svg" alt="Edit" />
						<span>Edit details</span>
					</DropdownMenuItem>
					{(row.boxCount > 0 || row.driverCount > 0) && (
						<DropdownMenuItem
							onSelect={() => callbacks.onReassignResources?.(row)}
							className="flex items-center gap-[var(--gp-space-m)] px-[var(--gp-space-l)] py-[var(--gp-space-m)] border-t border-[var(--gp-color-border-neutral-secondary)] hover:bg-[var(--gp-color-background-interactive-brand-secondary-button-default)] cursor-pointer text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)] font-normal"
						>
							<DropdownIcon src="/Employee/Multiselect/refresh.svg" alt="Reassign" />
							<span>Reassign resources</span>
						</DropdownMenuItem>
					)}
					<DropdownMenuItem
						onSelect={() => callbacks.onSuspendRestaurant?.(row)}
						className="flex items-center gap-[var(--gp-space-m)] px-[var(--gp-space-l)] py-[var(--gp-space-m)] border-t border-[var(--gp-color-border-neutral-secondary)] hover:bg-[var(--gp-color-background-interactive-brand-secondary-button-default)] cursor-pointer text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)] font-normal"
					>
						<DropdownIcon src="/Group/dropdown/Dropdown/x-circle.svg" alt="Suspend" />
						<span>Suspend restaurant</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={() => callbacks.onDeleteGroup?.(row)}
						className="flex items-center gap-[var(--gp-space-m)] px-[var(--gp-space-l)] py-[var(--gp-space-m)] border-t border-[var(--gp-color-border-neutral-secondary)] hover:bg-[var(--gp-color-background-interactive-brand-secondary-button-default)] cursor-pointer text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)] font-normal"
					>
						<DropdownIcon src="/Group/dropdown/Dropdown/trash.svg" alt="Delete" />
						<span>Delete restaurant</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</ActionCell>
	);
}
