"use client";

import { FiEdit3, FiXCircle, FiTrash2, FiFileText } from "react-icons/fi";
import {
	EmployeeDataTable,
	type EmployeeRow,
	type ColumnId,
} from "../table/employee-data-table";
import type { EmployeeGroup } from "@/types";
import type { Employee } from "@/types/domain/employees";
import type { GroupCollapseTableGroup } from "@/types/ui";
import type { SuspendedEmployee } from "../types";

type BoxGroupType = "connected" | "disconnected" | "manager";

function groupNameToBoxGroupType(groupName: string): BoxGroupType | undefined {
	const normalized = groupName.trim().toLowerCase();
	if (normalized === "box connected") return "connected";
	if (normalized === "box disconnected") return "disconnected";
	if (normalized === "manager" || normalized === "managers") return "manager";
	return undefined;
}

function employeeToRow(
	employee: Employee,
	boxGroupType?: BoxGroupType,
): EmployeeRow {
	const identifier = `#${employee.employeeId} | Joined ${employee.joinedDate}${employee.restaurantName ? ` | ${employee.restaurantName}` : ""}`;
	return {
		id: employee.id,
		name: employee.name,
		identifier,
		role: employee.role as "Manager" | "Driver",
		added: employee.added,
		suspended: employee.status === "Suspended" ? employee.added : undefined,
		status: employee.status === "Suspended" ? "suspended" : "active",
		boxCount: employee.boxCount,
		boxConnected: employee.boxCount > 0,
		boxDetails: employee.boxDetails,
		boxGroupType,
		connectedBoxesStatus: employee.connectedBoxesStatus,
		handlerBox: employee.handlerBox,
		contactInfo: {
			email: employee.email,
			phone: employee.phone,
		},
	};
}

function suspendedEmployeeToRow(employee: SuspendedEmployee): EmployeeRow {
	const identifier = `#${employee.employeeId}${employee.restaurantName ? ` | ${employee.restaurantName}` : ""}`;
	return {
		id: employee.id,
		name: employee.name,
		identifier,
		role: employee.role as "Manager" | "Driver",
		added: employee.added,
		suspended: employee.suspended,
		status: "suspended",
		boxCount: 0,
		boxConnected: false,
	};
}

type ActiveGroupTableProps = {
	mode: "active";
	group: EmployeeGroup;
	onRowClick?: (employee: Employee) => void;
	onEdit?: (employee: Employee) => void;
	onDelete?: (employee: Employee) => void;
	onSuspend?: (employee: Employee) => void;
	onViewLogs?: (employee: Employee) => void;
	onViewDetails?: (employee: Employee) => void;
	onViewAllBoxes?: (employee: Employee) => void;
};

type SuspendedGroupTableProps = {
	mode: "suspended";
	group: GroupCollapseTableGroup<SuspendedEmployee>;
	onRowClick?: (employee: SuspendedEmployee) => void;
	onActivate?: (employeeId: string) => void;
	onDelete?: (employeeId: string) => void;
};

type EmployeeGroupTableProps = (
	| ActiveGroupTableProps
	| SuspendedGroupTableProps
) & {
	onRowSelect?: (id: string, selected: boolean) => void;
	selectedIds?: Set<string>;
};

const ACTIVE_COLUMNS: ColumnId[] = [
	"name",
	"message",
	"role",
	"box",
	"added",
	"actions",
];
const SUSPENDED_COLUMNS: ColumnId[] = [
	"name",
	"message",
	"role",
	"added",
	"suspended",
	"actions",
];

export default function EmployeeGroupTable(props: EmployeeGroupTableProps) {
	const { onRowSelect, selectedIds = new Set() } = props;

	const handleSelectionChange = (ids: Set<string>, itemIds: string[]) => {
		if (!onRowSelect) return;
		itemIds.forEach((id) => {
			const shouldBeSelected = ids.has(id);
			const isSelected = selectedIds.has(id);
			if (shouldBeSelected !== isSelected) {
				onRowSelect(id, shouldBeSelected);
			}
		});
	};

	if (props.mode === "suspended") {
		const items = props.group.items ?? [];
		const data = items.map(suspendedEmployeeToRow);
		return (
			<div className="bg-white">
				<EmployeeDataTable
					data={data}
					columns={SUSPENDED_COLUMNS}
					selectedIds={selectedIds}
					onSelectionChange={(ids) =>
						handleSelectionChange(
							ids,
							items.map((e) => e.id),
						)
					}
					onActivate={
						props.onActivate
							? (row) => props.onActivate!(row.id)
							: undefined
					}
					onDelete={
						props.onDelete
							? (row) => props.onDelete!(row.id)
							: undefined
					}
					onAllBoxes={undefined}
					onMenuClick={
						props.onRowClick
							? (row) =>
									props.onRowClick!(
										items.find((e) => e.id === row.id)!,
									)
							: undefined
					}
				/>
			</div>
		);
	}

	// mode === "active"
	const items = props.group.items ?? [];
	const groupName =
		typeof props.group.name === "string" ? props.group.name : "";
	const boxGroupType = groupNameToBoxGroupType(groupName);
	const data = items.map((employee) => employeeToRow(employee, boxGroupType));
	const {
		onRowClick,
		onEdit,
		onDelete,
		onSuspend,
		onViewLogs,
		onViewDetails,
		onViewAllBoxes,
	} = props;

	const getMenuItems = (
		row: EmployeeRow,
	): import("@/components/ui/ActionsMenu").ActionsMenuItem[] => {
		const employee = items.find((e) => e.id === row.id);
		if (!employee) return [];

		const menuItems: import("@/components/ui/ActionsMenu").ActionsMenuItem[] =
			[];

		if (onEdit) {
			menuItems.push({
				label: "Edit employee details",
				icon: <FiEdit3 className="w-5 h-5" />,
				onClick: () => onEdit(employee),
			});
		}

		if (onViewLogs) {
			menuItems.push({
				label: "View logs",
				icon: <FiFileText className="w-5 h-5" />,
				onClick: () => onViewLogs(employee),
			});
		}

		if (onSuspend) {
			menuItems.push({
				label: "Suspend employee",
				icon: <FiXCircle className="w-5 h-5" />,
				onClick: () => onSuspend(employee),
			});
		}

		if (onDelete) {
			menuItems.push({
				label: "Delete employee",
				icon: <FiTrash2 className="w-5 h-5" />,
				onClick: () => onDelete(employee),
			});
		}

		return menuItems;
	};

	return (
		<div className="bg-white">
			<EmployeeDataTable
				data={data}
				columns={ACTIVE_COLUMNS}
				selectedIds={selectedIds}
				onSelectionChange={(ids) =>
					handleSelectionChange(
						ids,
						items.map((e) => e.id),
					)
				}
				onActivate={undefined}
				onDelete={
					onDelete
						? (row) => onDelete(items.find((e) => e.id === row.id)!)
						: undefined
				}
				onAllBoxes={
					onViewAllBoxes
						? (row) =>
								onViewAllBoxes(
									items.find((e) => e.id === row.id)!,
								)
						: undefined
				}
				onMenuClick={
					onRowClick
						? (row) =>
								onRowClick(items.find((e) => e.id === row.id)!)
						: undefined
				}
				onEditEmployee={
					onEdit
						? (row) => onEdit(items.find((e) => e.id === row.id)!)
						: undefined
				}
				onViewLogs={
					onViewLogs
						? (row) =>
								onViewLogs(items.find((e) => e.id === row.id)!)
						: undefined
				}
				onViewDetails={
					onViewDetails
						? (row) =>
								onViewDetails(
									items.find((e) => e.id === row.id)!,
								)
						: undefined
				}
				onSuspendEmployee={
					onSuspend
						? (row) =>
								onSuspend(items.find((e) => e.id === row.id)!)
						: undefined
				}
				onDeleteEmployee={
					onDelete
						? (row) => onDelete(items.find((e) => e.id === row.id)!)
						: undefined
				}
			/>
		</div>
	);
}
