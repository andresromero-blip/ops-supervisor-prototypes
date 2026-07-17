"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { GlobalHeader } from "@/components/Header";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
type Status = "Online" | "Break" | "Coaching" | "Offline";

const STATUS_STYLES: Record<Status, { bg: string; text: string }> = {
  Online:   { bg: "#10B981", text: "white" },
  Break:    { bg: "rgb(var(--surface-muted))", text: "rgb(var(--text-secondary))" },
  Coaching: { bg: "rgb(var(--surface-muted))", text: "rgb(var(--text-secondary))" },
  Offline:  { bg: "rgb(var(--surface-muted))", text: "rgb(var(--text-secondary))" },
};

const AGENTS: { name: string; status: Status }[] = [
  { name: "João Silva",      status: "Online"   },
  { name: "Maria Santos",    status: "Online"   },
  { name: "Carlos Mendes",   status: "Break"    },
  { name: "Ana Ferreira",    status: "Online"   },
  { name: "Pedro Costa",     status: "Coaching" },
  { name: "Sofia Rodrigues", status: "Online"   },
  { name: "Ricardo Nunes",   status: "Offline"  },
  { name: "Beatriz Lopes",   status: "Online"   },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function SchedulesPage() {
  const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "/");

  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <GlobalHeader />
        <main className="flex-1 font-sans text-text-primary px-8 py-6">

          {/* ── Page header ──────────────────────────────────────────── */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold m-0">Schedules</h1>
              <p className="text-sm text-text-secondary m-0 mt-0.5">Schedule management</p>
            </div>
            {/* Date picker + view toggle */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-surface">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="2" width="12" height="11" rx="1.5" stroke="rgb(var(--text-secondary))" strokeWidth="1.1"/>
                  <path d="M4 1v2M10 1v2M1 6h12" stroke="rgb(var(--text-secondary))" strokeWidth="1.1" strokeLinecap="round"/>
                </svg>
                <input
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="text-sm text-text-primary outline-none bg-transparent"
                />
              </div>
              {/* Agent / Supervisor toggle */}
              <div className="flex items-center gap-1">
                <button className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-surface text-text-secondary hover:bg-surface-muted transition-colors">
                  Agent
                </button>
                <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand text-white flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="4" r="2" stroke="white" strokeWidth="1.1"/>
                    <path d="M1 11c0-2.5 2.24-4 5-4s5 1.5 5 4" stroke="white" strokeWidth="1.1" strokeLinecap="round"/>
                  </svg>
                  Supervisor
                </button>
              </div>
            </div>
          </div>

          {/* ── Schedule grid ─────────────────────────────────────────── */}
          <div className="border border-border rounded-xl bg-surface overflow-hidden">
            {/* Grid header */}
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-text-primary m-0">
                Schedule Grid — {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </h2>
            </div>

            {/* Table */}
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide w-64">Customer Expert</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide w-40">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide w-32">Start</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide w-32">End</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide w-32">Lunch</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {AGENTS.map((agent, i) => (
                  <tr key={i} className="border-b border-border last:border-b-0 hover:bg-surface-muted/40 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-medium text-text-primary">{agent.name}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: STATUS_STYLES[agent.status].bg, color: STATUS_STYLES[agent.status].text }}
                      >
                        {agent.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-text-tertiary">–</td>
                    <td className="px-6 py-3.5 text-sm text-text-tertiary">–</td>
                    <td className="px-6 py-3.5 text-sm text-text-tertiary">–</td>
                    <td className="px-6 py-3.5 text-right">
                      <button className="text-xs text-amber-500 border border-amber-200 rounded-lg px-2.5 py-1 hover:bg-amber-50 transition-colors">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </main>
      </div>
    </div>
  );
}
