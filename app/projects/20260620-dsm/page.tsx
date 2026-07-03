"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { GlobalHeader } from "@/components/Header";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Severity = "critical" | "warning" | "on-target";
type UrgencyState = "overdue" | "due-today" | "due-tomorrow" | "due-this-week" | "upcoming";
type CommitmentStatus = "open" | "completed" | "cancelled";
type Tab = "open" | "closed" | "meetings";

type Commitment = {
  id: string;
  kpi: string;
  kpiBadge: string;
  text: string;
  rationale: string;      // motivo resumido — visible sin expandir
  urgencyState: UrgencyState;
  urgencyLabel: string;   // "Overdue 2d" / "Due today" / "Due Jun 21"
  dueDate: string;
  status: CommitmentStatus;
  outcome?: string;
};

type AgentGroup = {
  agentId: string;
  agentName: string;
  initials: string;
  severity: Severity;
  kpiLabel: string;
  magnitude: string;      // "+37% above target"
  trend: "up" | "down";
  trendWeeks: number;
  hasPlan: boolean;
  commitments: Commitment[];
  // priority score (internal, not displayed)
  priorityScore: number;
};

type ClosedCommitment = Commitment & {
  agentName: string;
  closedDate: string;
  outcome: string;
};

type Meeting = {
  id: string;
  title: string;
  date: string;
  attendees: string;
  notes: string;
};

// ---------------------------------------------------------------------------
// Priority scoring (internal — determines order, not displayed)
// Severity weight × overdue multiplier × (1 + trend weeks factor)
// ---------------------------------------------------------------------------
function severityWeight(s: Severity) {
  return s === "critical" ? 3 : s === "warning" ? 2 : 1;
}

function overdueMultiplier(u: UrgencyState) {
  switch (u) {
    case "overdue":       return 2.0;
    case "due-today":     return 1.3;
    case "due-tomorrow":  return 1.1;
    case "due-this-week": return 1.0;
    default:              return 0.8;
  }
}

function computeScore(agent: Omit<AgentGroup, "priorityScore">): number {
  const worstCommitment = agent.commitments.reduce((worst, c) => {
    const score = overdueMultiplier(c.urgencyState);
    return score > overdueMultiplier(worst.urgencyState) ? c : worst;
  }, agent.commitments[0]);
  const base = severityWeight(agent.severity)
    * (worstCommitment ? overdueMultiplier(worstCommitment.urgencyState) : 0.8)
    * (1 + agent.trendWeeks * 0.05);
  // No plan bumps score significantly
  return agent.hasPlan ? base : base * 1.4;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const RAW_AGENTS: Omit<AgentGroup, "priorityScore">[] = [
  {
    agentId: "pedro-godinho",
    agentName: "Pedro Godinho",
    initials: "PG",
    severity: "critical",
    kpiLabel: "AHT",
    magnitude: "+37% above target",
    trend: "up",
    trendWeeks: 3,
    hasPlan: true,
    commitments: [
      {
        id: "pg-1",
        kpi: "AHT",
        kpiBadge: "bg-danger-light text-danger",
        text: "Root cause analysis — identify inefficient call handling pattern",
        rationale: "AHT at 863s vs 630s target · ↑ 3 consecutive weeks",
        urgencyState: "overdue",
        urgencyLabel: "Overdue 2d",
        dueDate: "Jun 14",
        status: "open",
      },
      {
        id: "pg-2",
        kpi: "FCR",
        kpiBadge: "bg-warning-light text-warning",
        text: "Coach Call — call time management and closure techniques",
        rationale: "FCR at 70% vs 75% target · ↓ 2 weeks · linked to AHT pattern",
        urgencyState: "overdue",
        urgencyLabel: "Overdue 1d",
        dueDate: "Jun 15",
        status: "open",
      },
    ],
  },
  {
    agentId: "denzel-melo",
    agentName: "Denzel Melo",
    initials: "DM",
    severity: "critical",
    kpiLabel: "Absence",
    magnitude: "33.5% vs 6% target",
    trend: "up",
    trendWeeks: 4,
    hasPlan: true,
    commitments: [
      {
        id: "dm-1",
        kpi: "Absence",
        kpiBadge: "bg-danger-light text-danger",
        text: "WFM extract — identify scheduling conflict pattern",
        rationale: "Absence at 33.5% vs 6% target · volatile pattern · ↑ 4 weeks",
        urgencyState: "overdue",
        urgencyLabel: "Overdue 1d",
        dueDate: "Jun 15",
        status: "open",
      },
    ],
  },
  {
    agentId: "raymond-akpelu",
    agentName: "Raymond Akpelu",
    initials: "RA",
    severity: "warning",
    kpiLabel: "QA",
    magnitude: "QA 34.0 vs 85 target",
    trend: "down",
    trendWeeks: 2,
    hasPlan: true,
    commitments: [
      {
        id: "ra-1",
        kpi: "QA",
        kpiBadge: "bg-warning-light text-warning",
        text: "Assessment — case categorization and documentation review",
        rationale: "QA dropped from 84.5 to 34.0 · ↓ 2 weeks · miscategorized cases",
        urgencyState: "due-today",
        urgencyLabel: "Due today",
        dueDate: "Jun 16",
        status: "open",
      },
    ],
  },
  {
    agentId: "martinho-wambembe",
    agentName: "Martinho Wambembe",
    initials: "MW",
    severity: "warning",
    kpiLabel: "Absence",
    magnitude: "32.5% vs 11.55% team avg",
    trend: "up",
    trendWeeks: 4,
    hasPlan: true,
    commitments: [
      {
        id: "mw-1",
        kpi: "Absence",
        kpiBadge: "bg-warning-light text-warning",
        text: "1:1 — attendance check-in and schedule review",
        rationale: "Absence rising steadily · 11.8% → 36.7% over 4 weeks",
        urgencyState: "due-tomorrow",
        urgencyLabel: "Due tomorrow",
        dueDate: "Jun 17",
        status: "open",
      },
    ],
  },
  {
    agentId: "alexandre-pereira",
    agentName: "Alexandre M. Pereira",
    initials: "AM",
    severity: "on-target",
    kpiLabel: "AHT",
    magnitude: "AHT -12% vs target",
    trend: "down",
    trendWeeks: 2,
    hasPlan: true,
    commitments: [
      {
        id: "ap-1",
        kpi: "AHT",
        kpiBadge: "bg-success-light text-success",
        text: "Peer mentoring session — share call efficiency techniques with team",
        rationale: "AHT 35% below team avg · top performer · agreed Jun 12",
        urgencyState: "due-this-week",
        urgencyLabel: "Due Jun 21",
        dueDate: "Jun 21",
        status: "open",
      },
    ],
  },
];

// Compute priority scores and sort
const AGENT_GROUPS: AgentGroup[] = RAW_AGENTS
  .map((a) => ({ ...a, priorityScore: computeScore(a) }))
  .sort((a, b) => b.priorityScore - a.priorityScore);

const CLOSED_COMMITMENTS: ClosedCommitment[] = [
  {
    id: "cl-1",
    agentName: "Camila Robledo",
    kpi: "AHT",
    kpiBadge: "bg-warning-light text-warning",
    text: "1:1 review — AHT trend and call handling techniques",
    rationale: "AHT at 821s vs 630s target · ↑ 2 weeks",
    urgencyState: "overdue",
    urgencyLabel: "Closed Jun 14",
    dueDate: "Jun 13",
    status: "completed",
    closedDate: "Jun 14",
    outcome: "Identified missing closure script. Agreed to apply 3-step protocol for 1 week. Follow-up scheduled Jun 21.",
  },
  {
    id: "cl-2",
    agentName: "Cristina Ji",
    kpi: "FCR",
    kpiBadge: "bg-danger-light text-danger",
    text: "Coach Call — first contact resolution and case routing",
    rationale: "FCR at 0% · ↓ 2 weeks · critical pattern",
    urgencyState: "overdue",
    urgencyLabel: "Closed Jun 13",
    dueDate: "Jun 12",
    status: "completed",
    closedDate: "Jun 13",
    outcome: "FCR issue linked to incorrect queue assignment. Escalated to WFM for routing fix. No coaching action needed.",
  },
];

const MEETINGS: Meeting[] = [
  {
    id: "m-1",
    title: "Weekly team sync",
    date: "Jun 16, 2026 · 09:00",
    attendees: "Full team · 14 agents",
    notes: "Performance review Q2 · attendance policy reminder · upsell script v2 distribution",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const SEVERITY_STYLES: Record<Severity, { dot: string; badge: string; text: string; label: string }> = {
  critical:   { dot: "bg-danger",  badge: "bg-danger-light text-danger",   text: "text-danger",  label: "CRITICAL"  },
  warning:    { dot: "bg-warning", badge: "bg-warning-light text-warning", text: "text-warning", label: "WARNING"   },
  "on-target":{ dot: "bg-success", badge: "bg-success-light text-success", text: "text-success", label: "ON TARGET" },
};

const URGENCY_STYLES: Record<UrgencyState, { text: string; bg: string }> = {
  "overdue":        { text: "text-danger",  bg: "bg-danger-light"  },
  "due-today":      { text: "text-warning", bg: "bg-warning-light" },
  "due-tomorrow":   { text: "text-warning", bg: "bg-warning-light" },
  "due-this-week":  { text: "text-text-secondary", bg: "bg-surface-muted" },
  "upcoming":       { text: "text-text-tertiary",  bg: "bg-surface-muted" },
};

function UrgencyBadge({ state, label }: { state: UrgencyState; label: string }) {
  const s = URGENCY_STYLES[state];
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded whitespace-nowrap ${s.bg} ${s.text}`}>
      {label}
    </span>
  );
}

// Outcome capture inline component
function OutcomeCapture({
  onConfirm,
  onBack,
}: {
  onConfirm: (outcome: string) => void;
  onBack: () => void;
}) {
  const [text, setText] = useState("");
  return (
    <div className="mt-2 pl-4 border-l-2 border-brand flex flex-col gap-2">
      <p className="text-[11px] uppercase tracking-wide text-text-tertiary m-0">
        What happened? <span className="normal-case text-text-tertiary">(optional — feeds One to One storyline)</span>
      </p>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. Root cause identified — overflow calls pushing AHT. Escalated to WFM."
        className="w-full text-sm px-3 py-1.5 border border-border rounded-md bg-surface-muted focus:outline-none focus:border-brand"
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={() => onConfirm(text)}
          className="text-xs font-medium px-3 py-1.5 rounded bg-brand text-white hover:bg-brand/90 transition-colors"
        >
          Confirm complete
        </button>
        <button
          onClick={onBack}
          className="text-xs font-medium px-3 py-1.5 rounded border border-border text-text-secondary hover:border-brand/40 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function DSMPage() {
  const [tab, setTab] = useState<Tab>("open");
  const [showNewDSM, setShowNewDSM] = useState(false);
  const [dsmForm, setDsmForm] = useState({
    date: new Date().toISOString().split("T")[0],
    transcript: "",
    attendance: "",
    kpiLob: "",
    topics: "",
    consent: false,
  });
  const [dsmActions, setDsmActions] = useState<{desc:string; due:string; owner:string}[]>([]);
  const [dsmSaved, setDsmSaved] = useState(false);
  // ITERATION E: all groups expanded by default — supervisor sees all actions immediately
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>(
    Object.fromEntries(AGENT_GROUPS.map((a) => [a.agentId, false]))
  );
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [outcomes, setOutcomes] = useState<Record<string, string>>({});

  const toggleAgent = (id: string) =>
    setExpandedAgents((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleComplete = (commitmentId: string, outcome: string) => {
    setCompletedIds((prev) => new Set([...prev, commitmentId]));
    setOutcomes((prev) => ({ ...prev, [commitmentId]: outcome }));
    setCompletingId(null);
  };

  const openCount = AGENT_GROUPS.flatMap((a) => a.commitments).filter(
    (c) => !completedIds.has(c.id)
  ).length;

  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
      <GlobalHeader />
      <main className="flex-1 font-sans text-text-primary px-6 py-6 overflow-x-hidden">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-semibold m-0">Daily Supervisor Meeting</h1>
              <p className="text-sm text-text-secondary m-0 mt-0.5">
                Performance tracking, daily focus, and delivery
              </p>
            </div>
            <button onClick={() => { setShowNewDSM(true); setDsmForm({date: new Date().toISOString().split("T")[0], transcript:"", attendance:"", kpiLob:"", topics:"", consent:false}); setDsmActions([]); }} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm rounded-lg font-medium bg-brand text-white hover:bg-brand/90 transition-colors">
              <Plus size={14} /> New DSM
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border mb-5">
            {(
              [
                { key: "open",     label: "Open commitments", count: openCount,                    alert: openCount > 0 },
                { key: "closed",   label: "Closed",           count: CLOSED_COMMITMENTS.length + completedIds.size, alert: false },
                { key: "meetings", label: "Meetings",         count: MEETINGS.length,              alert: false },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? "border-brand text-brand"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                {t.label}
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                    t.alert ? "bg-danger text-white" : "bg-surface-muted text-text-secondary"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── OPEN COMMITMENTS ──────────────────────────────────── */}
          {tab === "open" && (
            <div>
              {/* ITERATION E: callout — all groups expanded by default */}
              <div className="flex items-start gap-2 text-xs text-text-secondary bg-brand-light/50 border border-brand/20 rounded-lg px-3 py-2.5 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0 mt-0.5" />
                Actions are expanded by default so you can immediately triage urgent items. Ordered by operational priority — severity × urgency × duration of issue.
              </div>
              <div className="flex flex-col gap-3">
                {AGENT_GROUPS.map((agent) => {
                  const sty = SEVERITY_STYLES[agent.severity];
                  const openCommitments = agent.commitments.filter((c) => !completedIds.has(c.id));
                  if (openCommitments.length === 0) return null;

                  const worstUrgency = openCommitments.reduce((worst, c) => {
                    const order: UrgencyState[] = ["overdue", "due-today", "due-tomorrow", "due-this-week", "upcoming"];
                    return order.indexOf(c.urgencyState) < order.indexOf(worst.urgencyState) ? c : worst;
                  }, openCommitments[0]);

                  const isExpanded = expandedAgents[agent.agentId];

                  return (
                    <div key={agent.agentId} className="border border-border rounded-lg bg-surface overflow-hidden">
                      {/* Agent header */}
                      <button
                        onClick={() => toggleAgent(agent.agentId)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-muted transition-colors"
                      >
                        {/* Severity dot */}
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sty.dot}`} />

                        {/* Name + initials */}
                        <span className="w-7 h-7 rounded-full bg-surface-muted text-text-secondary text-xs font-semibold flex items-center justify-center flex-shrink-0">
                          {agent.initials}
                        </span>
                        <span className="font-medium text-sm">{agent.agentName}</span>

                        {/* KPI + severity badge */}
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded flex-shrink-0 ${sty.badge}`}>
                          {agent.kpiLabel} · {sty.label}
                        </span>

                        {/* Magnitude + trend + duration */}
                        <span className="text-xs text-text-secondary flex items-center gap-1 flex-shrink-0">
                          {agent.trend === "up"
                            ? <TrendingUp size={12} className={sty.text} />
                            : <TrendingDown size={12} className={sty.text} />
                          }
                          {agent.magnitude} · {agent.trendWeeks}w
                        </span>

                        {/* Spacer */}
                        <span className="flex-1" />

                        {/* Open count + worst urgency */}
                        <span className="text-xs text-text-secondary whitespace-nowrap">
                          {openCommitments.length} open ·{" "}
                          <span className={URGENCY_STYLES[worstUrgency.urgencyState].text}>
                            {worstUrgency.urgencyLabel.toLowerCase()}
                          </span>
                        </span>
                        {isExpanded
                          ? <ChevronUp size={15} className="text-text-tertiary flex-shrink-0" />
                          : <ChevronDown size={15} className="text-text-tertiary flex-shrink-0" />
                        }
                      </button>

                      {/* Commitments */}
                      {isExpanded && (
                        <div className="border-t border-border">
                          {openCommitments.map((c, idx) => (
                            <div
                              key={c.id}
                              className={`px-4 py-3 ${idx < openCommitments.length - 1 ? "border-b border-border" : ""}`}
                            >
                              {/* Commitment row */}
                              <div className="flex items-start gap-3 flex-wrap">
                                {/* KPI badge */}
                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded flex-shrink-0 mt-0.5 ${c.kpiBadge}`}>
                                  {c.kpi}
                                </span>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm m-0">{c.text}</p>
                                  {/* Rationale — always visible, secondary */}
                                  <p className="text-xs text-text-tertiary mt-0.5 m-0">{c.rationale}</p>
                                </div>

                                {/* Urgency */}
                                <UrgencyBadge state={c.urgencyState} label={c.urgencyLabel} />

                                {/* Actions */}
                                {completingId !== c.id && (
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <button
                                      onClick={() => setCompletingId(c.id)}
                                      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border border-success text-success hover:bg-success-light transition-colors"
                                    >
                                      <CheckCircle size={12} /> Complete
                                    </button>
                                    <button
                                      onClick={() => setCompletedIds((prev) => new Set([...prev, c.id]))}
                                      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border border-danger text-danger hover:bg-danger-light transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border border-warning text-warning hover:bg-warning-light transition-colors">
                                      Update
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Outcome capture */}
                              {completingId === c.id && (
                                <OutcomeCapture
                                  onConfirm={(outcome) => handleComplete(c.id, outcome)}
                                  onBack={() => setCompletingId(null)}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {openCount === 0 && (
                  <div className="border border-border rounded-lg px-6 py-10 text-center bg-surface">
                    <CheckCircle size={24} className="text-success mx-auto mb-2" />
                    <p className="text-sm font-medium m-0">All commitments closed.</p>
                    <p className="text-xs text-text-secondary mt-1 m-0">No open commitments for today.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── CLOSED ──────────────────────────────────────────────── */}
          {tab === "closed" && (
            <div className="flex flex-col gap-3">
              {/* Session-completed items first */}
              {Array.from(completedIds).map((id) => {
                const agent = AGENT_GROUPS.find((a) => a.commitments.some((c) => c.id === id));
                const commitment = agent?.commitments.find((c) => c.id === id);
                if (!commitment || !agent) return null;
                return (
                  <div key={id} className="border border-border rounded-lg px-4 py-3 bg-surface">
                    <div className="flex items-start gap-3 flex-wrap">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded flex-shrink-0 mt-0.5 ${commitment.kpiBadge}`}>
                        {commitment.kpi}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-tertiary m-0 mb-0.5">{agent.agentName}</p>
                        <p className="text-sm m-0">{commitment.text}</p>
                        {outcomes[id] && (
                          <p className="text-xs text-text-secondary mt-1 m-0 italic">"{outcomes[id]}"</p>
                        )}
                      </div>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-success-light text-success whitespace-nowrap">
                        Completed today
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Pre-existing closed */}
              {CLOSED_COMMITMENTS.map((c) => (
                <div key={c.id} className="border border-border rounded-lg px-4 py-3 bg-surface">
                  <div className="flex items-start gap-3 flex-wrap">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded flex-shrink-0 mt-0.5 ${c.kpiBadge}`}>
                      {c.kpi}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-tertiary m-0 mb-0.5">{c.agentName} · closed {c.closedDate}</p>
                      <p className="text-sm m-0">{c.text}</p>
                      <p className="text-xs text-text-secondary mt-1 m-0 italic">"{c.outcome}"</p>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-success-light text-success whitespace-nowrap">
                      Completed
                    </span>
                  </div>
                </div>
              ))}

              {completedIds.size === 0 && CLOSED_COMMITMENTS.length === 0 && (
                <div className="border border-border rounded-lg px-6 py-10 text-center bg-surface">
                  <p className="text-sm text-text-secondary m-0">No closed commitments yet.</p>
                </div>
              )}
            </div>
          )}

          {/* ── MEETINGS ────────────────────────────────────────────── */}
          {tab === "meetings" && (
            <div className="flex flex-col gap-3">
              {MEETINGS.map((m) => (
                <div key={m.id} className="border border-border rounded-lg px-4 py-4 bg-surface">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-medium m-0">{m.title}</p>
                    <span className="text-xs text-text-secondary whitespace-nowrap flex items-center gap-1">
                      <Clock size={12} /> {m.date}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary m-0 mb-1">{m.attendees}</p>
                  <p className="text-xs text-text-tertiary m-0">{m.notes}</p>
                </div>
              ))}
              {MEETINGS.length === 0 && (
                <div className="border border-border rounded-lg px-6 py-10 text-center bg-surface">
                  <p className="text-sm text-text-secondary m-0">No meetings recorded.</p>
                </div>
              )}
            </div>
          )}

        </div>

          {/* ── New DSM Meeting Modal ─────────────────────────────────── */}
          {showNewDSM && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.4)"}}>
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
                  <h2 className="text-base font-semibold text-text-primary">New DSM Meeting</h2>
                  <button onClick={() => setShowNewDSM(false)} className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-lg">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

                  {/* Meeting Date */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary block mb-1.5">Meeting Date</label>
                    <input type="date" value={dsmForm.date}
                      onChange={e => setDsmForm(f => ({...f, date: e.target.value}))}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface-muted focus:outline-none focus:border-brand"/>
                  </div>

                  {/* Voice Transcript */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
                        <svg width="11" height="13" viewBox="0 0 11 13" fill="none"><rect x="3" y="0.5" width="5" height="7" rx="2.5" stroke="#6B7280" strokeWidth="1.1"/><path d="M1 7a4.5 4.5 0 009 0" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/><line x1="5.5" y1="11.5" x2="5.5" y2="13" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/></svg>
                        Voice Transcript
                      </label>
                      <div className="flex items-center gap-2">
                        <select className="text-xs border border-border rounded-lg px-2 py-1 bg-surface-muted focus:outline-none text-text-secondary">
                          <option>Português</option><option>English</option><option>Español</option>
                        </select>
                        <button disabled={!dsmForm.consent}
                          className={"flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg text-white transition-opacity " + (dsmForm.consent ? "" : "opacity-40 cursor-not-allowed")}
                          style={{background:"#8051FF", color:"#FFFFFF"}}>
                          <svg width="8" height="9" viewBox="0 0 8 9" fill="none"><path d="M1 1.5l6 3-6 3V1.5z" fill="white"/></svg>
                          Start
                        </button>
                        <button disabled={!dsmForm.transcript}
                          className={"flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-border bg-white text-text-secondary transition-opacity " + (dsmForm.transcript ? "hover:border-brand hover:text-brand" : "opacity-40 cursor-not-allowed")}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 5.5l2.5 2.5 5.5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          AI Analysis
                        </button>
                      </div>
                    </div>
                    {/* GDPR notice */}
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 mb-2 text-xs text-amber-800 leading-relaxed">
                      <p className="mb-1">When you press <strong>Start</strong>, your browser streams microphone audio to a third-party cloud service operated by the browser vendor (typically outside the EEA) for transcription. Audio does not pass through OPS.Supervisor servers, but it may contain personal data (RGPD Arts. 13 &amp; 44).</p>
                      <p className="mb-2">You must obtain verbal consent from every participant before recording (RGPD Arts. 6, 7). For sensitive meetings, type the transcript manually instead.</p>
                      <label className="flex items-center gap-2 cursor-pointer font-medium">
                        <input type="checkbox" checked={dsmForm.consent}
                          onChange={e => setDsmForm(f => ({...f, consent: e.target.checked}))}
                          className="rounded accent-brand"/>
                        I have informed all participants and obtained their consent to record.
                      </label>
                    </div>
                    <textarea rows={5} value={dsmForm.transcript}
                      onChange={e => setDsmForm(f => ({...f, transcript: e.target.value}))}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface-muted placeholder:text-text-tertiary outline-none resize-none focus:border-brand"
                      placeholder="Paste, type, or speak the meeting transcript here..."/>
                    <p className="text-[11px] text-text-tertiary text-right mt-1">{dsmForm.transcript.length.toLocaleString()} / 80,000</p>
                  </div>

                  {/* Meeting Attendance */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary block mb-1.5">Meeting Attendance</label>
                    <textarea rows={2} value={dsmForm.attendance}
                      onChange={e => setDsmForm(f => ({...f, attendance: e.target.value}))}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface-muted placeholder:text-text-tertiary outline-none resize-none focus:border-brand"
                      placeholder="List attendees..."/>
                  </div>

                  {/* KPI / LOB / Market Addressed */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary block mb-1.5">KPI / LOB / Market Addressed</label>
                    <textarea rows={2} value={dsmForm.kpiLob}
                      onChange={e => setDsmForm(f => ({...f, kpiLob: e.target.value}))}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface-muted placeholder:text-text-tertiary outline-none resize-none focus:border-brand"
                      placeholder="KPIs, lines of business or markets discussed..."/>
                  </div>

                  {/* Discussed Topics */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary block mb-1.5">Discussed Topics</label>
                    <textarea rows={3} value={dsmForm.topics}
                      onChange={e => setDsmForm(f => ({...f, topics: e.target.value}))}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface-muted placeholder:text-text-tertiary outline-none resize-none focus:border-brand"
                      placeholder="Topics covered in the meeting..."/>
                  </div>

                  {/* Action Items — no default card, left-aligned add button */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary block mb-2">Action Items</label>
                    {dsmActions.map((a, i) => (
                      <div key={i} className="border border-border rounded-lg p-3 mb-2 bg-surface-muted">
                        <div className="flex items-center gap-2 mb-2">
                          <input type="text" value={a.desc}
                            onChange={e => setDsmActions(prev => prev.map((x,j) => j===i ? {...x, desc:e.target.value} : x))}
                            className="flex-1 text-sm border border-border rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-brand placeholder:text-text-tertiary"
                            placeholder="Description"/>
                          <button onClick={() => setDsmActions(prev => prev.filter((_,j) => j!==i))}
                            className="text-danger hover:opacity-70 transition-opacity flex-shrink-0">
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M10 3.5l-.5 7H3.5L3 3.5" stroke="#EF4444" strokeWidth="1.1" strokeLinecap="round"/></svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="date" value={a.due}
                            onChange={e => setDsmActions(prev => prev.map((x,j) => j===i ? {...x, due:e.target.value} : x))}
                            className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-brand"/>
                          <input type="text" value={a.owner}
                            onChange={e => setDsmActions(prev => prev.map((x,j) => j===i ? {...x, owner:e.target.value} : x))}
                            className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-brand placeholder:text-text-tertiary"
                            placeholder="+ Add owner"/>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setDsmActions(prev => [...prev, {desc:"", due:"", owner:""}])}
                      className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-border bg-white text-text-secondary hover:border-brand hover:text-brand transition-colors">
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M4.5 1v7M1 4.5h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                      + Add Action
                    </button>
                  </div>

                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-border flex-shrink-0 bg-white">
                  <button onClick={() => setShowNewDSM(false)}
                    className="text-sm text-text-secondary border border-border px-4 py-1.5 rounded-lg hover:border-brand/40 transition-colors">
                    Cancel
                  </button>
                  <button
                    disabled={!dsmForm.date}
                    onClick={() => { setShowNewDSM(false); setDsmSaved(true); setTimeout(() => setDsmSaved(false), 3000); }}
                    className={"flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-1.5 rounded-lg transition-opacity " + (dsmForm.date ? "" : "opacity-40 cursor-not-allowed")}
                    style={{background:"#8051FF", color:"#FFFFFF"}}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Save Meeting
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success toast */}
          {dsmSaved && (
            <div className="fixed bottom-6 left-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold"
              style={{transform:"translateX(-50%)", background:"#8051FF", animation:"fadeInUp 0.2s ease"}}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.5" opacity="0.5"/>
                <path d="M5 8l2.5 2.5 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              DSM meeting saved successfully
              <button onClick={() => setDsmSaved(false)} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
          )}
      </main>
      </div>
    </div>
  );
}
