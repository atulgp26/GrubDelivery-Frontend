export interface ApiEmployeeLogActor {
	id: string;
	name: string;
	role?: string;
	table?: string;
	ip?: string;
}

export interface ApiEmployeeLogSubject {
	id: string;
	name: string;
	type?: string;
}

export interface ApiEmployeeLog {
	id: string;
	category: string;
	type: string;
	description: string;
	actor?: ApiEmployeeLogActor;
	subject?: ApiEmployeeLogSubject;
	metadata?: Record<string, unknown>;
	createdAt?: string;
	created_at?: string;
	updatedAt?: string;
}

export interface EmployeeLogsListData {
	logs: ApiEmployeeLog[];
	page: number;
	limit: number;
	total: number;
}

export interface EmployeeLogsFilterItem {
	category: string;
	types?: string[];
}

export interface EmployeeLogsListRequest {
	limit?: number;
	page?: number;
	filters?: EmployeeLogsFilterItem[];
	query?: string;
	search?: string;
	start_date?: string;
	end_date?: string;
	actor_id?: string;
	subject_id?: string;
}

export interface EmployeeLogsDropdownData {
	categories: string[];
	types: string[];
	mapping: Record<string, string[]>;
}