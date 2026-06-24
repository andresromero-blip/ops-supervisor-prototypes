"use client";

// ITERATION A: global period selector with contextual date label
// Exported context so pages can consume it without re-declaring period state
import { createContext, useContext, useState } from "react";

export type Period = "D-1" | "WTD" | "MTD" | "QTD";

const PERIOD_CONTEXT_LABELS: Record<Period, string> = {
  "D-1": "Yesterday · Tue 23 Jun",
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
      className="flex items-center justify-between px-5 border-b bg-white"
      style={{ height: 44, borderColor: "#E5E7EB", flexShrink: 0 }}
    >
      <span className="text-xs text-text-secondary">Operations Dashboard</span>

      <div className="flex items-center gap-3">
        {/* Period buttons */}
        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-0.5">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                period === p
                  ? "bg-brand text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        {/* ITERATION: contextual date range label */}
        <span
          className="text-[11px] text-text-tertiary border-l pl-3"
          style={{ borderColor: "#E5E7EB" }}
        >
          {PERIOD_CONTEXT_LABELS[period]}
        </span>

        <button
          className="px-3 py-1.5 text-xs rounded-md border border-gray-200 bg-white text-text-secondary font-medium hover:border-brand/40 transition-colors"
        >
          Switch Team
        </button>
      </div>
    </header>
  );
}
