"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { GlobalHeader } from "@/components/Header";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Period = "D-1" | "WTD" | "MTD" | "QTD";
type KpiStatus = "outlier" | "off-target" | "at-risk" | "on-target";

type KpiCard = {
  key: string; label: string;
  value: string; unit: string;
  target: string; delta: string; deltaPos: boolean;
  status: KpiStatus;
  pendingActions: number;
  recentSessions: number;
  facts: { date: string; severity: "critical" | "warning"; text: string }[];
  trendData: number[]; teamData: number[]; targetValue: number;
  facts1: number; sessions: number; completed: number; pending: number;
};

type Agent = {
  id: string; name: string; initials: string; tenure: string;
  focusKpi: string;
  kpis: KpiCard[];
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const AGENTS: Agent[] = [
  {
    id: "joao-silva", name: "João Silva", initials: "JS", tenure: "1y",
    focusKpi: "aht",
    kpis: [
      {
        key: "aht", label: "AHT", value: "390", unit: "s", target: "Target 420",
        delta: "+2%", deltaPos: true, status: "outlier",
        pendingActions: 0, recentSessions: 3,
        facts: [],
        trendData: [410,405,400,395,392,388,390], teamData: [420,418,422,419,421,420,420], targetValue: 420,
        facts1: 1, sessions: 1, completed: 0, pending: 0,
      },
      {
        key: "sales", label: "SALES", value: "10.0", unit: "%", target: "Target 12.0%",
        delta: "-11%", deltaPos: false, status: "off-target",
        pendingActions: 0, recentSessions: 3,
        facts: [{ date: "Jun 12", severity: "warning", text: "Sales rate 2pp below team average for second consecutive week." }],
        trendData: [11.2,10.8,10.5,10.3,10.1,10.0,10.0], teamData: [11.8,11.9,12.0,11.8,12.1,12.0,12.0], targetValue: 12,
        facts1: 1, sessions: 1, completed: 0, pending: 0,
      },
      {
        key: "csat", label: "CSAT", value: "81.0", unit: "%", target: "Target 85.0%",
        delta: "-1%", deltaPos: false, status: "at-risk",
        pendingActions: 2, recentSessions: 3,
        facts: [
          { date: "Jun 14", severity: "critical", text: "CSAT below 82% for 3 consecutive days — threshold breach." },
          { date: "Jun 11", severity: "warning", text: "Call closure missing in 4 of 8 monitored calls." },
        ],
        trendData: [84,83,82,82,81,81,81], teamData: [85,85,86,85,85,85,85], targetValue: 85,
        facts1: 1, sessions: 1, completed: 0, pending: 0,
      },
      {
        key: "fcr", label: "FCR", value: "73.0", unit: "%", target: "Target 78.0%",
        delta: "-1%", deltaPos: false, status: "at-risk",
        pendingActions: 1, recentSessions: 1,
        facts: [{ date: "Jun 13", severity: "warning", text: "3 cases reopened within 24h — same client segment." }],
        trendData: [76,75,74,74,73,73,73], teamData: [78,78,79,78,78,78,78], targetValue: 78,
        facts1: 0, sessions: 1, completed: 0, pending: 1,
      },
      {
        key: "adh", label: "ADH", value: "92.0", unit: "%", target: "Target 95.0%",
        delta: "0%", deltaPos: true, status: "at-risk",
        pendingActions: 0, recentSessions: 1,
        facts: [],
        trendData: [93,92,92,92,92,92,92], teamData: [95,95,94,95,95,95,95], targetValue: 95,
        facts1: 0, sessions: 0, completed: 0, pending: 0,
      },
      {
        key: "nps", label: "NPS", value: "85", unit: "", target: "Target 45",
        delta: "-1%", deltaPos: false, status: "on-target",
        pendingActions: 0, recentSessions: 1,
        facts: [],
        trendData: [86,86,85,85,85,85,85], teamData: [80,81,82,82,83,84,84], targetValue: 45,
        facts1: 0, sessions: 0, completed: 0, pending: 0,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const STATUS_LABEL: Record<KpiStatus, string> = {
  "outlier":    "OUTLIER",
  "off-target": "OFF TARGET",
  "at-risk":    "AT RISK",
  "on-target":  "ON TARGET",
};

const STATUS_COLORS: Record<KpiStatus, { bg: string; text: string; border: string }> = {
  "outlier":    { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" },
  "off-target": { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
  "at-risk":    { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
  "on-target":  { bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" },
};

const VALUE_COLORS: Record<KpiStatus, string> = {
  "outlier":    "#10B981",
  "off-target": "#EF4444",
  "at-risk":    "#F59E0B",
  "on-target":  "#10B981",
};

// Deep-dive chart: SVG with agent line, team dashed, target dashed, area fill
function DeepDiveChart({ kpi }: { kpi: KpiCard }) {
  const W = 700; const H = 160;
  const PL = 44; const PR = 60; const PT = 12; const PB = 28;

  const allVals = [...kpi.trendData, ...kpi.teamData, kpi.targetValue];
  const minV = Math.min(...allVals) * 0.97;
  const maxV = Math.max(...allVals) * 1.03;
  const rangeV = maxV - minV || 1;

  const days = ["D-6", "", "D-4", "D-3", "", "D-1", "Today"];
  const toX = (i: number) => PL + (i / (kpi.trendData.length - 1)) * (W - PL - PR);
  const toY = (v: number) => PT + (1 - (v - minV) / rangeV) * (H - PT - PB);

  const agentPath = kpi.trendData.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(" ");
  const teamPath  = kpi.teamData.map((v, i)  => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(" ");
  const areaPath  = `${agentPath} L ${toX(kpi.trendData.length-1).toFixed(1)} ${(H-PB).toFixed(1)} L ${toX(0).toFixed(1)} ${(H-PB).toFixed(1)} Z`;
  const targetY   = toY(kpi.targetValue);

  // Y axis labels
  const yStep = Math.round((maxV - minV) / 3 / 5) * 5 || 1;
  const yLabels = [minV, minV + yStep, minV + yStep * 2, maxV].map(v => Math.round(v));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" style={{ height: 160 }}>
      {/* Y labels */}
      {yLabels.map((v, i) => (
        <text key={i} x={PL - 4} y={toY(v) + 4} textAnchor="end" fontSize="10" fill="#9CA3AF" fontFamily="Inter,system-ui,sans-serif">{v}</text>
      ))}
      {/* Target dashed */}
      <line x1={PL} y1={targetY} x2={W - PR} y2={targetY} stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x={W - PR + 4} y={targetY - 4} fontSize="9" fill="#9CA3AF" fontFamily="Inter,system-ui,sans-serif">TARGET</text>
      {/* Area under agent */}
      <path d={areaPath} fill="rgba(16,185,129,0.08)" />
      {/* Team line dashed */}
      <path d={teamPath} fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Agent line */}
      <path d={agentPath} fill="none" stroke="#10B981" strokeWidth="2" strokeLinejoin="round" />
      {/* X labels */}
      {days.map((d, i) => d && (
        <text key={i} x={toX(i)} y={H - 4} textAnchor="middle" fontSize="10" fill="#9CA3AF" fontFamily="Inter,system-ui,sans-serif">{d}</text>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function OneToOnePage() {
  const agent = AGENTS[0];
  const [focusKpi, setFocusKpi] = useState(agent.focusKpi);
  const [showSession, setShowSession] = useState(false);
  const [sessionActions, setSessionActions] = useState<{type:string;text:string}[]>([]);

  const activeKpi = agent.kpis.find(k => k.key === focusKpi) ?? agent.kpis[0];

  // Summary counts
  const outlierCount   = agent.kpis.filter(k => k.status === "outlier").length;
  const offTargetCount = agent.kpis.filter(k => k.status === "off-target").length;
  const atRiskCount    = agent.kpis.filter(k => k.status === "at-risk").length;
  const onTargetCount  = agent.kpis.filter(k => k.status === "on-target").length;

  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <GlobalHeader />
        <main className="flex-1 font-sans text-text-primary overflow-x-hidden px-8 py-6">

          {/* Page title */}
          <div className="mb-5">
            <h1 className="text-2xl font-semibold m-0 mb-1">One to One</h1>
            <p className="text-sm text-text-secondary m-0">Coaching & Development Dashboard · KPI → Root Causes → Actions</p>
          </div>

          {/* Agent module */}
          <div className="border border-border rounded-xl p-4 mb-5 bg-surface">
            <div className="flex items-start justify-between gap-4">
              {/* Left: agent selector */}
              <div className="flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary mb-2 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#9CA3AF" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4.5 5-4.5s5 2 5 4.5" stroke="#9CA3AF" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  AGENT
                </p>
                <div className="flex items-center gap-3 border border-border rounded-lg px-3 py-2 bg-white cursor-pointer hover:border-brand/40 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand text-xs font-bold flex-shrink-0">
                    {agent.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text-primary">{agent.name}</div>
                    <div className="text-xs text-text-tertiary">— · {agent.tenure}</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5.5l4 4 4-4" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round"/></svg>
                </div>
              </div>

              {/* Right: CEDP + New Session only — period lives in global header */}
              <div className="flex items-center gap-2 flex-shrink-0 self-center">
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-sm text-text-secondary bg-surface hover:border-brand/40 transition-colors">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1.5" width="11" height="10" rx="1.5" stroke="#6B7280" strokeWidth="1.1"/><path d="M4 5h5M4 8h3" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  CEDP
                </button>
                <button
                  onClick={() => setShowSession(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white"
                  style={{ background: "#10B981" }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  New Session
                </button>
              </div>
            </div>
          </div>

          {/* KPI filter bar */}
          <div className="mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <button className="px-3 py-1 rounded-full text-xs font-semibold bg-text-primary text-white">
                {agent.kpis.length} All
              </button>
              <button className="px-3 py-1 rounded-full text-xs font-medium text-text-secondary border border-border hover:border-brand/40">
                {outlierCount} Outlier
              </button>
              <button className="px-3 py-1 rounded-full text-xs font-medium text-text-secondary border border-border hover:border-brand/40">
                {offTargetCount} Off target
              </button>
              <button className="px-3 py-1 rounded-full text-xs font-medium text-text-secondary border border-border hover:border-brand/40">
                {atRiskCount} At risk
              </button>
              <button className="px-3 py-1 rounded-full text-xs font-medium text-text-secondary border border-border hover:border-brand/40">
                {onTargetCount} On target
              </button>
            </div>
            {/* B: helper text below the filter bar, not floated to the right */}
            <p className="text-xs text-text-tertiary mt-2 m-0">Click a KPI to focus its story below</p>
          </div>

          {/* KPI cards grid */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {agent.kpis.map(k => {
              const sc = STATUS_COLORS[k.status];
              const vc = VALUE_COLORS[k.status];
              const isActive = k.key === focusKpi;
              const deltaColor = k.deltaPos ? "#10B981" : "#EF4444";
              return (
                <div
                  key={k.key}
                  onClick={() => setFocusKpi(k.key)}
                  className="cursor-pointer rounded-xl p-4 transition-all"
                  style={{
                    background: "#fff",
                    border: `1.5px solid ${isActive ? "#10B981" : "#E5E7EB"}`,
                    boxShadow: isActive ? "0 0 0 3px rgba(16,185,129,0.10)" : "none",
                  }}
                >
                  {/* Label + status badge */}
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{k.label}</span>
                    {k.status !== "on-target" && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ background: sc.bg, color: sc.text }}
                      >
                        {STATUS_LABEL[k.status]}
                      </span>
                    )}
                  </div>
                  {/* Value */}
                  <div className="mb-1">
                    <span className="text-2xl font-bold" style={{ color: vc }}>{k.value}</span>
                    <span className="text-sm font-normal text-text-secondary ml-0.5">{k.unit}</span>
                  </div>
                  {/* Target + delta */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-text-tertiary flex items-center gap-0.5">
                      <span style={{ fontSize: 9 }}>⊙</span> {k.target}
                    </span>
                    <span className="text-[11px] font-semibold" style={{ color: deltaColor }}>{k.delta}</span>
                  </div>
                  {/* Pending actions + recent sessions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {k.pendingActions > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FEF3C7", color: "#92400E" }}>
                        {k.pendingActions} pending action{k.pendingActions > 1 ? "s" : ""}
                      </span>
                    )}
                    {k.recentSessions > 0 && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#F3F4F6", color: "#6B7280" }}>
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" style={{ display: "inline", marginRight: 3 }}><path d="M4.5 1v2.5L6 5" stroke="#9CA3AF" strokeWidth="1" strokeLinecap="round"/><circle cx="4.5" cy="4.5" r="3.5" stroke="#9CA3AF" strokeWidth="1"/></svg>
                        {k.recentSessions} recent 1:1{k.recentSessions !== 1 ? "s" : ""}
                      </span>
                    )}
                    {k.pendingActions === 0 && k.key === "fcr" && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FEF3C7", color: "#92400E" }}>
                        Pending action
                      </span>
                    )}
                    {k.key === "fcr" && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#F3F4F6", color: "#6B7280" }}>
                        Recent 1:1
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* KPI Deep Dive */}
          <div className="border border-border rounded-xl bg-surface mb-5 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3 border-b border-border">
              <div className="flex items-center gap-2 mb-0.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polyline points="1,11 4,6 7,8 11,3 13,5" stroke="#10B981" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/></svg>
                <span className="text-sm font-semibold">KPI deep dive · {activeKpi.label}</span>
              </div>
              {/* B: helper text below title, not to the right */}
              <p className="text-xs text-text-tertiary m-0 pl-5">Click any KPI card above to switch focus.</p>
            </div>

            {/* Stats row */}
            <div className="px-5 py-4 flex items-center gap-8 border-b border-border">
              <div className="flex items-center gap-3">
                <span
                  className="text-xs font-bold px-2 py-1 rounded-md"
                  style={{ background: "#F0FDF9", color: "#10B981", border: "1px solid #D1FAE5" }}
                >
                  {activeKpi.label}
                </span>
                <span className="text-3xl font-bold text-text-primary">{activeKpi.value}</span>
                <span className="text-sm text-text-tertiary">vs target {activeKpi.target.replace("Target ", "")}</span>
              </div>
              {[
                { n: activeKpi.facts1, l: "FACTS" },
                { n: activeKpi.sessions, l: "SESSIONS" },
                { n: activeKpi.completed, l: "COMPLETED" },
                { n: activeKpi.pending, l: "PENDING" },
              ].map(s => (
                <div key={s.l} className="text-center">
                  <div className="text-xl font-bold text-text-primary">{s.n}</div>
                  <div className="text-[10px] text-text-tertiary font-medium tracking-wide">{s.l}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="px-5 py-3 border-b border-border">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary mb-3">Last 7 days trend</p>
              <DeepDiveChart kpi={activeKpi} />
              {/* Legend */}
              <div className="flex items-center gap-5 mt-3">
                <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <span style={{ width: 20, height: 2, background: "#10B981", display: "inline-block", borderRadius: 2 }} />
                  Agent
                </span>
                <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <span style={{ width: 20, height: 0, display: "inline-block", borderTop: "2px dashed #D1D5DB" }} />
                  Team
                </span>
                <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <span style={{ width: 20, height: 0, display: "inline-block", borderTop: "2px dashed #D1D5DB" }} />
                  Target
                </span>
              </div>
            </div>

            {/* Relevant Facts */}
            <div className="px-5 py-4 border-b border-border">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary mb-3">
                Relevant facts on {activeKpi.label}
              </p>
              {activeKpi.facts.length === 0 ? (
                <p className="text-sm text-text-tertiary">No relevant facts for this KPI.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {activeKpi.facts.map((f, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-1 h-8 rounded-full flex-shrink-0"
                          style={{ background: f.severity === "critical" ? "#EF4444" : "#F59E0B" }}
                        />
                        <span className="text-xs text-text-tertiary">{f.date}</span>
                        <span className="text-sm font-semibold" style={{ color: f.severity === "critical" ? "#EF4444" : "#F59E0B" }}>
                          {f.severity}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.2"/><circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2"/></svg>
                        </button>
                        <button className="text-text-tertiary hover:text-danger transition-colors p-1 rounded">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 4l6 4 6-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
                        </button>
                        <span className="text-xs font-medium text-brand flex items-center gap-1">
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 6l3 3 4-5" stroke="#10B981" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Actioned
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Storyline */}
            <div className="px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary flex items-center gap-1.5 m-0">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><polyline points="1,9 4,5 7,7 11,2" stroke="#9CA3AF" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round"/></svg>
                  Storyline
                </p>
                <button className="text-xs text-text-tertiary hover:text-text-primary transition-colors flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  Show 2 historical items
                </button>
              </div>
              <p className="text-sm text-text-tertiary text-center py-4">
                No pending items. Click &quot;Show history&quot; to see past activity.
              </p>
            </div>
          </div>

          {/* Other topics */}
          <div className="border border-border rounded-xl bg-surface overflow-hidden mb-8">
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2 mb-0.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4.5" r="2.5" stroke="#6B7280" strokeWidth="1.2"/><path d="M1.5 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <span className="text-sm font-semibold">Other topics</span>
              </div>
              {/* B: helper text below title */}
              <p className="text-xs text-text-tertiary m-0 pl-5">Wellness, career, attendance and other non-KPI conversations.</p>
            </div>
            <div className="p-5">
              {/* CEDP review card */}
              <div className="border border-border rounded-xl p-4" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: "#FEF3C7", color: "#92400E" }}>CEDP</span>
                  <span className="text-xs text-text-tertiary">Monthly review</span>
                </div>
                <p className="text-sm font-bold mb-1" style={{ color: "#D97706" }}>CEDP review pending</p>
                <p className="text-sm text-text-secondary mb-3">
                  Run this month&apos;s Continuous Employee Development Plan review with{" "}
                  <strong style={{ color: "#10B981" }}>João Silva</strong>.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-tertiary flex items-center gap-1">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke="#9CA3AF" strokeWidth="1"/><path d="M5.5 3v2.5l1.5 1.5" stroke="#9CA3AF" strokeWidth="1" strokeLinecap="round"/></svg>
                    Monthly cadence
                  </span>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white" style={{ background: "#10B981" }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M8 4l2 2-2 2" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Open CEDP
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── C. New Coaching Session panel ────────────────────────────── */}
          {showSession && (
            <div
              className="fixed inset-0 bg-black/30 z-40 flex justify-end"
              onClick={() => setShowSession(false)}
            >
              <div
                className="relative bg-white h-full w-[420px] flex flex-col shadow-2xl overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                {/* Panel header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#10B981" strokeWidth="1.3"/><path d="M5.5 8.5l2 2 3-3.5" stroke="#10B981" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-sm font-semibold">New Coaching Session</span>
                  </div>
                  <button onClick={() => setShowSession(false)} className="text-text-tertiary hover:text-text-primary p-1 rounded transition-colors">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>

                <div className="flex-1 px-5 py-5 flex flex-col gap-5 overflow-y-auto">

                  {/* C1: Employee as fixed read-only badge — no dropdown */}
                  <div>
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide block mb-2">Employee</label>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border bg-surface-muted">
                      <div className="w-7 h-7 rounded-full bg-brand-light flex items-center justify-center text-brand text-xs font-bold flex-shrink-0">
                        {agent.initials}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-text-primary">{agent.name}</div>
                        <div className="text-xs text-text-tertiary">{agent.tenure} · Customer Expert</div>
                      </div>
                      {/* Lock icon to make read-only nature clear */}
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="ml-auto flex-shrink-0"><rect x="2" y="5.5" width="9" height="7" rx="1.5" stroke="#D1D5DB" strokeWidth="1.1"/><path d="M4 5.5V4a2.5 2.5 0 015 0v1.5" stroke="#D1D5DB" strokeWidth="1.1"/></svg>
                    </div>
                    {/* B: helper below the field */}
                    <p className="text-[11px] text-text-tertiary mt-1.5 m-0">Session opened from {agent.name}&apos;s profile.</p>
                  </div>

                  {/* Session type */}
                  <div>
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide block mb-2">Session Type</label>
                    <select className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white text-text-primary focus:outline-none focus:border-brand">
                      <option>Select...</option>
                      <option>Coaching</option>
                      <option>Performance Review</option>
                      <option>Development</option>
                      <option>GROW</option>
                    </select>
                  </div>

                  {/* KPI Focus */}
                  <div>
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide block mb-2">KPI Focus</label>
                    <select className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white text-text-primary focus:outline-none focus:border-brand">
                      <option>None</option>
                      {agent.kpis.map(k => <option key={k.key}>{k.label}</option>)}
                    </select>
                  </div>

                  {/* Topic + C2: New Fact button with #54B282 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Topic / Subject</label>
                      {/* C2: primary green action color */}
                      <button
                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg text-white transition-colors"
                        style={{ background: "#54B282" }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="white" strokeWidth="1.4" strokeLinecap="round"/></svg>
                        New Fact
                      </button>
                    </div>
                    <select className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white text-text-primary focus:outline-none focus:border-brand">
                      <option>— Select a fact —</option>
                      {activeKpi.facts.map((f, i) => (
                        <option key={i}>{f.date} · {f.severity} · {f.text.slice(0, 50)}…</option>
                      ))}
                    </select>
                  </div>

                  {/* Voice recording */}
                  <div>
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide block mb-2">Voice Recording</label>
                    <div className="border border-border rounded-lg p-3 bg-surface-muted">
                      <textarea
                        rows={3}
                        className="w-full text-sm bg-transparent outline-none resize-none text-text-primary placeholder:text-text-tertiary"
                        placeholder="Transcript will appear here as you speak, or paste text manually..."
                      />
                      <div className="flex justify-end mt-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "#54B282" }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="white" strokeWidth="1.2"/><path d="M4 3.5v3l2.5-1.5L4 3.5z" fill="white"/></svg>
                          Start
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide block mb-2">Notes / Summary</label>
                    <textarea
                      rows={3}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white text-text-primary placeholder:text-text-tertiary outline-none resize-none focus:border-brand"
                      placeholder="Session notes..."
                    />
                  </div>

                  {/* C3: Actions — visible by default, no button needed to reveal */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                        Actions ({sessionActions.length})
                      </label>
                    </div>

                    {/* Existing actions */}
                    {sessionActions.length > 0 && (
                      <div className="flex flex-col gap-2 mb-3">
                        {sessionActions.map((a, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-2 border border-border rounded-lg bg-surface-muted">
                            <div>
                              <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded mr-2" style={{ background: "#D1FAE5", color: "#065F46" }}>{a.type}</span>
                              <span className="text-sm text-text-primary">{a.text}</span>
                            </div>
                            <button onClick={() => setSessionActions(prev => prev.filter((_, j) => j !== i))} className="text-text-tertiary hover:text-danger ml-2 flex-shrink-0">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* C3: Action type options always visible */}
                    <p className="text-[11px] text-text-tertiary mb-2">Add an action agreed during this session:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { type: "Coach Call",   label: "Coach Call",   icon: "💬" },
                        { type: "GROW",         label: "GROW",         icon: "🎯" },
                        { type: "QA Review",    label: "QA Review",    icon: "🔍" },
                        { type: "Model Call",   label: "Model Call",   icon: "📞" },
                        { type: "Training",     label: "Training",     icon: "📚" },
                        { type: "Assessment",   label: "Assessment",   icon: "📋" },
                      ].map(a => (
                        <button
                          key={a.type}
                          onClick={() => setSessionActions(prev => [...prev, { type: a.type, text: "" }])}
                          className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm text-text-secondary hover:border-brand hover:text-text-primary hover:bg-surface-muted transition-all text-left"
                        >
                          <span>{a.icon}</span>
                          <span className="font-medium">{a.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-border flex-shrink-0">
                  <button
                    onClick={() => setShowSession(false)}
                    className="text-sm text-danger border border-danger/30 px-3 py-1.5 rounded-lg hover:bg-danger/5 transition-colors"
                  >
                    Discard
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => setShowSession(false)} className="text-sm text-text-secondary border border-border px-3 py-1.5 rounded-lg hover:border-brand/40 transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={() => setShowSession(false)}
                      className="text-sm font-semibold text-white px-4 py-1.5 rounded-lg transition-colors"
                      style={{ background: "#10B981" }}
                    >
                      Save Session
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
