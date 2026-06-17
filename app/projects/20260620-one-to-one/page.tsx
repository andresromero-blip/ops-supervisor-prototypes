"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Period = "D-1" | "WTD" | "MTD" | "QTD";
type KpiStatus = "outlier" | "off-target" | "at-risk" | "on-target";

type PendingAction = {
  type: string;       // "Coach Call" | "QA Review" | "Training" | "Assessment"
  dueDate: string;    // "Jun 18" | "Jun 16" etc.
  overdue: boolean;
  overdueDays?: number;
};

type KpiCard = {
  key: string;
  label: string;
  value: string;
  unit: string;
  target: string;
  delta: string;
  deltaPositive: boolean;
  status: KpiStatus;
  pendingActions: PendingAction[];
  recentSessions: number;
  lastSessionDate: string;
  facts: number;
  completedActions: number;
  trendData: number[];    // last 7 days — agent
  teamData: number[];     // last 7 days — team avg
  targetValue: number;
  trendMin: number;
  trendMax: number;
  storyline: string | null;
};

type Agent = {
  id: string;
  name: string;
  initials: string;
  tenure: string;
};

type OtherTopic = {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  description: string;
  cadence: string;
  actionLabel: string;
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const AGENTS: Agent[] = [
  { id: "joao-silva",       name: "João Silva",            initials: "JS", tenure: "1y" },
  { id: "pedro-godinho",    name: "Pedro Godinho",         initials: "PG", tenure: "4y" },
  { id: "alexandre-pereira",name: "Alexandre M. Pereira",  initials: "AM", tenure: "119d" },
  { id: "denzel-melo",      name: "Denzel Melo",           initials: "DM", tenure: "119d" },
];

const KPI_DATA: Record<string, KpiCard[]> = {
  "joao-silva": [
    {
      key: "aht", label: "AHT", value: "390", unit: "s", target: "420",
      delta: "+2%", deltaPositive: true, status: "outlier",
      pendingActions: [],
      recentSessions: 3, lastSessionDate: "Jun 10",
      facts: 1, completedActions: 1,
      trendData: [410, 405, 400, 395, 392, 388, 390],
      teamData:  [420, 418, 422, 419, 421, 420, 420],
      targetValue: 420, trendMin: 380, trendMax: 440,
      storyline: null,
    },
    {
      key: "sales", label: "Sales", value: "10.0", unit: "%", target: "12.0%",
      delta: "-11%", deltaPositive: false, status: "off-target",
      pendingActions: [],
      recentSessions: 3, lastSessionDate: "Jun 12",
      facts: 2, completedActions: 0,
      trendData: [11.2, 10.8, 10.5, 10.3, 10.1, 10.0, 10.0],
      teamData:  [11.8, 11.9, 12.0, 11.8, 12.1, 12.0, 12.0],
      targetValue: 12, trendMin: 9, trendMax: 13,
      storyline: "Consistent underperformance over the last 3 weeks. No coaching actions in place.",
    },
    {
      key: "csat", label: "CSAT", value: "81.0", unit: "%", target: "85.0%",
      delta: "-1%", deltaPositive: false, status: "at-risk",
      pendingActions: [
        { type: "Coach Call", dueDate: "Jun 18", overdue: false },
        { type: "QA Review",  dueDate: "Jun 14", overdue: true, overdueDays: 2 },
      ],
      recentSessions: 3, lastSessionDate: "Jun 10",
      facts: 3, completedActions: 1,
      trendData: [84, 83, 82, 82, 81, 81, 81],
      teamData:  [85, 85, 86, 85, 85, 85, 85],
      targetValue: 85, trendMin: 78, trendMax: 90,
      storyline: "CSAT has been declining for 3 consecutive weeks. Coach Call scheduled for Jun 18. QA Review overdue since Jun 14.",
    },
    {
      key: "fcr", label: "FCR", value: "73.0", unit: "%", target: "78.0%",
      delta: "-1%", deltaPositive: false, status: "at-risk",
      pendingActions: [
        { type: "Coach Call", dueDate: "Jun 20", overdue: false },
      ],
      recentSessions: 1, lastSessionDate: "Jun 8",
      facts: 2, completedActions: 0,
      trendData: [76, 75, 74, 74, 73, 73, 73],
      teamData:  [78, 78, 79, 78, 78, 78, 78],
      targetValue: 78, trendMin: 68, trendMax: 84,
      storyline: "FCR trending down for 2 weeks. Root cause under investigation. Coach Call set for Jun 20.",
    },
    {
      key: "adh", label: "ADH", value: "92.0", unit: "%", target: "95.0%",
      delta: "0%", deltaPositive: true, status: "at-risk",
      pendingActions: [
        { type: "Assessment", dueDate: "Jun 15", overdue: true, overdueDays: 1 },
      ],
      recentSessions: 1, lastSessionDate: "Jun 5",
      facts: 1, completedActions: 0,
      trendData: [93, 92, 92, 92, 92, 92, 92],
      teamData:  [95, 95, 94, 95, 95, 95, 95],
      targetValue: 95, trendMin: 88, trendMax: 98,
      storyline: "Adherence stable but below target. Assessment overdue since Jun 15.",
    },
    {
      key: "nps", label: "NPS", value: "85", unit: "", target: "45",
      delta: "-1%", deltaPositive: false, status: "on-target",
      pendingActions: [],
      recentSessions: 1, lastSessionDate: "Jun 10",
      facts: 0, completedActions: 2,
      trendData: [86, 86, 85, 85, 85, 85, 85],
      teamData:  [80, 81, 82, 82, 83, 84, 84],
      targetValue: 45, trendMin: 40, trendMax: 95,
      storyline: null,
    },
  ],
  "pedro-godinho": [
    {
      key: "aht", label: "AHT", value: "863", unit: "s", target: "630",
      delta: "+37%", deltaPositive: false, status: "outlier",
      pendingActions: [],
      recentSessions: 0, lastSessionDate: "—",
      facts: 3, completedActions: 0,
      trendData: [718, 845, 890, 870, 855, 840, 863],
      teamData:  [691, 695, 693, 690, 692, 691, 691],
      targetValue: 630, trendMin: 600, trendMax: 920,
      storyline: "No coaching plan in place despite 3 consecutive weeks above target. Immediate action required.",
    },
    {
      key: "fcr", label: "FCR", value: "70", unit: "%", target: "75%",
      delta: "-7%", deltaPositive: false, status: "at-risk",
      pendingActions: [
        { type: "Coach Call", dueDate: "Jun 17", overdue: true, overdueDays: 1 },
      ],
      recentSessions: 1, lastSessionDate: "Jun 5",
      facts: 2, completedActions: 0,
      trendData: [72, 71, 70, 70, 70, 70, 70],
      teamData:  [77, 77, 78, 78, 78, 77, 77],
      targetValue: 75, trendMin: 60, trendMax: 85,
      storyline: "FCR flat at 70% for 4 weeks. Coach Call overdue since Jun 17.",
    },
    {
      key: "nps", label: "NPS", value: "60", unit: "", target: "55",
      delta: "+9%", deltaPositive: true, status: "on-target",
      pendingActions: [],
      recentSessions: 1, lastSessionDate: "Jun 8",
      facts: 0, completedActions: 1,
      trendData: [58, 59, 60, 60, 60, 60, 60],
      teamData:  [55, 55, 56, 56, 55, 55, 55],
      targetValue: 55, trendMin: 40, trendMax: 75,
      storyline: null,
    },
  ],
};

const OTHER_TOPICS: OtherTopic[] = [
  {
    id: "cedp",
    tag: "CEDP",
    tagColor: "text-warning bg-warning-light",
    title: "CEDP review pending",
    description: "Run this month's Continuous Employee Development Plan review.",
    cadence: "Monthly cadence",
    actionLabel: "Open CEDP",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const STATUS_BADGE: Record<KpiStatus, { label: string; bg: string; text: string }> = {
  "outlier":    { label: "OUTLIER",     bg: "bg-danger-light",  text: "text-danger" },
  "off-target": { label: "OFF TARGET",  bg: "bg-danger-light",  text: "text-danger" },
  "at-risk":    { label: "AT RISK",     bg: "bg-warning-light", text: "text-warning" },
  "on-target":  { label: "ON TARGET",   bg: "bg-success-light", text: "text-success" },
};

const FILTER_LABELS: { key: KpiStatus | "all"; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "outlier",   label: "Outlier" },
  { key: "off-target",label: "Off target" },
  { key: "at-risk",   label: "At risk" },
  { key: "on-target", label: "On target" },
];

// O2 + O5: render pending action badge with type + due date / overdue
function ActionBadge({ action }: { action: PendingAction }) {
  if (action.overdue) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-danger-light text-danger whitespace-nowrap">
        <AlertTriangle size={11} />
        {action.type} · Overdue {action.overdueDays}d
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-warning-light text-warning whitespace-nowrap">
      <Clock size={11} />
      {action.type} · {action.dueDate}
    </span>
  );
}

// Mini SVG trend chart for deep dive
function TrendChart({ kpi }: { kpi: KpiCard }) {
  const w = 600;
  const h = 180;
  const pad = { t: 20, b: 30, l: 40, r: 20 };
  const days = ["D-6", "D-5", "D-4", "D-3", "D-2", "D-1", "Today"];

  const allVals = [...kpi.trendData, ...kpi.teamData, kpi.targetValue];
  const minV = Math.min(...allVals) * 0.97;
  const maxV = Math.max(...allVals) * 1.03;
  const range = maxV - minV || 1;

  const toX = (i: number) => pad.l + (i * (w - pad.l - pad.r)) / (days.length - 1);
  const toY = (v: number) => h - pad.b - ((v - minV) / range) * (h - pad.t - pad.b);

  const agentPath = kpi.trendData.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`).join(" ");
  const teamPath  = kpi.teamData.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`).join(" ");
  const targetY   = toY(kpi.targetValue);

  const agentArea = `${agentPath} L ${toX(kpi.trendData.length - 1)} ${h - pad.b} L ${toX(0)} ${h - pad.b} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44 block">
      {/* target line */}
      <line x1={pad.l} y1={targetY} x2={w - pad.r} y2={targetY} stroke="#9CA3AF" strokeWidth="1" strokeDasharray="5 4" />
      <text x={w - pad.r} y={targetY - 5} textAnchor="end" fontSize="10" fill="#9CA3AF" fontFamily="Inter, system-ui">TARGET</text>
      {/* agent area */}
      <path d={agentArea} fill="rgba(16,185,129,0.07)" stroke="none" />
      {/* team line */}
      <path d={teamPath} fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* agent line */}
      <path d={agentPath} fill="none" stroke="#10B981" strokeWidth="2" />
      {/* dots + x-axis labels */}
      {kpi.trendData.map((v, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(v)} r="3" fill="#10B981" />
          <text x={toX(i)} y={h - 6} textAnchor="middle" fontSize="10" fill="#9CA3AF" fontFamily="Inter, system-ui">{days[i]}</text>
        </g>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function OneToOnePage() {
  const [agentId, setAgentId]           = useState("joao-silva");
  const [agentDropdown, setAgentDropdown] = useState(false);
  const [period, setPeriod]             = useState<Period>("D-1");
  const [filter, setFilter]             = useState<KpiStatus | "all">("all");
  const [focusedKpi, setFocusedKpi]     = useState<string | null>("aht");
  const [factsExpanded, setFactsExpanded] = useState(false);

  const agent    = AGENTS.find((a) => a.id === agentId) ?? AGENTS[0];
  const allCards = KPI_DATA[agentId] ?? [];

  // Reset focused KPI when agent changes
  const handleAgentChange = (id: string) => {
    setAgentId(id);
    setAgentDropdown(false);
    setFocusedKpi(KPI_DATA[id]?.[0]?.key ?? null);
    setFilter("all");
  };

  const filtered = filter === "all" ? allCards : allCards.filter((k) => k.status === filter);
  const focused  = allCards.find((k) => k.key === focusedKpi) ?? allCards[0];

  // Filter counts
  const counts = {
    outlier:    allCards.filter((k) => k.status === "outlier").length,
    "off-target": allCards.filter((k) => k.status === "off-target").length,
    "at-risk":  allCards.filter((k) => k.status === "at-risk").length,
    "on-target": allCards.filter((k) => k.status === "on-target").length,
  };

  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar />
      <main className="flex-1 font-sans text-text-primary px-6 py-6 overflow-x-hidden">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-start justify-between mb-1 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-semibold m-0">One to One</h1>
              <p className="text-sm text-text-secondary m-0 mt-0.5">
                Coaching &amp; Development Dashboard · KPI → Root Causes → Actions
              </p>
            </div>
          </div>

          {/* Agent selector + period + actions */}
          <div className="border border-border rounded-lg bg-surface px-4 py-3 mt-4 mb-5 flex flex-wrap items-center gap-4">
            {/* Agent */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <p className="text-[11px] text-text-secondary uppercase tracking-wide m-0 whitespace-nowrap">Agent</p>
              <div className="relative flex-1 min-w-0 max-w-xs">
                <button
                  onClick={() => setAgentDropdown((v) => !v)}
                  className="w-full flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm bg-surface-muted hover:border-brand/40 transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-brand-light text-brand text-xs font-semibold flex items-center justify-center flex-shrink-0">
                    {agent.initials}
                  </span>
                  <span className="flex-1 text-left">
                    <span className="font-medium">{agent.name}</span>
                    <span className="text-text-tertiary text-xs ml-1">— {agent.tenure}</span>
                  </span>
                  <ChevronDown size={14} className="text-text-tertiary flex-shrink-0" />
                </button>
                {agentDropdown && (
                  <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-surface border border-border rounded-md overflow-hidden z-10 shadow-md">
                    {AGENTS.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => handleAgentChange(a.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left border-b border-border last:border-b-0 transition-colors ${
                          a.id === agentId ? "bg-surface-muted font-medium" : "hover:bg-surface-muted"
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-brand-light text-brand text-xs font-semibold flex items-center justify-center flex-shrink-0">
                          {a.initials}
                        </span>
                        {a.name}
                        <span className="text-text-tertiary text-xs ml-auto">— {a.tenure}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Period */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-text-secondary">
                <Clock size={13} />
                <span>Period: Yesterday — Tue 16 Jun</span>
              </div>
              <div className="flex gap-1">
                {(["D-1", "WTD", "MTD", "QTD"] as Period[]).map((p, i) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-2.5 py-1 text-xs rounded font-medium border transition-colors ${
                      period === p
                        ? "bg-brand text-white border-transparent"
                        : "bg-surface text-text-secondary border-border hover:border-brand/40"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 items-center">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-md text-text-secondary hover:border-brand/40 transition-colors">
                <ExternalLink size={13} /> CEDP
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md font-medium bg-brand text-white border border-transparent hover:bg-brand/90 transition-colors">
                <Plus size={14} /> New Session
              </button>
            </div>
          </div>

          {/* KPI filters */}
          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
            {FILTER_LABELS.map((f) => {
              const count = f.key === "all" ? allCards.length : counts[f.key as KpiStatus];
              const isActive = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key as KpiStatus | "all")}
                  className={`px-3 py-1 text-xs rounded-full font-medium border transition-colors ${
                    isActive
                      ? "bg-text-primary text-white border-transparent"
                      : "bg-surface text-text-secondary border-border hover:border-brand/40"
                  }`}
                >
                  {count} {f.label}
                </button>
              );
            })}
            <p className="text-xs text-text-tertiary ml-auto">Click a KPI to focus its story below.</p>
          </div>

          {/* KPI cards grid — O2 + O5 applied */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
            {filtered.map((kpi) => {
              const badge   = STATUS_BADGE[kpi.status];
              const isFocus = kpi.key === focusedKpi;
              const valueColor =
                kpi.status === "outlier" || kpi.status === "off-target" ? "text-danger" :
                kpi.status === "at-risk" ? "text-warning" : "text-success";
              const deltaColor = kpi.deltaPositive ? "text-success" : "text-danger";

              return (
                <div
                  key={kpi.key}
                  onClick={() => setFocusedKpi(kpi.key)}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    isFocus ? "border-brand ring-1 ring-brand/30 bg-surface" : "border-border bg-surface hover:border-brand/40"
                  }`}
                >
                  {/* Label + status badge */}
                  <div className="flex items-center justify-between mb-1.5 gap-1">
                    <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide m-0">{kpi.label}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${badge.bg} ${badge.text}`}>{badge.label}</span>
                  </div>

                  {/* Value + unit */}
                  <p className={`text-2xl font-bold m-0 leading-tight ${valueColor}`}>
                    {kpi.value}
                    {kpi.unit && <span className="text-sm font-normal text-text-secondary"> {kpi.unit}</span>}
                  </p>

                  {/* Target + delta */}
                  <div className="flex items-center justify-between mt-1 mb-2">
                    <p className="text-xs text-text-tertiary m-0 flex items-center gap-1">
                      <span className="inline-block w-2.5 h-2.5 rounded-full border border-text-tertiary flex-shrink-0" />
                      Target {kpi.target}
                    </p>
                    <span className={`text-xs font-medium ${deltaColor}`}>{kpi.delta}</span>
                  </div>

                  {/* O2 + O5: accionable badges */}
                  <div className="flex flex-col gap-1">
                    {kpi.pendingActions.length === 0 && kpi.recentSessions > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-text-tertiary">
                        <CheckCircle size={11} className="text-success" />
                        {kpi.recentSessions} recent 1:1{kpi.recentSessions > 1 ? "s" : ""}
                      </span>
                    )}
                    {kpi.pendingActions.length === 0 && kpi.recentSessions === 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-danger">
                        <AlertCircle size={11} />
                        No plan · Create session
                      </span>
                    )}
                    {kpi.pendingActions.map((action, i) => (
                      <ActionBadge key={i} action={action} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* KPI deep dive */}
          {focused && (
            <div className="border border-border rounded-lg bg-surface mb-5">
              {/* Deep dive header */}
              <div className="px-5 py-3 border-b border-border flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold bg-brand-light text-brand px-2.5 py-1 rounded">
                    {focused.label}
                  </span>
                  <span className={`text-2xl font-bold ${
                    focused.status === "outlier" || focused.status === "off-target" ? "text-danger" :
                    focused.status === "at-risk" ? "text-warning" : "text-success"
                  }`}>
                    {focused.value}
                  </span>
                  <span className="text-sm text-text-secondary">vs target {focused.target}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-secondary">
                  {[
                    { label: "FACTS",     value: focused.facts },
                    { label: "SESSIONS",  value: focused.recentSessions },
                    { label: "COMPLETED", value: focused.completedActions },
                    { label: "PENDING",   value: focused.pendingActions.length },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="text-lg font-bold text-text-primary m-0 leading-tight">{s.value}</p>
                      <p className="text-[10px] uppercase tracking-wide text-text-tertiary m-0">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trend chart */}
              <div className="px-5 py-3 border-b border-border">
                <p className="text-[11px] uppercase tracking-wide text-text-tertiary mb-2 m-0">Last 7 days trend</p>
                <TrendChart kpi={focused} />
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <span className="w-4 border-t-2 border-brand inline-block" /> Agent
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <span className="w-4 border-t border-dashed border-text-tertiary inline-block" /> Team
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <span className="w-4 border-t border-dashed border-text-tertiary inline-block" /> Target
                  </span>
                </div>
              </div>

              {/* Relevant facts */}
              <div className="px-5 py-3 border-b border-border">
                <button
                  className="flex items-center gap-2 w-full text-left"
                  onClick={() => setFactsExpanded((v) => !v)}
                >
                  <AlertTriangle size={13} className="text-text-tertiary" />
                  <p className="text-[11px] uppercase tracking-wide text-text-tertiary m-0 flex-1">
                    Relevant facts on {focused.label}
                  </p>
                  {factsExpanded ? <ChevronUp size={14} className="text-text-tertiary" /> : <ChevronDown size={14} className="text-text-tertiary" />}
                </button>
                {factsExpanded && focused.facts > 0 && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    {Array.from({ length: focused.facts }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm py-1.5 border-t border-border">
                        <span className="text-xs text-text-tertiary font-mono whitespace-nowrap">Jun {14 - i}</span>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${i === 0 ? "bg-danger-light text-danger" : "bg-warning-light text-warning"}`}>
                          {i === 0 ? "critical" : "warning"}
                        </span>
                        <span className="text-text-secondary text-xs flex-1">
                          {i === 0 ? `${focused.label} performance below acceptable threshold for 3 consecutive days.` : `${focused.label} approaching risk boundary.`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {!factsExpanded && (
                  <p className="text-xs text-text-tertiary mt-1 m-0">{focused.facts} fact{focused.facts !== 1 ? "s" : ""} available. Expand to review.</p>
                )}
              </div>

              {/* Storyline */}
              <div className="px-5 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-[11px] uppercase tracking-wide text-text-tertiary m-0">Storyline</p>
                </div>
                {focused.storyline ? (
                  <p className="text-sm text-text-secondary m-0 leading-relaxed">{focused.storyline}</p>
                ) : (
                  <p className="text-sm text-text-tertiary m-0 italic">
                    No pending items. Click "Show history" to see past activity.
                  </p>
                )}
                {focused.pendingActions.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-3">
                    {focused.pendingActions.map((action, i) => (
                      <ActionBadge key={i} action={action} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other topics */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-text-secondary uppercase tracking-wide m-0">Other topics</p>
              <p className="text-xs text-text-tertiary">Wellness, career, attendance and other non-KPI conversations.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {OTHER_TOPICS.map((t) => (
                <div key={t.id} className="border border-border rounded-lg p-4 bg-surface">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${t.tagColor}`}>{t.tag}</span>
                    <span className="text-xs text-text-tertiary">Monthly review</span>
                  </div>
                  <p className="text-sm font-semibold m-0 mb-1">{t.title}</p>
                  <p className="text-sm text-text-secondary m-0 mb-3">{t.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-tertiary flex items-center gap-1">
                      <Clock size={11} /> {t.cadence}
                    </span>
                    <button className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded bg-brand text-white hover:bg-brand/90 transition-colors">
                      <ExternalLink size={12} /> {t.actionLabel}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
