"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { LogEntry } from "./types";
import type { ApiSystemLog } from "@/types/domain/system-logs";
import logsService from "@/services/logs";

export const SYSTEM_LOG_TYPES = [
  "Creation", "Deletion", "Suspension", "Activation", "Updation",
  "Status", "Box status", "Connection status", "Door status", "Alerts",
];

export const ACTION_LOG_TYPES = [
  "Assignment", "Reassignment", "Ownership", "GrubLock", 
  "Temperature set", "Temp. self check", "Ioniser status", 
  "Battery status", "Battery self check", "Emergency unlock", "OTP",
  "Access", "Employee mgmt.", "Box mgmt.", "Restaurant mgmt.",
];

const LOG_TYPE_ICON: Record<string, string> = {
  "Activation":         "/GrubPac/Box-settings/check-circle.svg",
  "Creation":           "/GrubPac/Box-settings/check-circle.svg",
  "Deletion":           "/GrubPac/Box-settings/minus-circle.svg",
  "Suspension":         "/GrubPac/Box-settings/minus-circle.svg",
  "Updation":           "/GrubPac/Box-settings/switch.svg",
  "Status":             "/GrubPac/Box-settings/switch.svg",
  "Ownership":          "/GrubPac/Box-settings/users.svg",
  "Assignment":         "/GrubPac/Box-settings/users.svg",
  "Reassignment":       "/GrubPac/Box-settings/users-brand.svg",
  "Box status":         "/GrubPac/Box-settings/switch.svg",
  "Ioniser status":     "/GrubPac/Box-settings/virus-covid-19.svg",
  "Connection status":  "/GrubPac/Box-settings/wifi.svg",
  "GrubLock":           "/GrubPac/Box-settings/grublock-brand-close.svg",
  "Temperature set":    "/GrubPac/Box-settings/thermometer.svg",
  "Temp. self check":   "/GrubPac/Box-settings/thermometer.svg",
  "Door status":        "/GrubPac/Box-settings/cube-dash.svg",
  "Battery status":     "/GrubPac/Box-settings/signal.svg",
  "Battery self check": "/GrubPac/Box-settings/signal.svg",
  "Emergency unlock":   "/GrubPac/Box-settings/grublock-open.svg",
  "OTP":                "/GrubPac/Box-settings/shield-check.svg",
  "Access":             "/GrubPac/Box-settings/users.svg",
  "Alerts":             "/GrubPac/Box-settings/minus-circle.svg",
  "Employee mgmt.":     "/GrubPac/Box-settings/users.svg",
  "Box mgmt.":          "/GrubPac/Box-settings/cube-dash.svg",
  "Restaurant mgmt.":   "/GrubPac/Box-settings/users.svg",
};

function LogTypeIcon({ type }: { type: string }) {
  const src = LOG_TYPE_ICON[type] ?? "/GrubPac/Box-settings/minus-circle.svg";
  return <Image src={src} alt={type} width={18} height={18} />;
}

function FilterCheckbox({ checked, onChange, label, isAll = false }: {
  checked: boolean; onChange: () => void; label: string; isAll?: boolean;
}) {
  return (
    <button onClick={onChange} className="flex items-center gap-2.5 text-left cursor-pointer">
      <span className={`w-5 h-5 rounded-sm flex items-center justify-center shrink-0 border transition-colors ${
        checked
          ? isAll ? "bg-[#cb3301] border-[#cb3301]" : "bg-[#37493f] border-[#37493f]"
          : "bg-white border-[#c1c7c4]"
      }`}>
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      <span className="text-sm text-[#37493f]">{label}</span>
    </button>
  );
}

function formatTimestamp(isoString?: string): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en", { month: "short" });
  const year = String(d.getFullYear()).slice(-2);
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  const secs = String(d.getSeconds()).padStart(2, "0");
  return `${day} ${month} '${year}, ${hours}:${mins}:${secs}`;
}

function sanitizeDescription(description: string, log: ApiSystemLog): string {
  let text = description;
  if (log.subject?.name) {
    text = text.replaceAll(log.subject.id, log.subject.name);
  }
  if (log.actor?.name) {
    text = text.replaceAll(log.actor.id, log.actor.name);
  }
  return text;
}

function mapApiLogToEntry(log: ApiSystemLog): LogEntry {
  const type = log.type ?? "";
  const isSystem = SYSTEM_LOG_TYPES.includes(type);
  const description = log.description ?? "";
  const sanitized = sanitizeDescription(description, log);
  return {
    id: log.id,
    timestamp: formatTimestamp(log.createdAt ?? log.created_at),
    type,
    category: isSystem ? "System log" : "Action log",
    action: sanitized,
    actionHighlight: type === "Box status" ? sanitized.includes("ON") : undefined,
    actorName: log.actor?.name,
    actorRole: log.actor?.role,
    subjectName: log.subject?.name,
  };
}

export function LogsView({ boxId }: { boxId?: string }) {
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [systemFilters, setSystemFilters] = useState<Set<string>>(new Set(SYSTEM_LOG_TYPES));
  const [actionFilters, setActionFilters] = useState<Set<string>>(new Set(ACTION_LOG_TYPES));
  const [draftSystem, setDraftSystem] = useState<Set<string>>(new Set(SYSTEM_LOG_TYPES));
  const [draftAction, setDraftAction] = useState<Set<string>>(new Set(ACTION_LOG_TYPES));
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(() => {
    const end = new Date();
    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return [start, end];
  });
  const [startDate, endDate] = dateRange;

  const [selectedPreset, setSelectedPreset] = useState<"all" | "24h" | "7d" | "30d" | "custom">("7d");
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  const presetDropdownRef = useRef<HTMLDivElement>(null);

  const presetLabels = {
    all: "Date range",
    "24h": "Last 24 hours",
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    custom: "Custom dates",
  };

  const getDropdownLabel = () => {
    if (selectedPreset === "custom") {
      if (startDate && endDate) {
        const formatDateShort = (d: Date) => {
          const day = String(d.getDate()).padStart(2, "0");
          const month = d.toLocaleString("en", { month: "short" });
          return `${day} ${month}`;
        };
        return `${formatDateShort(startDate)} - ${formatDateShort(endDate)}`;
      }
      return "Custom dates";
    }
    return presetLabels[selectedPreset];
  };

  const handlePresetSelect = (preset: "all" | "24h" | "7d" | "30d" | "custom") => {
    setSelectedPreset(preset);
    setShowPresetDropdown(false);
    if (preset === "all") {
      setDateRange([null, null]);
    } else if (preset === "24h") {
      setDateRange([new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()]);
    } else if (preset === "7d") {
      setDateRange([new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()]);
    } else if (preset === "30d") {
      setDateRange([new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()]);
    }
    setPage(1);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (presetDropdownRef.current && !presetDropdownRef.current.contains(event.target as Node)) {
        setShowPresetDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!boxId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await logsService.getList({
        subject_id: boxId,
        category: ["GrubPac", "GrubLock"],
        limit: 100,
        start_date: startDate ? startDate.toISOString() : undefined,
        end_date: endDate ? endDate.toISOString() : undefined,
      });
      if (cancelled) return;
      if (res.success && res.data) {
        const mapped = (res.data.logs ?? []).map(mapApiLogToEntry);
        setLogs(mapped);
        setTotalCount(res.data.total ?? mapped.length);
      } else {
        setLogs([]);
        setTotalCount(0);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [boxId, startDate, endDate]);

  const allSystemChecked = draftSystem.size === SYSTEM_LOG_TYPES.length;
  const allActionChecked = draftAction.size === ACTION_LOG_TYPES.length;

  const filteredLogs = useMemo(() => logs.filter((log) => {
    const q = search.toLowerCase();
    const matchesSearch = !search || log.action.toLowerCase().includes(q) || log.type.toLowerCase().includes(q);
    const matchesFilter = log.category === "System log" ? systemFilters.has(log.type) : actionFilters.has(log.type);
    return matchesSearch && matchesFilter;
  }), [logs, search, systemFilters, actionFilters]);

  const suggestions = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return Array.from(new Set(filteredLogs.map(l => l.action)))
      .filter(a => a.toLowerCase().includes(q))
      .slice(0, 6);
  }, [filteredLogs, search]);

  const PER_PAGE = 50;
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PER_PAGE));
  const pageLogs = filteredLogs.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const startIdx = filteredLogs.length === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const endIdx = Math.min(page * PER_PAGE, filteredLogs.length);

  function toggleSystem(t: string) {
    setDraftSystem((prev) => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; });
  }
  function toggleAction(t: string) {
    setDraftAction((prev) => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; });
  }
  function applyFilter() {
    setSystemFilters(new Set(draftSystem));
    setActionFilters(new Set(draftAction));
    setShowFilter(false);
    setPage(1);
  }
  function cancelFilter() {
    setDraftSystem(new Set(systemFilters));
    setDraftAction(new Set(actionFilters));
    setShowFilter(false);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden px-6 pt-4 pb-6 gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        {/* Search */}
        <div className="relative">
          <div className={`flex items-center gap-2 h-9 px-3 rounded-lg border bg-white transition-colors ${
            searchFocused ? "border-[#cb3301] shadow-[0_0_0_2px_rgba(203,51,1,0.15)]" : "border-[#e0e3e1]"
          }`} style={{ width: 240 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <circle cx="7" cy="7" r="5" stroke={searchFocused ? "#cb3301" : "#6b7971"} strokeWidth="1.5"/>
              <path d="M11 11L14 14" stroke={searchFocused ? "#cb3301" : "#6b7971"} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              placeholder="Search logs"
              className="flex-1 text-sm text-[#03130a] placeholder:text-[#c1c7c4] outline-none bg-transparent"
            />
            {search && (
              <button onClick={() => setSearch("")} className="shrink-0 cursor-pointer">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 3L11 11M11 3L3 11" stroke="#6b7971" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
          {/* Autocomplete dropdown */}
          {searchFocused && suggestions.length > 0 && (
            <div className="absolute top-full mt-1 left-0 w-full bg-white border border-[#e0e3e1] rounded-lg shadow-lg overflow-hidden z-20">
              {suggestions.map((s) => {
                const idx = s.toLowerCase().indexOf(search.toLowerCase());
                return (
                  <button
                    key={s}
                    onMouseDown={() => setSearch(s)}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#37493f] hover:bg-[#f7f8f7] transition-colors cursor-pointer"
                  >
                    {s.slice(0, idx)}
                    <span className="text-[#cb3301] font-semibold">{s.slice(idx, idx + search.length)}</span>
                    {s.slice(idx + search.length)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Entry count */}
        <span className="text-sm text-[#6b7971] whitespace-nowrap">{loading ? "Loading..." : `${totalCount} entries`}</span>

        {/* Date Preset Filter Dropdown / Date range picker */}
        {selectedPreset === "custom" ? (
          <div className="relative">
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update: [Date | null, Date | null]) => {
                setDateRange(update);
                setPage(1);
              }}
              placeholderText="Select custom range"
              className="pr-10 !w-44 !h-9 cursor-pointer !rounded-lg border border-[#e0e3e1] bg-white text-sm text-[#37493f] px-3 outline-none"
              dateFormat="dd MMM yy"
              maxDate={new Date()}
              autoFocus
            />
            <button
              onClick={() => handlePresetSelect("all")}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#cb3301]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ) : (
          <div className="relative" ref={presetDropdownRef}>
            <button
              onClick={() => setShowPresetDropdown(!showPresetDropdown)}
              className={`flex items-center justify-between h-9 w-44 px-3 border rounded-lg text-sm text-[#37493f] cursor-pointer hover:bg-[#f7f8f7] transition-colors ${
                selectedPreset !== "all" ? "bg-[#ffece6] border-[#cb3301]" : "bg-white border-[#e0e3e1]"
              }`}
            >
              <span className="truncate">{getDropdownLabel()}</span>
              <svg
                width="16" height="16" viewBox="0 0 16 16" fill="none"
                className={`shrink-0 ml-1 transition-colors ${selectedPreset !== "all" ? "text-[#cb3301]" : "text-[#6b7971]"}`}
              >
                <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5 1.5V4M11 1.5V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M2 7h12" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="4.5" y="9" width="2" height="2" rx="0.5" fill="currentColor"/>
                <rect x="9" y="9" width="2" height="2" rx="0.5" fill="currentColor"/>
              </svg>
            </button>

            {showPresetDropdown && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#e0e3e1] rounded-lg shadow-lg z-30 py-1">
                {(["all", "24h", "7d", "30d", "custom"] as const).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetSelect(preset)}
                    className={`w-full text-left px-4 py-2 text-sm text-[#37493f] hover:bg-[#f7f8f7] transition-colors cursor-pointer ${
                      selectedPreset === preset ? "font-semibold text-[#cb3301] bg-[#ffece6]/35" : ""
                    }`}
                  >
                    {presetLabels[preset]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Filter button + dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              if (!showFilter) { setDraftSystem(new Set(systemFilters)); setDraftAction(new Set(actionFilters)); }
              setShowFilter(!showFilter);
            }}
            className={`flex items-center gap-2 h-9 px-4 border rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              showFilter
                ? "bg-[#ffece6] border-[#cb3301] text-[#cb3301] shadow-[0_0_0_2px_rgba(203,51,1,0.4)] underline"
                : "bg-white border-[#6b7971] text-[#6b7971] hover:bg-[#f7f8f7]"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            FILTER
          </button>

          {showFilter && (
            <div className="absolute top-full mt-2 right-0 z-30 bg-white border border-[#e0e3e1] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] w-[580px]">
              {/* System Logs */}
              <div className="px-6 pt-5 pb-4 border-b border-[#e0e3e1]">
                <p className="text-sm text-[#6b7971] mb-4">System Logs</p>
                <div className="mb-3">
                  <FilterCheckbox checked={allSystemChecked} onChange={() => setDraftSystem(allSystemChecked ? new Set() : new Set(SYSTEM_LOG_TYPES))} label="All selected" isAll />
                </div>
                <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                  {SYSTEM_LOG_TYPES.map((t) => (
                    <FilterCheckbox key={t} checked={draftSystem.has(t)} onChange={() => toggleSystem(t)} label={t} />
                  ))}
                </div>
              </div>
              {/* Action Logs */}
              <div className="px-6 pt-4 pb-4 border-b border-[#e0e3e1]">
                <p className="text-sm text-[#6b7971] mb-4">Action Logs</p>
                <div className="mb-3">
                  <FilterCheckbox checked={allActionChecked} onChange={() => setDraftAction(allActionChecked ? new Set() : new Set(ACTION_LOG_TYPES))} label="All selected" isAll />
                </div>
                <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                  {ACTION_LOG_TYPES.map((t) => (
                    <FilterCheckbox key={t} checked={draftAction.has(t)} onChange={() => toggleAction(t)} label={t} />
                  ))}
                </div>
              </div>
              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4">
                <button onClick={cancelFilter} className="text-sm font-semibold text-[#6b7971] uppercase tracking-wide cursor-pointer hover:text-[#03130a]">
                  CANCEL
                </button>
                <button
                  onClick={applyFilter}
                  className="flex items-center gap-2 h-9 px-5 border border-[#cb3301] rounded-lg text-sm font-medium text-[#cb3301] hover:bg-[#ffece6] transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7L5.5 10.5L12 3.5" stroke="#cb3301" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  FILTER LOGS
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pagination row */}
      <div className="flex items-center justify-between h-10 px-4 bg-[#f7f8f7] border border-[#e0e3e1] rounded-lg shrink-0">
        <span className="text-sm text-[#6b7971]">
          Showing {startIdx}-{endIdx}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="h-7 w-7 flex items-center justify-center rounded border border-[#e0e3e1] bg-white hover:bg-[#f7f8f7] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7L9 3" stroke="#37493f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="h-7 w-7 flex items-center justify-center rounded border border-[#e0e3e1] bg-white hover:bg-[#f7f8f7] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3L9 7L5 11" stroke="#37493f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="grid grid-cols-[200px_1fr_2fr] border-b border-[#e0e3e1] pb-3">
          <span className="text-sm text-[#6b7971]">Time stamp</span>
          <span className="text-sm text-[#6b7971]">Type</span>
          <span className="text-sm text-[#6b7971]">Action</span>
        </div>
        {/* Rows */}
        {pageLogs.map((log) => (
          <div key={log.id} className="grid grid-cols-[200px_1fr_2fr] py-4 border-b border-[#e0e3e1] items-start">
            <span className="text-sm font-semibold text-[#03130a]">{log.timestamp}</span>
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0"><LogTypeIcon type={log.type} /></span>
              <div>
                <p className="text-sm font-semibold text-[#03130a]">{log.subjectName ?? log.type}</p>
                <p className="text-xs text-[#6b7971]">{log.type} ({log.category})</p>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className={`text-sm ${log.actionHighlight ? "font-semibold text-[#f0a433]" : "text-[#37493f]"}`}>
                {log.action}
              </span>
              {log.actorName && (
                <span className="text-xs text-[#6b7971]">by {log.actorName}{log.actorRole ? ` (${log.actorRole})` : ""}</span>
              )}
            </div>
          </div>
        ))}
        {pageLogs.length === 0 && (
          <div className="flex items-center justify-center h-40 text-sm text-[#6b7971]">
            No logs match your search or filters.
          </div>
        )}
      </div>
    </div>
  );
}
