"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
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
  ExternalLink,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Mode = "defined" | "exploratory";
type ObjectiveStatus = "not-started" | "in-progress" | "achieved" | "paused" | "needs-reorientation";
type ReviewStatus = "draft" | "in-progress" | "completed";
type DirectionOfEvolution =
  | "converging"
  | "progressing-not-relevant"
  | "early-stage"
  | "needs-reorientation"
  | null;

type Observation = {
  date: string;
  text: string;
  source: "One to One" | "Direct observation";
};

type DevelopmentObjective = {
  id: string;
  title: string;
  gapAddressed: string;
  isCriticalGap: boolean;
  how: string;
  evidence: Observation[];
  successWhen: string;
  successDate: string;
  status: ObjectiveStatus;
  dsmCommitments: number;
  noEvidenceWeeks: number;
};

type Exploration = {
  id: string;
  dimension: string;
  observations: Observation[];
  contextsTested: { label: string; verified: boolean }[];
  nextExposure: string;
  nextExposureDate: string;
  hypothesis: string;
  status: "active" | "paused";
};

type CompetencyRow = {
  key: string;
  label: string;
  isCritical: boolean;
  agentRating: number | null;
  supervisorRating: number | null;
  lastReviewAgent: number | null;
  lastReviewSupervisor: number | null;
};

type Agent = {
  id: string;
  name: string;
  initials: string;
  tenure: string;
  role: string;
  mode: Mode;
  aspiration: string | null;
  criticalGaps: string[];
  emergingStrengths: string[];
  lastReview: { date: string; topic: string; status: ReviewStatus } | null;
  objectives: DevelopmentObjective[];
  explorations: Exploration[];
  competencies: CompetencyRow[];
  retentionSignal: "Low" | "Medium" | "High";
  hasRoleFramework: boolean;
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const RATING_LABELS: Record<string, string[]> = {
  "Task management":    ["Needs guidance on daily tasks","Manages routine tasks independently","Handles complex tasks with minimal support","Anticipates and adapts to changing demands"],
  "Problem solving":   ["Needs guidance to identify issues","Identifies issues, needs help with solutions","Solves routine issues independently","Proactively identifies systemic issues and proposes solutions"],
  "Commitment":        ["Inconsistent delivery of commitments","Meets most commitments with reminders","Consistently meets commitments independently","Takes ownership proactively beyond expectations"],
  "Attitude to work":  ["Disengaged or resistant","Compliant but passive","Engaged and collaborative","Actively drives team energy and culture"],
  "Project knowledge": ["Limited product/process knowledge","Basic knowledge sufficient for role","Strong knowledge, supports peers","Expert-level, trains others"],
  "Absenteeism":       ["Frequent unplanned absences","Occasional absences, communicates in advance","Reliable attendance, rare absences","Exemplary attendance, proactively manages schedule"],
};

const AGENTS: Agent[] = [
  {
    id: "joao-silva",
    name: "João Silva",
    initials: "JS",
    tenure: "1y",
    role: "Customer Expert",
    mode: "defined",
    aspiration: "Team Lead — Operations",
    criticalGaps: ["Communication", "Coaching", "Influence"],
    emergingStrengths: [],
    lastReview: { date: "Mar 2026", topic: "Communication & Problem Solving", status: "completed" },
    objectives: [
      {
        id: "obj-1",
        title: "Develop interpersonal communication under pressure",
        gapAddressed: "Communication",
        isCriticalGap: true,
        how: "Weekly Coach Call + buddy role with new agent (from Jun 10)",
        evidence: [
          { date: "Jun 10", text: "Led team briefing without supervisor prompting — first time in 3 weeks.", source: "One to One" },
          { date: "Jun 14", text: "Handled difficult client interaction without escalating. De-escalated using empathy framing.", source: "Direct observation" },
        ],
        successWhen: "Leads a structured feedback session with a peer independently",
        successDate: "Sep 2026",
        status: "in-progress",
        dsmCommitments: 1,
        noEvidenceWeeks: 0,
      },
      {
        id: "obj-2",
        title: "Develop problem-solving under operational complexity",
        gapAddressed: "Problem solving",
        isCriticalGap: false,
        how: "Assigned to process improvement working group (Jun - Aug)",
        evidence: [
          { date: "Jun 12", text: "Identified a case routing error before it affected the queue. Flagged to supervisor proactively.", source: "Direct observation" },
        ],
        successWhen: "Proposes a documented process improvement that gets implemented",
        successDate: "Aug 2026",
        status: "in-progress",
        dsmCommitments: 0,
        noEvidenceWeeks: 0,
      },
    ],
    explorations: [],
    competencies: [
      { key: "task",        label: "Task management",    isCritical: false, agentRating: 3, supervisorRating: 3, lastReviewAgent: 3, lastReviewSupervisor: 3 },
      { key: "problem",     label: "Problem solving",    isCritical: false, agentRating: 2, supervisorRating: 4, lastReviewAgent: 2, lastReviewSupervisor: 3 },
      { key: "commitment",  label: "Commitment",         isCritical: false, agentRating: 3, supervisorRating: 3, lastReviewAgent: 3, lastReviewSupervisor: 3 },
      { key: "attitude",    label: "Attitude to work",   isCritical: false, agentRating: 4, supervisorRating: 3, lastReviewAgent: 4, lastReviewSupervisor: 3 },
      { key: "knowledge",   label: "Project knowledge",  isCritical: false, agentRating: 3, supervisorRating: 4, lastReviewAgent: 3, lastReviewSupervisor: 3 },
      { key: "absenteeism", label: "Absenteeism",        isCritical: false, agentRating: 4, supervisorRating: 4, lastReviewAgent: 4, lastReviewSupervisor: 5 },
    ],
    retentionSignal: "Low",
    hasRoleFramework: true,
  },
  {
    id: "denzel-melo",
    name: "Denzel Melo",
    initials: "DM",
    tenure: "119d",
    role: "Customer Expert",
    mode: "exploratory",
    aspiration: null,
    criticalGaps: [],
    emergingStrengths: ["FCR above tenure average", "Calm under pressure in monitored calls"],
    lastReview: { date: "Mar 2026", topic: "First CEDP — onboarding review", status: "completed" },
    explorations: [
      {
        id: "exp-1",
        dimension: "Interpersonal communication under pressure",
        observations: [
          { date: "Jun 8", text: "Managed a frustrated client without supervisor support. Used empathy language naturally.", source: "Direct observation" },
          { date: "Jun 12", text: "Defused tension between two agents during a team call. Not asked to intervene.", source: "One to One" },
          { date: "Jun 14", text: "Gave constructive feedback to a peer about a shared case — unprompted.", source: "One to One" },
        ],
        contextsTested: [
          { label: "Customer calls", verified: true },
          { label: "Peer interaction", verified: true },
          { label: "Team-facing settings", verified: false },
          { label: "Manager-facing communication", verified: false },
        ],
        nextExposure: "Assign as buddy for new agent joining Jun 23",
        nextExposureDate: "Jun 23",
        hypothesis: "May have natural aptitude for roles requiring team-facing communication — Team Lead or Trainer trajectory worth exploring.",
        status: "active",
      },
    ],
    objectives: [],
    competencies: [
      { key: "task",        label: "Task management",    isCritical: false, agentRating: 2, supervisorRating: 3, lastReviewAgent: 2, lastReviewSupervisor: 2 },
      { key: "problem",     label: "Problem solving",    isCritical: false, agentRating: 3, supervisorRating: 3, lastReviewAgent: 2, lastReviewSupervisor: 2 },
      { key: "commitment",  label: "Commitment",         isCritical: false, agentRating: 4, supervisorRating: 3, lastReviewAgent: 3, lastReviewSupervisor: 3 },
      { key: "attitude",    label: "Attitude to work",   isCritical: false, agentRating: 4, supervisorRating: 4, lastReviewAgent: 3, lastReviewSupervisor: 3 },
      { key: "knowledge",   label: "Project knowledge",  isCritical: false, agentRating: 2, supervisorRating: 2, lastReviewAgent: 2, lastReviewSupervisor: 2 },
      { key: "absenteeism", label: "Absenteeism",        isCritical: false, agentRating: 1, supervisorRating: 2, lastReviewAgent: null, lastReviewSupervisor: null },
    ],
    retentionSignal: "Medium",
    hasRoleFramework: false,
  },
  {
    id: "pedro-godinho",
    name: "Pedro Godinho",
    initials: "PG",
    tenure: "4y",
    role: "Customer Expert",
    mode: "exploratory",
    aspiration: null,
    criticalGaps: [],
    emergingStrengths: ["Strong product knowledge", "High NPS — customer rapport"],
    lastReview: { date: "Dec 2025", topic: "Annual review — performance alignment", status: "completed" },
    explorations: [],
    objectives: [],
    competencies: [
      { key: "task",        label: "Task management",    isCritical: false, agentRating: 3, supervisorRating: 3, lastReviewAgent: 3, lastReviewSupervisor: 3 },
      { key: "problem",     label: "Problem solving",    isCritical: false, agentRating: 3, supervisorRating: 2, lastReviewAgent: 3, lastReviewSupervisor: 3 },
      { key: "commitment",  label: "Commitment",         isCritical: false, agentRating: 3, supervisorRating: 2, lastReviewAgent: 3, lastReviewSupervisor: 3 },
      { key: "attitude",    label: "Attitude to work",   isCritical: false, agentRating: 3, supervisorRating: 3, lastReviewAgent: 3, lastReviewSupervisor: 3 },
      { key: "knowledge",   label: "Project knowledge",  isCritical: false, agentRating: 4, supervisorRating: 4, lastReviewAgent: 4, lastReviewSupervisor: 4 },
      { key: "absenteeism", label: "Absenteeism",        isCritical: false, agentRating: 3, supervisorRating: 3, lastReviewAgent: 3, lastReviewSupervisor: 3 },
    ],
    retentionSignal: "Low",
    hasRoleFramework: false,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const OBJECTIVE_STATUS_STYLES: Record<ObjectiveStatus, { bg: string; text: string; label: string }> = {
  "not-started":         { bg: "bg-surface-muted",   text: "text-text-tertiary",  label: "Not started"         },
  "in-progress":         { bg: "bg-brand-light",      text: "text-brand",          label: "In progress"         },
  "achieved":            { bg: "bg-success-light",    text: "text-success",        label: "Achieved"            },
  "paused":              { bg: "bg-warning-light",    text: "text-warning",        label: "Paused"              },
  "needs-reorientation": { bg: "bg-danger-light",     text: "text-danger",         label: "Needs reorientation" },
};

const REVIEW_STATUS_STYLES: Record<ReviewStatus, { bg: string; text: string; label: string }> = {
  "draft":      { bg: "bg-surface-muted",  text: "text-text-secondary", label: "Draft"       },
  "in-progress":{ bg: "bg-warning-light",  text: "text-warning",        label: "In progress" },
  "completed":  { bg: "bg-success-light",  text: "text-success",        label: "Completed"   },
};

function computeGap(supervisor: number | null, agent: number | null): number | null {
  if (supervisor === null || agent === null) return null;
  return supervisor - agent;
}

function vsLastReview(current: number | null, last: number | null): "up" | "down" | "same" | "first" {
  if (last === null) return "first";
  if (current === null) return "first";
  if (current > last) return "up";
  if (current < last) return "down";
  return "same";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function StatusBadge({ status }: { status: ReviewStatus }) {
  const s = REVIEW_STATUS_STYLES[status];
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${s.bg} ${s.text}`}>{s.label}</span>;
}

function ObjectiveBadge({ status }: { status: ObjectiveStatus }) {
  const s = OBJECTIVE_STATUS_STYLES[status];
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${s.bg} ${s.text}`}>{s.label}</span>;
}

function GapIndicator({ gap }: { gap: number | null }) {
  if (gap === null) return <span className="text-text-tertiary text-xs">—</span>;
  if (gap === 0) return <span className="text-text-tertiary text-xs">—</span>;
  if (gap >= 2) return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-danger">
      ↑{gap} <span className="text-[10px] bg-danger-light px-1 rounded">Perception gap</span>
    </span>
  );
  if (gap > 0) return <span className="text-xs text-warning">↑{gap}</span>;
  return <span className="text-xs text-success">↓{Math.abs(gap)}</span>;
}

function VsLastReview({ current, last, isCritical }: { current: number | null; last: number | null; isCritical: boolean }) {
  const dir = vsLastReview(current, last);
  if (dir === "first") return <span className="text-text-tertiary text-xs">—</span>;
  if (dir === "up")   return <span className="text-success text-xs font-medium">↑ +{(current ?? 0) - (last ?? 0)}</span>;
  if (dir === "down") return (
    <span className={`text-xs font-medium ${isCritical ? "text-danger" : "text-warning"} flex items-center gap-0.5`}>
      ↓ {(current ?? 0) - (last ?? 0)}
      {isCritical && <AlertTriangle size={11} />}
    </span>
  );
  return <span className="text-text-tertiary text-xs">=</span>;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function CEDPPage() {
  const [agentId, setAgentId]               = useState("joao-silva");
  const [agentDropdown, setAgentDropdown]   = useState(false);
  const [competenciesOpen, setCompetenciesOpen] = useState(false);
  const [reviewCloseOpen, setReviewCloseOpen]   = useState(false);
  const [expandedObservations, setExpandedObservations] = useState<Record<string, boolean>>({});
  const [expandedExplorations, setExpandedExplorations] = useState<Record<string, boolean>>({ "exp-1": true });

  // Review close state
  const [reviewSummary, setReviewSummary]   = useState("");
  const [direction, setDirection]           = useState<DirectionOfEvolution>(null);
  const [commitments, setCommitments]       = useState([
    { id: "c1", text: "Assign buddy role for new agent joining Jun 23", date: "Jun 23", sent: false },
    { id: "c2", text: "Schedule next One to One focused on communication evidence", date: "Jun 25", sent: false },
  ]);
  const [synthesisNote, setSynthesisNote]   = useState(
    "João showing behavioral evidence of communication improvement. Problem solving objective needs more exposure opportunities. Next 90 days: maintain communication focus, increase complexity exposure."
  );
  const [reviewCompleted, setReviewCompleted] = useState(false);

  const agent = AGENTS.find((a) => a.id === agentId) ?? AGENTS[0];
  const isExploratory = agent.mode === "exploratory";

  const toggleObservations = (id: string) =>
    setExpandedObservations((p) => ({ ...p, [id]: !p[id] }));
  const toggleExploration = (id: string) =>
    setExpandedExplorations((p) => ({ ...p, [id]: !p[id] }));

  const canCompleteReview = direction !== null && reviewSummary.trim().length > 0;

  const handleCompleteReview = () => {
    if (canCompleteReview) setReviewCompleted(true);
  };

  const allCommitmentsSent = commitments.every((c) => c.sent);

  const hasEnoughExploratoryEvidence =
    isExploratory &&
    agent.explorations.length > 0 &&
    agent.explorations.some((e) => e.observations.length >= 2);

  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar />
      <main className="flex-1 font-sans text-text-primary px-6 py-6 overflow-x-hidden">
        <div className="max-w-4xl mx-auto">

          {/* ── Page header ─────────────────────────────────────────── */}
          <div className="mb-5">
            <h1 className="text-2xl font-semibold m-0">CEDP</h1>
            <p className="text-sm text-text-secondary m-0 mt-0.5">
              Customer Expert Development Plan
            </p>
          </div>

          {/* ── Agent selector + period + tabs ──────────────────────── */}
          <div className="border border-border rounded-lg bg-surface px-4 py-3 mb-4 flex flex-wrap items-center gap-4">
            {/* Agent selector */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <p className="text-[11px] text-text-secondary uppercase tracking-wide m-0 whitespace-nowrap">Agent</p>
              <div className="relative max-w-xs flex-1">
                <button
                  onClick={() => setAgentDropdown((v) => !v)}
                  className="w-full flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm bg-surface-muted hover:border-brand/40 transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-brand-light text-brand text-xs font-semibold flex items-center justify-center flex-shrink-0">
                    {agent.initials}
                  </span>
                  <span className="flex-1 text-left">
                    <span className="font-medium">{agent.name}</span>
                    <span className="text-text-tertiary text-xs ml-1.5">— {agent.tenure}</span>
                  </span>
                  <ChevronDown size={14} className="text-text-tertiary flex-shrink-0" />
                </button>
                {agentDropdown && (
                  <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-surface border border-border rounded-md overflow-hidden z-10 shadow-md">
                    {AGENTS.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => { setAgentId(a.id); setAgentDropdown(false); setReviewCompleted(false); setDirection(null); setReviewSummary(""); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left border-b border-border last:border-b-0 transition-colors ${a.id === agentId ? "bg-surface-muted font-medium" : "hover:bg-surface-muted"}`}
                      >
                        <span className="w-6 h-6 rounded-full bg-brand-light text-brand text-xs font-semibold flex items-center justify-center flex-shrink-0">{a.initials}</span>
                        {a.name}
                        <span className="text-text-tertiary text-xs ml-auto">{a.tenure}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border border-border rounded-md overflow-hidden">
              {["Agent", "Supervisor", "Draft"].map((tab, i) => (
                <button
                  key={tab}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${i === 1 ? "bg-brand text-white" : "bg-surface text-text-secondary hover:bg-surface-muted"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* CEDP link */}
            <button className="inline-flex items-center gap-1.5 text-xs text-text-secondary border border-border rounded-md px-3 py-1.5 hover:border-brand/40 transition-colors">
              <ExternalLink size={12} /> 5 pending reviews
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════
              BLOQUE 1 — Identity & direction
          ══════════════════════════════════════════════════════════ */}
          <div className="border border-border rounded-lg bg-surface px-5 py-4 mb-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left — identity */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-light text-brand text-sm font-semibold flex items-center justify-center flex-shrink-0">
                  {agent.initials}
                </div>
                <div>
                  <p className="text-base font-semibold m-0">{agent.name}</p>
                  <p className="text-sm text-text-secondary m-0">{agent.tenure} · {agent.role}</p>
                </div>
              </div>

              {/* Right — direction */}
              <div className="flex flex-col gap-2.5">
                {/* Aspiration */}
                <div className="flex items-start gap-3">
                  <p className="text-[11px] uppercase tracking-wide text-text-tertiary w-32 flex-shrink-0 mt-0.5">Career aspiration</p>
                  {!isExploratory ? (
                    <div>
                      <p className="text-sm font-medium text-text-primary m-0">{agent.aspiration}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-text-secondary m-0">Not yet defined</p>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-surface-muted text-text-secondary">Exploratory</span>
                    </div>
                  )}
                </div>

                {/* Critical gaps or Emerging strengths */}
                {!isExploratory && agent.criticalGaps.length > 0 && (
                  <div className="flex items-start gap-3">
                    <p className="text-[11px] uppercase tracking-wide text-text-tertiary w-32 flex-shrink-0 mt-0.5">Critical gaps</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.criticalGaps.map((g) => (
                        <span key={g} className="text-[11px] font-medium px-2 py-0.5 rounded bg-danger-light text-danger">{g}</span>
                      ))}
                      {!agent.hasRoleFramework && (
                        <p className="text-xs text-warning m-0 mt-0.5 w-full">Role profile not configured in Project Config</p>
                      )}
                    </div>
                  </div>
                )}

                {isExploratory && agent.emergingStrengths.length > 0 && (
                  <div className="flex items-start gap-3">
                    <p className="text-[11px] uppercase tracking-wide text-text-tertiary w-32 flex-shrink-0 mt-0.5">Emerging strengths</p>
                    <div className="flex flex-col gap-0.5">
                      {agent.emergingStrengths.map((s) => (
                        <p key={s} className="text-xs text-text-secondary m-0 italic">{s}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews */}
                {agent.lastReview && (
                  <div className="flex items-start gap-3">
                    <p className="text-[11px] uppercase tracking-wide text-text-tertiary w-32 flex-shrink-0 mt-0.5">Last review</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs text-text-secondary m-0">{agent.lastReview.date} · {agent.lastReview.topic}</p>
                      <StatusBadge status={agent.lastReview.status} />
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <p className="text-[11px] uppercase tracking-wide text-text-tertiary w-32 flex-shrink-0 mt-0.5">This review</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs text-text-secondary m-0">Jun 2026 · D-1</p>
                    <StatusBadge status={reviewCompleted ? "completed" : "draft"} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              BLOQUE 2 — Development focus
          ══════════════════════════════════════════════════════════ */}
          <div className="border border-border rounded-lg bg-surface mb-4 overflow-hidden">
            {/* Block header */}
            <div className="px-5 py-3 border-b border-border bg-surface-muted flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wide text-text-secondary m-0">Development focus</p>
              <button
                className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded border border-brand bg-brand-light text-brand hover:bg-brand/10 transition-colors"
                disabled={!isExploratory && agent.objectives.length >= 3}
                title={!isExploratory && agent.objectives.length >= 3 ? "Close or pause an existing objective first" : ""}
              >
                <Plus size={13} /> {isExploratory ? "Add exploration" : "Add objective"}
              </button>
            </div>

            {/* MODE_DEFINED — Objectives */}
            {!isExploratory && agent.objectives.map((obj) => (
              <div key={obj.id} className="border-b border-border last:border-b-0 px-5 py-4">
                {/* Row 1: status + title */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <ObjectiveBadge status={obj.status} />
                      {!obj.isCriticalGap && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-warning">
                          <AlertCircle size={11} />
                          Not aligned with critical gaps for {agent.aspiration}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-text-primary m-0">{obj.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5 m-0">
                      Gap: <span className={obj.isCriticalGap ? "text-danger font-medium" : "text-text-secondary"}>{obj.gapAddressed}</span>
                      {obj.isCriticalGap && <span className="text-[11px] text-danger ml-1">[critical for {agent.aspiration}]</span>}
                    </p>
                  </div>
                </div>

                {/* Row 2: How */}
                <div className="mb-3">
                  <p className="text-[11px] uppercase tracking-wide text-text-tertiary mb-1 m-0">How</p>
                  <p className="text-xs text-text-secondary m-0">{obj.how}</p>
                </div>

                {/* Row 3: Evidence */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] uppercase tracking-wide text-text-tertiary m-0">Evidence so far</p>
                    <button
                      onClick={() => toggleObservations(obj.id)}
                      className="text-[11px] text-brand underline"
                    >
                      {expandedObservations[obj.id] ? "Collapse" : `${obj.evidence.length} observation${obj.evidence.length !== 1 ? "s" : ""}`}
                    </button>
                  </div>

                  {obj.noEvidenceWeeks >= 4 && (
                    <div className="inline-flex items-center gap-1 text-xs font-medium bg-warning-light text-warning px-2 py-0.5 rounded mb-2">
                      <AlertTriangle size={11} />
                      No evidence after {obj.noEvidenceWeeks} weeks — has the agent had opportunities?
                    </div>
                  )}

                  {(expandedObservations[obj.id] || obj.evidence.length <= 2) && obj.evidence.map((obs, i) => (
                    <div key={i} className="flex items-start gap-2 py-1 border-t border-border first:border-t-0">
                      <span className="text-xs text-text-tertiary font-mono whitespace-nowrap w-14 flex-shrink-0">{obs.date}</span>
                      <span className="text-xs text-text-secondary flex-1">{obs.text}</span>
                      <span className="text-[11px] text-text-tertiary whitespace-nowrap flex-shrink-0">{obs.source}</span>
                    </div>
                  ))}

                  <button className="text-xs text-brand underline mt-1 block">+ Import from One to One session</button>
                </div>

                {/* Row 4: Success when */}
                <div className="mb-2">
                  <p className="text-[11px] uppercase tracking-wide text-text-tertiary mb-1 m-0">Success when</p>
                  <p className="text-xs text-text-secondary m-0">{obj.successWhen}</p>
                  <p className="text-xs text-text-tertiary m-0">by {obj.successDate}</p>
                </div>

                {/* Row 5: DSM link */}
                <div className="mt-2 pt-2 border-t border-border">
                  {obj.dsmCommitments > 0 ? (
                    <button className="text-xs text-brand underline">
                      → {obj.dsmCommitments} commitment{obj.dsmCommitments !== 1 ? "s" : ""} open in DSM
                    </button>
                  ) : (
                    <p className="text-xs text-text-tertiary m-0">No active commitments in DSM</p>
                  )}
                </div>
              </div>
            ))}

            {/* MODE_EXPLORATORY — Explorations */}
            {isExploratory && agent.explorations.map((exp) => (
              <div key={exp.id} className="border-b border-border last:border-b-0">
                {/* Header — expandible */}
                <button
                  onClick={() => toggleExploration(exp.id)}
                  className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-surface-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-brand-light text-brand">Active</span>
                    <p className="text-sm font-medium text-text-primary m-0">{exp.dimension}</p>
                  </div>
                  {expandedExplorations[exp.id]
                    ? <ChevronUp size={14} className="text-text-tertiary flex-shrink-0" />
                    : <ChevronDown size={14} className="text-text-tertiary flex-shrink-0" />
                  }
                </button>

                {expandedExplorations[exp.id] && (
                  <div className="px-5 pb-4">
                    {/* Observed */}
                    <div className="mb-3">
                      <p className="text-[11px] uppercase tracking-wide text-text-tertiary mb-1 m-0">Observed</p>
                      <p className="text-xs text-text-secondary mb-1.5 m-0">{exp.observations.length} instances:</p>
                      {exp.observations.map((obs, i) => (
                        <div key={i} className="flex items-start gap-2 py-1 border-t border-border first:border-t-0">
                          <span className="text-xs text-text-tertiary font-mono whitespace-nowrap w-14 flex-shrink-0">{obs.date}</span>
                          <span className="text-xs text-text-secondary flex-1">{obs.text}</span>
                          <span className="text-[11px] text-text-tertiary whitespace-nowrap flex-shrink-0">{obs.source}</span>
                        </div>
                      ))}
                    </div>

                    {/* Contexts tested */}
                    <div className="mb-3">
                      <p className="text-[11px] uppercase tracking-wide text-text-tertiary mb-1.5 m-0">Contexts tested</p>
                      <div className="flex flex-wrap gap-1.5">
                        {exp.contextsTested.map((ctx) => (
                          <span
                            key={ctx.label}
                            className={`text-xs font-medium px-2 py-0.5 rounded ${ctx.verified ? "bg-success-light text-success" : "bg-surface-muted text-text-tertiary"}`}
                          >
                            {ctx.label}{!ctx.verified && " — not yet"}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Next exposure */}
                    <div className="mb-3">
                      <p className="text-[11px] uppercase tracking-wide text-text-tertiary mb-1 m-0">Next exposure</p>
                      <p className="text-xs text-text-secondary m-0">
                        {exp.nextExposure}
                        <span className="text-text-tertiary ml-1">· {exp.nextExposureDate}</span>
                      </p>
                    </div>

                    {/* Hypothesis */}
                    <div className="mb-2">
                      <p className="text-[11px] uppercase tracking-wide text-text-tertiary mb-1 m-0">Hypothesis</p>
                      <p className="text-xs text-text-secondary italic m-0">{exp.hypothesis}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Empty state */}
            {!isExploratory && agent.objectives.length === 0 && (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-text-secondary m-0">No development objectives defined yet.</p>
                <p className="text-xs text-text-tertiary mt-1 m-0">Add an objective aligned with the critical gaps for {agent.aspiration}.</p>
              </div>
            )}
            {isExploratory && agent.explorations.length === 0 && (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-text-secondary m-0">No explorations defined yet.</p>
                <p className="text-xs text-text-tertiary mt-1 m-0">Start by identifying a dimension to observe and test in different contexts.</p>
              </div>
            )}

            {/* Emerging direction footer — exploratory with evidence */}
            {hasEnoughExploratoryEvidence && (
              <div className="border-t border-border px-5 py-3 bg-surface-muted flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-text-tertiary m-0 mb-0.5">Emerging direction</p>
                  <p className="text-xs text-text-secondary m-0">
                    {agent.explorations[0]?.hypothesis ?? "Patterns suggest team-facing communication roles."}
                  </p>
                </div>
                <button className="text-xs font-medium px-3 py-1.5 rounded border border-brand bg-brand-light text-brand hover:bg-brand/10 transition-colors whitespace-nowrap">
                  Start aspiration conversation guide →
                </button>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              BLOQUE 3 — Competency evidence (colapsable)
          ══════════════════════════════════════════════════════════ */}
          <div className="border border-border rounded-lg bg-surface mb-4 overflow-hidden">
            <button
              onClick={() => setCompetenciesOpen((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-surface-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={13} className="text-text-tertiary" />
                <p className="text-[11px] uppercase tracking-wide text-text-tertiary m-0">Competency evidence</p>
                {/* Gap summary badge */}
                {(() => {
                  const significantGaps = agent.competencies.filter((c) => {
                    const g = computeGap(c.supervisorRating, c.agentRating);
                    return g !== null && g >= 2;
                  }).length;
                  return significantGaps > 0 ? (
                    <span className="text-xs font-medium bg-danger-light text-danger px-2 py-0.5 rounded ml-1">
                      {significantGaps} gap{significantGaps > 1 ? "s" : ""} of 2+ points
                    </span>
                  ) : null;
                })()}
              </div>
              {competenciesOpen
                ? <ChevronUp size={14} className="text-text-tertiary" />
                : <ChevronDown size={14} className="text-text-tertiary" />
              }
            </button>

            {competenciesOpen && (
              <div className="px-5 py-3 border-t border-border">
                {isExploratory && (
                  <p className="text-xs text-text-secondary mb-3 m-0 italic">
                    In exploratory mode: look for competencies rated above tenure average — these signal potential direction.
                  </p>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse min-w-[520px]">
                    <thead>
                      <tr className="bg-surface-muted">
                        <th className="text-left px-3 py-2 text-[11px] font-medium text-text-secondary uppercase tracking-wide">Competency</th>
                        <th className="text-center px-3 py-2 text-[11px] font-medium text-text-secondary uppercase tracking-wide">Agent</th>
                        <th className="text-center px-3 py-2 text-[11px] font-medium text-text-secondary uppercase tracking-wide">Supervisor</th>
                        <th className="text-center px-3 py-2 text-[11px] font-medium text-text-secondary uppercase tracking-wide">Gap</th>
                        <th className="text-center px-3 py-2 text-[11px] font-medium text-text-secondary uppercase tracking-wide">vs last review</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agent.competencies.map((comp) => {
                        const gap = computeGap(comp.supervisorRating, comp.agentRating);
                        const labels = RATING_LABELS[comp.label] ?? ["1", "2", "3", "4"];
                        return (
                          <tr key={comp.key} className="border-t border-border hover:bg-surface-muted transition-colors">
                            <td className="px-3 py-2.5">
                              <span className="text-sm text-text-primary">{comp.label}</span>
                              {comp.isCritical && (
                                <span className="ml-1.5 text-[11px] text-danger">[critical]</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <select
                                className="text-xs border border-border rounded px-1.5 py-1 bg-surface focus:outline-none focus:border-brand"
                                value={comp.agentRating ?? ""}
                                onChange={() => {}}
                              >
                                <option value="">—</option>
                                {labels.map((l, i) => (
                                  <option key={i} value={i + 1}>{i + 1} — {l}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <select
                                className="text-xs border border-border rounded px-1.5 py-1 bg-surface focus:outline-none focus:border-brand"
                                value={comp.supervisorRating ?? ""}
                                onChange={() => {}}
                              >
                                <option value="">—</option>
                                {labels.map((l, i) => (
                                  <option key={i} value={i + 1}>{i + 1} — {l}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <GapIndicator gap={gap} />
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <VsLastReview
                                current={comp.supervisorRating}
                                last={comp.lastReviewSupervisor}
                                isCritical={comp.isCritical}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Retention signal */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-text-secondary m-0">Retention signal</p>
                  <div className="flex items-center gap-2">
                    <select className="text-xs border border-border rounded px-2 py-1 bg-surface focus:outline-none focus:border-brand">
                      <option value="Low" selected={agent.retentionSignal === "Low"}>Low</option>
                      <option value="Medium" selected={agent.retentionSignal === "Medium"}>Medium</option>
                      <option value="High" selected={agent.retentionSignal === "High"}>High</option>
                    </select>
                    {agent.retentionSignal === "High" && (
                      <p className="text-xs text-warning m-0">Consider a retention conversation — create commitment in DSM</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              BLOQUE 4 — Review & close
          ══════════════════════════════════════════════════════════ */}
          <div className="border border-border rounded-lg bg-surface mb-6 overflow-hidden">
            <button
              onClick={() => setReviewCloseOpen((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-surface-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className={reviewCompleted ? "text-success" : "text-text-tertiary"} />
                <p className="text-[11px] uppercase tracking-wide text-text-tertiary m-0">
                  {reviewCompleted ? "Review completed ✓" : "Review & close"}
                </p>
              </div>
              {reviewCloseOpen
                ? <ChevronUp size={14} className="text-text-tertiary" />
                : <ChevronDown size={14} className="text-text-tertiary" />
              }
            </button>

            {reviewCloseOpen && !reviewCompleted && (
              <div className="border-t border-border">

                {/* Section 1 — Summary */}
                <div className="px-5 py-4 border-b border-border">
                  <p className="text-[11px] uppercase tracking-wide text-text-tertiary mb-1 m-0">Review summary</p>
                  <p className="text-xs text-text-tertiary mb-2 m-0">2 lines max — what would you say if asked "how is {agent.name} doing?"</p>
                  <textarea
                    value={reviewSummary}
                    onChange={(e) => setReviewSummary(e.target.value)}
                    rows={2}
                    maxLength={280}
                    placeholder={`${agent.name} is...`}
                    className="w-full text-sm px-3 py-2 border border-border rounded-md bg-surface-muted focus:outline-none focus:border-brand resize-none"
                  />
                </div>

                {/* Section 2 — Direction of evolution */}
                <div className="px-5 py-4 border-b border-border">
                  <p className="text-[11px] uppercase tracking-wide text-text-tertiary mb-3 m-0">Direction of evolution <span className="text-danger">*</span></p>
                  <div className="flex flex-col gap-2">
                    {([
                      {
                        value: "converging" as DirectionOfEvolution,
                        title: "Converging toward aspiration",
                        desc: "Gaps closing. Objectives on track. Evidence of behavioral change in critical areas.",
                        note: null,
                      },
                      {
                        value: "progressing-not-relevant" as DirectionOfEvolution,
                        title: "Progressing but not goal-relevant",
                        desc: "Genuine improvement, but in non-critical competencies. Plan may need reorientation.",
                        note: agent.criticalGaps.length > 0 ? `Critical gaps still open: ${agent.criticalGaps.join(", ")}` : null,
                        noteColor: "text-warning",
                      },
                      {
                        value: "early-stage" as DirectionOfEvolution,
                        title: "Early stage — insufficient evidence",
                        desc: "Objectives defined. Not enough time or exposure to assess behavioral change yet.",
                        note: null,
                      },
                      {
                        value: "needs-reorientation" as DirectionOfEvolution,
                        title: "Needs reorientation",
                        desc: "Current plan not aligned with critical gaps or evidence suggests method isn't working.",
                        note: "Consider updating development objectives before next review.",
                        noteColor: "text-danger",
                      },
                    ] as { value: DirectionOfEvolution; title: string; desc: string; note: string | null; noteColor?: string }[]).map((opt) => (
                      <button
                        key={opt.value ?? ""}
                        onClick={() => setDirection(opt.value)}
                        className={`text-left border rounded-md p-3 transition-colors ${direction === opt.value ? "border-brand bg-brand-light/20" : "border-border hover:border-brand/40"}`}
                      >
                        <p className="text-sm font-medium text-text-primary m-0">{opt.title}</p>
                        <p className="text-xs text-text-secondary mt-0.5 m-0">{opt.desc}</p>
                        {direction === opt.value && opt.note && (
                          <p className={`text-xs mt-1 m-0 ${opt.noteColor ?? "text-text-secondary"}`}>{opt.note}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 3 — Commitments → DSM */}
                <div className="px-5 py-4 border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] uppercase tracking-wide text-text-tertiary m-0">Commitments → DSM</p>
                    {!allCommitmentsSent && (
                      <button
                        onClick={() => setCommitments((c) => c.map((item) => ({ ...item, sent: true })))}
                        className="text-xs text-brand underline"
                      >
                        Send all
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {commitments.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 py-1.5 border-b border-border last:border-b-0">
                        <input
                          type="checkbox"
                          checked={c.sent}
                          onChange={() => setCommitments((prev) => prev.map((item) => item.id === c.id ? { ...item, sent: !item.sent } : item))}
                          className="flex-shrink-0 accent-brand"
                        />
                        <span className="text-sm text-text-primary flex-1">{c.text}</span>
                        <span className="text-xs text-text-tertiary whitespace-nowrap">Due: {c.date}</span>
                        {c.sent && <CheckCircle size={13} className="text-success flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                  {allCommitmentsSent && (
                    <p className="text-xs text-success mt-2 m-0">✓ All commitments sent to DSM</p>
                  )}
                  <button className="text-xs text-brand underline mt-2 block">+ Add commitment</button>
                </div>

                {/* Section 4 — Synthesis note → One to One */}
                <div className="px-5 py-4 border-b border-border">
                  <p className="text-[11px] uppercase tracking-wide text-text-tertiary mb-1 m-0">Synthesis note → One to One</p>
                  <p className="text-xs text-text-tertiary mb-2 m-0">
                    This note will appear as preparation context in the next One to One session for {agent.name}.
                  </p>
                  <textarea
                    value={synthesisNote}
                    onChange={(e) => setSynthesisNote(e.target.value)}
                    rows={3}
                    className="w-full text-sm px-3 py-2 border border-border rounded-md bg-surface-muted focus:outline-none focus:border-brand resize-none"
                  />
                  <p className="text-xs text-text-tertiary mt-1 m-0">Auto-generated from review content. Edit before sending.</p>
                </div>

                {/* Section 5 — Actions */}
                <div className="px-5 py-4 flex items-center justify-end gap-2">
                  <button className="text-sm px-4 py-2 rounded-md border border-border text-text-secondary hover:border-brand/40 transition-colors">
                    Save draft
                  </button>
                  <button
                    onClick={handleCompleteReview}
                    disabled={!canCompleteReview}
                    className="text-sm font-medium px-4 py-2 rounded-md bg-brand text-white hover:bg-brand/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Complete review
                  </button>
                </div>
              </div>
            )}

            {/* Completed state */}
            {reviewCloseOpen && reviewCompleted && (
              <div className="border-t border-border px-5 py-4">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-text-tertiary mb-0.5 m-0">Summary</p>
                    <p className="m-0 text-sm">{reviewSummary || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-text-tertiary mb-0.5 m-0">Direction</p>
                    <p className="m-0 text-sm capitalize">{direction?.replace(/-/g, " ") ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-text-tertiary mb-0.5 m-0">Sent to</p>
                    <p className="m-0 text-sm text-success">DSM + One to One ✓</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
