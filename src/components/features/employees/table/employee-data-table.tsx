"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { getWrappedGroupArray } from "@/lib/utils/groupedResponse";
import { Button } from "@/components/ui/Button";
import grubpacService from "@/services/grubpacs";
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
	IconTextCell,
	BoxBadgeCell,
	TextCell,
	ActionCell,
	IconButton,
	MessageSquareLinesIcon,
	TrashIcon,
} from "@/components/ui/data-table-cells";
import { FiFileText } from "react-icons/fi";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export type ColumnId = "name" | "message" | "role" | "box" | "added" | "suspended" | "actions";
export type BoxGroupType = "connected" | "disconnected" | "manager";

export interface EmployeeRow {
	id: string;
	name: string;
	identifier: string;
	role: "Manager" | "Driver";
	added: string;
	suspended?: string;
	status?: "suspended" | "active";
	boxCount?: number;
	boxConnected?: boolean;
	boxGroupType?: BoxGroupType;
	connectedBoxesStatus?: boolean;
	handlerBox?: {
		id: string;
		name: string;
		displayId: string;
		status?: string;
	};
	contactInfo?: {
		email?: string;
		phone?: string;
	};
	boxDetails?: {
		boxId?: string;
		licenseNumber?: string;
		settingsId?: string;
	} | {
		boxId?: string;
		licenseNumber?: string;
		settingsId?: string;
	}[];
}

export interface EmployeeDataTableProps {
	data: EmployeeRow[];
	columns: ColumnId[];
	selectedIds?: Set<string>;
	onSelectionChange?: (ids: Set<string>) => void;
	onActivate?: (row: EmployeeRow) => void;
	onDelete?: (row: EmployeeRow) => void;
onAllBoxes?: (row: EmployeeRow) => void;
onViewRestaurantBoxes?: (row: EmployeeRow) => void;
	onMenuClick?: (row: EmployeeRow) => void;
	onAddClick?: (row: EmployeeRow) => void;
	onEditEmployee?: (row: EmployeeRow) => void;
	onViewDetails?: (row: EmployeeRow) => void;
	onViewLogs?: (row: EmployeeRow) => void;
	onSuspendEmployee?: (row: EmployeeRow) => void;
	onDeleteEmployee?: (row: EmployeeRow) => void;
	className?: string;
}

/* ========================
   Predefined column definitions
   ======================== */
interface ColumnDef {
	id: ColumnId;
	header: string;
	width?: string | number;
	/** Whether this column header includes a select-all checkbox */
	hasCheckbox?: boolean;
	/** Whether to center align the column content */
	centered?: boolean;
}

const COLUMN_DEFS: Record<ColumnId, ColumnDef> = {
	name: { id: "name", header: "Name", hasCheckbox: true },
	message: { id: "message", header: "", width: 140, centered: true },
	role: { id: "role", header: "Role", width: 140 },
	box: { id: "box", header: "Box", width: 160, centered: true },
	added: { id: "added", header: "Added", width: 160 },
	suspended: { id: "suspended", header: "Suspended" },
	actions: { id: "actions", header: "", width: 160 },
};

/* ========================
   Component
   ======================== */
export function EmployeeDataTable({
	data,
	columns,
	selectedIds: controlledSelectedIds,
	onSelectionChange,
	onActivate,
	onDelete,
	onAllBoxes,
	onViewRestaurantBoxes,
	onMenuClick,
	onAddClick,
	onEditEmployee,
	onViewDetails,
	onViewLogs,
	onSuspendEmployee,
	onDeleteEmployee,
	className,
}: EmployeeDataTableProps) {
	const router = useRouter();
	const [internalSelectedIds, setInternalSelectedIds] = React.useState<Set<string>>(new Set());
	const [openDropdownRowId, setOpenDropdownRowId] = React.useState<string | null>(null);
	
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

	const openBoxSettings = React.useCallback(
		async (row: EmployeeRow) => {
			const firstConnectedBox = row.handlerBox;

			if (firstConnectedBox?.id) {
				const targetPath =
					firstConnectedBox.status === "suspended"
						? "/grubpacs/suspended/details"
						: "/grubpacs/details";
				router.push(`${targetPath}?id=${encodeURIComponent(firstConnectedBox.id)}`);
				return;
			}

			const firstBoxDetails = Array.isArray(row.boxDetails)
				? row.boxDetails[0]
				: row.boxDetails;

			const directSettingsId = firstBoxDetails?.settingsId?.trim();
			if (directSettingsId) {
				router.push(`/grubpacs/details?id=${encodeURIComponent(directSettingsId)}`);
				return;
			}

			const displayBoxId = firstBoxDetails?.boxId?.trim();
			if (displayBoxId) {
				const searchRes = await grubpacService.search({
					query: displayBoxId,
					limit: 1,
					status: "active",
				});

				const matchedId = searchRes.success && Array.isArray(searchRes.data)
					? searchRes.data[0]?.id
					: undefined;

				if (matchedId) {
					router.push(`/grubpacs/details?id=${encodeURIComponent(matchedId)}`);
					return;
				}
			}

			if (!row.id) return;

			const listRes = await grubpacService.getList({
				employee_id: row.id,
				status: "active",
				limit: 1,
			});

			if (!listRes.success || !listRes.data) return;

			const data = listRes.data as {
				boxes?: Array<{ id?: string }>;
				groups?: Record<string, unknown>;
			};

			let resolvedId: string | undefined = data.boxes?.[0]?.id;

			if (!resolvedId && data.groups && typeof data.groups === "object") {
				for (const value of Object.values(data.groups)) {
					const groupedItems = getWrappedGroupArray<{ id?: string }>(value);
					if (groupedItems.length > 0) {
						const first = groupedItems[0];
						if (typeof first?.id === "string" && first.id.trim()) {
							resolvedId = first.id;
							break;
						}
					}
				}
			}

			if (resolvedId) {
				router.push(`/grubpacs/details?id=${encodeURIComponent(resolvedId)}`);
			}
		},
		[router],
	);

	const callbacks: CellCallbacks = {
		onActivate,
		onDelete,
		onAllBoxes,
		onViewRestaurantBoxes,
		onMenuClick,
		
		onAddClick,
		onEditEmployee,
		onViewDetails,
		onViewLogs,
		onSuspendEmployee,
		onDeleteEmployee,
		onOpenBoxSettings: openBoxSettings,
	};

	return (
		<DataTable className={className}>
			{/* Header */}
			<DataTableHeader>
				{colDefs.map((col) => {
					if (col.hasCheckbox) {
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

			{/* Body */}
			<DataTableBody>
				{data.map((row, index) => (
					<DataTableRow 
						key={row.id}
						className={cn(
							openDropdownRowId === row.id ? "bg-[#EFF1F0]" : "",
							callbacks.onMenuClick ? "cursor-pointer" : ""
						)}
						onClick={() => callbacks.onMenuClick?.(row)}
					>
						{colDefs.map((col) => (
							<DataTableCell 
								key={col.id} 
								width={col.width}
								className={col.centered ? "text-center" : undefined}
								onClick={["actions", "message", "box"].includes(col.id) ? (e) => e.stopPropagation() : undefined}
							>
								{renderCell(col.id, row, index, {
									selectedIds,
									toggleRow,
									setOpenDropdownRowId,
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
	onActivate?: (row: EmployeeRow) => void;
	onDelete?: (row: EmployeeRow) => void;
	onAllBoxes?: (row: EmployeeRow) => void;
	onViewRestaurantBoxes?: (row: EmployeeRow) => void; 
	onMenuClick?: (row: EmployeeRow) => void;
	onAddClick?: (row: EmployeeRow) => void;
	onEditEmployee?: (row: EmployeeRow) => void;
	onViewDetails?: (row: EmployeeRow) => void;
	onViewLogs?: (row: EmployeeRow) => void;
	onSuspendEmployee?: (row: EmployeeRow) => void;
	onDeleteEmployee?: (row: EmployeeRow) => void;
	onOpenBoxSettings?: (row: EmployeeRow) => void;
}

interface RenderCellCallbacks extends CellCallbacks {
	selectedIds: Set<string>;
	toggleRow: (id: string) => void;
	setOpenDropdownRowId: (id: string | null) => void;
}

function renderCell(
	columnId: ColumnId,
	row: EmployeeRow,
	rowIndex: number,
	callbacks: RenderCellCallbacks
): React.ReactNode {
	switch (columnId) {
		case "name":
			return (
				<div className="flex items-start gap-[var(--gp-space-xl)]">
					<div onClick={(e) => e.stopPropagation()}>
						<CheckboxCell
							checked={callbacks.selectedIds.has(row.id)}
							onChange={() => callbacks.toggleRow(row.id)}
							className="mt-0.5"
						/>
					</div>
					<NameCell
						name={row.name}
						nameClassName="block max-w-[420px] whitespace-normal break-all"
						subtitle={row.identifier}
						subtitleClassName="block max-w-[240px] whitespace-normal break-all"
					/>
				</div>
			);

		case "message":
			return (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className="flex items-center justify-center w-[32px] h-[32px] border border-[#6B7971] bg-white shrink-0 rounded-lg cursor-pointer hover:border-[var(--gp-color-border-brand-active)] hover:bg-[var(--gp-color-background-interactive-brand-secondary-button-active)] hover:ring-2 hover:ring-[rgb(var(--neutral-300))] active:border-[var(--gp-color-border-brand-active)] active:bg-[var(--gp-color-background-interactive-brand-secondary-button-active)] active:ring-2 active:ring-[rgb(var(--neutral-300))]">
							<MessageSquareLinesIcon />
						</div>
					</TooltipTrigger>
				<CustomTooltipContent side="left" sideOffset={8} align="center">
						<div className="text-left">
							{row.contactInfo?.email || row.contactInfo?.phone ? (
								<>
									{row.contactInfo.email && <>{row.contactInfo.email}<br /></>}
									{row.contactInfo.phone && <>({row.contactInfo.phone})</>}
								</>
							) : (
								<>
									ravi@gmail.com<br />
									(+91 98765 43210)
								</>
							)}
						</div>
					</CustomTooltipContent>
				</Tooltip>
			);

		case "role":
			return <TextCell>{row.role}</TextCell>;

		case "box": {
			const normalizedCount = row.boxCount ?? 0;
			const isManagerGroupRow = row.boxGroupType === "manager";
			
			// Manager group uses count-only styling: 0 = gray (old), > 0 = orange (connected style).
			const boxVariant: "connected" | "disconnected" = isManagerGroupRow
				? normalizedCount > 0
					? "connected"
					: "disconnected"
				: row.connectedBoxesStatus !== undefined
					? row.connectedBoxesStatus
						? "connected"
						: "disconnected"
					: row.boxGroupType === "connected"
						? "connected"
						: row.boxGroupType === "disconnected"
							? "disconnected"
							: normalizedCount > 0
								? "connected"
								: "disconnected";
			
			const isConnected = boxVariant === "connected";
			const hasNoBoxes = normalizedCount === 0;
			const hasMultiple = normalizedCount > 1;
			
			// Try to get box details from connectedBoxes array first, fall back to boxDetails
			const firstConnectedBox = row.handlerBox;
			const firstBoxDetails = Array.isArray(row.boxDetails)
				? row.boxDetails[0]
				: row.boxDetails;
			
			const boxName = firstConnectedBox?.name || firstBoxDetails?.boxId || "Box";
			const boxDisplayId =
				firstConnectedBox?.displayId ||
				firstBoxDetails?.boxId ||
				firstBoxDetails?.licenseNumber ||
				"N/A";
			const boxId = firstConnectedBox?.id;
			const directSettingsId = firstBoxDetails?.settingsId?.trim();
			
			const canOpenSettings =
				isConnected &&
				!hasNoBoxes &&
				Boolean(boxId || directSettingsId || firstBoxDetails?.boxId || row.id);
				
			const connectedTooltipContent = (
				<div>
					<span className="text-[12px] leading-[18px]">Connected with </span>
					<span className="text-[var(--gp-color-text-brand)] font-semibold italic text-[14px] leading-[22px]">
						{boxName}
					</span>
					<br />
					<span className="text-[14px] leading-[22px] text-left block">(
						{boxDisplayId}
						)
					</span>
				</div>
			);

			let tooltipContent: React.ReactNode = null;

if (isManagerGroupRow) {
    tooltipContent = "View list";
} else if (!isConnected) {
    if (normalizedCount > 0) {
        tooltipContent = "View list";
    } else {
        tooltipContent = "Ask handler to connect";
    }
} else if (hasNoBoxes) {
    tooltipContent = (
        <div>
            <span className="text-[14px] leading-[22px]">No assigned GrubPacs.</span>
            <br />
            <span className="text-[var(--gp-color-text-brand)] font-semibold text-[14px] leading-[22px]">
                Open GrubPacs to assign {">>"}
            </span>
        </div>
    );
} else {
    tooltipContent = connectedTooltipContent;
}

const handleBoxClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    callbacks.onViewRestaurantBoxes?.(row);
};
			
			return (
				<Tooltip>
					<TooltipTrigger asChild>
						<div
							className="cursor-pointer"
							onClick={handleBoxClick}
							onPointerDown={handleBoxClick}
						>
							<BoxBadgeCell
								variant={boxVariant}
								count={isManagerGroupRow ? normalizedCount : undefined}
							/>
						</div>
					</TooltipTrigger>
					<CustomTooltipContent side="left" sideOffset={-30} align="center">
						<div className="text-center">
							{tooltipContent}
						</div>
					</CustomTooltipContent>
				</Tooltip>
			);
		}

		case "added":
			return <TextCell>{row.added}</TextCell>;

		case "suspended":
			return <TextCell>{row.suspended}</TextCell>;

		case "actions":
			return renderActions(row, rowIndex, callbacks);

		default:
			return null;
	}
}

// Custom tooltip content without default styling conflicts
const CustomTooltipContent = ({ children, side = "bottom", sideOffset = 0, align = "center", ...props }: {
	children: React.ReactNode;
	side?: "top" | "right" | "bottom" | "left";
	sideOffset?: number;
	align?: "start" | "center" | "end";
}) => (
	<TooltipPrimitive.Portal>
		<TooltipPrimitive.Content
			side={side}
			sideOffset={sideOffset}
			align={align}
			className="bg-white border border-[var(--gp-color-border-neutral-secondary)] rounded-[var(--gp-radius-base)] px-[var(--gp-space-m)] py-[var(--gp-space-s)] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.16)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)] font-normal max-w-none z-[9999] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
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
	row: EmployeeRow,
	rowIndex: number,
	callbacks: RenderCellCallbacks
): React.ReactNode {
	if (row.suspended != null) {
		return (
			<ActionCell>
				<Button
					variant="primary"
					appearance="outlined"
					size="sm"
					state={rowIndex === 0 ? "press" : "default"}
					onClick={() => callbacks.onActivate?.(row)}
					className="w-[92px] h-[32px] bg-white font-medium"
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
	}

	return (
		<ActionCell>
			<Button
				variant="neutral"
				appearance="outlined"
				state="press"
				size="sm"
				onClick={() => callbacks.onAllBoxes?.(row)}
				className="h-[32px] bg-white"
			>
				<span className="font-semibold">ALL BOXES</span>
			</Button>
			<DropdownMenu
				modal={false}
				onOpenChange={(open) => callbacks.setOpenDropdownRowId(open ? row.id : null)}
			>
				<DropdownMenuTrigger asChild>
					<IconButton
						icon={
							<Image
								src="/Employee/dots-vertical.svg"
								alt="More options"
								width={20}
								height={20}
							/>
						}
						aria-label="More options"
						className="size-9 rounded-[8px] bg-white p-2 transition-colors hover:bg-[#EFF1F0] data-[state=open]:bg-[#EFF1F0] data-[state=open]:shadow-[0_0_0_2px_rgba(121,134,126,0.40)]"
						onClick={(e) => e.stopPropagation()}
					/>
				</DropdownMenuTrigger>
				<DropdownMenuContent 
					align="end" 
					sideOffset={8}
					className="bg-white border border-[var(--gp-color-border-neutral-secondary)] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1),4px_4px_8px_0px_rgba(0,0,0,0.12)] p-0 min-w-[200px]"
				>
				<DropdownMenuItem 
  onSelect={() => callbacks.onEditEmployee?.(row)}
  className="flex items-center gap-[var(--gp-space-m)] px-[var(--gp-space-l)] py-[var(--gp-space-m)] border-t border-[var(--gp-color-border-neutral-secondary)] first:border-t-0 hover:bg-[var(--gp-color-background-interactive-brand-secondary-button-default)] cursor-pointer text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)] font-normal"
>
  <DropdownIcon src="/Employee/dropdown/Dropdown/pen-line.svg" alt="Edit" />
  <span>Edit employee details</span>
</DropdownMenuItem>
<DropdownMenuItem 
  onSelect={() => callbacks.onViewLogs?.(row)}
  className="flex items-center gap-[var(--gp-space-m)] px-[var(--gp-space-l)] py-[var(--gp-space-m)] border-t border-[var(--gp-color-border-neutral-secondary)] hover:bg-[var(--gp-color-background-interactive-brand-secondary-button-default)] cursor-pointer text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)] font-normal"
>
<FiFileText className="w-[18px] h-[18px] text-[var(--gp-color-text-neutral-secondary)]" />
  <span>View logs</span>
</DropdownMenuItem>
					<DropdownMenuItem 
						onSelect={() => callbacks.onSuspendEmployee?.(row)}
						className="flex items-center gap-[var(--gp-space-m)] px-[var(--gp-space-l)] py-[var(--gp-space-m)] border-t border-[var(--gp-color-border-neutral-secondary)] hover:bg-[var(--gp-color-background-interactive-brand-secondary-button-default)] cursor-pointer text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)] font-normal"
					>
						<DropdownIcon src="/Employee/dropdown/Dropdown/x-circle.svg" alt="Suspend" />
						<span>Suspend employee</span>
					</DropdownMenuItem>
					<DropdownMenuItem 
						onSelect={() => callbacks.onDeleteEmployee?.(row)}
						className="flex items-center gap-[var(--gp-space-m)] px-[var(--gp-space-l)] py-[var(--gp-space-m)] border-t border-[var(--gp-color-border-neutral-secondary)] hover:bg-[var(--gp-color-background-interactive-brand-secondary-button-default)] cursor-pointer text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)] font-normal"
					>
						<DropdownIcon src="/Employee/dropdown/Dropdown/trash.svg" alt="Delete" />
						<span>Delete employee</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</ActionCell>
	);
}
