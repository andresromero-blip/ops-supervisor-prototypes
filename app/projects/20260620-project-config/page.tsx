"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { GlobalHeader } from "@/components/Header";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ProjectConfigPage() {
  const [kpiOpen, setKpiOpen]         = useState(false);
  const [addKpiOpen, setAddKpiOpen]   = useState(false);
  const [contentsOpen, setContentsOpen] = useState(false);
  const [backupsOpen, setBackupsOpen] = useState(false);

  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <GlobalHeader />
        <main className="flex-1 font-sans text-text-primary px-8 py-6">

          {/* ── Page header ──────────────────────────────────────────── */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold m-0">Project Configuration</h1>
            <p className="text-sm text-text-secondary m-0 mt-0.5">Configure KPIs, weights, targets, and project contents</p>
          </div>

          {/* ── Total Weight validity banner ──────────────────────────── */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand/30 bg-[#F6FEF9] mb-4">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="#FF0082" strokeWidth="1.2"/>
              <path d="M4.5 7l2 2 3-3" stroke="#FF0082" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm font-medium text-brand">Total Weight: 100% ✓ Valid</span>
          </div>

          {/* ── Accordion sections ────────────────────────────────────── */}
          <div className="flex flex-col gap-3">

            {/* KPI Builder & Weight Configuration */}
            <div className="border border-border rounded-xl bg-white overflow-hidden">
              <button
                onClick={() => setKpiOpen(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M2 13V8M6 13V5M10 13V9M13 13V3" stroke="#6B7280" strokeWidth="1.3" strokeLinecap="round"/>
                    <circle cx="13" cy="2" r="1" fill="#6B7280"/>
                  </svg>
                  <span className="text-sm font-semibold text-text-primary">KPI Builder & Weight Configuration</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={"transition-transform duration-150 " + (kpiOpen ? "rotate-180" : "")}>
                  <path d="M3 5.5l4 4 4-4" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </button>
              {kpiOpen && (
                <div className="border-t border-border px-5 py-4">
                  <p className="text-sm text-text-tertiary m-0">KPI configuration content goes here.</p>
                </div>
              )}
            </div>

            {/* Add New KPI */}
            <div className="border border-border rounded-xl bg-white overflow-hidden">
              <button
                onClick={() => setAddKpiOpen(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M7.5 2v11M2 7.5h11" stroke="#6B7280" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  <span className="text-sm font-semibold text-text-primary">Add New KPI</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={"transition-transform duration-150 " + (addKpiOpen ? "rotate-180" : "")}>
                  <path d="M3 5.5l4 4 4-4" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </button>
              {addKpiOpen && (
                <div className="border-t border-border px-5 py-4">
                  <p className="text-sm text-text-tertiary m-0">Add KPI form goes here.</p>
                </div>
              )}
            </div>

            {/* Project Contents */}
            <div className="border border-border rounded-xl bg-white overflow-hidden">
              <button
                onClick={() => setContentsOpen(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <rect x="2" y="2" width="11" height="11" rx="1.5" stroke="#6B7280" strokeWidth="1.1"/>
                    <path d="M5 5h5M5 7.5h5M5 10h3" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/>
                  </svg>
                  <span className="text-sm font-semibold text-text-primary">Project Contents</span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-surface-muted border border-border text-text-secondary">3</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={"transition-transform duration-150 " + (contentsOpen ? "rotate-180" : "")}>
                  <path d="M3 5.5l4 4 4-4" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </button>
              {contentsOpen && (
                <div className="border-t border-border px-5 py-4">
                  <p className="text-sm text-text-tertiary m-0">Project contents list goes here.</p>
                </div>
              )}
            </div>

            {/* Supervisor Backups */}
            <div className="border border-border rounded-xl bg-white overflow-hidden">
              <button
                onClick={() => setBackupsOpen(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 flex-1">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <circle cx="5.5" cy="4.5" r="2" stroke="#6B7280" strokeWidth="1.1"/>
                    <circle cx="10.5" cy="4.5" r="2" stroke="#6B7280" strokeWidth="1.1"/>
                    <path d="M1 13c0-2.2 2.02-3.5 4.5-3.5M14 13c0-2.2-2.02-3.5-4.5-3.5M7.5 13c0-2.2 1.12-3.5 3-3.5" stroke="#6B7280" strokeWidth="1.1" strokeLinecap="round"/>
                  </svg>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">Supervisor Backups</span>
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-surface-muted border border-border text-text-secondary">0</span>
                    </div>
                    <p className="text-xs text-text-tertiary m-0 mt-0.5">Supervisors authorised to cover your team when you are absent.</p>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={"transition-transform duration-150 " + (backupsOpen ? "rotate-180" : "")}>
                  <path d="M3 5.5l4 4 4-4" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </button>
              {backupsOpen && (
                <div className="border-t border-border px-5 py-4">
                  <p className="text-sm text-text-tertiary m-0">No supervisor backups configured yet.</p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
