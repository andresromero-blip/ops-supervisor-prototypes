"use client";

import React, { useState } from "react";
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
        delta: "+2%", deltaPos: true, status: "on-target",
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
  {
    id: "maria-santos", name: "Maria Santos", initials: "MS", tenure: "2y", focusKpi: "csat",
    kpis: [{ key:"csat", label:"CSAT", value:"88.0", unit:"%", target:"Target 85.0%", delta:"+3%", deltaPos:true, status:"on-target" as KpiStatus, pendingActions:0, recentSessions:1, facts:[], trendData:[87,87.5,88,88,88,88,88], teamData:[84,85,85,85,85,85,85], targetValue:85, facts1:0, sessions:1, completed:1, pending:0 }],
  },
  {
    id: "carlos-mendes", name: "Carlos Mendes", initials: "CM", tenure: "3y", focusKpi: "csat",
    kpis: [{ key:"csat", label:"CSAT", value:"82.0", unit:"%", target:"Target 85.0%", delta:"-3%", deltaPos:false, status:"at-risk" as KpiStatus, pendingActions:1, recentSessions:2, facts:[], trendData:[83,83,82.5,82,82,82,82], teamData:[84,85,85,85,85,85,85], targetValue:85, facts1:1, sessions:2, completed:0, pending:1 }],
  },
  {
    id: "ana-ferreira", name: "Ana Ferreira", initials: "AF", tenure: "1.5y", focusKpi: "csat",
    kpis: [{ key:"csat", label:"CSAT", value:"85.0", unit:"%", target:"Target 85.0%", delta:"0%", deltaPos:true, status:"on-target" as KpiStatus, pendingActions:0, recentSessions:1, facts:[], trendData:[85,85,85,85,85,85,85], teamData:[84,85,85,85,85,85,85], targetValue:85, facts1:0, sessions:1, completed:1, pending:0 }],
  },
  {
    id: "pedro-costa", name: "Pedro Costa", initials: "PC", tenure: "2y", focusKpi: "csat",
    kpis: [{ key:"csat", label:"CSAT", value:"79.0", unit:"%", target:"Target 85.0%", delta:"-6%", deltaPos:false, status:"off-target" as KpiStatus, pendingActions:2, recentSessions:3, facts:[], trendData:[81,80,80,79,79,79,79], teamData:[84,85,85,85,85,85,85], targetValue:85, facts1:2, sessions:3, completed:0, pending:2 }],
  },
  {
    id: "sofia-rodrigues", name: "Sofia Rodrigues", initials: "SR", tenure: "4y", focusKpi: "csat",
    kpis: [{ key:"csat", label:"CSAT", value:"87.0", unit:"%", target:"Target 85.0%", delta:"+2%", deltaPos:true, status:"on-target" as KpiStatus, pendingActions:0, recentSessions:1, facts:[], trendData:[87,87,87,87,87,87,87], teamData:[84,85,85,85,85,85,85], targetValue:85, facts1:0, sessions:1, completed:1, pending:0 }],
  },
  {
    id: "ricardo-nunes", name: "Ricardo Nunes", initials: "RN", tenure: "1y", focusKpi: "adh",
    kpis: [{ key:"adh", label:"ADH", value:"85.0", unit:"%", target:"Target 95.0%", delta:"-10%", deltaPos:false, status:"at-risk" as KpiStatus, pendingActions:1, recentSessions:1, facts:[], trendData:[86,86,85.5,85,85,85,85], teamData:[94,95,95,95,95,95,95], targetValue:95, facts1:0, sessions:1, completed:0, pending:1 }],
  },
  {
    id: "beatriz-lopes", name: "Beatriz Lopes", initials: "BL", tenure: "3y", focusKpi: "csat",
    kpis: [{ key:"csat", label:"CSAT", value:"89.0", unit:"%", target:"Target 85.0%", delta:"+4%", deltaPos:true, status:"on-target" as KpiStatus, pendingActions:0, recentSessions:2, facts:[], trendData:[88,89,89,89,89,89,89], teamData:[84,85,85,85,85,85,85], targetValue:85, facts1:0, sessions:2, completed:2, pending:0 }],
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
function DeepDiveChart({ kpi, lineColor = "#10B981" }: { kpi: KpiCard; lineColor?: string }) {
  // Canvas — NO side padding: the SVG fills the full card width edge-to-edge
  const W = 700; const H = 220;
  const PT = 24; const PB = 28; // top/bottom only — left/right = 0

  const allVals = [...kpi.trendData, ...kpi.teamData, kpi.targetValue];
  const minV = Math.min(...allVals) * 0.97;
  const maxV = Math.max(...allVals) * 1.03;
  const rangeV = maxV - minV || 1;

  const days = ["D-6", "", "D-4", "D-3", "", "D-1", "Today"];
  const n = kpi.trendData.length;
  // X: first point at 2% from left, last point at 98% from left
  const toX = (i: number) => (i / (n - 1)) * W;
  const toY = (v: number) => PT + (1 - (v - minV) / rangeV) * (H - PT - PB);

  const agentPath = kpi.trendData.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(" ");
  const teamPath  = kpi.teamData.map((v, i)  => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(" ");
  const areaPath  = `${agentPath} L ${toX(n-1).toFixed(1)} ${(H-PB).toFixed(1)} L ${toX(0).toFixed(1)} ${(H-PB).toFixed(1)} Z`;
  const targetY   = toY(kpi.targetValue);
  const areaFill  = lineColor === "#10B981" ? "rgba(16,185,129,0.09)"
                  : lineColor === "#EF4444" ? "rgba(239,68,68,0.07)"
                  : "rgba(245,158,11,0.07)";

  // Y grid: 4 rounded values
  const step = Math.round((maxV - minV) / 3 / 5) * 5 || 1;
  const yLabels = [minV, minV + step, minV + step * 2, maxV].map(v => Math.round(v));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", height: 240 }}>
      {/* Horizontal grid lines + floating Y labels */}
      {yLabels.map((v, i) => {
        const y = toY(v);
        return (
          <g key={i}>
            <line x1={0} y1={y} x2={W} y2={y} stroke="#F3F4F6" strokeWidth="1" />
            <text x={8} y={y - 4} fontSize="10" fill="#9CA3AF" fontFamily="Inter,system-ui,sans-serif">{v}</text>
          </g>
        );
      })}

      {/* Target line — dark dashed, full width */}
      <line x1={0} y1={targetY} x2={W} y2={targetY} stroke="#374151" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
      {/* TARGET label — inside, top-right */}
      <text x={W - 6} y={targetY - 5} textAnchor="end" fontSize="9" fill="#9CA3AF" fontFamily="Inter,system-ui,sans-serif" fontWeight="600">TARGET</text>

      {/* Team dashed line */}
      <path d={teamPath} fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="4 3" />

      {/* Area fill under agent */}
      <path d={areaPath} fill={areaFill} />

      {/* Agent line */}
      <path d={agentPath} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {/* X axis baseline */}
      <line x1={0} y1={H - PB} x2={W} y2={H - PB} stroke="#E5E7EB" strokeWidth="1" />

      {/* X labels */}
      {days.map((d, i) => d && (
        <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#9CA3AF" fontFamily="Inter,system-ui,sans-serif">{d}</text>
      ))}
    </svg>
  );
}


// ── Accordion content field ────────────────────────────────────────────────
function ContentField({ label }: { label: string; key?: number | string }) {
  const [open, setOpen] = React.useState(false);
  const placeholders: Record<string, string> = {
    "Goal": "What outcome are we working toward?",
    "Performance Review": "How is the agent performing against expectations?",
    "Improvement Opportunities Discussion": "What specific areas need development?",
    "Development Plan": "What steps and resources will support growth?",
    "Notes / Summary": "Session notes and key takeaways...",
  };
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-white hover:bg-surface-muted transition-colors text-left"
      >
        <span className="text-xs font-medium text-text-secondary">{label}</span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          className={"transition-transform duration-150 " + (open ? "rotate-180" : "")}
        >
          <path d="M2 4l4 4 4-4" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </button>
      {open && (
        <div className="px-3 pb-3 bg-white border-t border-border">
          <textarea
            rows={4}
            className="w-full mt-2 text-sm border border-border rounded-lg px-3 py-2 bg-surface-muted placeholder:text-text-tertiary outline-none resize-none focus:border-brand"
            placeholder={placeholders[label] ?? label + "..."}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function OneToOnePage() {
  const [selectedAgentId, setSelectedAgentId] = useState(AGENTS[0].id);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [agentSearch, setAgentSearch] = useState("");
  const agent = AGENTS.find(a => a.id === selectedAgentId) ?? AGENTS[0];
  const [focusKpi, setFocusKpi] = useState(agent.focusKpi);
  const [showSession, setShowSession] = useState(false);
  const [sessionActions, setSessionActions] = useState<{type:string;text:string;dueDate:string}[]>([]);
  const hasActions = sessionActions.length !== 0;
  const [savedToast, setSavedToast] = useState(false);

  const activeKpi = agent.kpis.find(k => k.key === focusKpi) ?? agent.kpis[0];
  const handleSave = () => {
    setShowSession(false);
    setSessionActions([]);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };
  const mainStyle: React.CSSProperties = showSession
    ? { paddingRight: '540px' }
    : {};

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
        <main className="flex-1 font-sans text-text-primary overflow-x-hidden px-8 py-6" style={mainStyle}>

          {/* Page title */}
          <div className="mb-5">
            <h1 className="text-2xl font-semibold m-0 mb-1">One to One</h1>
            <p className="text-sm text-text-secondary m-0">Coaching & Development Dashboard · KPI → Root Causes → Actions</p>
          </div>

          {/* Agent module — collapses when session panel is open */}
          <div className="border border-border rounded-xl mb-5 bg-surface transition-all" style={{position:"relative", zIndex: 20}}>
            {!showSession ? (
              /* Full view: label + selector + buttons */
              <div className="px-4 pt-3 pb-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary mb-2 flex items-center gap-1.5">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="3.5" r="2" stroke="#9CA3AF" strokeWidth="1.1"/><path d="M1 10c0-2.5 2.02-4 4.5-4s4.5 1.5 4.5 4" stroke="#9CA3AF" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  AGENT
                </p>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 min-w-0">
                    <div onClick={() => { setShowAgentDropdown(v => !v); setAgentSearch(""); }}
                      className="flex items-center gap-3 border border-border rounded-lg px-3 py-2 bg-white cursor-pointer hover:border-brand/40 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand text-xs font-bold flex-shrink-0">{agent.initials}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-text-primary">{agent.name}</div>
                        <div className="text-xs text-text-tertiary">— · {agent.tenure}</div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                        <path d={showAgentDropdown ? "M3 8.5l4-4 4 4" : "M3 5.5l4 4 4-4"} stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                    </div>
                    {showAgentDropdown && (
                      <div className="absolute top-[calc(100%+4px)] left-0 bg-white border border-border rounded-xl shadow-xl overflow-hidden" style={{zIndex:50, minWidth:"320px", width:"100%"}}>
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#9CA3AF" strokeWidth="1.2"/><path d="M10 10l3 3" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round"/></svg>
                          <input autoFocus type="text" placeholder="Search employee..."
                            value={agentSearch} onChange={e => setAgentSearch(e.target.value)}
                            className="flex-1 text-sm outline-none bg-transparent text-text-primary placeholder:text-text-tertiary"/>
                        </div>
                        <div className="px-4 pt-2 pb-1">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Other</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto pb-2">
                          {AGENTS.filter(a => a.name.toLowerCase().includes(agentSearch.toLowerCase())).map(a => (
                            <div key={a.id}
                              onClick={() => { setSelectedAgentId(a.id); setFocusKpi(a.focusKpi); setShowAgentDropdown(false); setAgentSearch(""); }}
                              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${a.id === selectedAgentId ? "bg-surface-muted" : "hover:bg-surface-muted"}`}>
                              <div className="w-7 h-7 rounded-full bg-brand-light flex items-center justify-center text-brand text-[10px] font-bold flex-shrink-0">{a.initials}</div>
                              <span className={`text-sm flex-1 ${a.id === selectedAgentId ? "font-semibold text-text-primary" : "text-text-secondary"}`}>{a.name}</span>
                              {a.id === selectedAgentId && <span className="text-xs text-text-tertiary">2 active</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm text-text-secondary bg-surface hover:border-brand/40 transition-colors flex-shrink-0 whitespace-nowrap">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1.5" width="11" height="10" rx="1.5" stroke="#6B7280" strokeWidth="1.1"/><path d="M4 5h5M4 8h3" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    CEDP
                  </button>
                  <button
                    onClick={() => setShowSession(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white flex-shrink-0 whitespace-nowrap"
                    style={{ background: "#10B981" }}
                  >
                    + New Session
                  </button>
                </div>
              </div>
            ) : (
              /* Collapsed view when session panel is open: compact single row */
              <div className="px-4 py-2.5 flex items-center gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary flex items-center gap-1.5 flex-shrink-0">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="3.5" r="2" stroke="#9CA3AF" strokeWidth="1.1"/><path d="M1 10c0-2.5 2.02-4 4.5-4s4.5 1.5 4.5 4" stroke="#9CA3AF" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  AGENT
                </p>
                <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 bg-white flex-1 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-brand-light flex items-center justify-center text-brand text-[10px] font-bold flex-shrink-0">
                    {agent.initials}
                  </div>
                  <span className="text-sm font-semibold text-text-primary truncate">{agent.name}</span>
                  <span className="text-xs text-text-tertiary flex-shrink-0">— · {agent.tenure}</span>
                </div>
              </div>
            )}
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
          <div className="mb-5">
            {/* Header: title + helper below */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <polyline points="1,11 4,6 7,8 11,3 13,5"
                    stroke={VALUE_COLORS[activeKpi.status]}
                    strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>
                </svg>
                <span className="text-sm font-semibold">KPI deep dive · {activeKpi.label}</span>
              </div>
              <p className="text-xs text-text-tertiary m-0 ml-5">Click any KPI card above to switch focus.</p>
            </div>

            {/* Single card: stats + chart + legend */}
            <div className="border border-border rounded-xl bg-surface overflow-hidden mb-3">

              {/* Stats row */}
              <div className="px-5 py-4 flex items-center gap-8 border-b border-border">
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                    style={{
                      background: activeKpi.status === "outlier" ? "#FEE2E2"
                                : activeKpi.status === "off-target" ? "#FEF3C7"
                                : activeKpi.status === "at-risk" ? "#FEF3C7"
                                : "#D1FAE5",
                      color: VALUE_COLORS[activeKpi.status],
                      border: `1px solid ${activeKpi.status === "outlier" ? "#FECACA"
                        : activeKpi.status === "off-target" || activeKpi.status === "at-risk" ? "#FDE68A"
                        : "#A7F3D0"}`
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <polyline points="1,8 3.5,5 6,6.5 9,2" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round"/>
                    </svg>
                    {activeKpi.label}
                  </span>
                  <span className="font-bold" style={{ color: VALUE_COLORS[activeKpi.status], fontSize: 42, lineHeight: 1 }}>
                    {activeKpi.value}<span style={{ fontSize: 24, fontWeight: 700 }}>{activeKpi.unit}</span>
                  </span>
                  <span className="text-sm text-text-tertiary">vs target {activeKpi.target.replace("Target ", "")}</span>
                </div>
                {[
                  { n: activeKpi.facts1,   l: "FACTS"     },
                  { n: activeKpi.sessions, l: "SESSIONS"  },
                  { n: activeKpi.completed,l: "COMPLETED" },
                  { n: activeKpi.pending,  l: "PENDING"   },
                ].map(s => (
                  <div key={s.l} className="text-center">
                    <div className="text-2xl font-bold text-text-primary leading-tight">{s.n}</div>
                    <div className="text-[10px] text-text-tertiary font-semibold tracking-widest mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Chart — full width, no horizontal padding */}
              <div className="pt-4 pb-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary px-5 mb-3">
                  Last 7 days trend
                </p>
                <DeepDiveChart kpi={activeKpi} lineColor={VALUE_COLORS[activeKpi.status]} />
              </div>

              {/* Legend right-aligned */}
              <div className="flex items-center justify-end gap-5 px-5 py-3">
                <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <span style={{ width: 20, height: 2, background: VALUE_COLORS[activeKpi.status], display: "inline-block", borderRadius: 2 }} />
                  Agent
                </span>
                <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <span style={{ width: 20, height: 0, display: "inline-block", borderTop: "2px dashed #9CA3AF" }} />
                  Team
                </span>
                <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <span style={{ width: 20, height: 0, display: "inline-block", borderTop: "2px dashed #374151" }} />
                  Target
                </span>
              </div>
            </div>

            {/* Storyline card */}
            <div className="border border-border rounded-xl bg-surface overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary flex items-center gap-1.5 m-0">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><polyline points="1,9 4,5 7,7 11,2" stroke="#9CA3AF" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round"/></svg>
                  Storyline
                </p>
              </div>
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-text-tertiary italic m-0">
                  No coaching activity recorded for this KPI yet.
                </p>
              </div>
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

          {/* ── New Coaching Session panel — fixed right, no overlay ── */}
          {showSession && (
            <div
              className="fixed top-[44px] right-0 bottom-0 z-40 bg-white flex flex-col border-l border-border shadow-2xl"
              style={{ width: 520, overflowY: "hidden" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="#10B981" strokeWidth="1.3"/><path d="M4.5 7.5l2.5 2.5 3.5-4" stroke="#10B981" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-sm font-semibold">New Coaching Session</span>
                  </div>
                  <button onClick={() => setShowSession(false)} className="text-text-tertiary hover:text-text-primary p-1 rounded transition-colors">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>

                {/* Draft notice */}
                <div className="mx-4 mt-3 flex items-start gap-2 px-3 py-2 rounded-lg border border-border bg-surface-muted flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="mt-0.5 flex-shrink-0"><rect x="1" y="1" width="10" height="10" rx="1.5" stroke="#9CA3AF" strokeWidth="1"/><path d="M3 4h6M3 6h4" stroke="#9CA3AF" strokeWidth="1" strokeLinecap="round"/></svg>
                  <p className="text-[11px] text-text-tertiary m-0 leading-relaxed">
                    Draft in progress. × or Cancel to keep editing later — use <span className="font-semibold">Discard</span> to clear all fields.
                  </p>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

                  {/* ════ ZONA 1 — CONTEXTO ════════════════════════════ */}
                {/* Row: Employee | Session Type | KPI Focus */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary block mb-1.5">Employee</label>
                    <div className="flex items-center gap-2 px-2.5 py-2 border border-border rounded-lg bg-surface-muted cursor-default">
                      <div className="w-5 h-5 rounded-full bg-brand-light flex items-center justify-center text-brand text-[9px] font-bold flex-shrink-0">{agent.initials}</div>
                      <span className="text-sm text-text-primary truncate">{agent.name}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary block mb-1.5">Session Type</label>
                    <select className="w-full text-sm border border-border rounded-lg px-2.5 py-2 bg-surface-muted text-text-secondary focus:outline-none focus:border-brand">
                      <option value="">Select...</option>
                      <option>Coaching</option>
                      <option>Performance Review</option>
                      <option>Development</option>
                      <option>GROW</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary block mb-1.5">KPI Focus</label>
                    <select className="w-full text-sm border border-border rounded-lg px-2.5 py-2 bg-surface-muted text-text-primary focus:outline-none focus:border-brand">
                      <option>None</option>
                      {agent.kpis.map(k => <option key={k.key}>{k.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Topic / Subject */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary block mb-1.5">Topic / Subject</label>
                  <select className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface-muted text-text-secondary focus:outline-none focus:border-brand mb-2">
                    <option>— Select a fact —</option>
                    {activeKpi.facts.map((f, i) => <option key={i}>{f.date} · {f.severity} — {f.text.slice(0,45)}</option>)}
                  </select>
                  <button className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-border bg-white text-text-secondary hover:border-brand hover:text-brand transition-colors">
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M4.5 1v7M1 4.5h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                    + New Fact
                  </button>
                </div>

                {/* Linked Improvement Point */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary block mb-1.5">Linked Improvement Point</label>
                  <select className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface-muted text-text-secondary focus:outline-none focus:border-brand">
                    <option>— Select —</option>
                    <option>Improve closing technique — only 35% pitch rate</option>
                    <option>Greeting protocol compliance — failed 3 consecutive evals</option>
                  </select>
                </div>

                {/* ── Divider ─────────────────────────────────────────── */}
                <div className="border-t border-border" />

                {/* ════ ZONA 2 — CONTENIDO ════════════════════════════ */}
                {/* Accordion: each content field collapses independently */}
                {["Goal", "Performance Review", "Improvement Opportunities Discussion", "Development Plan", "Notes / Summary"].map((fieldName, fi) => (
                  <ContentField label={fieldName} key={fi} />
                ))}

                {/* ── Divider ─────────────────────────────────────────── */}
                <div className="border-t border-border" />

                {/* ════ ZONA 3 — COMPROMISOS ══════════════════════════ */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary block mb-2">
                    Actions ({sessionActions.length === 0 ? 1 : sessionActions.length})
                  </label>
                  <button
                    onClick={() => setSessionActions(prev => [...prev, {type:"Human Coaching", text:"", dueDate:""}])}
                    className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-border bg-white text-text-secondary hover:border-brand hover:text-brand transition-colors mb-3"
                  >
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M4.5 1v7M1 4.5h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                    + Add Action
                  </button>

                  {/* Default empty action */}
                  {sessionActions.length === 0 && (
                    <div className="border border-border rounded-xl p-3 bg-white">
                      <span className="text-xs text-text-tertiary block mb-2">Action 1</span>
                      <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface-muted placeholder:text-text-tertiary outline-none resize-none focus:border-brand mb-3" placeholder="Describe the action..."/>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="text-[11px] text-text-tertiary font-medium block mb-1">Category</label>
                          <select className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-surface-muted focus:outline-none focus:border-brand">
                            <option>Human Coaching</option><option>Training</option><option>AI Coaching</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] text-text-tertiary font-medium block mb-1">Due Date</label>
                          <input type="date" className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-surface-muted focus:outline-none focus:border-brand"/>
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-text-tertiary font-medium block mb-1">Coaching Tool</label>
                        <select className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-surface-muted focus:outline-none focus:border-brand text-text-tertiary">
                          <option value="">Select tool...</option>
                          <option>GROW Model</option><option>Customer Experience Coaching</option>
                          <option>Feedback Conversation</option><option>Side-by-Side Observation</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {sessionActions.map((a, i) => (
                    <div key={i} className="border border-border rounded-xl p-3 bg-white mb-3 last:mb-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-text-tertiary">Action {i + 1}</span>
                        <button onClick={() => setSessionActions(prev => prev.filter((_, j) => j !== i))} className="text-danger hover:opacity-70 transition-opacity">
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M10 3.5l-.5 7H3.5L3 3.5" stroke="#EF4444" strokeWidth="1.1" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                      <textarea rows={3} value={hasActions ? a.text : ""}
                        onChange={hasActions ? e => setSessionActions(prev => prev.map((x,j) => j===i?{...x,text:e.target.value}:x)) : undefined}
                        className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface-muted placeholder:text-text-tertiary outline-none resize-none focus:border-brand mb-3"
                        placeholder="Describe the action..."/>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="text-[11px] text-text-tertiary font-medium block mb-1">Category</label>
                          <select value={hasActions ? a.type : "Human Coaching"}
                            onChange={hasActions ? e => setSessionActions(prev => prev.map((x,j) => j===i?{...x,type:e.target.value}:x)) : undefined}
                            className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-surface-muted focus:outline-none focus:border-brand">
                            <option>Human Coaching</option><option>Training</option><option>AI Coaching</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] text-text-tertiary font-medium block mb-1">Due Date</label>
                          <input type="date" value={hasActions ? a.dueDate : ""}
                            onChange={hasActions ? e => setSessionActions(prev => prev.map((x,j) => j===i?{...x,dueDate:e.target.value}:x)) : undefined}
                            className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-surface-muted focus:outline-none focus:border-brand"/>
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-text-tertiary font-medium block mb-1">Coaching Tool</label>
                        <select className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-surface-muted focus:outline-none focus:border-brand text-text-tertiary">
                          <option value="">Select tool...</option>
                          <option>GROW Model</option><option>Customer Experience Coaching</option>
                          <option>Feedback Conversation</option><option>Side-by-Side Observation</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-border flex-shrink-0 bg-white">
                  <button onClick={() => {setShowSession(false); setSessionActions([]);}}
                    className="flex items-center gap-1.5 text-sm text-danger border border-danger/30 px-3 py-1.5 rounded-lg hover:bg-danger/5 transition-colors font-medium">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M4.5 3V2h3v1M9.5 3l-.4 6.5H2.9L2.5 3" stroke="#EF4444" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    Discard
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => setShowSession(false)} className="text-sm text-text-secondary border border-border px-3 py-1.5 rounded-lg hover:border-brand/40 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSave}
                      className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-1.5 rounded-lg"
                      style={{background:"#10B981"}}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Save Session
                    </button>
                  </div>
                </div>
            </div>
          )}
          {/* ── Success toast ── */}
          {savedToast && (
            <div
              className="fixed bottom-6 left-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold"
              style={{
                transform: "translateX(-50%)",
                background: "#10B981",
                animation: "fadeInUp 0.2s ease",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.5" opacity="0.5"/>
                <path d="M5 8l2.5 2.5 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Coaching session saved successfully
              <button
                onClick={() => setSavedToast(false)}
                className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
