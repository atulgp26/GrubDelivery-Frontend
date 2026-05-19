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
import { CheckboxCell, TextCell, ActionCell, DotsVerticalIcon } from "@/components/ui/data-table-cells";
import {
	Tooltip,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
	getGlobalStatusTooltip,
	getHandlerTooltip,
	type GlobalStatusValue,
	type HandlerStatusValue,
} from "@/components/features/grubpacs/utils/grubPacsTooltipUtils";

export type GrubPacBoxColumnId = "name" | "status" | "battery" | "handler" | "lockDetails" | "actions";

export interface GrubPacBoxRow {
	id: string;
	name: string;
	/** Subtitle e.g. "#DL12345 | DL2BD1234" */
	identifier?: string;
	/** Canonical lock state from API */
	grublockStatus?: "locked" | "unlocked" | "not_available" | "offline";
	/** Lock status: true (locked), false (unlocked), undefined (grey/unknown) */
	isLocked?: boolean;
	/** Whether the box has lock hardware available */
	hasLock?: boolean;
	/** Power status: "on" | "off" | "unknown" */
	powerStatus?: "on" | "off" | "unknown";
	globalStatus?: GlobalStatusValue;
	/** Battery status: "good" | "warning" | "critical" */
	battery?: "good" | "warning" | "critical";
	/** Battery percentage */
	batteryPercent?: string;
	/** Handler/Driver assigned status */
	hasHandler?: boolean;
	handlerName?: string;
	handlerPhone?: string;
	handlerStatus?: HandlerStatusValue;
	/** Lock status for lock-details token button */
	lockStatus?: "locked" | "unlocked";
}

export interface GrubPacBoxTableProps {
	data: GrubPacBoxRow[];
	/** Column IDs to display. */
	columns: GrubPacBoxColumnId[];
	/** When true, shows checkboxes for row selection */
	selectable?: boolean;
	selectedIds?: Set<string>;
	onSelectionChange?: (ids: Set<string>) => void;
	onRowClick?: (row: GrubPacBoxRow) => void;
	onLockDetailsClick?: (row: GrubPacBoxRow, buttonElement: HTMLElement | null) => void;
	onViewDetailsClick?: (row: GrubPacBoxRow) => void;
	onViewInGrubPacsClick?: (row: GrubPacBoxRow) => void;
	loadingRowIds?: Set<string>;
	activeLockDetailsRowId?: string;
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
	status: { id: "status", header: "", width: 20, centered: true },
	battery: { id: "battery", header: "Battery", width: 100, centered: true },
	handler: { id: "handler", header: "Handler", width: 80, centered: true },
	lockDetails: { id: "lockDetails", header: "Lock details", width: 180, centered: true },
	actions: { id: "actions", header: "", width: 60, centered: true },
};

/* ========================
   Component
   ======================== */
export function GrubPacBoxTable({
	data,
	columns,
	selectable = false,
	selectedIds: controlledSelectedIds,
	onSelectionChange,
	onRowClick,
	onLockDetailsClick,
	onViewDetailsClick,
	onViewInGrubPacsClick,
	loadingRowIds,
	activeLockDetailsRowId,
	className,
}: GrubPacBoxTableProps) {
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

	const handleRowClick = (row: GrubPacBoxRow, e: React.MouseEvent) => {
		const target = e.target as HTMLElement;
		const ignoreClick =
			target.closest('input[type="checkbox"]') ||
			target.closest("button") ||
			target.closest('[data-no-row-click="true"]');
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
				{data.map((row) => (
					<DataTableRow
						key={row.id}
						className={onRowClick ? "cursor-pointer hover:bg-[#F7F8F7]" : ""}
						onClick={(e) => handleRowClick(row, e)}
					>
						{colDefs.map((col) => (
							<DataTableCell
								key={col.id}
								width={col.width}
								className={col.centered ? "text-center" : undefined}
							>
									{renderCell(col.id, row, {
										selectedIds,
										toggleRow,
										showCheckbox,
										onLockDetailsClick,
											onViewDetailsClick,
											onViewInGrubPacsClick,
										isRowLoading: loadingRowIds?.has(row.id) ?? false,
										isLockDetailsActive: activeLockDetailsRowId === row.id,
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
	selectedIds: Set<string>;
	toggleRow: (id: string) => void;
	showCheckbox: boolean;
	onLockDetailsClick?: (row: GrubPacBoxRow, buttonElement: HTMLElement | null) => void;
	onViewDetailsClick?: (row: GrubPacBoxRow) => void;
	onViewInGrubPacsClick?: (row: GrubPacBoxRow) => void;
	isRowLoading: boolean;
	isLockDetailsActive: boolean;
}

function renderCell(
	columnId: GrubPacBoxColumnId,
	row: GrubPacBoxRow,
	callbacks: RenderCellCallbacks
): React.ReactNode {
	const fallbackLockState: "locked" | "unlocked" | "not_available" | "offline" =
		row.powerStatus === "off"
			? "offline"
			: row.hasLock === false
			? "not_available"
			: row.isLocked === false
			? "unlocked"
			: "locked";

	const lockState = row.grublockStatus ?? fallbackLockState;

	const lockTooltipByState: Record<typeof lockState, { title: string; subtitle?: string; showLink?: boolean }> = {
		locked: {
			title: "Box is locked.",
		},
		not_available: {
			title: "Feature not available",
		},
		offline: {
			title: "Switch on the box to access",
		},
		unlocked: {
			title: "Box is unlocked.",
		},
	};

	const lockTooltip = lockTooltipByState[lockState];
	const lockIconPath =
		lockState === "locked"
			? "/sidebar/Grublock.svg"
			: lockState === "unlocked"
			? "/GrubPac/Table/Row/Cell/Grublock-1.svg"
			: lockState === "not_available"
			? "/GrubPac/Table/Row/Cell/Grublock-1 2.svg"
			: "/GrubPac/Box-settings/grublock-open.svg";

	switch (columnId) {
		case "name":
			const identifierText = row.identifier
				? row.identifier.startsWith("#")
					? row.identifier
					: `#${row.identifier}`
				: undefined;
			const displayName = row.name?.trim() || identifierText || row.id;
			const showIdentifier = Boolean(identifierText && row.name && identifierText !== row.name);
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
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="rounded-[var(--gp-radius-md)] p-[2px] hover:bg-[var(--gp-color-bg-colored-secondary)] cursor-pointer transition-colors duration-200">
									<img
										src={lockIconPath}
										alt=""
										className="size-6 shrink-0"
										aria-hidden
									/>
								</div>
							</TooltipTrigger>
							<CustomTooltipContent side="bottom" sideOffset={-4} align="start">
								<div className="flex flex-col gap-[2px]">
									<div className="text-[14px] leading-[20px] text-[var(--color-neutral-secondary)]">
										{lockTooltip.title}
									</div>
									{lockTooltip.subtitle && (
										<div className={lockTooltip.showLink ? "text-[14px] italic leading-[16px] text-[var(--color-brand-default)]" : "text-[14px] font-bold leading-[16px] text-[var(--color-neutral-secondary)]"}>
											{lockTooltip.subtitle}
										</div>
									)}
								</div>
							</CustomTooltipContent>
						</Tooltip>
						<div className="flex flex-col gap-[var(--gp-text-spacing-narrow)] flex-1 min-w-0">
							<span
								className="font-[var(--gp-font-heading)] text-[16px] leading-[24px] text-[var(--gp-color-text-neutral-secondary)] truncate whitespace-nowrap"
								style={{ fontWeight: 600 }}
							>
								{displayName}
							</span>
							{showIdentifier && (
								<span
									className="font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)] break-words [overflow-wrap:anywhere]"
									style={{ fontWeight: 400 }}
								>
									{identifierText}
								</span>
							)}
						</div>
					</div>
				</div>
			);

		case "status": {
			const globalStatusValue: GlobalStatusValue =
				row.globalStatus ?? (row.powerStatus === "off" ? "power_off" : "unknown");
			const globalStatusTooltip = getGlobalStatusTooltip(globalStatusValue);

			const statusBadgeStyles: Record<GlobalStatusValue, { backgroundColor: string; borderColor: string }> = {
				power_off: {
					backgroundColor: "#EFF1F0",
					borderColor: "#506157",
				},
				ready: {
					backgroundColor: "#EDF5E9",
					borderColor: "#3B7D24",
				},
				critical: {
					backgroundColor: "#FFECE5",
					borderColor: "#AD260B",
				},
				attention: {
					backgroundColor: "#FFF6EB",
					borderColor: "#BB812C",
				},
				unknown: {
					backgroundColor: "#EFF1F0",
					borderColor: "#506157",
				},
			};

			const statusIconPath =
				globalStatusValue === "critical"
					? "/GrubPac/Box-settings/exclamation-triangle-critical.svg"
					: globalStatusValue === "attention"
					? "/GrubPac/Box-settings/exclamation-triangle.svg"
					: globalStatusValue === "ready" || row.powerStatus === "on"
					? "/GrubPac/Box-settings/check-circle.svg"
					: "/GrubPac/Box-settings/minus-circle.svg";

			const { backgroundColor, borderColor } = statusBadgeStyles[globalStatusValue];

			return (
				<div className="flex items-center justify-center py-[13px]">
					<Tooltip>
						<TooltipTrigger asChild>
							<div
								className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--gp-radius-base)] border border-transparent bg-transparent transition-colors duration-200 hover:bg-[var(--gp-status-hover-bg)] hover:border-[var(--gp-status-hover-border)]"
								style={{
									["--gp-status-hover-bg" as string]: backgroundColor,
									["--gp-status-hover-border" as string]: borderColor,
								}}
							>
								<img
									src={statusIconPath}
									alt="Status"
									className="size-4 shrink-0"
								/>
							</div>
						</TooltipTrigger>
						<CustomTooltipContent side="bottom" sideOffset={-4} align="start">
							<TooltipText title={globalStatusTooltip.title} subtitle={globalStatusTooltip.subtitle} />
						</CustomTooltipContent>
					</Tooltip>
				</div>
			);
		}

		case "battery": {
			if (row.powerStatus === "off") {
				return (
					<div className="flex items-center justify-center py-[13px]">
						<span
							className="inline-flex items-center justify-center px-[7px] rounded-full border text-[14px] leading-[22px] font-[var(--gp-font-text)] font-normal"
							style={{
								backgroundColor: "#EFF1F0",
								borderColor: "#C1C7C4",
								color: "#69726D",
							}}
						>
							??
						</span>
					</div>
				);
			}

			// Parse percentage and show green if > 50%
			const percentValue = row.batteryPercent ? parseInt(row.batteryPercent) : 0;
			const isAbove50 = percentValue > 50;

			const batteryBgColor = isAbove50
				? "#DCECD4"
				: row.battery === "good"
				? "#DCECD4"
				: row.battery === "warning"
				? "#FFECD7"
				: row.battery === "critical"
				? "#FFE3D9"
				: "#FFECD7";

			const batteryBorderColor = isAbove50
				? "#5CA940"
				: row.battery === "good"
				? "#5CA940"
				: row.battery === "warning"
				? "#F4AD49"
				: row.battery === "critical"
				? "#FE5720"
				: "#F4AD49";

			const batteryTextColor = isAbove50
				? "#479F29"
				: row.battery === "good"
				? "#479F29"
				: row.battery === "warning"
				? "#F0A433"
				: row.battery === "critical"
				? "#FE480B"
				: "#F0A433";

			return (
				<div className="flex items-center justify-center py-[13px]">
					<span
						className="inline-flex items-center justify-center px-[7px] rounded-full border text-[14px] leading-[22px] font-[var(--gp-font-text)] font-normal"
						style={{
							backgroundColor: batteryBgColor,
							borderColor: batteryBorderColor,
							color: batteryTextColor,
						}}
					>
						{row.batteryPercent ?? "??"}
					</span>
				</div>
			);
		}

		case "handler": {
			const handlerStatusValue: HandlerStatusValue =
				row.powerStatus === "off"
					? "offline"
					: row.handlerStatus ?? (row.hasHandler ? "connected" : "disconnected");
			const handlerTooltip = getHandlerTooltip(handlerStatusValue, {
				name: row.handlerName,
				phone: row.handlerPhone,
			});
			const showNeutralVisual =
				handlerStatusValue === "offline" || handlerStatusValue === "not_shared";
			const handlerBadgeClass = showNeutralVisual
				? "bg-white border-[#C1C7C4] hover:bg-[#EFF1F0]"
				: "bg-white border-[#FFDED2] hover:bg-[#FFD9CC] hover:border-[#F96636]";
			const shouldOpenPermissionsFromTooltip = handlerTooltip.subtitle.includes(">>");

			return (
				<div className="flex items-center justify-center py-[13px]" data-no-row-click="true">
					<Tooltip>
						<TooltipTrigger asChild>
							<div
								className={`inline-flex items-center gap-[var(--gp-space-s)] px-[10px] py-[5px] rounded-full border transition-[background-color,border-color] duration-200 ${handlerBadgeClass}`}
								data-no-row-click="true"
								onPointerDownCapture={(e) => e.stopPropagation()}
								onClickCapture={(e) => e.stopPropagation()}
								onMouseDown={(e) => e.stopPropagation()}
								onClick={(e) => e.stopPropagation()}
							>
								<img
									src={showNeutralVisual ? "/GrubPac/Table/Row/Cell/users-grey.svg" : "/GrubPac/Table/Row/Cell/users-red.svg"}
									alt="Handler"
									className="size-4 shrink-0"
								/>
							</div>
						</TooltipTrigger>
						<CustomTooltipContent side="bottom" sideOffset={-4} align="end">
							<TooltipText
								title={handlerTooltip.title}
								subtitle={handlerTooltip.subtitle}
								linkStyle={shouldOpenPermissionsFromTooltip}
								boldSubtitle
								titleClassName="text-[var(--gp-color-text-neutral-tertiary)]"
								subtitleClassName="text-[var(--gp-color-text-neutral-tertiary)]"
							/>
						</CustomTooltipContent>
					</Tooltip>
				</div>
			);
		}

		case "lockDetails": {
			const isLocked = row.lockStatus === "locked";
			const bgColor = isLocked ? "#FFECD7" : "white";
			const borderColor = isLocked ? "#F0A433" : "#F0A433";
			const textColor = "#F0A433";
			const lockIcon = isLocked ? "/GrubLock/Table/Grouped/Box/Table/Default/Table/Row/Table/Cell/Token/Grublock.svg" : "/GrubLock/Table/Grouped/Box/Table/Default/Table/Row/Table/Cell/Token/Grublock-Open.svg";
			const text = isLocked ? "GRUBLOCK" : "UNLOCKED";

			return (
				<div className="flex items-center justify-center py-[13px]">
					<button
						type="button"
						disabled={callbacks.isRowLoading}
						onMouseDown={(event) => {
							event.stopPropagation();
						}}
						onClick={(event) => {
							event.stopPropagation();
							callbacks.onLockDetailsClick?.(row, event.currentTarget);
						}}
						className={`inline-flex items-center gap-[var(--gp-space-s)] px-[var(--gp-padding-s)] py-[3px] rounded-full border transition-opacity duration-200 disabled:cursor-progress disabled:opacity-60 ${
							callbacks.isLockDetailsActive ? "ring-4 ring-[#FE572066]" : ""
						}`}
						style={{
							backgroundColor: bgColor,
							borderColor: borderColor,
						}}
						aria-label={isLocked ? "Unlock box options" : "Lock box"}
						aria-busy={callbacks.isRowLoading}
					>
						<img
							src={lockIcon}
							alt=""
							className="size-6 shrink-0"
							aria-hidden
						/>
						<span
							className="font-[var(--gp-font-interactive)] text-[16px] leading-[20px] font-medium uppercase"
							style={{ color: textColor }}
						>
							{text}
						</span>
					</button>
				</div>
			);
		}

		case "actions":
			return (
				<ActionCell className="justify-end w-full" data-no-row-click="true">
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								aria-label="More options"
								data-no-row-click="true"
								className="flex items-center justify-center size-6 rounded-[var(--gp-radius-base)] cursor-pointer focus:outline-none hover:bg-[#EFF1F0] hover:border-2 hover:border-[#C3C9C5] active:bg-[#EFF1F0] active:border-2 active:border-[#C3C9C5] data-[state=open]:bg-[#EFF1F0] data-[state=open]:border-2 data-[state=open]:border-[#C3C9C5]"
								onClick={(e) => e.stopPropagation()}
							>
								<DotsVerticalIcon className="size-3.5" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							sideOffset={8}
							data-no-row-click="true"
							className="bg-white border border-[var(--gp-color-border-neutral-secondary)] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1),4px_4px_8px_0px_rgba(0,0,0,0.12)] p-0 min-w-[200px]"
						>
							<DropdownMenuItem
								data-no-row-click="true"
								onClick={(event) => event.stopPropagation()}
								onSelect={(event) => {
									event.stopPropagation();
									callbacks.onViewDetailsClick?.(row);
								}}
								className="flex items-center gap-[var(--gp-space-m)] px-[var(--gp-space-l)] py-[var(--gp-space-m)] border-t border-[var(--gp-color-border-neutral-secondary)] first:border-t-0 hover:bg-[var(--gp-color-background-interactive-brand-secondary-button-default)] cursor-pointer text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)] font-normal"
							>
								<img src="/GrubLock/dropdown/Dropdown/clipboard-text.svg" alt="View details" className="w-[20px] h-[20px]" />
								<span>View details</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								data-no-row-click="true"
								onClick={(event) => event.stopPropagation()}
								onSelect={(event) => {
									event.stopPropagation();
									callbacks.onViewInGrubPacsClick?.(row);
								}}
								className="flex items-center gap-[var(--gp-space-m)] px-[var(--gp-space-l)] py-[var(--gp-space-m)] border-t border-[var(--gp-color-border-neutral-secondary)] hover:bg-[var(--gp-color-background-interactive-brand-secondary-button-default)] cursor-pointer text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)] font-normal"
							>
								<img src="/GrubLock/dropdown/Dropdown/list.svg" alt="View in GrubPacs list" className="w-[20px] h-[20px]" />
								<span>View in GrubPacs list</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</ActionCell>
			);

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
			className={`bg-white border border-[var(--gp-color-border-neutral-secondary)] rounded-[var(--gp-radius-base)] px-[var(--gp-space-l)] py-[var(--gp-space-m)] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.16)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)] font-normal max-w-none z-[9999] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 ${onClick ? 'cursor-pointer hover:bg-[#F7F8F7]' : ''}`}
			style={{ transform: horizontalOffset !== 0 ? `translateX(${horizontalOffset}px)` : undefined }}
			onClick={onClick}
			{...props}
		>
			{children}
			<TooltipPrimitive.Arrow width={14} height={7} className="fill-white stroke-[var(--gp-color-border-neutral-secondary)] stroke-[1px] z-50" />
		</TooltipPrimitive.Content>
	</TooltipPrimitive.Portal>
);

const TooltipText = ({
	title,
	subtitle,
	linkStyle = false,
	boldSubtitle = false,
	titleClassName,
	subtitleClassName,
}: {
	title: React.ReactNode;
	subtitle?: React.ReactNode;
	linkStyle?: boolean;
	boldSubtitle?: boolean;
	titleClassName?: string;
	subtitleClassName?: string;
}) => (
	<div className="flex flex-col gap-[2px]">
		<div className={`text-[14px] leading-[20px] ${titleClassName ?? "text-[var(--color-neutral-secondary)]"}`}>{title}</div>
		{subtitle ? (
			<div
				className={
					linkStyle
						? "text-[14px] italic leading-[16px] text-[var(--color-brand-default)]"
						: boldSubtitle
						? `text-[14px] font-bold leading-[16px] ${subtitleClassName ?? "text-[var(--color-neutral-secondary)]"}`
						: `text-[14px] leading-[16px] ${subtitleClassName ?? "text-[var(--color-neutral-secondary)]"}`
				}
			>
				{subtitle}
			</div>
		) : null}
	</div>
);
