export type BoxState = "offline" | "unreachable" | "online";
export type Tab = "settings" | "logs" | "track";
export type BadgeVariant = "green" | "red" | "orange" | "gray";

export interface LogEntry {
  id: string;
  timestamp: string;
  type: string;
  category: "System log" | "Action log";
  action: string;
  actionHighlight?: boolean;
  actorName?: string;
  actorRole?: string;
  subjectName?: string;
}
