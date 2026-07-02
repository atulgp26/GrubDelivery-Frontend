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
} from "@/components/ui/data-table-cells";
import {
	Tooltip,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import TableCheckbox from "@/components/ui/TableCheckbox";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { useRouter } from "next/navigation";

export type RestaurantResourceColumnId = "name" | "contactInfo" | "role" | "box" | "added";

export type ResourceRole = "manager" | "driver";

export interface RestaurantResourceRow {
	id: string;
	name: string;
	identifier?: string; // e.g., "#DP1234 | Joined 12 June '25"
	contactInfo: {
		phone: string;
		email: string;
	};
	role: ResourceRole;
	/** For managers: number of boxes they manage. For drivers: box ID if assigned */
	box?: string | number | null;
	added: string;
}

export interface ViewListEmployeeTableProps {
	data: RestaurantResourceRow[];
	columns: RestaurantResourceColumnId[];
	onRowClick?: (row: RestaurantResourceRow) => void;
	onViewBoxesList?: (row: RestaurantResourceRow) => void;
	onAssignBoxes?: (row: RestaurantResourceRow) => void;
	className?: string;
	isEditMode?: boolean;
	selectedIds?: Set<string>;
	onSelectionChange?: (id: string, checked: boolean) => void;
	allSelected?: boolean;
	onSelectAll?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/* ========================
   Predefined column definitions
   ======================== */
interface ColumnDef {
	id: RestaurantResourceColumnId;
	header: string;
	width?: string | number;
	/** Whether to center align the column content */
	centered?: boolean;
}

const COLUMN_DEFS: Record<RestaurantResourceColumnId, ColumnDef> = {
	name: { id: "name", header: "Name" },
	contactInfo: { id: "contactInfo", header: "Contact info" },
	role: { id: "role", header: "Role", width: 210, centered: false },
	box: { id: "box", header: "Box", width: 210, centered: true },
	added: { id: "added", header: "Added", width: 210, centered: true },
};

/* ========================
   Component
   ======================== */
export function RestaurantResourceModalTable({
	data,
	columns,
	onRowClick,
	onViewBoxesList,
	onAssignBoxes,
	className,
	isEditMode = false,
	selectedIds = new Set(),
	onSelectionChange,
	allSelected = false,
	onSelectAll,
}: ViewListEmployeeTableProps) {
	const router = useRouter();

	const [openBoxesTooltipRowId, setOpenBoxesTooltipRowId] = React.useState<string | null>(null);

	const colDefs = columns.map((id) => COLUMN_DEFS[id]);

	const handleRowClick = (row: RestaurantResourceRow, e: React.MouseEvent<HTMLTableRowElement>) => {
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
				{isEditMode && (
					<DataTableHeaderCell width={48} className="text-center">
						<TableCheckbox
							checked={allSelected}
							onChange={onSelectAll || (() => {})}
						/>
					</DataTableHeaderCell>
				)}
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
					<DataTableRow key={row.id}>
						{isEditMode && (
							<DataTableCell width={48} className="text-center">
								<TableCheckbox
									checked={selectedIds.has(row.id)}
									onChange={(e) => onSelectionChange?.(row.id, e.target.checked)}
								/>
							</DataTableCell>
						)}
						{colDefs.map((col) => (
							<DataTableCell 
								key={col.id} 
								width={col.width}
								className={col.centered ? "text-center" : undefined}
							>
								{renderCell(col.id, row, index, {
									openBoxesTooltipRowId,
									setOpenBoxesTooltipRowId,
									onViewBoxesList,
									onAssignBoxes,
									router,
								})}
							</DataTableCell>
						))}
					</DataTableRow>
				))}
			</DataTableBody>
		</DataTable>
	);
}

interface RenderCellCallbacks {
	openBoxesTooltipRowId: string | null;
	setOpenBoxesTooltipRowId: (id: string | null) => void;
	onViewBoxesList?: (row: RestaurantResourceRow) => void;
	onAssignBoxes?: (row: RestaurantResourceRow) => void;
	router?: any;
}

function renderCell(
	columnId: RestaurantResourceColumnId,
	row: RestaurantResourceRow,
	rowIndex: number,
	callbacks: RenderCellCallbacks,
): React.ReactNode {
	switch (columnId) {
		case "name":
			return (
				<div className="flex flex-col gap-[4px]">
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
			);

		case "contactInfo":
			return (
				<div className="flex flex-col gap-[4px]">
					<span 
						className="font-[var(--gp-font-heading)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)]"
						style={{ fontWeight: 600 }}
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

		case "role":
			return (
				<TextCell>
					<span 
						className="font-[var(--gp-font-text)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)] capitalize"
						style={{ fontWeight: 400 }}
					>
						{row.role}
					</span>
				</TextCell>
			);

		case "box": {
			const isManager = row.role === "manager";
			const boxCount = typeof row.box === "number" ? row.box : (row.box ? 1 : 0);
			const hasBoxes = boxCount > 0;
			const boxesTooltipOpen = callbacks.openBoxesTooltipRowId === row.id;
			const boxesHovered = boxesTooltipOpen && boxCount === 0;

			return (
				<div className="flex items-center justify-center py-[13px]">
					<Tooltip open={boxesTooltipOpen} onOpenChange={(open: boolean) => callbacks.setOpenBoxesTooltipRowId(open ? row.id : null)}>
						<TooltipTrigger asChild>
							<div
					className={`group/badge inline-flex items-center gap-[var(--gp-space-s)] px-[10px] rounded-full py-[5px] transition-[background-color,border-color] duration-200 cursor-default ${
						boxCount > 0
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
										boxCount > 0 
											? '[filter:invert(35%)_sepia(100%)_saturate(7000%)_hue-rotate(5deg)_brightness(100%)_contrast(105%)]' 
										: boxesHovered
											? '[filter:invert(35%)_sepia(100%)_saturate(7000%)_hue-rotate(5deg)_brightness(100%)_contrast(105%)]'
											: '[filter:grayscale(100%)_opacity(0.6)] group-hover/badge:[filter:invert(35%)_sepia(100%)_saturate(7000%)_hue-rotate(5deg)_brightness(100%)_contrast(105%)]'
									}`}
								/>
								{hasBoxes && (
									<span
										className="font-[var(--gp-font-text)] text-[14px] leading-[22px]"
										style={{
											fontWeight: 400,
											color: "black"
										}}
									>
										{boxCount}
									</span>
								)}
							</div>
						</TooltipTrigger>
					<CustomTooltipContent 
						sideOffset={0} 
						align="start" 
						alignOffset={10} 
						horizontalOffset={-7}
						onClick={(e) => {
							e.stopPropagation();
							if (boxCount > 0) {
								callbacks.onViewBoxesList?.(row);
							} else {
								callbacks.router?.push("/grubpacs/list");
							}
						}}
					>
							{boxCount > 0 ? (
								<span>View list</span>
							) : (
								<div className="flex flex-col gap-[2px]">
									<span className="text-[14px] leading-[22px]">No assigned GrubPacs.</span>
									<span className="text-[14px] font-bold leading-[18px] italic" style={{ color: '#FE5720' }}>Open GrubPacs to assign &gt;&gt;</span>
								</div>
							)}
						</CustomTooltipContent>
					</Tooltip>
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
