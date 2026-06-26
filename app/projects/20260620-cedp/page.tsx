"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { GlobalHeader } from "@/components/Header";
import { ChevronDown, ExternalLink } from "lucide-react";

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

  const agent = AGENTS.find((a) => a.id === agentId) ?? AGENTS[0];

  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <GlobalHeader />
        <main className="flex-1 font-sans text-text-primary px-8 py-6 overflow-x-hidden">
          <div>

            {/* ── Page header ─────────────────────────────────────────── */}
            <div className="mb-5">
              <h1 className="text-2xl font-semibold m-0">CEDP</h1>
              <p className="text-sm text-text-secondary m-0 mt-0.5">Customer Expert Development Plan</p>
            </div>

            {/* ── Agent selector row ─────────────────────────────────── */}
            <div className="border border-border rounded-xl bg-surface px-4 py-3 mb-4 flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary flex-shrink-0">Agent</span>
              <div className="relative">
                <button
                  onClick={() => setAgentDropdown((v: boolean) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-sm bg-surface-muted hover:border-brand/40 transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-brand-light text-brand text-[10px] font-bold flex items-center justify-center flex-shrink-0">{agent.initials}</span>
                  <span className="font-medium text-text-primary">{agent.name}</span>
                  <span className="text-text-tertiary text-xs">— {agent.tenure}</span>
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
                <button className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-white text-text-secondary hover:bg-surface-muted transition-colors">Agent</button>
                <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand text-white">Supervisor</button>
                <button className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-white text-text-secondary hover:bg-surface-muted transition-colors">Draft</button>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-text-secondary border border-border rounded-lg px-3 py-1.5 hover:border-brand/40 transition-colors flex-shrink-0">
                <ExternalLink size={12} />
                5 pending reviews
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
            <div className="px-5 py-3 border-b border-border flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="1.5"/><text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill="#6B7280" fontFamily="Inter,system-ui">A</text></svg>
              <span className="text-sm font-semibold text-text-primary">Ability to cope with the tasks and daily routine</span>
            </div>
            <div className="grid grid-cols-2">
              {/* EXPERT */}
              <div className="p-4 border-r border-border">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#6B7280" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                </div>
                  <select className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                  <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
              {/* SUPERVISOR */}
              <div className="p-4 bg-[#F6FEF9]">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#10B981" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                </div>
                  <select className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-[#F6FEF9] focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                  <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-[#F6FEF9] placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
            </div>
          </div>
          {/* B — Problem solving and continuous improvement */}
          <div className="border border-border rounded-xl bg-surface overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-border flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="1.5"/><text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill="#6B7280" fontFamily="Inter,system-ui">B</text></svg>
              <span className="text-sm font-semibold text-text-primary">Problem solving and continuous improvement</span>
            </div>
            <div className="grid grid-cols-2">
              {/* EXPERT */}
              <div className="p-4 border-r border-border">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#6B7280" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                </div>
                  <select className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                  <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
              {/* SUPERVISOR */}
              <div className="p-4 bg-[#F6FEF9]">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#10B981" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                </div>
                  <select className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-[#F6FEF9] focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                  <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-[#F6FEF9] placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
            </div>
          </div>
          {/* C — Commitment and responsibility */}
          <div className="border border-border rounded-xl bg-surface overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-border flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="1.5"/><text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill="#6B7280" fontFamily="Inter,system-ui">C</text></svg>
              <span className="text-sm font-semibold text-text-primary">Commitment and responsibility</span>
            </div>
            <div className="grid grid-cols-2">
              {/* EXPERT */}
              <div className="p-4 border-r border-border">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#6B7280" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                </div>
                  <select className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                  <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
              {/* SUPERVISOR */}
              <div className="p-4 bg-[#F6FEF9]">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#10B981" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                </div>
                  <select className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-[#F6FEF9] focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                  <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-[#F6FEF9] placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
            </div>
          </div>
          {/* D — Attitude towards work */}
          <div className="border border-border rounded-xl bg-surface overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-border flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="1.5"/><text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill="#6B7280" fontFamily="Inter,system-ui">D</text></svg>
              <span className="text-sm font-semibold text-text-primary">Attitude towards work</span>
            </div>
            <div className="grid grid-cols-2">
              {/* EXPERT */}
              <div className="p-4 border-r border-border">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#6B7280" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                </div>
                  <select className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                  <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
              {/* SUPERVISOR */}
              <div className="p-4 bg-[#F6FEF9]">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#10B981" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                </div>
                  <select className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-[#F6FEF9] focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                  <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-[#F6FEF9] placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
            </div>
          </div>
          {/* E — Project knowledge */}
          <div className="border border-border rounded-xl bg-surface overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-border flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="1.5"/><text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill="#6B7280" fontFamily="Inter,system-ui">E</text></svg>
              <span className="text-sm font-semibold text-text-primary">Project knowledge</span>
            </div>
            <div className="grid grid-cols-2">
              {/* EXPERT */}
              <div className="p-4 border-r border-border">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#6B7280" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                </div>
                  <select className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                  <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
              {/* SUPERVISOR */}
              <div className="p-4 bg-[#F6FEF9]">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#10B981" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                </div>
                  <select className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-[#F6FEF9] focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                  <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-[#F6FEF9] placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
            </div>
          </div>
          {/* F — Absenteeism and delays */}
          <div className="border border-border rounded-xl bg-surface overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-border flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="1.5"/><text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill="#6B7280" fontFamily="Inter,system-ui">F</text></svg>
              <span className="text-sm font-semibold text-text-primary">Absenteeism and delays</span>
            </div>
            <div className="grid grid-cols-2">
              {/* EXPERT */}
              <div className="p-4 border-r border-border">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#6B7280" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                </div>
                  <select className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                  <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
              {/* SUPERVISOR */}
              <div className="p-4 bg-[#F6FEF9]">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#10B981" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                </div>
                  <select className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-[#F6FEF9] focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option value="">Select a rating...</option>
                    <option>1 — Below expectations</option>
                    <option>2 — Developing</option>
                    <option>3 — Meets expectations</option>
                    <option>4 — Exceeds expectations</option>
                    <option>5 — Outstanding</option>
                  </select>
                  <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-[#F6FEF9] placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
            </div>
          </div>
          {/* G — Propensity to leave in the next 30 days */}
          <div className="border border-border rounded-xl bg-surface overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-border flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="1.5"/><text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill="#6B7280" fontFamily="Inter,system-ui">G</text></svg>
              <span className="text-sm font-semibold text-text-primary">Propensity to leave in the next 30 days</span>
            </div>
            <div className="grid grid-cols-2">
              {/* EXPERT */}
              <div className="p-4 border-r border-border">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#6B7280" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                </div>
                  <select className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                  <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
              {/* SUPERVISOR */}
              <div className="p-4 bg-[#F6FEF9]">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#10B981" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                </div>
                  <select className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-[#F6FEF9] focus:outline-none focus:border-brand text-text-secondary mb-2">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                  <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-[#F6FEF9] placeholder:text-text-tertiary outline-none resize-none focus:border-brand" placeholder="Comments..."/>
              </div>
            </div>
          </div>
          {/* H — Personal Aspirations */}
          <div className="border border-border rounded-xl bg-surface overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-border flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="1.5"/><text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill="#6B7280" fontFamily="Inter,system-ui">H</text></svg>
              <span className="text-sm font-semibold text-text-primary">Personal Aspirations</span>
            </div>
            <div className="grid grid-cols-2">
              {/* EXPERT */}
              <div className="p-4 border-r border-border">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#6B7280" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                </div>
                  <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 placeholder:text-text-tertiary outline-none resize-none focus:border-brand mb-2 bg-white" placeholder="Describe personal aspirations..."/>
              </div>
              {/* SUPERVISOR */}
              <div className="p-4 bg-[#F6FEF9]">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#10B981" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                </div>
                  <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 placeholder:text-text-tertiary outline-none resize-none focus:border-brand mb-2 bg-[#F6FEF9]" placeholder="Supervisor comments on personal aspirations..."/>
              </div>
            </div>
          </div>
          {/* I — Professional Aspirations */}
          <div className="border border-border rounded-xl bg-surface overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-border flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="1.5"/><text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill="#6B7280" fontFamily="Inter,system-ui">I</text></svg>
              <span className="text-sm font-semibold text-text-primary">Professional Aspirations</span>
            </div>
            <div className="grid grid-cols-2">
              {/* EXPERT */}
              <div className="p-4 border-r border-border">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#6B7280" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Expert</span>
                </div>
                  <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 placeholder:text-text-tertiary outline-none resize-none focus:border-brand mb-2 bg-white" placeholder="Describe professional aspirations..."/>
              </div>
              {/* SUPERVISOR */}
              <div className="p-4 bg-[#F6FEF9]">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2.5" stroke="#10B981" strokeWidth="1.1"/><path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="#10B981" strokeWidth="1.1" strokeLinecap="round"/></svg>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand">Supervisor</span>
                </div>
                  <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 placeholder:text-text-tertiary outline-none resize-none focus:border-brand mb-2 bg-[#F6FEF9]" placeholder="Supervisor comments on professional aspirations..."/>
              </div>
            </div>
          </div>



          </div>
        </main>
      </div>
    </div>
  );
}
