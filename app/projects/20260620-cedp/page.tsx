"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { GlobalHeader } from "@/components/Header";
import { ChevronDown, ChevronUp } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Agent = {
  id: string;
  name: string;
  initials: string;
  tenure: string;
  role?: string;
  mode?: string;
  aspiration?: string | null;
  criticalGaps?: string[];
  [key: string]: unknown;
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
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
// Page
// ---------------------------------------------------------------------------
export default function CEDPPage() {
  const [agentId, setAgentId]             = useState(AGENTS[0].id);
  const [agentDropdown, setAgentDropdown] = useState(false);
  const [propensity, setPropensity]       = useState<number>(0);

  const PROPENSITY_LEVELS = ["Low", "Medium", "High"];
  const cyclePropensity = (dir: 1 | -1) => {
    setPropensity((prev) => (prev + dir + PROPENSITY_LEVELS.length) % PROPENSITY_LEVELS.length);
  };

  const agent = AGENTS.find((a) => a.id === agentId) ?? AGENTS[0];

  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <GlobalHeader />
        <main className="flex-1 font-sans text-text-primary px-8 py-6 overflow-x-hidden">
          <div>

            {/* ── Page header ─────────────────────────────────────────── */}
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold m-0">CEDP</h1>
                <p className="text-sm text-text-secondary m-0 mt-0.5">Customer Expert Development Plan</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors flex-shrink-0 mt-1">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.1"/><path d="M6 5.5v3M6 4v.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                5 pending reviews
              </button>
            </div>

            {/* ── Employee selector row ──────────────────────────────── */}
            <div className="border border-border rounded-xl bg-surface px-4 py-3 mb-4 flex items-center gap-3">
              <span className="text-sm text-text-secondary flex-shrink-0">Employee:</span>
              <div className="relative">
                <button
                  onClick={() => setAgentDropdown((v: boolean) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-sm bg-surface-muted hover:border-brand/40 transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-brand-light text-brand text-[10px] font-bold flex items-center justify-center flex-shrink-0">{agent.initials}</span>
                  <span className="font-medium text-text-primary">{agent.name}</span>
                  <ChevronDown size={13} className="text-text-tertiary flex-shrink-0" />
                </button>
                {agentDropdown && (
                  <div className="absolute top-[calc(100%+4px)] left-0 bg-surface border border-border rounded-xl overflow-hidden z-20 shadow-lg min-w-[200px]">
                    {AGENTS.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => { setAgentId(a.id); setAgentDropdown(false); }}
                        className={"w-full flex items-center gap-2 px-3 py-2 text-sm text-left border-b border-border last:border-b-0 transition-colors " + (a.id === agentId ? "bg-surface-muted font-medium" : "hover:bg-surface-muted")}
                      >
                        <span className="w-6 h-6 rounded-full bg-brand-light text-brand text-[10px] font-bold flex items-center justify-center flex-shrink-0">{a.initials}</span>
                        <span className="flex-1">{a.name}</span>
                        <span className="text-text-tertiary text-xs">{a.tenure}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-1">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-surface text-text-secondary hover:bg-surface-muted transition-colors">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="4" r="2" stroke="currentColor" strokeWidth="1.1"/><path d="M1.5 9.5c0-2 1.8-3.2 4-3.2s4 1.2 4 3.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  Agent
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand text-white">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1L9.5 2.5v3c0 2.5-1.7 4-4 4.5-2.3-.5-4-2-4-4.5v-3L5.5 1z" stroke="white" strokeWidth="1.1" strokeLinejoin="round"/></svg>
                  Supervisor
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-surface text-text-secondary hover:bg-surface-muted transition-colors">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="1.5" y="1" width="8" height="9" rx="1" stroke="currentColor" strokeWidth="1.1"/><path d="M3.3 4h4.4M3.3 6h4.4M3.3 8h2.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
                  Draft
                </button>
              </div>
            </div>

          {/* Current / History tabs */}
          <div className="flex items-center gap-1 mb-4">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-text-primary text-surface">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.1"/><circle cx="5.5" cy="5.5" r="1.3" fill="currentColor"/></svg>
              Current
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-text-secondary hover:bg-surface-muted transition-colors">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v3l2 2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/><circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.1"/></svg>
              History
            </button>
          </div>

          {/* Draft notice */}
          <div className="border border-warning/30 rounded-xl bg-warning-light px-4 py-3 mb-5 text-xs text-text-secondary">
            This CEDP is in draft. Switch to <span className="font-semibold text-text-primary">Agent view</span> to fill and submit the self-assessment.
          </div>

          {/* A — Ability to cope with the tasks and daily routine */}
          <div className="border border-border rounded-xl overflow-hidden mb-3 bg-surface">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 bg-surface-muted border border-border text-text-secondary">A</span>
              <span className="text-sm font-semibold text-text-primary flex-1">Ability to cope with the tasks and daily routine</span>
            </div>
            <div className="border-t border-border">
              <div className="grid grid-cols-2">
                {/* EXPERT — read-only */}
                <div className="p-4 border-r border-border bg-surface-muted/40">
                  <div className="flex items-center gap-1.5 mb-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="rgb(var(--text-tertiary))" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="rgb(var(--text-tertiary))" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                    <span className="ml-auto text-[10px] text-text-tertiary italic">Read only</span>
                  </div>
                <select disabled className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-surface-muted text-text-tertiary mb-2 cursor-not-allowed opacity-60">
                  <option value="">Select a rating...</option>
                  <option>1 — Below expectations</option>
                  <option>2 — Developing</option>
                  <option>3 — Meets expectations</option>
                  <option>4 — Exceeds expectations</option>
                  <option>5 — Outstanding</option>
                </select>
                <textarea rows={2} disabled className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface-muted placeholder:text-text-tertiary outline-none resize-none cursor-not-allowed opacity-60" placeholder="Comments..."/>
                </div>
                {/* SUPERVISOR — active */}
                <div className="p-4 bg-brand-light">
                  <div className="flex items-center gap-1.5 mb-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="rgb(var(--brand))" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="rgb(var(--brand))" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                  </div>
                <select className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-surface focus:outline-none focus:border-brand text-text-secondary mb-2">
                  <option value="">Select a rating...</option>
                  <option>1 — Below expectations</option>
                  <option>2 — Developing</option>
                  <option>3 — Meets expectations</option>
                  <option>4 — Exceeds expectations</option>
                  <option>5 — Outstanding</option>
                </select>
                <textarea rows={2} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
                </div>
              </div>
            </div>
          </div>

          {/* B — Problem solving and continuous improvement */}
          <div className="border border-border rounded-xl overflow-hidden mb-3 bg-surface">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 bg-surface-muted border border-border text-text-secondary">B</span>
              <span className="text-sm font-semibold text-text-primary flex-1">Problem solving and continuous improvement</span>
            </div>
            <div className="border-t border-border">
              <div className="grid grid-cols-2">
                {/* EXPERT — read-only */}
                <div className="p-4 border-r border-border bg-surface-muted/40">
                  <div className="flex items-center gap-1.5 mb-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="rgb(var(--text-tertiary))" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="rgb(var(--text-tertiary))" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                    <span className="ml-auto text-[10px] text-text-tertiary italic">Read only</span>
                  </div>
                <select disabled className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-surface-muted text-text-tertiary mb-2 cursor-not-allowed opacity-60">
                  <option value="">Select a rating...</option>
                  <option>1 — Below expectations</option>
                  <option>2 — Developing</option>
                  <option>3 — Meets expectations</option>
                  <option>4 — Exceeds expectations</option>
                  <option>5 — Outstanding</option>
                </select>
                <textarea rows={2} disabled className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface-muted placeholder:text-text-tertiary outline-none resize-none cursor-not-allowed opacity-60" placeholder="Comments..."/>
                </div>
                {/* SUPERVISOR — active */}
                <div className="p-4 bg-brand-light">
                  <div className="flex items-center gap-1.5 mb-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="rgb(var(--brand))" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="rgb(var(--brand))" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                  </div>
                <select className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-surface focus:outline-none focus:border-brand text-text-secondary mb-2">
                  <option value="">Select a rating...</option>
                  <option>1 — Below expectations</option>
                  <option>2 — Developing</option>
                  <option>3 — Meets expectations</option>
                  <option>4 — Exceeds expectations</option>
                  <option>5 — Outstanding</option>
                </select>
                <textarea rows={2} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
                </div>
              </div>
            </div>
          </div>

          {/* C — Commitment and responsibility */}
          <div className="border border-border rounded-xl overflow-hidden mb-3 bg-surface">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 bg-surface-muted border border-border text-text-secondary">C</span>
              <span className="text-sm font-semibold text-text-primary flex-1">Commitment and responsibility</span>
            </div>
            <div className="border-t border-border">
              <div className="grid grid-cols-2">
                {/* EXPERT — read-only */}
                <div className="p-4 border-r border-border bg-surface-muted/40">
                  <div className="flex items-center gap-1.5 mb-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="rgb(var(--text-tertiary))" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="rgb(var(--text-tertiary))" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                    <span className="ml-auto text-[10px] text-text-tertiary italic">Read only</span>
                  </div>
                <select disabled className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-surface-muted text-text-tertiary mb-2 cursor-not-allowed opacity-60">
                  <option value="">Select a rating...</option>
                  <option>1 — Below expectations</option>
                  <option>2 — Developing</option>
                  <option>3 — Meets expectations</option>
                  <option>4 — Exceeds expectations</option>
                  <option>5 — Outstanding</option>
                </select>
                <textarea rows={2} disabled className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface-muted placeholder:text-text-tertiary outline-none resize-none cursor-not-allowed opacity-60" placeholder="Comments..."/>
                </div>
                {/* SUPERVISOR — active */}
                <div className="p-4 bg-brand-light">
                  <div className="flex items-center gap-1.5 mb-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="rgb(var(--brand))" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="rgb(var(--brand))" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                  </div>
                <select className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-surface focus:outline-none focus:border-brand text-text-secondary mb-2">
                  <option value="">Select a rating...</option>
                  <option>1 — Below expectations</option>
                  <option>2 — Developing</option>
                  <option>3 — Meets expectations</option>
                  <option>4 — Exceeds expectations</option>
                  <option>5 — Outstanding</option>
                </select>
                <textarea rows={2} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
                </div>
              </div>
            </div>
          </div>

          {/* D — Attitude towards work */}
          <div className="border border-border rounded-xl overflow-hidden mb-3 bg-surface">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 bg-surface-muted border border-border text-text-secondary">D</span>
              <span className="text-sm font-semibold text-text-primary flex-1">Attitude towards work</span>
            </div>
            <div className="border-t border-border">
              <div className="grid grid-cols-2">
                {/* EXPERT — read-only */}
                <div className="p-4 border-r border-border bg-surface-muted/40">
                  <div className="flex items-center gap-1.5 mb-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="rgb(var(--text-tertiary))" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="rgb(var(--text-tertiary))" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                    <span className="ml-auto text-[10px] text-text-tertiary italic">Read only</span>
                  </div>
                <select disabled className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-surface-muted text-text-tertiary mb-2 cursor-not-allowed opacity-60">
                  <option value="">Select a rating...</option>
                  <option>1 — Below expectations</option>
                  <option>2 — Developing</option>
                  <option>3 — Meets expectations</option>
                  <option>4 — Exceeds expectations</option>
                  <option>5 — Outstanding</option>
                </select>
                <textarea rows={2} disabled className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface-muted placeholder:text-text-tertiary outline-none resize-none cursor-not-allowed opacity-60" placeholder="Comments..."/>
                </div>
                {/* SUPERVISOR — active */}
                <div className="p-4 bg-brand-light">
                  <div className="flex items-center gap-1.5 mb-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="rgb(var(--brand))" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="rgb(var(--brand))" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                  </div>
                <select className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-surface focus:outline-none focus:border-brand text-text-secondary mb-2">
                  <option value="">Select a rating...</option>
                  <option>1 — Below expectations</option>
                  <option>2 — Developing</option>
                  <option>3 — Meets expectations</option>
                  <option>4 — Exceeds expectations</option>
                  <option>5 — Outstanding</option>
                </select>
                <textarea rows={2} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
                </div>
              </div>
            </div>
          </div>

          {/* E — Project knowledge */}
          <div className="border border-border rounded-xl overflow-hidden mb-3 bg-surface">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 bg-surface-muted border border-border text-text-secondary">E</span>
              <span className="text-sm font-semibold text-text-primary flex-1">Project knowledge</span>
            </div>
            <div className="border-t border-border">
              <div className="grid grid-cols-2">
                {/* EXPERT — read-only */}
                <div className="p-4 border-r border-border bg-surface-muted/40">
                  <div className="flex items-center gap-1.5 mb-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="rgb(var(--text-tertiary))" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="rgb(var(--text-tertiary))" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                    <span className="ml-auto text-[10px] text-text-tertiary italic">Read only</span>
                  </div>
                <select disabled className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-surface-muted text-text-tertiary mb-2 cursor-not-allowed opacity-60">
                  <option value="">Select a rating...</option>
                  <option>1 — Below expectations</option>
                  <option>2 — Developing</option>
                  <option>3 — Meets expectations</option>
                  <option>4 — Exceeds expectations</option>
                  <option>5 — Outstanding</option>
                </select>
                <textarea rows={2} disabled className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface-muted placeholder:text-text-tertiary outline-none resize-none cursor-not-allowed opacity-60" placeholder="Comments..."/>
                </div>
                {/* SUPERVISOR — active */}
                <div className="p-4 bg-brand-light">
                  <div className="flex items-center gap-1.5 mb-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="rgb(var(--brand))" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="rgb(var(--brand))" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                  </div>
                <select className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-surface focus:outline-none focus:border-brand text-text-secondary mb-2">
                  <option value="">Select a rating...</option>
                  <option>1 — Below expectations</option>
                  <option>2 — Developing</option>
                  <option>3 — Meets expectations</option>
                  <option>4 — Exceeds expectations</option>
                  <option>5 — Outstanding</option>
                </select>
                <textarea rows={2} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
                </div>
              </div>
            </div>
          </div>

          {/* F — Absenteeism and delays */}
          <div className="border border-border rounded-xl overflow-hidden mb-3 bg-surface">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 bg-surface-muted border border-border text-text-secondary">F</span>
              <span className="text-sm font-semibold text-text-primary flex-1">Absenteeism and delays</span>
            </div>
            <div className="border-t border-border">
              <div className="grid grid-cols-2">
                {/* EXPERT — read-only */}
                <div className="p-4 border-r border-border bg-surface-muted/40">
                  <div className="flex items-center gap-1.5 mb-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="rgb(var(--text-tertiary))" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="rgb(var(--text-tertiary))" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                    <span className="ml-auto text-[10px] text-text-tertiary italic">Read only</span>
                  </div>
                <select disabled className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-surface-muted text-text-tertiary mb-2 cursor-not-allowed opacity-60">
                  <option value="">Select a rating...</option>
                  <option>1 — Below expectations</option>
                  <option>2 — Developing</option>
                  <option>3 — Meets expectations</option>
                  <option>4 — Exceeds expectations</option>
                  <option>5 — Outstanding</option>
                </select>
                <textarea rows={2} disabled className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface-muted placeholder:text-text-tertiary outline-none resize-none cursor-not-allowed opacity-60" placeholder="Comments..."/>
                </div>
                {/* SUPERVISOR — active */}
                <div className="p-4 bg-brand-light">
                  <div className="flex items-center gap-1.5 mb-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="rgb(var(--brand))" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="rgb(var(--brand))" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                  </div>
                <select className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-surface focus:outline-none focus:border-brand text-text-secondary mb-2">
                  <option value="">Select a rating...</option>
                  <option>1 — Below expectations</option>
                  <option>2 — Developing</option>
                  <option>3 — Meets expectations</option>
                  <option>4 — Exceeds expectations</option>
                  <option>5 — Outstanding</option>
                </select>
                <textarea rows={2} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
                </div>
              </div>
            </div>
          </div>

          {/* G — Propensity to leave in the next 30 days */}
          <div className="border border-border rounded-xl overflow-hidden mb-3 bg-surface">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 bg-surface-muted border border-border text-text-secondary">G</span>
              <span className="text-sm font-semibold text-text-primary flex-1">Propensity to leave in the next 30 days</span>
            </div>
            <div className="border-t border-border">
              <div className="grid grid-cols-2">
                {/* EXPERT — read-only */}
                <div className="p-4 border-r border-border bg-surface-muted/40">
                  <div className="flex items-center gap-1.5 mb-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="rgb(var(--text-tertiary))" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="rgb(var(--text-tertiary))" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                    <span className="ml-auto text-[10px] text-text-tertiary italic">Read only</span>
                  </div>
                  <div className="flex items-center justify-between w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-surface-muted text-text-tertiary mb-2 cursor-not-allowed opacity-60">
                    <span>Low</span>
                    <span className="flex flex-col gap-[1px] text-text-tertiary">
                      <ChevronUp size={10} />
                      <ChevronDown size={10} />
                    </span>
                  </div>
                <textarea rows={2} disabled className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface-muted placeholder:text-text-tertiary outline-none resize-none cursor-not-allowed opacity-60" placeholder="Comments..."/>
                </div>
                {/* SUPERVISOR — active */}
                <div className="p-4 bg-brand-light">
                  <div className="flex items-center gap-1.5 mb-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="rgb(var(--brand))" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="rgb(var(--brand))" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                  </div>
                  <div className="flex items-center justify-between w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-surface text-text-secondary mb-2">
                    <span>{PROPENSITY_LEVELS[propensity]}</span>
                    <span className="flex flex-col gap-[1px]">
                      <button type="button" onClick={() => cyclePropensity(1)} className="text-text-tertiary hover:text-brand transition-colors" aria-label="Increase">
                        <ChevronUp size={10} />
                      </button>
                      <button type="button" onClick={() => cyclePropensity(-1)} className="text-text-tertiary hover:text-brand transition-colors" aria-label="Decrease">
                        <ChevronDown size={10} />
                      </button>
                    </span>
                  </div>
                <textarea rows={2} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
                </div>
              </div>
            </div>
          </div>

          {/* H — Personal Aspirations */}
          <div className="border border-border rounded-xl overflow-hidden mb-3 bg-surface">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 bg-surface-muted border border-border text-text-secondary">H</span>
              <span className="text-sm font-semibold text-text-primary flex-1">Personal Aspirations</span>
            </div>
            <div className="border-t border-border">
              <div className="grid grid-cols-2">
                {/* EXPERT — read-only */}
                <div className="p-4 border-r border-border bg-surface-muted/40">
                  <div className="flex items-center gap-1.5 mb-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="rgb(var(--text-tertiary))" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="rgb(var(--text-tertiary))" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                    <span className="ml-auto text-[10px] text-text-tertiary italic">Read only</span>
                  </div>
                <textarea rows={3} disabled className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface-muted placeholder:text-text-tertiary outline-none resize-none cursor-not-allowed opacity-60" placeholder="Describe personal aspirations..."/>
                </div>
                {/* SUPERVISOR — active */}
                <div className="p-4 bg-brand-light">
                  <div className="flex items-center gap-1.5 mb-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="rgb(var(--brand))" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="rgb(var(--brand))" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                  </div>
                <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Supervisor comments on personal aspirations..."/>
                </div>
              </div>
            </div>
          </div>

          {/* I — Professional Aspirations */}
          <div className="border border-border rounded-xl overflow-hidden mb-3 bg-surface">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 bg-surface-muted border border-border text-text-secondary">I</span>
              <span className="text-sm font-semibold text-text-primary flex-1">Professional Aspirations</span>
            </div>
            <div className="border-t border-border">
              <div className="grid grid-cols-2">
                {/* EXPERT — read-only */}
                <div className="p-4 border-r border-border bg-surface-muted/40">
                  <div className="flex items-center gap-1.5 mb-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="rgb(var(--text-tertiary))" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="rgb(var(--text-tertiary))" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                    <span className="ml-auto text-[10px] text-text-tertiary italic">Read only</span>
                  </div>
                <textarea rows={3} disabled className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface-muted placeholder:text-text-tertiary outline-none resize-none cursor-not-allowed opacity-60" placeholder="Describe professional aspirations..."/>
                </div>
                {/* SUPERVISOR — active */}
                <div className="p-4 bg-brand-light">
                  <div className="flex items-center gap-1.5 mb-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="rgb(var(--brand))" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="rgb(var(--brand))" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                  </div>
                <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Supervisor comments on professional aspirations..."/>
                </div>
              </div>
            </div>
          </div>

          </div>
        </main>
      </div>
    </div>
  );
}
