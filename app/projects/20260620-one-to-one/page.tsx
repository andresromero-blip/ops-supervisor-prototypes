"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { GlobalHeader } from "@/components/Header";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Period = "D-1" | "WTD" | "MTD" | "QTD";
type KpiStatus = "outlier" | "off-target" | "at-risk" | "on-target";
type SessionTone = "receptive" | "committed" | "defensive" | "disengaged" | "";

type PendingAction = {
  type: string;
  dueDate: string;
  overdue: boolean;
  overdueDays?: number;
};

type Fact = {
  date: string;
  severity: "critical" | "warning";
  text: string;
};

type KpiRow = {
  key: string;
  label: string;
  value: string;
  unit: string;
  target: string;
  delta: string;
  deltaPositive: boolean;   // true = moving in the right direction
  status: KpiStatus;
  lowerIsBetter: boolean;   // AHT, Absence = lower is better; CSAT, FCR, NPS = higher is better
  pendingActions: PendingAction[];
  recentSessions: number;
  storyline: string | null;
  hypothesis: string | null;
  trendData: number[];
  teamData: number[];
  targetValue: number;
  facts: Fact[];
};

type Agent = {
  id: string;
  name: string;
  initials: string;
  tenure: string;
  role: string;
  headline: string;
  lastSessionDate: string;
  lastSessionAgreement: string;
  coachingNote: string;
  focusKpi: string;
  kpis: KpiRow[];
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const AGENTS: Agent[] = [
  {
    id: "joao-silva",
    name: "João Silva",
    initials: "JS",
    tenure: "1 year",
    role: "Customer Expert",
    headline: "CSAT declining 3 weeks — closure script not being applied consistently. QA Review overdue.",
    lastSessionDate: "Jun 10",
    lastSessionAgreement: "João acknowledged the gap in call closures and agreed to practice the 3-step protocol consistently throughout the week.",
    coachingNote: "Responds better to concrete examples than abstract feedback. Lead with observed behavior, not metrics.",
    focusKpi: "csat",
    kpis: [
      {
        key: "aht", label: "AHT", value: "390", unit: "s", target: "420",
        delta: "+2%", deltaPositive: true, status: "outlier", lowerIsBetter: true,
        pendingActions: [],
        recentSessions: 3,
        storyline: "AHT consistently below target. No action needed — monitor to maintain.",
        hypothesis: null,
        trendData: [410, 405, 400, 395, 392, 388, 390],
        teamData:  [420, 418, 422, 419, 421, 420, 420],
        targetValue: 420,
        facts: [],
      },
      {
        key: "sales", label: "Sales", value: "10.0", unit: "%", target: "12.0%",
        delta: "-11%", deltaPositive: false, status: "off-target", lowerIsBetter: false,
        pendingActions: [],
        recentSessions: 3,
        storyline: "Sales declining for 3 weeks with no coaching actions in place. Needs a structured conversation to identify root cause.",
        hypothesis: "Likely missed upsell opportunities during call closure — same pattern seen in agents who struggle with the closure script.",
        trendData: [11.2, 10.8, 10.5, 10.3, 10.1, 10.0, 10.0],
        teamData:  [11.8, 11.9, 12.0, 11.8, 12.1, 12.0, 12.0],
        targetValue: 12,
        facts: [
          { date: "Jun 12", severity: "warning", text: "Sales rate 2pp below team average for second consecutive week." },
        ],
      },
      {
        key: "csat", label: "CSAT", value: "81.0", unit: "%", target: "85.0%",
        delta: "-1%", deltaPositive: false, status: "at-risk", lowerIsBetter: false,
        pendingActions: [
          { type: "Coach Call", dueDate: "Jun 18", overdue: false },
          { type: "QA Review",  dueDate: "Jun 14", overdue: true, overdueDays: 2 },
        ],
        recentSessions: 3,
        storyline: "CSAT declining for 3 consecutive weeks. Last session (Jun 10) focused on call closure — João acknowledged the gap but hasn't applied the script consistently. QA Review overdue since Jun 14. Coach Call scheduled Jun 18.",
        hypothesis: "Inconsistent application of closure protocol is the primary driver. QA data should confirm whether it's knowledge or habit.",
        trendData: [84, 83, 82, 82, 81, 81, 81],
        teamData:  [85, 85, 86, 85, 85, 85, 85],
        targetValue: 85,
        facts: [
          { date: "Jun 14", severity: "critical", text: "CSAT below 82% for 3 consecutive days — threshold breach." },
          { date: "Jun 11", severity: "warning", text: "Call closure missing in 4 of 8 monitored calls." },
          { date: "Jun 9",  severity: "warning", text: "Client escalation linked to incomplete resolution on João's queue." },
        ],
      },
      {
        key: "fcr", label: "FCR", value: "73.0", unit: "%", target: "78.0%",
        delta: "-1%", deltaPositive: false, status: "at-risk", lowerIsBetter: false,
        pendingActions: [
          { type: "Coach Call", dueDate: "Jun 20", overdue: false },
        ],
        recentSessions: 1,
        storyline: "FCR trending down for 2 weeks. Root cause not yet identified. Coach Call set for Jun 20 to explore whether it's a knowledge gap or a case routing issue.",
        hypothesis: "Possibly related to the same closure issue affecting CSAT — unresolved cases being logged as resolved.",
        trendData: [76, 75, 74, 74, 73, 73, 73],
        teamData:  [78, 78, 79, 78, 78, 78, 78],
        targetValue: 78,
        facts: [
          { date: "Jun 13", severity: "warning", text: "3 cases reopened within 24h — same client segment." },
        ],
      },
      {
        key: "adh", label: "ADH", value: "92.0", unit: "%", target: "95.0%",
        delta: "0%", deltaPositive: true, status: "at-risk", lowerIsBetter: false,
        pendingActions: [
          { type: "Assessment", dueDate: "Jun 15", overdue: true, overdueDays: 1 },
        ],
        recentSessions: 1,
        storyline: "ADH stable at 92% but persistently 3pp below target. Assessment overdue since Jun 15.",
        hypothesis: "Schedule adherence may be affected by call overflow — worth checking if extended calls push past scheduled end time.",
        trendData: [93, 92, 92, 92, 92, 92, 92],
        teamData:  [95, 95, 94, 95, 95, 95, 95],
        targetValue: 95,
        facts: [],
      },
      {
        key: "nps", label: "NPS", value: "85", unit: "", target: "45",
        delta: "-1%", deltaPositive: false, status: "on-target", lowerIsBetter: false,
        pendingActions: [],
        recentSessions: 1,
        storyline: null,
        hypothesis: null,
        trendData: [86, 86, 85, 85, 85, 85, 85],
        teamData:  [80, 81, 82, 82, 83, 84, 84],
        targetValue: 45,
        facts: [],
      },
    ],
  },
  {
    id: "pedro-godinho",
    name: "Pedro Godinho",
    initials: "PG",
    tenure: "4 years",
    role: "Customer Expert",
    headline: "AHT 37% above target for 3 consecutive weeks. No coaching plan in place. First structured conversation on this topic.",
    lastSessionDate: "",
    lastSessionAgreement: "",
    coachingNote: "Experienced agent — frame as efficiency opportunity, not underperformance. Start by understanding his own perception of his call time before offering solutions.",
    focusKpi: "aht",
    kpis: [
      {
        key: "aht", label: "AHT", value: "863", unit: "s", target: "630",
        delta: "+37%", deltaPositive: false, status: "outlier", lowerIsBetter: true,
        pendingActions: [],
        recentSessions: 0,
        storyline: "AHT above target for 3+ weeks with no coaching intervention. No sessions recorded. This is the first structured conversation on this topic.",
        hypothesis: "Given 4 years of tenure, this is unlikely a knowledge gap. More likely inefficient case handling habits that have gone unchallenged. Start by understanding his own perception.",
        trendData: [718, 845, 890, 870, 855, 840, 863],
        teamData:  [691, 695, 693, 690, 692, 691, 691],
        targetValue: 630,
        facts: [
          { date: "Jun 14", severity: "critical", text: "AHT peaked at 890s — highest in team this week." },
          { date: "Jun 10", severity: "warning", text: "3 calls over 1000s identified in QA monitoring." },
        ],
      },
      {
        key: "fcr", label: "FCR", value: "70", unit: "%", target: "75%",
        delta: "-7%", deltaPositive: false, status: "at-risk", lowerIsBetter: false,
        pendingActions: [
          { type: "Coach Call", dueDate: "Jun 17", overdue: true, overdueDays: 1 },
        ],
        recentSessions: 1,
        storyline: "FCR flat at 70% for 4 weeks. Coach Call scheduled Jun 17 — overdue by 1 day. Last session (Jun 5) identified case categorization as a likely driver.",
        hypothesis: "Cases being reopened suggest first contact resolution is failing due to incomplete case notes, not the call itself.",
        trendData: [72, 71, 70, 70, 70, 70, 70],
        teamData:  [77, 77, 78, 78, 78, 77, 77],
        targetValue: 75,
        facts: [],
      },
      {
        key: "nps", label: "NPS", value: "60", unit: "", target: "55",
        delta: "+9%", deltaPositive: true, status: "on-target", lowerIsBetter: false,
        pendingActions: [],
        recentSessions: 1,
        storyline: null,
        hypothesis: null,
        trendData: [58, 59, 60, 60, 60, 60, 60],
        teamData:  [55, 55, 56, 56, 55, 55, 55],
        targetValue: 55,
        facts: [],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<KpiStatus, { color: string; bg: string; label: string; dot: string }> = {
  "outlier":    { color: "text-danger",  bg: "bg-danger-light",  label: "Outlier",    dot: "#EF4444" },
  "off-target": { color: "text-danger",  bg: "bg-danger-light",  label: "Off target", dot: "#EF4444" },
  "at-risk":    { color: "text-warning", bg: "bg-warning-light", label: "At risk",    dot: "#F59E0B" },
  "on-target":  { color: "text-success", bg: "bg-success-light", label: "On target",  dot: "#10B981" },
};

const TONE_OPTIONS: { value: SessionTone; label: string }[] = [
  { value: "receptive",  label: "Receptive"  },
  { value: "committed",  label: "Committed"  },
  { value: "defensive",  label: "Defensive"  },
  { value: "disengaged", label: "Disengaged" },
];

// ---------------------------------------------------------------------------
// Semantic color resolution
// "Outlier" AHT below target = GOOD (green). "Outlier" AHT above target = BAD (red).
// The color must reflect the direction of the deviation, not just its existence.
// ---------------------------------------------------------------------------
function semanticConfig(kpi: KpiRow): { color: string; bg: string; label: string; dot: string } {
  const base = STATUS_CONFIG[kpi.status];

  // For on-target KPIs, always use success color regardless of lowerIsBetter
  if (kpi.status === "on-target") return base;

  // For outlier/off-target: check if the deviation is in the favorable direction
  const favorableDeviation =
    (kpi.lowerIsBetter && kpi.deltaPositive) ||   // lower is better AND value is below target
    (!kpi.lowerIsBetter && kpi.deltaPositive);    // higher is better AND value is above target

  if (favorableDeviation && kpi.status === "outlier") {
    // Outlier in a good direction: green, not red
    return { color: "text-success", bg: "bg-success-light", label: "Outlier", dot: "#10B981" };
  }

  return base;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

// Pending action pill — kept as a visual component because urgency/overdue
// needs color distinction that pure text can't communicate as quickly
function ActionPill({ action }: { action: PendingAction }) {
  if (action.overdue) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-danger-light text-danger border border-danger/20">
        <AlertTriangle size={11} />
        {action.type} · Overdue {action.overdueDays}d
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-warning-light text-warning border border-warning/20">
      <Clock size={11} />
      {action.type} · {action.dueDate}
    </span>
  );
}

// Minimal SVG trend chart
function TrendChart({ kpi }: { kpi: KpiRow }) {
  const w = 560; const h = 140;
  const pad = { t: 16, b: 28, l: 20, r: 16 };
  const days = ["D-6", "D-5", "D-4", "D-3", "D-2", "D-1", "Today"];
  const all = [...kpi.trendData, ...kpi.teamData, kpi.targetValue];
  const minV = Math.min(...all) * 0.97;
  const maxV = Math.max(...all) * 1.03;
  const range = maxV - minV || 1;
  const toX = (i: number) => pad.l + (i * (w - pad.l - pad.r)) / (days.length - 1);
  const toY = (v: number) => h - pad.b - ((v - minV) / range) * (h - pad.t - pad.b);
  const agentPath = kpi.trendData.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`).join(" ");
  const teamPath  = kpi.teamData.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`).join(" ");
  const tY = toY(kpi.targetValue);
  const area = `${agentPath} L ${toX(kpi.trendData.length - 1)} ${h - pad.b} L ${toX(0)} ${h - pad.b} Z`;
  const cfg = STATUS_CONFIG[kpi.status];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full block" style={{ height: 140 }}>
      <line x1={pad.l} y1={tY} x2={w - pad.r} y2={tY}
        stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 3" />
      <text x={w - pad.r} y={tY - 5} textAnchor="end" fontSize="9"
        fill="#9CA3AF" fontFamily="Inter, system-ui">target</text>
      <path d={area} fill={`${cfg.dot}12`} />
      <path d={teamPath} fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d={agentPath} fill="none" stroke={cfg.dot} strokeWidth="2" />
      {kpi.trendData.map((v, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(v)} r="3" fill={cfg.dot} />
          <text x={toX(i)} y={h - 5} textAnchor="middle" fontSize="9"
            fill="#9CA3AF" fontFamily="Inter, system-ui">{days[i]}</text>
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
  const [focusedKpi, setFocusedKpi]     = useState<string>("csat");
  const [kpisOpen, setKpisOpen]         = useState(false);
  const [trendOpen, setTrendOpen]       = useState(false);
  const [factsOpen, setFactsOpen]       = useState(false);
  const [sessionOpen, setSessionOpen]   = useState(false);
  const [sessionTopic, setSessionTopic] = useState("");
  const [sessionAgreement, setSessionAgreement] = useState("");
  const [sessionFollowup, setSessionFollowup]   = useState("");
  const [sessionTone, setSessionTone]   = useState<SessionTone>("");
  const [sessionSaved, setSessionSaved] = useState(false);

  const agent  = AGENTS.find((a) => a.id === agentId) ?? AGENTS[0];
  const focused = agent.kpis.find((k) => k.key === focusedKpi) ?? agent.kpis[0];
  const cfg    = semanticConfig(focused);

  const selectAgent = (id: string) => {
    const a = AGENTS.find((x) => x.id === id);
    setAgentId(id);
    setAgentDropdown(false);
    setFocusedKpi(a?.focusKpi ?? a?.kpis[0]?.key ?? "");
    setKpisOpen(false);
    setTrendOpen(false);
    setFactsOpen(false);
    setSessionOpen(false);
    setSessionSaved(false);
    setSessionTopic(""); setSessionAgreement("");
    setSessionFollowup(""); setSessionTone("");
  };

  const selectKpi = (key: string) => {
    setFocusedKpi(key);
    setTrendOpen(false);
    setFactsOpen(false);
  };

  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar />

      <main className="flex-1 font-sans text-text-primary overflow-x-hidden">

        {/* ── Topbar ──────────────────────────────────────────────────── */}
        <div className="border-b border-border px-8 py-3 flex items-center justify-between bg-surface sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-tertiary">One to One</span>
            <span className="text-text-tertiary">·</span>
            <span className="text-text-secondary font-medium">{agent.name}</span>
            <span className="text-text-tertiary">·</span>
            <span className="text-text-tertiary text-xs">Coaching &amp; Development</span>
          </div>
          <div className="flex items-center gap-3">
            {/* ITERATION D1: period selector removed — lives in global header */}
            <button
              onClick={() => setSessionOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-brand text-white hover:bg-brand/90 transition-colors">
              <Plus size={13} /> New Session
            </button>
          </div>
        </div>

        <div className="flex h-[calc(100vh-44px)]">

          {/* ── Left column: Person + context ─────────────────────────── */}
          {/* Fixed-width preparation zone. Quiet, contextual, human. */}
          <div className="w-72 flex-shrink-0 border-r border-border bg-surface-muted overflow-y-auto flex flex-col">

            {/* Agent identity — top of the left column, generous padding */}
            <div className="px-6 pt-8 pb-6 border-b border-border">
              <div className="relative">
                <button
                  onClick={() => setAgentDropdown((v) => !v)}
                  className="w-full flex items-center gap-3 text-left group"
                >
                  <div className="w-11 h-11 rounded-full bg-brand text-white text-sm font-semibold flex items-center justify-center flex-shrink-0 shadow-sm">
                    {agent.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-text-primary m-0 leading-tight">{agent.name}</p>
                    <p className="text-xs text-text-secondary m-0 mt-0.5">{agent.tenure} · {agent.role}</p>
                  </div>
                  <ChevronDown size={14} className="text-text-tertiary flex-shrink-0 group-hover:text-text-secondary transition-colors" />
                </button>
                {agentDropdown && (
                  <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-surface border border-border rounded-lg overflow-hidden z-10 shadow-lg">
                    {AGENTS.map((a) => (
                      <button key={a.id} onClick={() => selectAgent(a.id)}
                        className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left border-b border-border last:border-b-0 transition-colors ${
                          a.id === agentId ? "bg-surface-muted font-medium" : "hover:bg-surface-muted"
                        }`}>
                        <span className="w-7 h-7 rounded-full bg-brand text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">{a.initials}</span>
                        <span className="flex-1">{a.name}</span>
                        <span className="text-text-tertiary text-xs">{a.tenure}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Conversation context — the coaching preparation content */}
            <div className="flex-1 px-6 py-6 flex flex-col gap-7">

              {/* What this conversation is about */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary mb-2">This conversation</p>
                <p className="text-sm text-text-primary leading-relaxed m-0">{agent.headline}</p>
              </div>

              {/* Last session memory */}
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary m-0">Last session</p>
                  {agent.lastSessionDate && (
                    <span className="text-[10px] text-text-tertiary">{agent.lastSessionDate}</span>
                  )}
                </div>
                {agent.lastSessionAgreement ? (
                  <p className="text-sm text-text-secondary leading-relaxed m-0">{agent.lastSessionAgreement}</p>
                ) : (
                  <p className="text-sm text-danger m-0 leading-relaxed">No previous session on record. This is the first structured conversation.</p>
                )}
              </div>

              {/* Coaching approach note */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary mb-2">Coaching approach</p>
                <p className="text-sm text-text-secondary italic leading-relaxed m-0">{agent.coachingNote}</p>
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* KPI navigation — compact list, selector */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary mb-3">KPIs</p>
                <div className="flex flex-col gap-0.5">
                  {agent.kpis.map((kpi) => {
                    const k = semanticConfig(kpi);
                    const isActive = kpi.key === focusedKpi;
                    const hasOverdue = kpi.pendingActions.some((a) => a.overdue);
                    const hasPending = kpi.pendingActions.length > 0 && !hasOverdue;
                    const noPlan = kpi.pendingActions.length === 0 && kpi.recentSessions === 0 && kpi.status !== "on-target";
                    return (
                      <button
                        key={kpi.key}
                        onClick={() => selectKpi(kpi.key)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left transition-all ${
                          isActive
                            ? "bg-surface border border-border shadow-sm"
                            : "hover:bg-surface/70"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: k.dot }} />
                        <span className={`text-xs font-medium flex-shrink-0 w-11 ${isActive ? "text-text-primary" : "text-text-secondary"}`}>
                          {kpi.label}
                        </span>
                        <span className={`text-xs font-semibold flex-shrink-0 ${k.color}`}>
                          {kpi.value}{kpi.unit && <span className="font-normal text-text-tertiary text-[10px]"> {kpi.unit}</span>}
                        </span>
                        <span className="flex-1 text-right">
                          {hasOverdue  && <span className="text-[10px] font-semibold text-danger">overdue</span>}
                          {hasPending  && <span className="text-[10px] font-semibold text-warning">pending</span>}
                          {noPlan      && <span className="text-[10px] font-semibold text-danger">no plan</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* CEDP link — anchored to bottom */}
            <div className="px-6 py-4 border-t border-border">
              <button className="text-xs text-text-tertiary hover:text-brand transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-warning flex-shrink-0" />
                CEDP pending review →
              </button>
            </div>
          </div>

          {/* ── Right column: Coaching workspace ──────────────────────── */}
          {/* More air. Storyline is the protagonist. Evidence is secondary. */}
          <div className="flex-1 overflow-y-auto bg-surface">
            <div className="px-12 py-10" style={{ maxWidth: 680 }}>

              {/* ── KPI header ──────────────────────────────────────────── */}
              {/* Large, confident. The number anchors the conversation. */}
              <div className="mb-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary m-0 mb-2">
                  {focused.label}
                </p>
                <div className="flex items-end justify-between">
                  <div className="flex items-baseline gap-4">
                    <span className={`text-5xl font-bold leading-none tracking-tight ${cfg.color}`}>
                      {focused.value}
                    </span>
                    {focused.unit && (
                      <span className="text-2xl font-normal text-text-tertiary">{focused.unit}</span>
                    )}
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-tertiary m-0 mb-0.5">Target {focused.target}</p>
                    <p className={`text-sm font-semibold m-0 ${focused.deltaPositive ? "text-success" : "text-danger"}`}>
                      {focused.delta}
                    </p>
                  </div>
                </div>

                {/* Action pills — visible but not dominant */}
                {focused.pendingActions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-5">
                    {focused.pendingActions.map((a, i) => (
                      <ActionPill key={i} action={a} />
                    ))}
                  </div>
                )}
                {focused.pendingActions.length === 0 && focused.recentSessions === 0 && focused.status !== "on-target" && (
                  <div className="mt-5">
                    <span className="text-xs font-medium text-danger bg-danger-light px-3 py-1.5 rounded-full border border-danger/20">
                      No coaching plan — create a session
                    </span>
                  </div>
                )}
                {focused.pendingActions.length === 0 && focused.recentSessions > 0 && (
                  <p className="text-xs text-text-tertiary mt-4 m-0 flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-success" />
                    {focused.recentSessions} recent 1:1{focused.recentSessions > 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* ── Storyline ───────────────────────────────────────────── */}
              {/* The narrative center of the coaching workspace.
                  This is what the supervisor reads to prepare the conversation.
                  More space, more readable type size. */}
              <div className="mb-10">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary mb-4">Storyline</p>
                {focused.storyline ? (
                  <p className="text-[15px] text-text-secondary leading-[1.75] m-0">{focused.storyline}</p>
                ) : (
                  <p className="text-[15px] text-text-tertiary italic leading-[1.75] m-0">
                    No issues recorded for this KPI. No conversation needed unless the agent raises it.
                  </p>
                )}
              </div>

              {/* ── Hypothesis ──────────────────────────────────────────── */}
              {/* Indented, italic. A thought, not a fact. */}
              {focused.hypothesis && (
                <div className="mb-10 pl-5 border-l-2 border-border">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary mb-3">Hypothesis</p>
                  <p className="text-sm text-text-secondary italic leading-relaxed m-0">{focused.hypothesis}</p>
                </div>
              )}

              {/* ── 7-day trend — collapsible ───────────────────────────── */}
              <div className="mb-2 border-t border-border">
                <button
                  onClick={() => setTrendOpen((v) => !v)}
                  className="flex items-center gap-2.5 w-full text-left py-4 hover:text-text-primary transition-colors group"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {focused.trendData[focused.trendData.length - 1] > focused.trendData[0]
                      ? <TrendingUp size={14} className={`${cfg.color} opacity-70`} />
                      : <TrendingDown size={14} className={`${cfg.color} opacity-70`} />
                    }
                    <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                      7-day trend
                    </span>
                    <span className="text-xs text-text-tertiary">Agent vs Team vs Target</span>
                  </div>
                  {trendOpen
                    ? <ChevronUp size={14} className="text-text-tertiary" />
                    : <ChevronDown size={14} className="text-text-tertiary" />
                  }
                </button>
                {trendOpen && (
                  <div className="pb-6">
                    <TrendChart kpi={focused} />
                    <div className="flex items-center gap-6 mt-3">
                      {[
                        { label: "Agent",  style: "solid" as const,  color: cfg.dot },
                        { label: "Team",   style: "dashed" as const, color: "#D1D5DB" },
                        { label: "Target", style: "dashed" as const, color: "#9CA3AF" },
                      ].map((l) => (
                        <span key={l.label} className="flex items-center gap-1.5 text-xs text-text-tertiary">
                          <span className="w-5 inline-block" style={{
                            borderTopWidth: 2,
                            borderTopStyle: l.style,
                            borderTopColor: l.color,
                          }} />
                          {l.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Relevant facts — collapsible ─────────────────────────── */}
              {focused.facts.length > 0 && (
                <div className="mb-2 border-t border-border">
                  <button
                    onClick={() => setFactsOpen((v) => !v)}
                    className="flex items-center gap-2.5 w-full text-left py-4 hover:text-text-primary transition-colors group"
                  >
                    <AlertTriangle size={14} className="text-text-tertiary flex-shrink-0" />
                    <span className="flex-1 text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                      Relevant facts
                    </span>
                    <span className="text-xs text-text-tertiary mr-2">{focused.facts.length} recorded</span>
                    {factsOpen
                      ? <ChevronUp size={14} className="text-text-tertiary" />
                      : <ChevronDown size={14} className="text-text-tertiary" />
                    }
                  </button>
                  {factsOpen && (
                    <div className="pb-6 flex flex-col gap-4">
                      {focused.facts.map((f, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <span className="text-xs text-text-tertiary whitespace-nowrap mt-0.5 w-12 flex-shrink-0 font-mono">{f.date}</span>
                          <div className={`w-0.5 self-stretch rounded-full flex-shrink-0 ${f.severity === "critical" ? "bg-danger" : "bg-warning"}`} />
                          <p className="text-sm text-text-secondary m-0 leading-relaxed">{f.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Session close ────────────────────────────────────────── */}
              {/* At the bottom. Only expands when the conversation is done. */}
              <div className="border-t border-border mt-2">
                <button
                  onClick={() => setSessionOpen((v) => !v)}
                  className="flex items-center gap-2.5 w-full text-left py-4 hover:text-text-primary transition-colors group"
                >
                  <CheckCircle size={14}
                    className={sessionSaved ? "text-success flex-shrink-0" : "text-text-tertiary flex-shrink-0"} />
                  <span className="flex-1 text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                    {sessionSaved ? "Session recorded" : "Close session — record outcome"}
                  </span>
                  {sessionOpen
                    ? <ChevronUp size={14} className="text-text-tertiary" />
                    : <ChevronDown size={14} className="text-text-tertiary" />
                  }
                </button>

                {sessionOpen && !sessionSaved && (
                  <div className="pb-8 flex flex-col gap-7">
                    {/* ITERATION D3: Employee shown as fixed badge - no editable dropdown */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-brand-light rounded-lg border border-brand/20">
                      <div className="w-6 h-6 rounded-full bg-brand text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">{agent.initials}</div>
                      <span className="text-sm font-medium text-brand">Session for {agent.name}</span>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary block mb-3">
                        Topic discussed <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        value={sessionTopic}
                        onChange={(e) => setSessionTopic(e.target.value)}
                        placeholder="e.g. CSAT decline — closure script not being applied"
                        className="w-full text-sm text-text-primary bg-transparent border-b border-border pb-2.5 focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-tertiary"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary block mb-3">
                        Agreement
                      </label>
                      <input
                        type="text"
                        value={sessionAgreement}
                        onChange={(e) => setSessionAgreement(e.target.value)}
                        placeholder="e.g. Apply 3-step closure script in every call this week"
                        className="w-full text-sm text-text-primary bg-transparent border-b border-border pb-2.5 focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-tertiary"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary block mb-3">
                        Follow-up by
                      </label>
                      <input
                        type="text"
                        value={sessionFollowup}
                        onChange={(e) => setSessionFollowup(e.target.value)}
                        placeholder="e.g. Jun 25"
                        className="w-full text-sm text-text-primary bg-transparent border-b border-border pb-2.5 focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-tertiary"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary block mb-3">
                        How did they respond? <span className="text-danger">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {TONE_OPTIONS.map((t) => (
                          <button
                            key={t.value}
                            onClick={() => setSessionTone(t.value)}
                            className={`text-sm px-4 py-2 rounded-full border transition-all ${
                              sessionTone === t.value
                                ? "bg-text-primary text-white border-text-primary"
                                : "bg-surface border-border text-text-secondary hover:border-text-secondary"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => { if (sessionTopic && sessionTone) setSessionSaved(true); }}
                        disabled={!sessionTopic || !sessionTone}
                        className="text-sm font-medium px-6 py-2.5 rounded-md bg-brand text-white hover:bg-brand/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Save session
                      </button>
                    </div>
                  </div>
                )}

                {sessionOpen && sessionSaved && (
                  <div className="pb-6 flex flex-col gap-3">
                    <div className="flex items-baseline gap-4">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary w-24 flex-shrink-0">Topic</span>
                      <span className="text-sm text-text-secondary">{sessionTopic}</span>
                    </div>
                    {sessionAgreement && (
                      <div className="flex items-baseline gap-4">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary w-24 flex-shrink-0">Agreement</span>
                        <span className="text-sm text-text-secondary">
                          {sessionAgreement}{sessionFollowup && <span className="text-text-tertiary"> · by {sessionFollowup}</span>}
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-4">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary w-24 flex-shrink-0">Response</span>
                      <span className="text-sm text-text-secondary capitalize">{sessionTone}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </main>
      </div>
    </div>
  );
}
