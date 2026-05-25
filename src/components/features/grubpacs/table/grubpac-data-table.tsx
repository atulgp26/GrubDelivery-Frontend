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
import { CheckboxCell, ActionCell, DotsVerticalIcon } from "@/components/ui/data-table-cells";
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
import {
	getGlobalStatusTooltip,
	getHandlerTooltip,
	getPowerStatusTooltip,
	type GlobalStatusValue,
	type HandlerStatusValue,
	type PowerStatusValue,
} from "@/components/features/grubpacs/utils/grubPacsTooltipUtils";
import { getLockSrc, getStatusIconSrc } from "@/components/features/grubpacs/utils/boxSettingsUtils";
import type { GrubPacItem } from "@/types/domain/grubpacs";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export type GrubPacDataColumnId = "name" | "status" | "power" | "battery" | "settings" | "handler" | "added" | "actions";

export interface GrubPacDataRow {
	id: string;
	name: string;
	/** Subtitle e.g. "#DL12345 | DL2BD1234" or with restaurant name */
	identifier?: string;
	/** Canonical lock state from API */
	grublockStatus?: "locked" | "unlocked" | "not_available" | "offline";
	/** Lock status: true (locked), false (unlocked), undefined (grey/unknown) */
	isLocked?: boolean;
	/** Whether the box has lock hardware available */
	hasLock?: boolean;
	/** Power status: "on" | "off" | "unknown" */
	powerStatus?: "on" | "off" | "unknown";
	/** Health status: "good" | "warning" | "critical" | "unknown" */
	healthStatus?: "good" | "warning" | "critical" | "unknown";
	/** API global status used for icon tooltip copy */
	globalStatus?: "power_off" | "ready" | "critical" | "attention" | "unknown";
	/** Battery percentage or status */
	batteryPercent?: string | number;
	/** Battery text like "ON", "OFF", "??" */
	batteryText?: string;
	/** Battery color status for badge */
	batteryStatus?: "good" | "warning" | "critical" | "unknown";
	/** Ioniser settings (e.g. "Ioniser turned ON") */
	ioniserStatus?: string;
	/** Zone temperature info (e.g. "Zone 1 : 4°c | Zone 2 : 25°c") */
	zoneTemp?: string;
	/** Handler/Driver assigned status */
	hasHandler?: boolean;
	/** API handler status for hover tooltip */
	handlerStatus?: "connected" | "disconnected" | "not_shared" | "offline" | "unknown";
	handlerName?: string;
	handlerPhone?: string;
	accessMode?: "public" | "all_employees" | "restaurant_employees";
	blockedEmployeeIds?: string[];
	/** When was the box added */
	added?: string;
}

export interface GrubPacDataTableProps {
	data: GrubPacDataRow[];
	/** Column IDs to display. */
	columns: GrubPacDataColumnId[];
	/** When true, shows checkboxes for row selection */
	selectable?: boolean;
	selectedIds?: Set<string>;
	onSelectionChange?: (ids: Set<string>) => void;
	onRowClick?: (row: GrubPacDataRow) => void;
	onLockIconClick?: (row: GrubPacDataRow) => void;
	/** When true, shows empty settings with "-" instead of hiding them */
	showEmptySettings?: boolean;
	className?: string;
	onEditBoxDetails?: (row: GrubPacDataRow) => void;
	onCheckPermissions?: (row: GrubPacDataRow) => void;
	onViewSettings?: (row: GrubPacDataRow) => void;
	onSuspendBox?: (row: GrubPacDataRow) => void;
	onRemoveBox?: (row: GrubPacDataRow) => void;
}

/* ========================
   Predefined column definitions
   ======================== */
interface ColumnDef {
	id: GrubPacDataColumnId;
	header: string;
	width?: string | number;
	centered?: boolean;
}

const COLUMN_DEFS: Record<GrubPacDataColumnId, ColumnDef> = {
	name: { id: "name", header: "Name" },
	status: { id: "status", header: "", width: 40, centered: true },
	power: { id: "power", header: "Power", centered: true },
	battery: { id: "battery", header: "Battery", width: 160, centered: true },
	settings: { id: "settings", header: "Settings", width: 280 },
	handler: { id: "handler", header: "Handler", width: 100, centered: true },
	added: { id: "added", header: "Added", width: 120, centered: true },
	actions: { id: "actions", header: "", width: 80, centered: true },
};

/* ========================
   Component
   ======================== */
export function GrubPacDataTable({
	data,
	columns,
	selectable = false,
	selectedIds: controlledSelectedIds,
	onSelectionChange,
	onRowClick,
	onLockIconClick,
	showEmptySettings = false,
	className,
	onEditBoxDetails,
	onCheckPermissions,
	onViewSettings,
	onSuspendBox,
	onRemoveBox,
}: GrubPacDataTableProps) {
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

	const handleRowClick = (row: GrubPacDataRow, e: React.MouseEvent) => {
		const target = e.target as HTMLElement;
		const ignoreClick = target.closest('input[type="checkbox"]') || 
							target.closest("button") || 
							target.closest('[role="button"]') ||
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
								<div className="flex items-center gap-[var(--gp-space-m)]">
									<CheckboxCell
										checked={headerCheckboxState}
										onChange={toggleAll}
										isHeader
									/>
									<span
										className="font-[var(--gp-font-text)] text-[var(--gp-color-text-neutral-tertiary)]"
										style={{ 
											fontWeight: 400,
											fontSize: 'var(--gp-font-size-small-m, 14px)',
											lineHeight: 'var(--gp-line-height-regular-small-m, 22px)'
										}}
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
						className={onRowClick ? "cursor-pointer hover:bg-[var(--gp-color-bg-row-hover)] min-h-[84px]" : "min-h-[84px]"}
						onClick={(e) => handleRowClick(row, e)}
					>
						{colDefs.map((col) => (
							<DataTableCell
								key={col.id}
								width={col.width}
								className={col.centered ? "text-center p-0" : "p-0"}
								onClick={col.id === "actions" ? (e) => e.stopPropagation() : undefined}
							>
								{renderCell(col.id, row, { selectedIds, toggleRow, showCheckbox, showEmptySettings, onLockIconClick, onEditBoxDetails, onCheckPermissions, onViewSettings, onSuspendBox, onRemoveBox })}
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
	showEmptySettings?: boolean;
	onLockIconClick?: (row: GrubPacDataRow) => void;
	onEditBoxDetails?: (row: GrubPacDataRow) => void;
	onCheckPermissions?: (row: GrubPacDataRow) => void;
	onViewSettings?: (row: GrubPacDataRow) => void;
	onSuspendBox?: (row: GrubPacDataRow) => void;
	onRemoveBox?: (row: GrubPacDataRow) => void;
}

function renderCell(
	columnId: GrubPacDataColumnId,
	row: GrubPacDataRow,
	callbacks: RenderCellCallbacks
): React.ReactNode {
	const globalStatusValue: GlobalStatusValue =
		row.globalStatus === "power_off" ||
		row.globalStatus === "ready" ||
		row.globalStatus === "critical" ||
		row.globalStatus === "attention"
			? row.globalStatus
			: "unknown";

	const powerStatusValue: PowerStatusValue =
		row.powerStatus === "on" || row.powerStatus === "off" ? row.powerStatus : "unknown";

	const handlerStatusValue: HandlerStatusValue =
		row.powerStatus === "off"
			? "offline"
			: row.handlerStatus === "connected" ||
			  row.handlerStatus === "disconnected" ||
			  row.handlerStatus === "not_shared" ||
			  row.handlerStatus === "offline"
			? row.handlerStatus
			: row.hasHandler
			? "connected"
			: "disconnected";

	const globalStatusTooltip = getGlobalStatusTooltip(globalStatusValue);
	const powerStatusTooltip = getPowerStatusTooltip(powerStatusValue);
	const handlerTooltip = getHandlerTooltip(handlerStatusValue, {
		name: row.handlerName,
		phone: row.handlerPhone,
	});

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
			subtitle: "Visit GrubLock for details >>",
			showLink: true,
		},
		not_available: {
			title: "Feature not available",
		},
		offline: {
			title: "Switch on the box to access",
		},
		unlocked: {
			title: "Box is unlocked.",
			subtitle: "Visit GrubLock for details >>",
			showLink: true,
		},
	};

	const lockTooltip = lockTooltipByState[lockState];

	const sidebarIconItem: GrubPacItem = {
		id: row.id,
		locked: lockState === "locked" ? true : lockState === "unlocked" ? false : undefined,
		hasLock: row.hasLock,
		grublockStatus: lockState,
		power: powerStatusValue === "on" ? "ON" : powerStatusValue === "off" ? "OFF" : undefined,
		powerStatus: powerStatusValue === "on" ? "ON" : powerStatusValue === "off" ? "OFF" : "UNKNOWN",
		status:
			globalStatusValue === "critical"
				? "ERROR"
				: globalStatusValue === "attention"
				? "WARNING"
				: globalStatusValue === "power_off"
				? "OFFLINE"
				: "ONLINE",
		globalStatus: globalStatusValue,
	};

	const lockIconPath = getLockSrc(sidebarIconItem);
	const statusIconPath = getStatusIconSrc(sidebarIconItem);

	switch (columnId) {
		case "name": {
			return (
				<div className="flex items-start gap-[var(--gp-space-m)] px-[var(--gp-padding-l)] py-[var(--gp-padding-l)]">
					{callbacks.showCheckbox && (
						<CheckboxCell
							checked={callbacks.selectedIds.has(row.id)}
							onChange={() => callbacks.toggleRow(row.id)}
							className="mt-0.5"
						/>
					)}
			<div className="flex items-start gap-[var(--gp-text-spacing-narrow)]">
						<Tooltip>
							<TooltipTrigger asChild>
								<div
									role="button"
									tabIndex={0}
									className="rounded-[var(--gp-radius-md)] p-[2px] hover:bg-[var(--gp-color-bg-colored-secondary)] cursor-pointer transition-colors duration-200"
									onClick={(e) => {
										e.stopPropagation();
										e.preventDefault();
										callbacks.onLockIconClick?.(row);
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.stopPropagation();
											e.preventDefault();
											callbacks.onLockIconClick?.(row);
										}
									}}
								>
									<img
										src={lockIconPath}
										alt="Lock status"
										className="size-6 shrink-0 pointer-events-none"
										draggable={false}
									/>
								</div>
							</TooltipTrigger>
							<CustomTooltipContent side="bottom" sideOffset={-4} align="start">
								<TooltipText
									title={lockTooltip.title}
									subtitle={lockTooltip.subtitle}
									linkStyle={Boolean(lockTooltip.showLink)}
									boldSubtitle
									onSubtitleClick={
										lockTooltip.showLink
											? () => callbacks.onLockIconClick?.(row)
											: undefined
									}
								/>
							</CustomTooltipContent>
						</Tooltip>
						<div className="flex flex-col gap-[var(--gp-text-spacing-narrow)] flex-1 min-w-0">
							<span
								className="font-[var(--gp-font-heading)] text-[var(--gp-color-text-neutral-secondary)] truncate whitespace-nowrap"
								style={{ 
									fontWeight: 600,
									fontSize: 'var(--gp-font-size-small-l, 16px)',
									lineHeight: 'var(--gp-line-height-regular-small-l, 24px)'
								}}
							>
								{row.name}
							</span>
							{row.identifier && (
								<span
									className="font-[var(--gp-font-text)] text-[var(--gp-color-text-neutral-tertiary)] break-words [overflow-wrap:anywhere]"
									style={{ 
										fontWeight: 400,
										fontSize: 'var(--gp-font-size-small-m, 14px)',
										lineHeight: 'var(--gp-line-height-regular-small-m, 22px)'
									}}
								>
									{row.identifier}
								</span>
							)}
						</div>
					</div>
				</div>
			);
		}

		case "status": {
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

			const { backgroundColor, borderColor } = statusBadgeStyles[globalStatusValue];

			return (
				<div className="flex items-center justify-center py-[var(--gp-padding-l)]">
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

		case "power": {
			const { powerStatus } = row;
			
			// Determine badge styling based on power status
			let bgColor = "#EFF1F0";
			let borderColor = "#C1C7C4";
			let textColor = "#69726D";
			let displayText = "??";
			
			if (powerStatus === "on") {
				bgColor = "#DCECD4";
				borderColor = "#5CA940";
				textColor = "#479F29";
				displayText = "ON";
			} else if (powerStatus === "off") {
				bgColor = "#FFE3D9";
				borderColor = "#FE5720";
				textColor = "#FE480B";
				displayText = "OFF";
			}

			return (
				<div className="flex items-center justify-center py-[var(--gp-padding-l)]">
					<Tooltip>
						<TooltipTrigger asChild>
							<span
								className="inline-flex items-center justify-center px-[var(--gp-padding-s)] py-[4px] rounded-[var(--gp-radius-full)] border font-[var(--gp-font-interactive)] font-medium uppercase"
								style={{
									backgroundColor: bgColor,
									borderColor: borderColor,
									color: textColor,
									fontSize: 'var(--gp-font-size-small-m, 14px)',
									lineHeight: 'var(--gp-line-height-narrow-small-m, 16px)',
								}}
							>
								{displayText}
							</span>
						</TooltipTrigger>
						<CustomTooltipContent side="bottom" sideOffset={-4} align="start">
							<TooltipText title={powerStatusTooltip.title} subtitle={powerStatusTooltip.subtitle} />
						</CustomTooltipContent>
					</Tooltip>
				</div>
			);
		}

		case "battery": {
			const { batteryPercent, powerStatus } = row;
			
			// If powered off, show ??
			if (powerStatus === "off") {
				return (
					<div className="flex items-center justify-center py-[var(--gp-padding-l)]">
						<span
							className="inline-flex items-center justify-center px-[7px] rounded-full border font-[var(--gp-font-text)] font-normal"
							style={{
								backgroundColor: "#EFF1F0",
								borderColor: "#C1C7C4",
								color: "#69726D",
								fontSize: '14px',
								lineHeight: '22px',
							}}
						>
							??
						</span>
					</div>
				);
			}
			
			// Parse percentage and determine color
			const percentValue = batteryPercent ? (typeof batteryPercent === 'string' ? parseInt(batteryPercent) : batteryPercent) : 0;
			const isAbove50 = percentValue > 50;

			const batteryBgColor = isAbove50 ? "#DCECD4" : row.batteryStatus === "good" ? "#DCECD4" : row.batteryStatus === "warning" ? "#FFECD7" : row.batteryStatus === "critical" ? "#FFE3D9" : "#FFECD7";
			const batteryBorderColor = isAbove50 ? "#5CA940" : row.batteryStatus === "good" ? "#5CA940" : row.batteryStatus === "warning" ? "#F4AD49" : row.batteryStatus === "critical" ? "#FE5720" : "#F4AD49";
			const batteryTextColor = isAbove50 ? "#479F29" : row.batteryStatus === "good" ? "#479F29" : row.batteryStatus === "warning" ? "#F0A433" : row.batteryStatus === "critical" ? "#FE480B" : "#F0A433";

			const displayText = batteryPercent ? `${batteryPercent}%` : "??";

			return (
				<div className="flex items-center justify-center py-[var(--gp-padding-l)]">
					<span
						className="inline-flex items-center justify-center px-[7px] rounded-full border font-[var(--gp-font-text)] font-normal"
						style={{
							backgroundColor: batteryBgColor,
							borderColor: batteryBorderColor,
							color: batteryTextColor,
							fontSize: '14px',
							lineHeight: '22px',
						}}
					>
						{displayText}
					</span>
				</div>
			);
		}

		case "settings": {
			const { ioniserStatus, zoneTemp } = row;
			const showEmpty = callbacks.showEmptySettings;
			
			// If showEmpty is false and both are empty, show just a simple dash
			if (!showEmpty && !ioniserStatus && !zoneTemp) {
				return (
					<div className="px-[var(--gp-padding-l)] py-[var(--gp-padding-l)]">
						<span className="text-[var(--gp-color-text-neutral-secondary)]">-</span>
					</div>
				);
			}
			
			// Otherwise show rows with icons for available data
			return (
				<div className="flex flex-col gap-[var(--gp-text-spacing-narrow)] px-[var(--gp-padding-l)] py-[var(--gp-padding-l)]">
					{ioniserStatus && (
						<div className="flex items-center gap-[var(--gp-text-spacing-regular)] text-[var(--gp-color-text-neutral-secondary)]">
							<img
								src="/GrubPac/Table/Row/Cell/virus-covid-19.svg"
								alt="Ioniser"
								className="size-4 shrink-0"
								aria-hidden
							/>
							<span 
								className="font-[var(--gp-font-text)]" 
								style={{ 
									fontWeight: 400,
									fontSize: 'var(--gp-font-size-small-m, 14px)',
									lineHeight: 'var(--gp-line-height-regular-small-m, 22px)'
								}}
							>
								{ioniserStatus}
							</span>
						</div>
					)}
					{zoneTemp && (
						<div className="flex items-center gap-[var(--gp-text-spacing-regular)] text-[var(--gp-color-text-neutral-secondary)]">
							<img
								src="/GrubPac/Table/Row/Cell/thermometer.svg"
								alt="Temperature"
								className="size-4 shrink-0"
								aria-hidden
							/>
							<span 
								className="font-[var(--gp-font-text)]" 
								style={{ 
									fontWeight: 400,
									fontSize: 'var(--gp-font-size-small-m, 14px)',
									lineHeight: 'var(--gp-line-height-regular-small-m, 22px)'
								}}
							>
								{zoneTemp}
							</span>
						</div>
					)}
					{showEmpty && !ioniserStatus && (
						<div className="flex items-center gap-[var(--gp-text-spacing-regular)] text-[var(--gp-color-text-neutral-secondary)]">
							<img
								src="/GrubPac/Table/Row/Cell/virus-covid-19.svg"
								alt="Ioniser"
								className="size-4 shrink-0"
								aria-hidden
							/>
							<span 
								className="font-[var(--gp-font-text)]" 
								style={{ 
									fontWeight: 400,
									fontSize: 'var(--gp-font-size-small-m, 14px)',
									lineHeight: 'var(--gp-line-height-regular-small-m, 22px)'
								}}
							>
								-
							</span>
						</div>
					)}
					{showEmpty && !zoneTemp && (
						<div className="flex items-center gap-[var(--gp-text-spacing-regular)] text-[var(--gp-color-text-neutral-secondary)]">
							<img
								src="/GrubPac/Table/Row/Cell/thermometer.svg"
								alt="Temperature"
								className="size-4 shrink-0"
								aria-hidden
							/>
							<span 
								className="font-[var(--gp-font-text)]" 
								style={{ 
									fontWeight: 400,
									fontSize: 'var(--gp-font-size-small-m, 14px)',
									lineHeight: 'var(--gp-line-height-regular-small-m, 22px)'
								}}
							>
								-
							</span>
						</div>
					)}
				</div>
			);
		}

		case "handler": {
			const showNeutralVisual =
				handlerStatusValue === "offline" || handlerStatusValue === "not_shared";
			const handlerBadgeClass = showNeutralVisual
				? "bg-white border-[#C1C7C4] hover:bg-[#EFF1F0]"
				: "bg-white border-[#FFDED2] hover:bg-[#FFD9CC] hover:border-[#F96636]";
			const shouldOpenPermissionsFromTooltip = handlerTooltip.subtitle.includes(">>");
		return (
			<div className="flex items-center justify-center py-[var(--gp-padding-l)]" data-no-row-click="true">
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
							onSubtitleClick={
								shouldOpenPermissionsFromTooltip
									? () => callbacks.onCheckPermissions?.(row)
									: undefined
							}
						/>
					</CustomTooltipContent>
				</Tooltip>
			</div>
		);
	}

	case "added": {
		return (
			<div className="flex items-center justify-center px-[var(--gp-padding-l)] py-[var(--gp-padding-l)]">
				<span
					className="font-[var(--gp-font-text)] text-[var(--gp-color-text-neutral-secondary)]"
					style={{ 
						fontWeight: 400,
						fontSize: 'var(--gp-font-size-small-l, 16px)',
						lineHeight: 'var(--gp-line-height-regular-small-l, 24px)'
					}}
				>
					{row.added || "-"}
				</span>
			</div>
		);
	}

		case "actions":
			return (
				<ActionCell className="justify-end w-full pr-[var(--gp-padding-l)]">
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								aria-label="More options"
								className="flex items-center justify-center size-6 rounded-[var(--gp-radius-base)] cursor-pointer focus:outline-none hover:bg-[#EFF1F0] hover:border-2 hover:border-[#C3C9C5] active:bg-[#EFF1F0] active:border-2 active:border-[#C3C9C5] data-[state=open]:bg-[#EFF1F0] data-[state=open]:border-2 data-[state=open]:border-[#C3C9C5]"
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
						onSelect={() => callbacks.onEditBoxDetails?.(row)}
								className="flex items-center gap-[var(--gp-space-m)] px-[var(--gp-padding-l)] py-[var(--gp-padding-m)] border-t border-[var(--gp-color-border-neutral-secondary)] first:border-t-0 hover:bg-[var(--gp-color-background-interactive-brand-secondary-button-default)] cursor-pointer text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)] font-normal"
							>
								<img src="/GrubPac/Dropdown/pen-line.svg" alt="" className="size-5 shrink-0" aria-hidden />
								<span>Edit box details</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onSelect={() => callbacks.onCheckPermissions?.(row)}
								className="flex items-center gap-[var(--gp-space-m)] px-[var(--gp-padding-l)] py-[var(--gp-padding-m)] border-t border-[var(--gp-color-border-neutral-secondary)] hover:bg-[var(--gp-color-background-interactive-brand-secondary-button-default)] cursor-pointer text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)] font-normal"
							>
								<img src="/GrubPac/Dropdown/shield-check.svg" alt="" className="size-5 shrink-0" aria-hidden />
								<span>Check permissions</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onSelect={() => callbacks.onViewSettings?.(row)}
								className="flex items-center gap-[var(--gp-space-m)] px-[var(--gp-padding-l)] py-[var(--gp-padding-m)] border-t border-[var(--gp-color-border-neutral-secondary)] hover:bg-[var(--gp-color-background-interactive-brand-secondary-button-default)] cursor-pointer text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)] font-normal"
							>
								<img src="/GrubPac/Dropdown/clipboard-text.svg" alt="" className="size-5 shrink-0" aria-hidden />
								<span>View settings</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onSelect={() => callbacks.onSuspendBox?.(row)}
								className="flex items-center gap-[var(--gp-space-m)] px-[var(--gp-padding-l)] py-[var(--gp-padding-m)] border-t border-[var(--gp-color-border-neutral-secondary)] hover:bg-[var(--gp-color-background-interactive-brand-secondary-button-default)] cursor-pointer text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)] font-normal"
							>
								<img src="/GrubPac/Dropdown/x-circle.svg" alt="" className="size-5 shrink-0" aria-hidden />
								<span>Suspend box</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onSelect={() => callbacks.onRemoveBox?.(row)}
								className="flex items-center gap-[var(--gp-space-m)] px-[var(--gp-padding-l)] py-[var(--gp-padding-m)] border-t border-[var(--gp-color-border-neutral-secondary)] hover:bg-[var(--gp-color-background-interactive-brand-secondary-button-default)] cursor-pointer text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-secondary)] font-normal"
							>
								<img src="/GrubPac/Dropdown/trash.svg" alt="" className="size-5 shrink-0" aria-hidden />
								<span>Remove box</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</ActionCell>
			);

		default:
			return null;
	}
}

const CustomTooltipContent = ({ children, side = "bottom", sideOffset = 8, align = "start", alignOffset = 0, horizontalOffset = 0, ...props }: {
	children: React.ReactNode;
	side?: "top" | "right" | "bottom" | "left";
	sideOffset?: number;
	align?: "start" | "center" | "end";
	alignOffset?: number;
	horizontalOffset?: number;
}) => (
	<TooltipPrimitive.Portal>
		<TooltipPrimitive.Content
			side={side}
			sideOffset={sideOffset}
			align={align}
			alignOffset={alignOffset}
			className="bg-white border border-[var(--gp-color-border-neutral-secondary)] rounded-[var(--gp-radius-base)] px-[var(--gp-space-l)] py-[var(--gp-space-m)] shadow-[var(--gp-shadow-tooltip)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)] font-normal max-w-none z-[9999] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
			style={{ transform: horizontalOffset !== 0 ? `translateX(${horizontalOffset}px)` : undefined }}
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
	onSubtitleClick,
}: {
	title: React.ReactNode;
	subtitle?: string;
	linkStyle?: boolean;
	boldSubtitle?: boolean;
	titleClassName?: string;
	subtitleClassName?: string;
	onSubtitleClick?: () => void;
}) => (
	<div className="flex flex-col gap-[2px]">
		<div
			className={`text-[14px] leading-[20px] text-[var(--color-neutral-secondary)] ${titleClassName ?? ""}`}
		>
			{title}
		</div>
		{subtitle ? (
			linkStyle ? (
				<button
					type="button"
					data-no-row-click="true"
					onMouseDown={(e) => e.stopPropagation()}
					onClick={(e) => {
						e.stopPropagation();
						onSubtitleClick?.();
					}}
					className="text-right text-[16px] font-semibold italic leading-[22px] text-[#FE480B] hover:underline cursor-pointer"
				>
					{subtitle}
				</button>
			) : (
				<div
					className={`text-right text-[16px] leading-[22px] text-[var(--color-neutral-secondary)] ${boldSubtitle ? "font-semibold" : "font-normal"} ${subtitleClassName ?? ""}`}
				>
					{subtitle}
				</div>
			)
		) : null}
	</div>
);
