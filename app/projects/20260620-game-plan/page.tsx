"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import {
  AlertTriangle,
  AlertCircle,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type EventType = "coaching" | "session" | "review" | "meeting";

type DayEvent = {
  id: string;
  agent: string;
  agentSlug: string;
  title: string;
  time: string;
  type: EventType;
  status: "pending" | "done";
};

type FactItem = {
  agent: string;
  agentSlug: string;
  body: string;
};

// ---------------------------------------------------------------------------
// Mock data — week of May 18-24, 2026
// ---------------------------------------------------------------------------
const WEEK_DAYS = [
  { date: 18, label: "Mon" },
  { date: 19, label: "Tue" },
  { date: 20, label: "Wed" },
  { date: 21, label: "Thu" },
  { date: 22, label: "Fri" },
  { date: 23, label: "Sat" },
  { date: 24, label: "Sun" },
];

const EVENTS: Record<number, DayEvent[]> = {
  18: [
    { id: "e1", agent: "Camila Robledo", agentSlug: "camila-robledo", title: "1:1 review — AHT trend", time: "10:00", type: "review", status: "done" },
  ],
  19: [],
  20: [
    {
      id: "e2",
      agent: "Alexandre Manuel Pereira",
      agentSlug: "alexandre-pereira",
      title: "Schedule live coaching (Coach Call) to practice social interactions and receive real-time feedback.",
      time: "11:00",
      type: "coaching",
      status: "pending",
    },
  ],
  21: [
    { id: "e3", agent: "Pedro Godinho", agentSlug: "pedro-godinho", title: "Coach Call — call time management", time: "09:30", type: "coaching", status: "pending" },
    { id: "e4", agent: "Denzel Melo", agentSlug: "denzel-melo", title: "1:1 — discuss absence pattern", time: "14:00", type: "meeting", status: "pending" },
  ],
  22: [
    { id: "e5", agent: "Raymond Akpelu", agentSlug: "raymond-akpelu", title: "QA review session — case categorization", time: "10:30", type: "review", status: "pending" },
    { id: "e6", agent: "Martinho Wambembe", agentSlug: "martinho-wambembe", title: "1:1 — attendance check-in", time: "15:00", type: "meeting", status: "pending" },
  ],
  23: [],
  24: [],
};

const TEAM_FACTS: { critical: FactItem[]; warning: FactItem[]; positive: FactItem[] } = {
  critical: [
    { agent: "Pedro Godinho", agentSlug: "pedro-godinho", body: "AHT 25% above target for 3 consecutive weeks, with no active coaching plan in place." },
    { agent: "Denzel Melo", agentSlug: "denzel-melo", body: "Gross absence climbed to 33.5% vs 6% target, trending upward with no excused absences recorded." },
  ],
  warning: [
    { agent: "Raymond Akpelu", agentSlug: "raymond-akpelu", body: "QA score dropped from 84.5 to 34.0 due to miscategorized cases and missing documentation." },
    { agent: "Martinho Wambembe", agentSlug: "martinho-wambembe", body: "Absence rate worsening steadily for 4 weeks straight (11.8% to 36.7%)." },
    { agent: "Toufiq Hossain", agentSlug: "toufiq-hossain", body: "Alternating absence pattern pushed monthly average to 55.6%, well above the 11.55% team average." },
  ],
  positive: [
    { agent: "Alexandre Manuel Pereira", agentSlug: "alexandre-pereira", body: "AHT 35% below team average this week — a strong candidate to mentor peers on call efficiency." },
    { agent: "Francisco Esperança", agentSlug: "francisco-esperanca", body: "AHT consistently on target with an improving trend over the last 3 weeks." },
    { agent: "Vasile Bunduche", agentSlug: "vasile-bunduche", body: "FCR improved to 78%, up from 62% a month ago." },
  ],
};

const EVENT_TYPE_STYLES: Record<EventType, { bg: string; text: string; label: string }> = {
  coaching: { bg: "bg-brand-light", text: "text-brand", label: "Coaching" },
  session: { bg: "bg-success-light", text: "text-success", label: "Session" },
  review: { bg: "bg-warning-light", text: "text-warning", label: "Review" },
  meeting: { bg: "bg-surface-muted", text: "text-text-secondary", label: "Meeting" },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function GamePlanPage() {
  const [selectedDate, setSelectedDate] = useState(20);

  const selectedEvents = EVENTS[selectedDate] ?? [];
  const selectedDayLabel = WEEK_DAYS.find((d) => d.date === selectedDate)?.label ?? "";

  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar />
      <main className="flex-1 text-text-primary font-sans px-6 py-8 overflow-x-hidden">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
            <div>
              <p className="text-sm text-text-secondary mb-1">Wednesday May 20, 2026</p>
              <h1 className="text-2xl font-medium m-0">Supervisor game plan</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded-md border border-border bg-surface text-text-secondary inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-warning inline-block" />
                8 open DSM actions
              </span>
              <button
                disabled
                title="Coming soon"
                className="px-3.5 py-1.5 text-sm rounded-md font-medium border border-border bg-surface-muted text-text-tertiary inline-flex items-center gap-1.5 cursor-not-allowed opacity-50"
              >
                <Plus size={14} /> Add event
              </button>
            </div>
          </div>

          {/* Main grid: week calendar | day timeline */}
          <div className="grid md:grid-cols-2 gap-4 mb-6 items-stretch">
            {/* Week calendar — selector */}
            <div className="border border-border rounded-lg bg-surface px-4 py-3 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-text-secondary uppercase tracking-wide m-0">May 18 – 24</p>
                <div className="flex gap-1">
                  <button className="p-1 rounded-md border border-border text-text-secondary hover:border-brand/40 transition-colors">
                    <ChevronLeft size={14} />
                  </button>
                  <button className="p-1 rounded-md border border-border text-text-secondary hover:border-brand/40 transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1.5 flex-1">
                {WEEK_DAYS.map((d) => {
                  const count = (EVENTS[d.date] ?? []).length;
                  const isSelected = d.date === selectedDate;
                  const hasCritical = (EVENTS[d.date] ?? []).some((e) => e.type === "coaching" && e.status === "pending");
                  return (
                    <button
                      key={d.date}
                      onClick={() => setSelectedDate(d.date)}
                      className={`flex flex-col items-center justify-between rounded-md py-2.5 px-1 border transition-colors ${
                        isSelected ? "bg-brand text-white border-brand" : "bg-surface-muted border-border hover:border-brand/40"
                      }`}
                    >
                      <span className={`text-[11px] uppercase tracking-wide ${isSelected ? "text-white/80" : "text-text-tertiary"}`}>{d.label}</span>
                      <span className={`text-lg font-medium mt-1 ${isSelected ? "text-white" : "text-text-primary"}`}>{d.date}</span>
                      <span
                        className={`mt-1.5 text-[10px] font-mono rounded-full px-1.5 leading-tight ${
                          count === 0
                            ? "text-transparent"
                            : isSelected
                              ? "bg-white/20 text-white"
                              : hasCritical
                                ? "bg-danger-light text-danger"
                                : "bg-surface text-text-secondary"
                        }`}
                      >
                        {count || "0"}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-text-tertiary m-0 mt-2">Select a day to see its timeline.</p>
            </div>

            {/* Day timeline */}
            <div className="border border-border rounded-lg bg-surface overflow-hidden flex flex-col">
              <div className="px-4 py-2 border-b border-border bg-surface-muted flex items-center justify-between">
                <p className="text-sm text-text-secondary uppercase tracking-wide m-0">
                  {selectedDayLabel} {selectedDate} — Timeline
                </p>
                <span className="text-xs text-text-tertiary font-mono">{selectedEvents.length} events</span>
              </div>
              <div className="overflow-y-auto max-h-72 flex-1">
                {selectedEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-10 px-4 text-center">
                    <Clock size={24} className="text-text-tertiary mb-2" />
                    <p className="text-sm text-text-secondary m-0">No events scheduled for this day.</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {selectedEvents.map((e) => {
                      const style = EVENT_TYPE_STYLES[e.type];
                      return (
                        <Link
                          key={e.id}
                          href={`/projects/20260620-agent-view?agent=${e.agentSlug}`}
                          className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-muted transition-colors"
                        >
                          <span className="text-xs font-mono text-text-tertiary mt-0.5 whitespace-nowrap">{e.time}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-medium text-sm">{e.agent}</span>
                              <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${style.bg} ${style.text}`}>{style.label}</span>
                              {e.status === "pending" && (
                                <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-warning-light text-warning">pending</span>
                              )}
                            </div>
                            <p className="text-sm text-text-secondary m-0">{e.title}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Your Team Facts */}
          <p className="text-sm text-text-secondary mb-2.5 uppercase tracking-wide">Your team facts</p>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {/* Critical */}
            <div className="border border-danger/20 bg-danger-light rounded-lg overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-danger" />
                  <p className="text-sm font-medium text-danger m-0">Critical</p>
                </div>
                <span className="text-xs font-mono bg-surface px-1.5 rounded-md text-danger">{TEAM_FACTS.critical.length}</span>
              </div>
              <div className="flex flex-col gap-2 px-3 pb-3">
                {TEAM_FACTS.critical.map((f) => (
                  <Link
                    key={f.agentSlug}
                    href={`/projects/20260620-agent-view?agent=${f.agentSlug}`}
                    className="bg-surface rounded-md px-3 py-2.5 hover:border-danger/40 border border-transparent transition-colors block"
                  >
                    <p className="text-sm font-medium m-0 mb-1">{f.agent}</p>
                    <p className="text-xs text-text-secondary m-0 leading-relaxed">{f.body}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Warning */}
            <div className="border border-warning/20 bg-warning-light rounded-lg overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-warning" />
                  <p className="text-sm font-medium text-warning m-0">Warning</p>
                </div>
                <span className="text-xs font-mono bg-surface px-1.5 rounded-md text-warning">{TEAM_FACTS.warning.length}</span>
              </div>
              <div className="flex flex-col gap-2 px-3 pb-3">
                {TEAM_FACTS.warning.map((f) => (
                  <Link
                    key={f.agentSlug}
                    href={`/projects/20260620-agent-view?agent=${f.agentSlug}`}
                    className="bg-surface rounded-md px-3 py-2.5 hover:border-warning/40 border border-transparent transition-colors block"
                  >
                    <p className="text-sm font-medium m-0 mb-1">{f.agent}</p>
                    <p className="text-xs text-text-secondary m-0 leading-relaxed">{f.body}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Positive */}
            <div className="border border-success/20 bg-success-light rounded-lg overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-success" />
                  <p className="text-sm font-medium text-success m-0">Positive</p>
                </div>
                <span className="text-xs font-mono bg-surface px-1.5 rounded-md text-success">{TEAM_FACTS.positive.length}</span>
              </div>
              <div className="flex flex-col gap-2 px-3 pb-3">
                {TEAM_FACTS.positive.map((f) => (
                  <Link
                    key={f.agentSlug}
                    href={`/projects/20260620-agent-view?agent=${f.agentSlug}`}
                    className="bg-surface rounded-md px-3 py-2.5 hover:border-success/40 border border-transparent transition-colors block"
                  >
                    <p className="text-sm font-medium m-0 mb-1">{f.agent}</p>
                    <p className="text-xs text-text-secondary m-0 leading-relaxed">{f.body}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
