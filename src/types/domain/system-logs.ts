export interface ApiLogActor {
  id: string;
  name: string;
  role?: string;
  table?: string;
  ip?: string;
}

export interface ApiLogSubject {
  id: string;
  name: string;
  type?: string;
}

export interface ApiSystemLog {
  id: string;
  category: string;
  type: string;
  description: string;
  actor?: ApiLogActor;
  subject?: ApiLogSubject;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
}

export interface SystemLogsListData {
  logs: ApiSystemLog[];
  page: number;
  limit: number;
  total: number;
}

export interface SystemLogsFilterItem {
  category: string;
  types?: string[];
}

export interface SystemLogsListRequest {
  limit?: number;
  page?: number;
  category?: string;
  filters?: SystemLogsFilterItem[];
  query?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  actor_id?: string;
  subject_id?: string;
  log_id?: string;
}

export interface SystemLogsDropdownData {
  categories: string[];
  types: string[];
  mapping: Record<string, string[]>;
}
