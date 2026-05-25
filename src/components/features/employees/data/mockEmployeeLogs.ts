import type { ApiSystemLog } from "@/types/domain/system-logs";

const mockEmployeeLogs: ApiSystemLog[] = [
	{
		id: "emp-log-1",
		createdAt: "2025-06-06T10:45:20Z",
		type: "Update",
		description: "Account created and assigned to Operations",
		category: "employee",
	},
	{
		id: "emp-log-2",
		createdAt: "2025-06-06T10:47:40Z",
		type: "Suspension",
		description: "Account suspended due to policy review",
		category: "employee",
	},
	{
		id: "emp-log-3",
		createdAt: "2025-06-07T08:12:05Z",
		type: "Activation",
		description: "Employee account reactivated and marked as active",
		category: "employee",
	},
	{
		id: "emp-log-4",
		createdAt: "2025-06-07T09:30:11Z",
		type: "Assignment",
		description: "Employee assigned to Pizza Place restaurant",
		category: "employee",
	},
	{
		id: "emp-log-5",
		createdAt: "2025-06-07T09:45:33Z",
		type: "Connection status",
		description: "Connected to GrubPac 3221",
		category: "employee",
	},
];

export default mockEmployeeLogs;
