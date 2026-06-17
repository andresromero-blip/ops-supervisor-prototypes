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
  MessageSquare,
  TrendingDown,
  TrendingUp,
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

type LastSession = {
  date: string;
  topic: string;
  agreement: string;
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
  trendData: number[];
  teamData: number[];
  targetValue: number;
  storyline: string | null;
  hypothesis: string | null; // root cause hypothesis for preparation
};

type AgentPrep = {
  headline: string;          // "De qué trata esta conversación"
  keyDataPoint: string;      // el dato más relevante para la hipótesis
  keyDataContext: string;    // contraste equipo o tendencia
  lastSession: LastSession | null;
  agentTone: string;         // cómo responde históricamente al coaching
};

type Agent = {
  id: string;
  name: string;
  initials: string;
  tenure: string;
  prep: AgentPrep;
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
  {
    id: "joao-silva",
    name: "João Silva",
    initials: "JS",
    tenure: "1y",
    prep: {
      headline: "CSAT declining 3 weeks · QA Review overdue · Coach Call due Jun 18",
      keyDataPoint: "CSAT at 81% — down 4pp in 3 weeks",
      keyDataContext: "Team avg holding at 85%. João is the only agent below threshold.",
      lastSession: {
        date: "Jun 10",
        topic: "Call closure techniques and empathy in difficult interactions",
        agreement: "João to apply the 3-step closure script in every call this week",
      },
      agentTone: "Generally receptive. Responds better to concrete examples than abstract feedback.",
    },
  },
  {
    id: "pedro-godinho",
    name: "Pedro Godinho",
    initials: "PG",
    tenure: "4y",
    prep: {
      headline: "AHT 37% above target · No coaching plan · No sessions in 4+ weeks",
      keyDataPoint: "AHT at 863s — 233s above the 630s target",
      keyDataContext: "Team avg is 691s. Pedro is the highest AHT on the team despite 4 years of tenure.",
      lastSession: null,
      agentTone: "Experienced agent. May resist feedback — frame as efficiency, not underperformance.",
    },
  },
  {
    id: "alexandre-pereira",
    name: "Alexandre M. Pereira",
    initials: "AM",
    tenure: "119d",
    prep: {
      headline: "Top performer · AHT 35% below team avg · Good candidate for peer mentoring",
      keyDataPoint: "AHT at 670s vs team avg 760s",
      keyDataContext: "FCR at 100%, NPS at 100%. Consistently above target across all KPIs.",
      lastSession: {
        date: "Jun 12",
        topic: "Development goals and peer mentoring opportunity",
        agreement: "Alexandre to lead a call efficiency sharing session with the team by Jun 25",
      },
      agentTone: "Highly engaged. Motivated by recognition and growth opportunities.",
    },
  },
  {
    id: "denzel-melo",
    name: "Denzel Melo",
    initials: "DM",
    tenure: "119d",
    prep: {
      headline: "Absence pattern escalating · 33% vs 6% target · New hire (119 days)",
      keyDataPoint: "Gross absence at 33.5% — volatile pattern (0% → 40% → 20% → 50%)",
      keyDataContext: "Team avg is 11.55%. No excused absences recorded. Pattern started week 3.",
      lastSession: {
        date: "Jun 8",
        topic: "Onboarding check-in and early performance review",
        agreement: "Denzel to flag scheduling conflicts in advance. Supervisor to clarify absence policy.",
      },
      agentTone: "Early stage. Approach with curiosity, not confrontation — understand causes before acting.",
    },
  },
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
      targetValue: 420,
      storyline: "AHT consistently below target. No action needed — monitor to maintain.",
      hypothesis: null,
    },
    {
      key: "sales", label: "Sales", value: "10.0", unit: "%", target: "12.0%",
      delta: "-11%", deltaPositive: false, status: "off-target",
      pendingActions: [],
      recentSessions: 3, lastSessionDate: "Jun 12",
      facts: 2, completedActions: 0,
      trendData: [11.2, 10.8, 10.5, 10.3, 10.1, 10.0, 10.0],
      teamData:  [11.8, 11.9, 12.0, 11.8, 12.1, 12.0, 12.0],
      targetValue: 12,
      storyline: "Sales declining for 3 weeks with no coaching actions in place. Needs a structured conversation to identify root cause.",
      hypothesis: "Likely missed upsell opportunities during call closure — same pattern seen in agents who struggle with the closure script.",
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
      targetValue: 85,
      storyline: "CSAT declining for 3 consecutive weeks. Last session (Jun 10) focused on call closure — João acknowledged the gap but hasn't applied the script consistently. QA Review overdue since Jun 14. Coach Call scheduled for Jun 18.",
      hypothesis: "Inconsistent application of closure protocol is the primary driver. QA data should confirm.",
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
      targetValue: 78,
      storyline: "FCR trending down for 2 weeks. Root cause not yet identified. Coach Call set for Jun 20 to explore whether it's a knowledge gap or case routing issue.",
      hypothesis: "Possibly related to the same closure issue affecting CSAT — unresolved cases being logged as resolved.",
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
      targetValue: 95,
      storyline: "ADH stable at 92% but persistently 3pp below target. Assessment overdue since Jun 15.",
      hypothesis: "Schedule adherence may be affected by call overflow — worth checking if João is taking longer calls that push him past his scheduled end time.",
    },
    {
      key: "nps", label: "NPS", value: "85", unit: "", target: "45",
      delta: "-1%", deltaPositive: false, status: "on-target",
      pendingActions: [],
      recentSessions: 1, lastSessionDate: "Jun 10",
      facts: 0, completedActions: 2,
      trendData: [86, 86, 85, 85, 85, 85, 85],
      teamData:  [80, 81, 82, 82, 83, 84, 84],
      targetValue: 45,
      storyline: null,
      hypothesis: null,
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
      targetValue: 630,
      storyline: "AHT has been above target for 3+ weeks with no coaching intervention. No sessions have been held. This is the first structured conversation on this topic.",
      hypothesis: "Given Pedro's 4 years of tenure, this is unlikely to be a knowledge gap. More likely: inefficient case handling habits that have gone unchallenged. Start by understanding his own perception of his call time.",
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
      targetValue: 75,
      storyline: "FCR flat at 70% for 4 weeks. Coach Call scheduled Jun 17 — overdue. Last session (Jun 5) identified case categorization as a likely driver.",
      hypothesis: "Cases being reopened by customers suggest first contact resolution is failing due to incomplete case notes, not the call itself.",
    },
    {
      key: "nps", label: "NPS", value: "60", unit: "", target: "55",
      delta: "+9%", deltaPositive: true, status: "on-target",
      pendingActions: [],
      recentSessions: 1, lastSessionDate: "Jun 8",
      facts: 0, completedActions: 1,
      trendData: [58, 59, 60, 60, 60, 60, 60],
      teamData:  [55, 55, 56, 56, 55, 55, 55],
      targetValue: 55,
      storyline: null,
      hypothesis: null,
    },
  ],
  "alexandre-pereira": [
    {
      key: "aht", label: "AHT", value: "670", unit: "s", target: "630",
      delta: "-12%", deltaPositive: true, status: "on-target",
      pendingActions: [],
      recentSessions: 2, lastSessionDate: "Jun 12",
      facts: 0, completedActions: 3,
      trendData: [640, 635, 628, 622, 618, 665, 670],
      teamData:  [760, 755, 758, 762, 760, 761, 760],
      targetValue: 630,
      storyline: "AHT well below team average. Last session explored sharing techniques with peers. Peer mentoring session agreed for Jun 25.",
      hypothesis: null,
    },
    {
      key: "fcr", label: "FCR", value: "100", unit: "%", target: "75%",
      delta: "+33%", deltaPositive: true, status: "on-target",
      pendingActions: [],
      recentSessions: 2, lastSessionDate: "Jun 12",
      facts: 0, completedActions: 2,
      trendData: [95, 96, 98, 100, 100, 100, 100],
      teamData:  [77, 78, 77, 78, 78, 78, 78],
      targetValue: 75,
      storyline: null,
      hypothesis: null,
    },
  ],
  "denzel-melo": [
    {
      key: "absence", label: "Gross Absence", value: "33.5", unit: "%", target: "6%",
      delta: "+458%", deltaPositive: false, status: "outlier",
      pendingActions: [],
      recentSessions: 1, lastSessionDate: "Jun 8",
      facts: 3, completedActions: 0,
      trendData: [0, 40, 20, 50, 33, 33, 33],
      teamData:  [12, 11, 11, 12, 11, 12, 12],
      targetValue: 6,
      storyline: "Absence pattern volatile and escalating since week 3. Last session (Jun 8) was a general onboarding check-in — absence was not the main topic. No action taken yet. This should be the first structured conversation on attendance.",
      hypothesis: "Volatile pattern (0-50%) suggests scheduling conflicts or external circumstances rather than disengagement. Approach with curiosity — ask before assuming.",
    },
    {
      key: "fcr", label: "FCR", value: "85", unit: "%", target: "75%",
      delta: "+13%", deltaPositive: true, status: "on-target",
      pendingActions: [],
      recentSessions: 1, lastSessionDate: "Jun 8",
      facts: 0, completedActions: 0,
      trendData: [78, 80, 82, 84, 85, 85, 85],
      teamData:  [77, 78, 77, 78, 78, 78, 78],
      targetValue: 75,
      storyline: null,
      hypothesis: null,
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
  "outlier":    { label: "OUTLIER",    bg: "bg-danger-light",  text: "text-danger"  },
  "off-target": { label: "OFF TARGET", bg: "bg-danger-light",  text: "text-danger"  },
  "at-risk":    { label: "AT RISK",    bg: "bg-warning-light", text: "text-warning" },
  "on-target":  { label: "ON TARGET",  bg: "bg-success-light", text: "text-success" },
};

const FILTER_LABELS: { key: KpiStatus | "all"; label: string }[] = [
  { key: "all",        label: "All"       },
  { key: "outlier",    label: "Outlier"   },
  { key: "off-target", label: "Off target"},
  { key: "at-risk",    label: "At risk"   },
  { key: "on-target",  label: "On target" },
];

const TONE_OPTIONS: { value: SessionTone; label: string; color: string }[] = [
  { value: "receptive",  label: "Receptive",  color: "bg-success-light text-success"  },
  { value: "committed",  label: "Committed",  color: "bg-brand-light text-brand"      },
  { value: "defensive",  label: "Defensive",  color: "bg-warning-light text-warning"  },
  { value: "disengaged", label: "Disengaged", color: "bg-danger-light text-danger"    },
];

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

function TrendChart({ kpi }: { kpi: KpiCard }) {
  const w = 600; const h = 140;
  const pad = { t: 16, b: 28, l: 36, r: 16 };
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
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full block" style={{ height: 140 }}>
      <line x1={pad.l} y1={targetY} x2={w - pad.r} y2={targetY} stroke="#9CA3AF" strokeWidth="1" strokeDasharray="5 4" />
      <text x={w - pad.r} y={targetY - 4} textAnchor="end" fontSize="9" fill="#9CA3AF" fontFamily="Inter, system-ui">TARGET</text>
      <path d={agentArea} fill="rgba(16,185,129,0.07)" stroke="none" />
      <path d={teamPath}  fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d={agentPath} fill="none" stroke="#10B981" strokeWidth="2" />
      {kpi.trendData.map((v, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(v)} r="2.5" fill="#10B981" />
          <text x={toX(i)} y={h - 5} textAnchor="middle" fontSize="9" fill="#9CA3AF" fontFamily="Inter, system-ui">{days[i]}</text>
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
  const [filter, setFilter]               = useState<KpiStatus | "all">("all");
  const [focusedKpi, setFocusedKpi]       = useState<string>("csat");
  const [factsExpanded, setFactsExpanded] = useState(false);
  const [trendExpanded, setTrendExpanded] = useState(false);
  // Session close state
  const [sessionOpen, setSessionOpen]     = useState(false);
  const [sessionTopic, setSessionTopic]   = useState("");
  const [sessionAgreement, setSessionAgreement] = useState("");
  const [sessionDate, setSessionDate]     = useState("");
  const [sessionTone, setSessionTone]     = useState<SessionTone>("");
  const [sessionSaved, setSessionSaved]   = useState(false);

  const agent    = AGENTS.find((a) => a.id === agentId) ?? AGENTS[0];
  const allCards = KPI_DATA[agentId] ?? [];

  const handleAgentChange = (id: string) => {
    setAgentId(id);
    setAgentDropdown(false);
    setFocusedKpi(KPI_DATA[id]?.[0]?.key ?? "");
    setFilter("all");
    setFactsExpanded(false);
    setTrendExpanded(false);
    setSessionOpen(false);
    setSessionSaved(false);
  };

  const filtered = filter === "all" ? allCards : allCards.filter((k) => k.status === filter);
  const focused  = allCards.find((k) => k.key === focusedKpi) ?? allCards[0];
  const prep     = agent.prep;

  const counts = {
    "outlier":    allCards.filter((k) => k.status === "outlier").length,
    "off-target": allCards.filter((k) => k.status === "off-target").length,
    "at-risk":    allCards.filter((k) => k.status === "at-risk").length,
    "on-target":  allCards.filter((k) => k.status === "on-target").length,
  };

  const handleSaveSession = () => {
    if (sessionTopic && sessionTone) setSessionSaved(true);
  };

  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar />
      <main className="flex-1 font-sans text-text-primary px-6 py-6 overflow-x-hidden">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ──────────────────────────────────────────────── */}
          <div className="mb-1">
            <h1 className="text-2xl font-semibold m-0">One to One</h1>
            <p className="text-sm text-text-secondary m-0 mt-0.5">
              Coaching &amp; Development Dashboard · KPI → Root Causes → Actions
            </p>
          </div>

          {/* ── Agent selector + period + actions ───────────────────── */}
          <div className="border border-border rounded-lg bg-surface px-4 py-3 mt-4 mb-4 flex flex-wrap items-center gap-4">
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
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-text-secondary">
                <Clock size={13} />
                <span>Yesterday — Tue 16 Jun</span>
              </div>
              <div className="flex gap-1">
                {(["D-1", "WTD", "MTD", "QTD"] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-2.5 py-1 text-xs rounded font-medium border transition-colors ${
                      period === p ? "bg-brand text-white border-transparent" : "bg-surface text-text-secondary border-border hover:border-brand/40"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-md text-text-secondary hover:border-brand/40 transition-colors">
                <ExternalLink size={13} /> CEDP
              </button>
              <button
                onClick={() => setSessionOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md font-medium bg-brand text-white border border-transparent hover:bg-brand/90 transition-colors"
              >
                <Plus size={14} /> New Session
              </button>
            </div>
          </div>

          {/* ── PREPARATION STRIP ───────────────────────────────────── */}
          {/* Responde: ¿de qué trata esta conversación? */}
          <div className="border border-border rounded-lg bg-surface mb-4 overflow-hidden">
            <div className="px-4 py-2 bg-surface-muted border-b border-border flex items-center gap-2">
              <MessageSquare size={13} className="text-text-tertiary" />
              <p className="text-[11px] uppercase tracking-wide text-text-tertiary m-0 font-medium">Preparation</p>
            </div>
            <div className="px-4 py-3 grid md:grid-cols-3 gap-4">
              {/* Headline — de qué trata */}
              <div className="md:col-span-1">
                <p className="text-[11px] uppercase tracking-wide text-text-tertiary mb-1 m-0">This conversation is about</p>
                <p className="text-sm font-medium text-text-primary m-0 leading-snug">{prep.headline}</p>
              </div>
              {/* Key data point — el dato más relevante */}
              <div>
                <p className="text-[11px] uppercase tracking-wide text-text-tertiary mb-1 m-0">Key data point</p>
                <p className="text-sm font-semibold text-text-primary m-0">{prep.keyDataPoint}</p>
                <p className="text-xs text-text-secondary mt-0.5 m-0">{prep.keyDataContext}</p>
              </div>
              {/* Last session memory */}
              <div>
                <p className="text-[11px] uppercase tracking-wide text-text-tertiary mb-1 m-0">
                  Last session {prep.lastSession ? `· ${prep.lastSession.date}` : "· None recorded"}
                </p>
                {prep.lastSession ? (
                  <>
                    <p className="text-xs text-text-secondary m-0 mb-0.5">
                      <span className="font-medium text-text-primary">Topic:</span> {prep.lastSession.topic}
                    </p>
                    <p className="text-xs text-text-secondary m-0">
                      <span className="font-medium text-text-primary">Agreement:</span> {prep.lastSession.agreement}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-danger m-0">No previous session on record. This is the first structured conversation.</p>
                )}
              </div>
            </div>
            {/* Agent tone note */}
            <div className="px-4 py-2 border-t border-border bg-surface-muted">
              <p className="text-xs text-text-secondary m-0">
                <span className="font-medium text-text-primary">Coaching note: </span>
                {prep.agentTone}
              </p>
            </div>
          </div>

          {/* ── KPI filters ─────────────────────────────────────────── */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {FILTER_LABELS.map((f) => {
              const count = f.key === "all" ? allCards.length : counts[f.key as KpiStatus];
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key as KpiStatus | "all")}
                  className={`px-3 py-1 text-xs rounded-full font-medium border transition-colors ${
                    filter === f.key
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

          {/* ── KPI cards ───────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {filtered.map((kpi) => {
              const badge = STATUS_BADGE[kpi.status];
              const isFocus = kpi.key === focusedKpi;
              const valueColor =
                kpi.status === "outlier" || kpi.status === "off-target" ? "text-danger" :
                kpi.status === "at-risk" ? "text-warning" : "text-success";
              const deltaColor = kpi.deltaPositive ? "text-success" : "text-danger";
              return (
                <div
                  key={kpi.key}
                  onClick={() => { setFocusedKpi(kpi.key); setFactsExpanded(false); setTrendExpanded(false); }}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    isFocus ? "border-brand ring-1 ring-brand/30 bg-surface" : "border-border bg-surface hover:border-brand/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 gap-1">
                    <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide m-0">{kpi.label}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${badge.bg} ${badge.text}`}>{badge.label}</span>
                  </div>
                  <p className={`text-2xl font-bold m-0 leading-tight ${valueColor}`}>
                    {kpi.value}
                    {kpi.unit && <span className="text-sm font-normal text-text-secondary"> {kpi.unit}</span>}
                  </p>
                  <div className="flex items-center justify-between mt-1 mb-2">
                    <p className="text-xs text-text-tertiary m-0 flex items-center gap-1">
                      <span className="inline-block w-2.5 h-2.5 rounded-full border border-text-tertiary flex-shrink-0" />
                      Target {kpi.target}
                    </p>
                    <span className={`text-xs font-medium ${deltaColor}`}>{kpi.delta}</span>
                  </div>
                  {/* O2 + O5 — accionable badges */}
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

          {/* ── KPI DEEP DIVE ───────────────────────────────────────── */}
          {focused && (
            <div className="border border-border rounded-lg bg-surface mb-4">

              {/* Deep dive header — stats reordenados: Pending primero (D1) */}
              <div className="px-5 py-3 border-b border-border flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold bg-brand-light text-brand px-2.5 py-1 rounded">
                    {focused.label}
                  </span>
                  <span className={`text-2xl font-bold ${
                    focused.status === "outlier" || focused.status === "off-target" ? "text-danger" :
                    focused.status === "at-risk" ? "text-warning" : "text-success"
                  }`}>
                    {focused.value}{focused.unit && <span className="text-base font-normal text-text-secondary ml-0.5">{focused.unit}</span>}
                  </span>
                  <span className="text-sm text-text-secondary">vs target {focused.target}</span>
                </div>
                {/* D1: Pending primero */}
                <div className="flex items-center gap-4 text-xs text-text-secondary">
                  {[
                    { label: "PENDING",   value: focused.pendingActions.length, highlight: focused.pendingActions.length > 0 },
                    { label: "COMPLETED", value: focused.completedActions,      highlight: false },
                    { label: "SESSIONS",  value: focused.recentSessions,        highlight: false },
                    { label: "FACTS",     value: focused.facts,                 highlight: false },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className={`text-lg font-bold m-0 leading-tight ${s.highlight ? "text-warning" : "text-text-primary"}`}>{s.value}</p>
                      <p className="text-[10px] uppercase tracking-wide text-text-tertiary m-0">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* D2: STORYLINE PRIMERO — narrativa + hipótesis de causa raíz */}
              <div className="px-5 py-3 border-b border-border">
                <p className="text-[11px] uppercase tracking-wide text-text-tertiary mb-2 m-0">Storyline</p>
                {focused.storyline ? (
                  <p className="text-sm text-text-secondary m-0 leading-relaxed mb-2">{focused.storyline}</p>
                ) : (
                  <p className="text-sm text-text-tertiary m-0 italic mb-2">
                    No issues recorded for this KPI. No conversation needed unless agent raises it.
                  </p>
                )}
                {/* Root cause hypothesis */}
                {focused.hypothesis && (
                  <div className="mt-2 flex gap-2 items-start bg-surface-muted rounded-md px-3 py-2">
                    <AlertCircle size={13} className="text-text-tertiary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-text-secondary m-0 leading-relaxed">
                      <span className="font-medium text-text-primary">Hypothesis: </span>
                      {focused.hypothesis}
                    </p>
                  </div>
                )}
                {/* Pending actions as context (not CTAs) */}
                {focused.pendingActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {focused.pendingActions.map((action, i) => (
                      <ActionBadge key={i} action={action} />
                    ))}
                  </div>
                )}
              </div>

              {/* D5: TREND SECOND — comprimido, colapsable */}
              <div className="border-b border-border">
                <button
                  className="w-full flex items-center justify-between px-5 py-2.5 text-left hover:bg-surface-muted transition-colors"
                  onClick={() => setTrendExpanded((v) => !v)}
                >
                  <div className="flex items-center gap-2">
                    {focused.trendData[focused.trendData.length - 1] > focused.trendData[0]
                      ? <TrendingUp size={13} className="text-text-tertiary" />
                      : <TrendingDown size={13} className="text-text-tertiary" />
                    }
                    <p className="text-[11px] uppercase tracking-wide text-text-tertiary m-0">7-day trend</p>
                  </div>
                  {trendExpanded ? <ChevronUp size={14} className="text-text-tertiary" /> : <ChevronDown size={14} className="text-text-tertiary" />}
                </button>
                {trendExpanded && (
                  <div className="px-5 pb-3">
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
                )}
              </div>

              {/* D5: FACTS LAST — colapsados */}
              <div>
                <button
                  className="w-full flex items-center justify-between px-5 py-2.5 text-left hover:bg-surface-muted transition-colors"
                  onClick={() => setFactsExpanded((v) => !v)}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={13} className="text-text-tertiary" />
                    <p className="text-[11px] uppercase tracking-wide text-text-tertiary m-0">
                      Relevant facts on {focused.label}
                      {focused.facts > 0 && <span className="ml-1 text-text-tertiary">({focused.facts})</span>}
                    </p>
                  </div>
                  {factsExpanded ? <ChevronUp size={14} className="text-text-tertiary" /> : <ChevronDown size={14} className="text-text-tertiary" />}
                </button>
                {factsExpanded && focused.facts > 0 && (
                  <div className="px-5 pb-3 flex flex-col gap-1.5">
                    {Array.from({ length: focused.facts }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm py-1.5 border-t border-border">
                        <span className="text-xs text-text-tertiary font-mono whitespace-nowrap">Jun {14 - i}</span>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${i === 0 ? "bg-danger-light text-danger" : "bg-warning-light text-warning"}`}>
                          {i === 0 ? "critical" : "warning"}
                        </span>
                        <span className="text-text-secondary text-xs flex-1">
                          {i === 0
                            ? `${focused.label} performance below acceptable threshold for 3 consecutive days.`
                            : `${focused.label} approaching risk boundary.`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {factsExpanded && focused.facts === 0 && (
                  <p className="px-5 pb-3 text-xs text-text-tertiary m-0">No facts recorded for this KPI.</p>
                )}
              </div>
            </div>
          )}

          {/* ── SESSION CLOSE — formulario mínimo de registro ───────── */}
          {/* Responde: qué registrar al terminar */}
          <div className="border border-border rounded-lg bg-surface mb-4 overflow-hidden">
            <button
              onClick={() => setSessionOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className={sessionSaved ? "text-success" : "text-text-tertiary"} />
                <p className="text-[11px] uppercase tracking-wide text-text-tertiary m-0 font-medium">
                  {sessionSaved ? "Session recorded ✓" : "Close session — record outcome"}
                </p>
              </div>
              {sessionOpen ? <ChevronUp size={14} className="text-text-tertiary" /> : <ChevronDown size={14} className="text-text-tertiary" />}
            </button>

            {sessionOpen && !sessionSaved && (
              <div className="px-4 pb-4 border-t border-border">
                <div className="grid md:grid-cols-3 gap-3 mt-3">
                  {/* Topic — una línea */}
                  <div>
                    <label className="text-[11px] uppercase tracking-wide text-text-tertiary block mb-1">
                      Topic discussed <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={sessionTopic}
                      onChange={(e) => setSessionTopic(e.target.value)}
                      placeholder="e.g. CSAT decline — closure script"
                      className="w-full text-sm px-3 py-1.5 border border-border rounded-md bg-surface-muted focus:outline-none focus:border-brand"
                    />
                  </div>
                  {/* Agreement — qué + fecha */}
                  <div>
                    <label className="text-[11px] uppercase tracking-wide text-text-tertiary block mb-1">
                      Agreement
                    </label>
                    <input
                      type="text"
                      value={sessionAgreement}
                      onChange={(e) => setSessionAgreement(e.target.value)}
                      placeholder="e.g. Apply closure script for 1 week"
                      className="w-full text-sm px-3 py-1.5 border border-border rounded-md bg-surface-muted focus:outline-none focus:border-brand"
                    />
                  </div>
                  {/* Follow-up date */}
                  <div>
                    <label className="text-[11px] uppercase tracking-wide text-text-tertiary block mb-1">
                      Follow-up by
                    </label>
                    <input
                      type="text"
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      placeholder="e.g. Jun 25"
                      className="w-full text-sm px-3 py-1.5 border border-border rounded-md bg-surface-muted focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>
                {/* Tone — señal de cómo respondió */}
                <div className="mt-3">
                  <label className="text-[11px] uppercase tracking-wide text-text-tertiary block mb-1.5">
                    Agent response <span className="text-danger">*</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {TONE_OPTIONS.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setSessionTone(t.value)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                          sessionTone === t.value ? `${t.color} border-transparent` : "bg-surface border-border text-text-secondary hover:border-brand/40"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleSaveSession}
                    disabled={!sessionTopic || !sessionTone}
                    className="text-sm font-medium px-4 py-1.5 rounded-md bg-brand text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand/90 transition-colors"
                  >
                    Save session
                  </button>
                </div>
              </div>
            )}

            {sessionOpen && sessionSaved && (
              <div className="px-4 py-3 border-t border-border">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-text-tertiary mb-0.5 m-0">Topic</p>
                    <p className="m-0 font-medium">{sessionTopic}</p>
                  </div>
                  {sessionAgreement && (
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-text-tertiary mb-0.5 m-0">Agreement</p>
                      <p className="m-0">{sessionAgreement}{sessionDate && ` · by ${sessionDate}`}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-text-tertiary mb-0.5 m-0">Agent response</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TONE_OPTIONS.find((t) => t.value === sessionTone)?.color}`}>
                      {TONE_OPTIONS.find((t) => t.value === sessionTone)?.label}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Other topics ────────────────────────────────────────── */}
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
