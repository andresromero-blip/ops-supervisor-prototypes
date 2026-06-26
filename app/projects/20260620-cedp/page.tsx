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
      <div className="flex-1 flex flex-col min-w-0">
      <GlobalHeader />
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

          {/* Current / History tabs */}
          <div className="flex items-center gap-1 mb-4">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-brand bg-white text-brand">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke="#10B981" strokeWidth="1.1"/><path d="M5.5 3v2.5l1.5 1.5" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/></svg>
              Current
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-white text-text-secondary hover:border-brand/40 transition-colors">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v3l2 2" stroke="#9CA3AF" strokeWidth="1.1" strokeLinecap="round"/><circle cx="5.5" cy="5.5" r="4.5" stroke="#9CA3AF" strokeWidth="1.1"/></svg>
              History
            </button>
          </div>

          {/* Draft notice */}
          <div className="border border-border rounded-xl bg-surface-muted px-4 py-3 mb-5 text-xs text-text-secondary">
            This CEDP is in draft. Switch to <span className="font-semibold text-text-primary">Agent view</span> to fill and submit the self-assessment.
          </div>


          {/* A — Ability to cope with the tasks and daily routine */}
          <div className="border border-border rounded-xl bg-surface overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-surface-muted border border-border flex items-center justify-center text-[11px] font-bold text-text-secondary flex-shrink-0">A</span>
              <span className="text-sm font-semibold text-text-primary">Ability to cope with the tasks and daily routine</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border">
              {/* EXPERT column */}
              <div className="px-4 py-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#6B7280" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                </div>
                  <select className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                <textarea rows={2} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
              {/* SUPERVISOR column */}
              <div className="px-4 py-4 bg-[#F6FEF9]">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#10B981" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                </div>
                  <select className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-surface-muted focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                <textarea rows={2} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
            </div>
          </div>
          {/* B — Problem solving and continuous improvement */}
          <div className="border border-border rounded-xl bg-surface overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-surface-muted border border-border flex items-center justify-center text-[11px] font-bold text-text-secondary flex-shrink-0">B</span>
              <span className="text-sm font-semibold text-text-primary">Problem solving and continuous improvement</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border">
              {/* EXPERT column */}
              <div className="px-4 py-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#6B7280" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                </div>
                  <select className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                <textarea rows={2} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
              {/* SUPERVISOR column */}
              <div className="px-4 py-4 bg-[#F6FEF9]">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#10B981" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                </div>
                  <select className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-surface-muted focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                <textarea rows={2} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
            </div>
          </div>
          {/* C — Commitment and responsibility */}
          <div className="border border-border rounded-xl bg-surface overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-surface-muted border border-border flex items-center justify-center text-[11px] font-bold text-text-secondary flex-shrink-0">C</span>
              <span className="text-sm font-semibold text-text-primary">Commitment and responsibility</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border">
              {/* EXPERT column */}
              <div className="px-4 py-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#6B7280" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                </div>
                  <select className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                <textarea rows={2} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
              {/* SUPERVISOR column */}
              <div className="px-4 py-4 bg-[#F6FEF9]">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#10B981" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                </div>
                  <select className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-surface-muted focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                <textarea rows={2} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
            </div>
          </div>
          {/* D — Attitude towards work */}
          <div className="border border-border rounded-xl bg-surface overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-surface-muted border border-border flex items-center justify-center text-[11px] font-bold text-text-secondary flex-shrink-0">D</span>
              <span className="text-sm font-semibold text-text-primary">Attitude towards work</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border">
              {/* EXPERT column */}
              <div className="px-4 py-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#6B7280" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                </div>
                  <select className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                <textarea rows={2} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
              {/* SUPERVISOR column */}
              <div className="px-4 py-4 bg-[#F6FEF9]">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#10B981" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                </div>
                  <select className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-surface-muted focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                <textarea rows={2} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
            </div>
          </div>
          {/* E — Project knowledge */}
          <div className="border border-border rounded-xl bg-surface overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-surface-muted border border-border flex items-center justify-center text-[11px] font-bold text-text-secondary flex-shrink-0">E</span>
              <span className="text-sm font-semibold text-text-primary">Project knowledge</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border">
              {/* EXPERT column */}
              <div className="px-4 py-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#6B7280" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                </div>
                  <select className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                <textarea rows={2} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
              {/* SUPERVISOR column */}
              <div className="px-4 py-4 bg-[#F6FEF9]">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#10B981" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                </div>
                  <select className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-surface-muted focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                <textarea rows={2} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
            </div>
          </div>
          {/* F — Absenteeism and delays */}
          <div className="border border-border rounded-xl bg-surface overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-surface-muted border border-border flex items-center justify-center text-[11px] font-bold text-text-secondary flex-shrink-0">F</span>
              <span className="text-sm font-semibold text-text-primary">Absenteeism and delays</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border">
              {/* EXPERT column */}
              <div className="px-4 py-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#6B7280" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                </div>
                  <select className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                <textarea rows={2} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
              {/* SUPERVISOR column */}
              <div className="px-4 py-4 bg-[#F6FEF9]">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#10B981" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                </div>
                  <select className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-surface-muted focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                <textarea rows={2} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
            </div>
          </div>
          {/* G — Propensity to leave in the next 30 days */}
          <div className="border border-border rounded-xl bg-surface overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-surface-muted border border-border flex items-center justify-center text-[11px] font-bold text-text-secondary flex-shrink-0">G</span>
              <span className="text-sm font-semibold text-text-primary">Propensity to leave in the next 30 days</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border">
              {/* EXPERT column */}
              <div className="px-4 py-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#6B7280" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                </div>
                  <select className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                <textarea rows={2} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
              {/* SUPERVISOR column */}
              <div className="px-4 py-4 bg-[#F6FEF9]">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#10B981" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                </div>
                  <select className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                <textarea rows={2} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
            </div>
          </div>
          {/* H — Personal Aspirations */}
          <div className="border border-border rounded-xl bg-surface overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-surface-muted border border-border flex items-center justify-center text-[11px] font-bold text-text-secondary flex-shrink-0">H</span>
              <span className="text-sm font-semibold text-text-primary">Personal Aspirations</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border">
              {/* EXPERT column */}
              <div className="px-4 py-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#6B7280" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                </div>
                  <textarea rows={3} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand mb-0" placeholder="Describe personal aspirations..."/>
                <textarea rows={2} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
              {/* SUPERVISOR column */}
              <div className="px-4 py-4 bg-[#F6FEF9]">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#10B981" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                </div>
                  <textarea rows={3} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand mb-0" placeholder="Supervisor comments on personal aspirations..."/>
                <textarea rows={2} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
            </div>
          </div>
          {/* I — Professional Aspirations */}
          <div className="border border-border rounded-xl bg-surface overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-surface-muted border border-border flex items-center justify-center text-[11px] font-bold text-text-secondary flex-shrink-0">I</span>
              <span className="text-sm font-semibold text-text-primary">Professional Aspirations</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border">
              {/* EXPERT column */}
              <div className="px-4 py-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#6B7280" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                </div>
                  <textarea rows={3} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand mb-0" placeholder="Describe professional aspirations..."/>
                <textarea rows={2} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
              {/* SUPERVISOR column */}
              <div className="px-4 py-4 bg-[#F6FEF9]">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#10B981" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                </div>
                  <textarea rows={3} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand mb-0" placeholder="Supervisor comments on professional aspirations..."/>
                <textarea rows={2} className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
            </div>
          </div>

        </div>
      </main>
      </div>
    </div>
  );
}

