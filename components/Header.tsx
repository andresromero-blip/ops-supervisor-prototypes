"use client";

import { createContext, useContext, useState } from "react";

export type Period = "D-1" | "WTD" | "MTD" | "QTD";

// Full label shown below the active button — mirrors the One to One module pattern
const PERIOD_DATE_LABELS: Record<Period, string> = {
  "D-1": "Yesterday — Tue 23 Jun",
  "WTD": "Week to date · Jun 17–23",
  "MTD": "Month to date · Jun 1–23",
  "QTD": "Quarter to date · Apr 1–Jun 23",
};

interface PeriodCtx {
  period: Period;
  setPeriod: (p: Period) => void;
}

export const PeriodContext = createContext<PeriodCtx>({
  period: "D-1",
  setPeriod: () => {},
});

export function usePeriod() {
  return useContext(PeriodContext);
}

export function PeriodProvider({ children }: { children: React.ReactNode }) {
  const [period, setPeriod] = useState<Period>("D-1");
  return (
    <PeriodContext.Provider value={{ period, setPeriod }}>
      {children}
    </PeriodContext.Provider>
  );
}

export function GlobalHeader() {
  const { period, setPeriod } = usePeriod();
  const periods: Period[] = ["D-1", "WTD", "MTD", "QTD"];

  return (
    <header
      className="flex items-center justify-between bg-white border-b"
      style={{
        height: 44,
        paddingLeft: 20,
        paddingRight: 20,
        borderColor: "#E5E7EB",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left: page identity */}
      <div className="flex items-center gap-2.5">
        <span
          className="text-sm"
          style={{ color: "#6B7280" }}
        >
          ☰
        </span>
        <span
          className="text-sm font-semibold"
          style={{ color: "#111827" }}
        >
          Operations Dashboard
        </span>
      </div>

      {/* Right: period selector + date context + switch team */}
      <div className="flex items-center gap-4">

        {/*
          Period selector with inline date context.
          Pattern taken from the One to One module:
          - Buttons in a pill group
          - Active period shows date label immediately to its right
          - No separate floating span — label lives next to the selector
        */}
        <div className="flex items-center gap-2">
          {/* Pill group */}
          <div
            className="flex items-center gap-0.5 rounded-lg p-0.5"
            style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}
          >
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  period === p
                    ? "bg-brand text-white"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Date context label — same pattern as One to One PERIOD label */}
          <div className="flex items-center gap-1.5" style={{ color: "#6B7280" }}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{ flexShrink: 0, opacity: 0.6 }}
            >
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M6 3.5V6L7.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span
              className="text-xs whitespace-nowrap"
              style={{ color: "#374151" }}
            >
              {PERIOD_DATE_LABELS[period]}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "#E5E7EB" }} />

        {/* Switch Team */}
        <button
          className="flex items-center gap-1.5 text-xs font-medium rounded-md border px-3 py-1.5 transition-colors hover:border-brand/40"
          style={{ borderColor: "#E5E7EB", color: "#374151", background: "#fff" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M1.5 11c0-2 1.57-3.5 3.5-3.5S8.5 9 8.5 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="10" cy="4.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M10 7.5c1.38 0 2.5 1.12 2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Switch Team
        </button>

        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
          style={{ background: "#F3F4F6", color: "#6B7280", border: "1px solid #E5E7EB" }}
        >
          S
        </div>
      </div>
    </header>
  );
}
