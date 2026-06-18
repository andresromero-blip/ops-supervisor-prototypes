"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { ChevronRight, ChevronDown, ChevronUp, Plus, CheckCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Period = "D-1" | "WTD" | "MTD" | "QTD";
type KpiStatus = "outlier" | "off-target" | "at-risk" | "on-target";
type SessionTone = "receptive" | "committed" | "defensive" | "disengaged" | "";

type Action = {
  type: string;
  dueDate: string;
  overdue: boolean;
  overdueDays?: number;
};

// Visual type: one of four — Insight / Action / Evidence / Alert
// Drives how a piece of content is rendered, not what it contains.

type KpiRow = {
  key: string;
  label: string;
  value: string;
  unit: string;
  target: string;
  delta: string;
  deltaPositive: boolean;
  status: KpiStatus;
  pendingActions: Action[];
  recentSessions: number;
  storyline: string | null;
  hypothesis: string | null;
  trendData: number[];
  teamData: number[];
  targetValue: number;
  facts: { date: string; severity: "critical" | "warning"; text: string }[];
};

type Agent = {
  id: string;
  name: string;
  initials: string;
  tenure: string;
  role: string;
  headline: string;          // "This conversation is about"
  lastSessionDate: string;
  lastSessionAgreement: string;
  coachingNote: string;
  focusKpi: string;          // key of the default focused KPI
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
    headline: "CSAT declining 3 weeks. Coach Call due Jun 18. QA Review overdue 2 days.",
    lastSessionDate: "Jun 10",
    lastSessionAgreement: "Applied closure script inconsistently — agreed to practice 3-step protocol this week.",
    coachingNote: "Responds better to concrete examples. Avoid abstract feedback.",
    focusKpi: "csat",
    kpis: [
      {
        key: "aht", label: "AHT", value: "390", unit: "s", target: "420",
        delta: "+2%", deltaPositive: true, status: "outlier",
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
        delta: "-11%", deltaPositive: false, status: "off-target",
        pendingActions: [],
        recentSessions: 3,
        storyline: "Sales declining for 3 weeks with no coaching actions in place. Needs a structured conversation to identify root cause.",
        hypothesis: "Likely missed upsell opportunities during call closure — same pattern as agents who struggle with the closure script.",
        trendData: [11.2, 10.8, 10.5, 10.3, 10.1, 10.0, 10.0],
        teamData:  [11.8, 11.9, 12.0, 11.8, 12.1, 12.0, 12.0],
        targetValue: 12,
        facts: [
          { date: "Jun 12", severity: "warning", text: "Sales rate 2pp below team average for second consecutive week." },
        ],
      },
      {
        key: "csat", label: "CSAT", value: "81.0", unit: "%", target: "85.0%",
        delta: "-1%", deltaPositive: false, status: "at-risk",
        pendingActions: [
          { type: "Coach Call", dueDate: "Jun 18", overdue: false },
          { type: "QA Review",  dueDate: "Jun 14", overdue: true, overdueDays: 2 },
        ],
        recentSessions: 3,
        storyline: "CSAT declining for 3 consecutive weeks. Last session (Jun 10) focused on call closure — João acknowledged the gap but hasn't applied the script consistently. QA Review overdue since Jun 14. Coach Call scheduled Jun 18.",
        hypothesis: "Inconsistent application of closure protocol is the primary driver. QA data should confirm.",
        trendData: [84, 83, 82, 82, 81, 81, 81],
        teamData:  [85, 85, 86, 85, 85, 85, 85],
        targetValue: 85,
        facts: [
          { date: "Jun 14", severity: "critical", text: "CSAT below 82% for 3 consecutive days — threshold breach." },
          { date: "Jun 11", severity: "warning", text: "Call closure missing in 4 of 8 monitored calls." },
          { date: "Jun 9",  severity: "warning", text: "Client escalation linked to incomplete resolution." },
        ],
      },
      {
        key: "fcr", label: "FCR", value: "73.0", unit: "%", target: "78.0%",
        delta: "-1%", deltaPositive: false, status: "at-risk",
        pendingActions: [
          { type: "Coach Call", dueDate: "Jun 20", overdue: false },
        ],
        recentSessions: 1,
        storyline: "FCR trending down for 2 weeks. Root cause not yet identified. Coach Call set for Jun 20 to explore whether it's a knowledge gap or case routing issue.",
        hypothesis: "Possibly related to the same closure issue affecting CSAT — unresolved cases being logged as resolved.",
        trendData: [76, 75, 74, 74, 73, 73, 73],
        teamData:  [78, 78, 79, 78, 78, 78, 78],
        targetValue: 78,
        facts: [
          { date: "Jun 13", severity: "warning", text: "3 cases reopened within 24h by same client." },
        ],
      },
      {
        key: "adh", label: "ADH", value: "92.0", unit: "%", target: "95.0%",
        delta: "0%", deltaPositive: true, status: "at-risk",
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
        delta: "-1%", deltaPositive: false, status: "on-target",
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
    headline: "AHT 37% above target for 3 weeks. No coaching plan in place. No sessions recorded.",
    lastSessionDate: "—",
    lastSessionAgreement: "No previous session on record. This is the first structured conversation.",
    coachingNote: "Experienced agent. Frame as efficiency, not underperformance. Start by understanding his own perception of his call time.",
    focusKpi: "aht",
    kpis: [
      {
        key: "aht", label: "AHT", value: "863", unit: "s", target: "630",
        delta: "+37%", deltaPositive: false, status: "outlier",
        pendingActions: [],
        recentSessions: 0,
        storyline: "AHT has been above target for 3+ weeks with no coaching intervention. No sessions have been held. This is the first structured conversation on this topic.",
        hypothesis: "Given 4 years of tenure, this is unlikely to be a knowledge gap. More likely inefficient case handling habits that have gone unchallenged. Start by understanding his own perception of his call time.",
        trendData: [718, 845, 890, 870, 855, 840, 863],
        teamData:  [691, 695, 693, 690, 692, 691, 691],
        targetValue: 630,
        facts: [
          { date: "Jun 14", severity: "critical", text: "AHT peaked at 890s — highest in team for the week." },
          { date: "Jun 10", severity: "warning", text: "3 calls over 1000s identified in QA monitoring." },
        ],
      },
      {
        key: "fcr", label: "FCR", value: "70", unit: "%", target: "75%",
        delta: "-7%", deltaPositive: false, status: "at-risk",
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
        delta: "+9%", deltaPositive: true, status: "on-target",
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
// Helpers
// ---------------------------------------------------------------------------
const STATUS_DOT: Record<KpiStatus, string> = {
  "outlier":    "text-danger",
  "off-target": "text-danger",
  "at-risk":    "text-warning",
  "on-target":  "text-success",
};

const STATUS_LABEL: Record<KpiStatus, string> = {
  "outlier":    "Outlier",
  "off-target": "Off target",
  "at-risk":    "At risk",
  "on-target":  "On target",
};

// ACTION visual type: dot + text + date, no badge
function ActionLine({ action }: { action: Action }) {
  if (action.overdue) {
    return (
      <p className="text-sm text-text-secondary m-0 flex items-baseline gap-1.5">
        <span className="text-danger font-medium">⚠</span>
        <span>{action.type}</span>
        <span className="text-danger text-xs">· Overdue {action.overdueDays}d</span>
      </p>
    );
  }
  return (
    <p className="text-sm text-text-secondary m-0 flex items-baseline gap-1.5">
      <span className="text-warning">●</span>
      <span>{action.type}</span>
      <span className="text-text-tertiary text-xs">· {action.dueDate}</span>
    </p>
  );
}

// Minimal SVG trend chart
function TrendChart({ kpi }: { kpi: KpiRow }) {
  const w = 600; const h = 120;
  const pad = { t: 12, b: 24, l: 24, r: 16 };
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
  const lineColor = kpi.status === "on-target" ? "#10B981" : kpi.status === "at-risk" ? "#F59E0B" : "#EF4444";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full block" style={{ height: 120 }}>
      <line x1={pad.l} y1={tY} x2={w - pad.r} y2={tY} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 3" />
      <text x={w - pad.r} y={tY - 4} textAnchor="end" fontSize="9" fill="#9CA3AF" fontFamily="Inter, system-ui">target</text>
      <path d={area} fill={`${lineColor}0D`} />
      <path d={teamPath} fill="none" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d={agentPath} fill="none" stroke={lineColor} strokeWidth="2" />
      {kpi.trendData.map((v, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(v)} r="2.5" fill={lineColor} />
          <text x={toX(i)} y={h - 4} textAnchor="middle" fontSize="9" fill="#9CA3AF" fontFamily="Inter, system-ui">{days[i]}</text>
        </g>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function OneToOnePage() {
  const [agentId, setAgentId]             = useState("joao-silva");
  const [agentDropdown, setAgentDropdown] = useState(false);
  const [period, setPeriod]               = useState<Period>("D-1");
  const [focusedKpi, setFocusedKpi]       = useState<string>("csat");
  const [kpisExpanded, setKpisExpanded]   = useState(false);
  const [trendExpanded, setTrendExpanded] = useState(false);
  const [factsExpanded, setFactsExpanded] = useState(false);
  const [sessionOpen, setSessionOpen]     = useState(false);
  const [sessionTopic, setSessionTopic]   = useState("");
  const [sessionAgreement, setSessionAgreement] = useState("");
  const [sessionFollowup, setSessionFollowup]   = useState("");
  const [sessionTone, setSessionTone]     = useState<SessionTone>("");
  const [sessionSaved, setSessionSaved]   = useState(false);

  const agent = AGENTS.find((a) => a.id === agentId) ?? AGENTS[0];
  const focused = agent.kpis.find((k) => k.key === focusedKpi) ?? agent.kpis[0];

  const handleAgentChange = (id: string) => {
    const a = AGENTS.find((x) => x.id === id);
    setAgentId(id);
    setAgentDropdown(false);
    setFocusedKpi(a?.focusKpi ?? a?.kpis[0]?.key ?? "");
    setKpisExpanded(false);
    setTrendExpanded(false);
    setFactsExpanded(false);
    setSessionOpen(false);
    setSessionSaved(false);
    setSessionTopic("");
    setSessionAgreement("");
    setSessionFollowup("");
    setSessionTone("");
  };

  const TONES: { value: SessionTone; label: string }[] = [
    { value: "receptive",  label: "Receptive"  },
    { value: "committed",  label: "Committed"  },
    { value: "defensive",  label: "Defensive"  },
    { value: "disengaged", label: "Disengaged" },
  ];

  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar />
      <main className="flex-1 font-sans text-text-primary px-8 py-8 overflow-x-hidden">
        <div style={{ maxWidth: 680 }} className="mx-auto">

          {/* ── Selector line ──────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-10">
            {/* Agent selector — no box, no label */}
            <div className="relative">
              <button
                onClick={() => setAgentDropdown((v) => !v)}
                className="flex items-center gap-2.5 text-left"
              >
                <span className="w-8 h-8 rounded-full bg-brand-light text-brand text-xs font-semibold flex items-center justify-center flex-shrink-0">
                  {agent.initials}
                </span>
                <span className="font-medium text-sm text-text-primary">{agent.name}</span>
                <ChevronDown size={14} className="text-text-tertiary" />
              </button>
              {agentDropdown && (
                <div className="absolute top-[calc(100%+6px)] left-0 bg-surface border border-border rounded-lg overflow-hidden z-10 shadow-md min-w-[220px]">
                  {AGENTS.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => handleAgentChange(a.id)}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left border-b border-border last:border-b-0 transition-colors ${a.id === agentId ? "bg-surface-muted font-medium" : "hover:bg-surface-muted"}`}
                    >
                      <span className="w-6 h-6 rounded-full bg-brand-light text-brand text-xs font-semibold flex items-center justify-center flex-shrink-0">{a.initials}</span>
                      {a.name}
                      <span className="text-text-tertiary text-xs ml-auto">{a.tenure}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right side: period + new session */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {(["D-1", "WTD", "MTD", "QTD"] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-2.5 py-1 text-xs rounded font-medium border transition-colors ${period === p ? "bg-brand text-white border-transparent" : "bg-surface text-text-secondary border-border hover:border-brand/40"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSessionOpen((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md bg-brand text-white hover:bg-brand/90 transition-colors"
              >
                <Plus size={13} /> New Session
              </button>
            </div>
          </div>

          {/* ── BLOQUE 1 — Persona + contexto ──────────────────────── */}
          {/* No box. Pure typography. */}
          <div className="mb-10">
            <h1 className="text-2xl font-semibold text-text-primary m-0 mb-0.5">{agent.name}</h1>
            <p className="text-sm text-text-secondary m-0 mb-6">{agent.tenure} · {agent.role}</p>

            {/* INSIGHT: This conversation is about */}
            <p className="text-[11px] uppercase tracking-wide text-text-tertiary m-0 mb-1">This conversation is about</p>
            <p className="text-sm text-text-primary m-0 mb-6 leading-relaxed">{agent.headline}</p>

            {/* EVIDENCE: Last session */}
            <p className="text-[11px] uppercase tracking-wide text-text-tertiary m-0 mb-1">
              Last session
              {agent.lastSessionDate !== "—" && (
                <span className="ml-2 normal-case text-text-tertiary">{agent.lastSessionDate}</span>
              )}
            </p>
            <p className={`text-sm m-0 mb-6 leading-relaxed ${agent.lastSessionDate === "—" ? "text-danger" : "text-text-secondary"}`}>
              {agent.lastSessionAgreement}
            </p>

            {/* INSIGHT: Coaching note */}
            <p className="text-[11px] uppercase tracking-wide text-text-tertiary m-0 mb-1">Coaching note</p>
            <p className="text-sm text-text-secondary italic m-0 leading-relaxed">{agent.coachingNote}</p>
          </div>

          {/* Divider */}
          <div className="border-t border-border mb-8" />

          {/* ── BLOQUE 2 — KPI en foco ─────────────────────────────── */}
          {/* One line. No card. Color communicates status. */}
          <div className="mb-6">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-text-primary">{focused.label}</span>
                <span className={`text-sm font-semibold ${STATUS_DOT[focused.status]}`}>
                  {focused.value}{focused.unit && <span className="text-sm font-normal text-text-secondary"> {focused.unit}</span>}
                </span>
                <span className={`text-xs ${STATUS_DOT[focused.status]}`}>· {STATUS_LABEL[focused.status]}</span>
              </div>
              <span className="text-xs text-text-tertiary">
                {focused.deltaPositive ? "+" : ""}{focused.delta} vs target {focused.target}
              </span>
            </div>
          </div>

          {/* ── BLOQUE 3 — Storyline + evidencia ───────────────────── */}
          <div className="mb-8">
            {/* INSIGHT label */}
            <p className="text-[11px] uppercase tracking-wide text-text-tertiary m-0 mb-2">Storyline</p>

            {focused.storyline ? (
              <p className="text-sm text-text-secondary m-0 mb-4 leading-relaxed">{focused.storyline}</p>
            ) : (
              <p className="text-sm text-text-tertiary italic m-0 mb-4">No issues recorded. No conversation needed unless the agent raises it.</p>
            )}

            {/* ACTION lines — pending actions */}
            {focused.pendingActions.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-4">
                {focused.pendingActions.map((a, i) => (
                  <ActionLine key={i} action={a} />
                ))}
              </div>
            )}

            {/* INSIGHT: Hypothesis */}
            {focused.hypothesis && (
              <div className="mb-4">
                <p className="text-[11px] uppercase tracking-wide text-text-tertiary m-0 mb-1">Hypothesis</p>
                <p className="text-sm text-text-secondary italic m-0 leading-relaxed">{focused.hypothesis}</p>
              </div>
            )}

            {/* EVIDENCE: 7-day trend — collapsible */}
            <div className="mb-2">
              <button
                onClick={() => setTrendExpanded((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors"
              >
                <span>7-day trend</span>
                <ChevronRight size={12} className={`transition-transform ${trendExpanded ? "rotate-90" : ""}`} />
              </button>
              {trendExpanded && (
                <div className="mt-3 mb-1">
                  <TrendChart kpi={focused} />
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
                      <span className="w-3 border-t-2 border-brand inline-block" /> Agent
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
                      <span className="w-3 border-t border-dashed border-border inline-block" /> Team
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
                      <span className="w-3 border-t border-dashed border-text-tertiary inline-block" /> Target
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* EVIDENCE: Relevant facts — collapsible */}
            {focused.facts.length > 0 && (
              <div>
                <button
                  onClick={() => setFactsExpanded((v) => !v)}
                  className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  <span>Relevant facts · {focused.facts.length}</span>
                  <ChevronRight size={12} className={`transition-transform ${factsExpanded ? "rotate-90" : ""}`} />
                </button>
                {factsExpanded && (
                  <div className="mt-3 flex flex-col gap-2">
                    {focused.facts.map((f, i) => (
                      <div key={i} className={`flex items-start gap-3 pl-3 border-l-2 ${f.severity === "critical" ? "border-danger" : "border-warning"}`}>
                        <span className="text-xs text-text-tertiary font-mono whitespace-nowrap w-12 flex-shrink-0">{f.date}</span>
                        <p className="text-xs text-text-secondary m-0 leading-relaxed">{f.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border mb-6" />

          {/* ── BLOQUE 4 — KPIs secundarios (colapsado) ────────────── */}
          <div className="mb-8">
            <button
              onClick={() => setKpisExpanded((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors mb-3"
            >
              <span>All KPIs</span>
              <ChevronRight size={12} className={`transition-transform ${kpisExpanded ? "rotate-90" : ""}`} />
            </button>

            {kpisExpanded && (
              <div className="flex flex-col">
                {agent.kpis.map((kpi) => (
                  <button
                    key={kpi.key}
                    onClick={() => {
                      setFocusedKpi(kpi.key);
                      setTrendExpanded(false);
                      setFactsExpanded(false);
                    }}
                    className={`flex items-center gap-3 py-2.5 border-b border-border last:border-b-0 text-left transition-colors hover:bg-surface-muted -mx-2 px-2 rounded ${kpi.key === focusedKpi ? "bg-surface-muted" : ""}`}
                  >
                    {/* STATUS DOT */}
                    <span className={`text-base leading-none flex-shrink-0 ${STATUS_DOT[kpi.status]}`}>●</span>

                    {/* LABEL */}
                    <span className="text-sm font-medium text-text-primary w-14 flex-shrink-0">{kpi.label}</span>

                    {/* VALUE */}
                    <span className={`text-sm w-16 flex-shrink-0 ${STATUS_DOT[kpi.status]}`}>
                      {kpi.value}{kpi.unit && <span className="text-xs text-text-tertiary"> {kpi.unit}</span>}
                    </span>

                    {/* STATUS LABEL — text, no badge */}
                    <span className={`text-xs w-20 flex-shrink-0 ${STATUS_DOT[kpi.status]}`}>{STATUS_LABEL[kpi.status]}</span>

                    {/* ACTION inline */}
                    <span className="text-xs text-text-secondary flex-1">
                      {kpi.pendingActions.length === 0 && kpi.recentSessions > 0 && (
                        <span className="text-success">✓ {kpi.recentSessions} recent 1:1{kpi.recentSessions > 1 ? "s" : ""}</span>
                      )}
                      {kpi.pendingActions.length === 0 && kpi.recentSessions === 0 && (
                        <span className="text-danger">No plan · Create session</span>
                      )}
                      {kpi.pendingActions.map((a, i) => (
                        <span key={i} className={a.overdue ? "text-danger" : "text-warning"}>
                          {i > 0 && " · "}
                          {a.overdue ? `⚠ ${a.type} overdue ${a.overdueDays}d` : `● ${a.type} · ${a.dueDate}`}
                        </span>
                      ))}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── BLOQUE 5 — Cierre de sesión (colapsado) ────────────── */}
          <div className="mb-8">
            <button
              onClick={() => setSessionOpen((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors"
            >
              <CheckCircle size={13} className={sessionSaved ? "text-success" : "text-text-tertiary"} />
              <span>{sessionSaved ? "Session recorded" : "Close session"}</span>
              <ChevronRight size={12} className={`transition-transform ${sessionOpen ? "rotate-90" : ""}`} />
            </button>

            {sessionOpen && !sessionSaved && (
              <div className="mt-6 flex flex-col gap-5">
                {/* Topic */}
                <div>
                  <label className="text-[11px] uppercase tracking-wide text-text-tertiary block mb-2">
                    Topic discussed <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={sessionTopic}
                    onChange={(e) => setSessionTopic(e.target.value)}
                    placeholder="e.g. CSAT decline — closure script"
                    className="w-full text-sm bg-transparent border-b border-border pb-2 focus:outline-none focus:border-brand transition-colors placeholder:text-text-tertiary"
                  />
                </div>

                {/* Agreement */}
                <div>
                  <label className="text-[11px] uppercase tracking-wide text-text-tertiary block mb-2">Agreement</label>
                  <input
                    type="text"
                    value={sessionAgreement}
                    onChange={(e) => setSessionAgreement(e.target.value)}
                    placeholder="e.g. Apply closure script for 1 week"
                    className="w-full text-sm bg-transparent border-b border-border pb-2 focus:outline-none focus:border-brand transition-colors placeholder:text-text-tertiary"
                  />
                </div>

                {/* Follow-up */}
                <div>
                  <label className="text-[11px] uppercase tracking-wide text-text-tertiary block mb-2">Follow-up by</label>
                  <input
                    type="text"
                    value={sessionFollowup}
                    onChange={(e) => setSessionFollowup(e.target.value)}
                    placeholder="e.g. Jun 25"
                    className="w-full text-sm bg-transparent border-b border-border pb-2 focus:outline-none focus:border-brand transition-colors placeholder:text-text-tertiary"
                  />
                </div>

                {/* Tone — radio in text, no chips */}
                <div>
                  <label className="text-[11px] uppercase tracking-wide text-text-tertiary block mb-2">
                    How did they respond? <span className="text-danger">*</span>
                  </label>
                  <div className="flex gap-4">
                    {TONES.map((t) => (
                      <label key={t.value} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="tone"
                          value={t.value}
                          checked={sessionTone === t.value}
                          onChange={() => setSessionTone(t.value)}
                          className="accent-brand"
                        />
                        <span className="text-sm text-text-secondary">{t.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Save */}
                <div className="flex justify-end">
                  <button
                    onClick={() => { if (sessionTopic && sessionTone) setSessionSaved(true); }}
                    disabled={!sessionTopic || !sessionTone}
                    className="text-sm font-medium px-4 py-2 rounded-md bg-brand text-white hover:bg-brand/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Save session
                  </button>
                </div>
              </div>
            )}

            {/* Saved state */}
            {sessionOpen && sessionSaved && (
              <div className="mt-4 flex flex-col gap-1">
                <p className="text-sm text-text-secondary m-0"><span className="text-text-tertiary text-xs">Topic</span> {sessionTopic}</p>
                {sessionAgreement && <p className="text-sm text-text-secondary m-0"><span className="text-text-tertiary text-xs">Agreement</span> {sessionAgreement}{sessionFollowup && ` · by ${sessionFollowup}`}</p>}
                <p className="text-sm text-text-secondary m-0 capitalize"><span className="text-text-tertiary text-xs">Response</span> {sessionTone}</p>
              </div>
            )}
          </div>

          {/* ── Footer link ─────────────────────────────────────────── */}
          <div className="border-t border-border pt-4">
            <button className="text-xs text-text-tertiary hover:text-brand transition-colors">
              CEDP pending review →
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
