"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { GlobalHeader, usePeriod } from "@/components/Header";
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ArrowRight,
  Clock,
  Lightbulb,
  AlertTriangle,
  Award,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data — multiple agents
// ---------------------------------------------------------------------------
type Status = "critical" | "warning" | "ok";

type Kpi = {
  key: string;
  label: string;
  target: string;
  actual: string;
  unit: string;
  teamAvg: string;
  rank: string;
  trend: "up" | "down";
  status: Status;
  weight: number;
};

type CoachingAction = {
  type: string;
  tag: string;
  text: string;
  due: string;
  status: string;
};

type Agent = {
  name: string;
  role: string;
  status: Status;
  overall: number;
  kpis: Kpi[];
  chart: number[];
  chartTarget: number;
  kpiTrends: Record<string, { data: number[]; target: number }>;
  insight: { title: string; body: string };
  coaching:
    | { hasAction: true; actions: CoachingAction[] }
    | { hasAction: false; suggestion: string };
};

const AGENTS: Record<string, Agent> = {
  "pedro-godinho": {
    name: "Pedro Godinho",
    role: "Customer Expert · 4+ years of tenure",
    status: "critical",
    overall: 73.2,
    kpis: [
      { key: "aht_phone", label: "AHT phone", target: "630", actual: "863.9", unit: "s", teamAvg: "760.9", rank: "#9/9", trend: "down", status: "critical", weight: 15 },
      { key: "gross_absence", label: "Gross absence", target: "6", actual: "0", unit: "%", teamAvg: "0", rank: "—", trend: "up", status: "ok", weight: 10 },
      { key: "fcr_phone", label: "FCR phone", target: "75", actual: "70", unit: "%", teamAvg: "91.7", rank: "#6/6", trend: "down", status: "critical", weight: 20 },
      { key: "nps_phone", label: "NPS phone", target: "55", actual: "60", unit: "%", teamAvg: "100", rank: "#3/4", trend: "up", status: "ok", weight: 10 },
      { key: "professionalism", label: "Professionalism", target: "95", actual: "92.9", unit: "%", teamAvg: "92.9", rank: "#4/7", trend: "up", status: "warning", weight: 5 },
      { key: "qa_score", label: "QA score", target: "85", actual: "78", unit: "%", teamAvg: "99", rank: "#3/3", trend: "down", status: "warning", weight: 13 },
      { key: "rr_phone", label: "RR phone", target: "85", actual: "92.9", unit: "%", teamAvg: "92.9", rank: "#2/7", trend: "up", status: "ok", weight: 5 },
    ],
    chart: [718.92, 845.47, 890.78, 863.9],
    chartTarget: 691.19,
    kpiTrends: {
      aht_phone:      { data: [718.92, 845.47, 890.78, 863.9],  target: 630 },
      gross_absence:  { data: [0, 0, 0, 0],                     target: 6 },
      fcr_phone:      { data: [60, 65, 68, 70],                 target: 75 },
      nps_phone:      { data: [55, 58, 60, 60],                 target: 55 },
      professionalism:{ data: [90, 91, 92, 92.9],               target: 95 },
      qa_score:       { data: [82, 80, 79, 78],                 target: 85 },
      rr_phone:       { data: [88, 90, 91, 92.9],               target: 85 },
    },
    insight: {
      title: "Inefficient call handling, trending upward",
      body: "AHT is 25% above the team average (863.9s vs 691.19s team target). The last few weeks show fluctuation: it rose to 890.78s before slightly easing to 835.58s. Despite 4+ years of experience, it doesn't show the efficiency expected of a senior agent.",
    },
    coaching: {
      hasAction: false,
      suggestion:
        "Create a Coach Call session focused on call time management, given the weekly fluctuation and the agent's tenure (a good fit for peer mentoring).",
    },
  },
  "alexandre-pereira": {
    name: "Alexandre Manuel Pereira",
    role: "Customer Expert · 119 days of tenure",
    status: "ok",
    overall: 73.2,
    kpis: [
      { key: "aht_phone", label: "AHT phone", target: "630", actual: "670.5", unit: "s", teamAvg: "760.9", rank: "#3/9", trend: "down", status: "ok", weight: 15 },
      { key: "gross_absence", label: "Gross absence", target: "6", actual: "0.25", unit: "%", teamAvg: "11.55", rank: "#1/14", trend: "up", status: "ok", weight: 10 },
      { key: "fcr_phone", label: "FCR phone", target: "75", actual: "100", unit: "%", teamAvg: "91.7", rank: "#1/6", trend: "up", status: "ok", weight: 20 },
      { key: "nps_phone", label: "NPS phone", target: "55", actual: "100", unit: "%", teamAvg: "100", rank: "#1/4", trend: "up", status: "ok", weight: 10 },
      { key: "professionalism", label: "Professionalism", target: "95", actual: "100", unit: "%", teamAvg: "92.9", rank: "#1/7", trend: "up", status: "ok", weight: 5 },
      { key: "qa_score", label: "QA score", target: "85", actual: "91.5", unit: "%", teamAvg: "99", rank: "#2/3", trend: "up", status: "ok", weight: 13 },
      { key: "rr_phone", label: "RR phone", target: "85", actual: "100", unit: "%", teamAvg: "92.9", rank: "#1/7", trend: "up", status: "ok", weight: 5 },
    ],
    chart: [65, 60, 50, 80],
    chartTarget: 75,
    kpiTrends: {
      aht_phone:      { data: [640, 620, 603, 670.5], target: 630 },
      gross_absence:  { data: [0, 0.1, 0.2, 0.25],   target: 6 },
      fcr_phone:      { data: [80, 90, 95, 100],      target: 75 },
      nps_phone:      { data: [85, 90, 95, 100],      target: 55 },
      professionalism:{ data: [96, 98, 99, 100],      target: 95 },
      qa_score:       { data: [88, 90, 91, 91.5],     target: 85 },
      rr_phone:       { data: [90, 95, 98, 100],      target: 85 },
    },
    insight: {
      title: "Top performer — opportunity to share best practices",
      body: "Efficient call handling techniques have driven AHT well below the team average (603.98s vs 691.19s), with a notable recent improvement (35% reduction to 474.56s in the latest week). Excellent candidate for peer mentoring.",
    },
    coaching: {
      hasAction: true,
      actions: [
        { type: "Human Coaching", tag: "CC – Coach Call", text: "Schedule live coaching sessions (Coach Call) to practice social interactions and receive real-time feedback.", due: "2026-05-20", status: "pending" },
        { type: "Human Coaching", tag: "MC – Model Call", text: "Assign a high-performing peer as a mentor to model positive social behaviors.", due: "2026-05-22", status: "pending" },
      ],
    },
  },
  "denzel-melo": {
    name: "Denzel Melo",
    role: "Customer Expert · 119 days of tenure",
    status: "critical",
    overall: 68.4,
    kpis: [
      { key: "aht_phone", label: "AHT phone", target: "630", actual: "601.2", unit: "s", teamAvg: "760.9", rank: "#2/9", trend: "up", status: "ok", weight: 15 },
      { key: "gross_absence", label: "Gross absence", target: "6", actual: "33.47", unit: "%", teamAvg: "11.55", rank: "#13/14", trend: "down", status: "critical", weight: 10 },
      { key: "fcr_phone", label: "FCR phone", target: "75", actual: "85", unit: "%", teamAvg: "91.7", rank: "#4/6", trend: "up", status: "ok", weight: 20 },
      { key: "nps_phone", label: "NPS phone", target: "55", actual: "70", unit: "%", teamAvg: "100", rank: "#2/4", trend: "up", status: "ok", weight: 10 },
      { key: "professionalism", label: "Professionalism", target: "95", actual: "88", unit: "%", teamAvg: "92.9", rank: "#5/7", trend: "down", status: "warning", weight: 5 },
      { key: "qa_score", label: "QA score", target: "85", actual: "90", unit: "%", teamAvg: "99", rank: "#1/3", trend: "up", status: "ok", weight: 13 },
      { key: "rr_phone", label: "RR phone", target: "85", actual: "88", unit: "%", teamAvg: "92.9", rank: "#5/7", trend: "down", status: "ok", weight: 5 },
    ],
    chart: [0, 40, 20.25, 50],
    chartTarget: 6,
    kpiTrends: {
      aht_phone:      { data: [610, 605, 600, 601.2],  target: 630 },
      gross_absence:  { data: [0, 40, 20.25, 33.47],  target: 6 },
      fcr_phone:      { data: [78, 80, 82, 85],        target: 75 },
      nps_phone:      { data: [60, 62, 66, 70],        target: 55 },
      professionalism:{ data: [92, 90, 89, 88],        target: 95 },
      qa_score:       { data: [88, 89, 90, 90],        target: 85 },
      rr_phone:       { data: [85, 86, 87, 88],        target: 85 },
    },
    insight: {
      title: "Escalating absence pattern, with high volatility",
      body: "Unexcused absence pattern with growing weekly volatility (0% → 40% → 20.25% → 50%). The monthly trend worsens from 25.26% to 33.47% (+8.21pp), despite being a recent hire (119 days). No excused absences recorded.",
    },
    coaching: {
      hasAction: false,
      suggestion:
        "Schedule a 1:1 conversation to understand the causes of the absences (scheduling conflicts, commitment) before the pattern becomes entrenched.",
    },
  },
};

const AGENT_LIST = Object.keys(AGENTS);

// Other agents linked from Team Overview that don't yet have a full
// hand-authored profile — we generate a lightweight generic profile so the
// link never 404s, while keeping the three "showcase" agents above detailed.
const AGENT_NAMES: Record<string, string> = {
  "raymond-akpelu": "Raymond Akpelu",
  "francisco-esperanca": "Francisco Esperança",
  "camila-robledo": "Camila Robledo",
  "cristina-ji": "Cristina Ji",
  "david-reis-carvalho": "David Reis Carvalho",
  "lucas-dias": "Lucas Dias",
  "marco-nunes-sousa": "Marco Nunes Sousa",
  "martinho-wambembe": "Martinho Wambembe",
  "phillip-ellis": "Phillip Ellis",
  "toufiq-hossain": "Toufiq Hossain",
  "vasile-bunduche": "Vasile Bunduche",
};

function genericAgent(slug: string): Agent {
  const name = AGENT_NAMES[slug] ?? slug;
  return {
    name,
    role: "Customer Expert",
    status: "warning",
    overall: 70,
    kpis: [
      { key: "aht_phone", label: "AHT phone", target: "630", actual: "—", unit: "s", teamAvg: "760.9", rank: "—", trend: "up", status: "warning", weight: 15 },
      { key: "gross_absence", label: "Gross absence", target: "6", actual: "—", unit: "%", teamAvg: "11.55", rank: "—", trend: "up", status: "warning", weight: 10 },
      { key: "fcr_phone", label: "FCR phone", target: "75", actual: "—", unit: "%", teamAvg: "91.7", rank: "—", trend: "up", status: "warning", weight: 20 },
      { key: "nps_phone", label: "NPS phone", target: "55", actual: "—", unit: "%", teamAvg: "100", rank: "—", trend: "up", status: "warning", weight: 10 },
      { key: "professionalism", label: "Professionalism", target: "95", actual: "—", unit: "%", teamAvg: "92.9", rank: "—", trend: "up", status: "warning", weight: 5 },
      { key: "qa_score", label: "QA score", target: "85", actual: "—", unit: "%", teamAvg: "99", rank: "—", trend: "up", status: "warning", weight: 13 },
      { key: "rr_phone", label: "RR phone", target: "85", actual: "—", unit: "%", teamAvg: "92.9", rank: "—", trend: "up", status: "warning", weight: 5 },
    ],
    chart: [50, 55, 60, 58],
    chartTarget: 75,
    kpiTrends: {},
    insight: {
      title: "Profile pending detail",
      body: "This agent was referenced from the team overview. The next iteration of the prototype will complete their individual analysis and coaching plan with real data.",
    },
    coaching: {
      hasAction: false,
      suggestion: "Review the team overview to identify the specific KPI that needs follow-up before proposing a coaching action.",
    },
  };
}

function getAgent(slug: string): { id: string; agent: Agent } {
  if (AGENTS[slug]) return { id: slug, agent: AGENTS[slug] };
  if (AGENT_NAMES[slug]) return { id: slug, agent: genericAgent(slug) };
  return { id: "pedro-godinho", agent: AGENTS["pedro-godinho"] };
}


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function statusClasses(status: Status) {
  switch (status) {
    case "critical":
      return { bg: "bg-danger-light", text: "text-danger", label: "Critical" };
    case "warning":
      return { bg: "bg-warning-light", text: "text-warning", label: "Needs attention" };
    default:
      return { bg: "bg-success-light", text: "text-success", label: "On target" };
  }
}

function TrendIcon({ trend, status }: { trend: "up" | "down"; status: Status }) {
  const color = status === "critical" ? "#EF4444" : status === "warning" ? "#F59E0B" : "#10B981";
  const Icon = trend === "up" ? TrendingUp : TrendingDown;
  return <Icon size={16} color={color} strokeWidth={2} />;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ---------------------------------------------------------------------------
// Mini line chart (pure SVG)
// ---------------------------------------------------------------------------
function MiniChart({ data, target, danger }: { data: number[]; target: number; danger: boolean }) {
  const w = 600;
  const h = 160;
  const pad = 24;
  const max = Math.max(...data, target) * 1.1;
  const min = Math.min(...data, target) * 0.9;
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (data.length - 1);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y];
  });

  const path = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(" ");
  const targetY = h - pad - ((target - min) / range) * (h - pad * 2);
  const lineColor = danger ? "#EF4444" : "#10B981";
  const fillColor = danger ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)";

  const areaPath = `${path} L ${points[points.length - 1][0]} ${h - pad} L ${points[0][0]} ${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40 block">
      <line x1={pad} y1={targetY} x2={w - pad} y2={targetY} stroke="#9CA3AF" strokeWidth="1" strokeDasharray="4 4" />
      <text x={w - pad} y={targetY - 6} textAnchor="end" fontSize="11" fontFamily="Inter, system-ui, sans-serif" fill="#9CA3AF">
        target
      </text>
      <path d={areaPath} fill={fillColor} stroke="none" />
      <path d={path} fill="none" stroke={lineColor} strokeWidth="2" />
      {points.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill={lineColor} />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AgentViewPage() {
  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar />
      <Suspense fallback={null}>
        <AgentViewContent />
      </Suspense>
    </div>
  );
}

function AgentViewContent() {
  const searchParams = useSearchParams();
  const requestedSlug = searchParams.get("agent") ?? "pedro-godinho";
  const initial = getAgent(requestedSlug);

  const [agentId, setAgentId] = useState(initial.id);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedKpiKey, setSelectedKpiKey] = useState<string | null>(null);
  // ITERATION B: QTD added to trend period toggle
  const [kpiPeriod, setKpiPeriod] = useState<"weekly" | "monthly" | "qtd">("weekly");

  useEffect(() => {
    setAgentId(getAgent(requestedSlug).id);
    setSelectedKpiKey(null); // reset KPI selector on agent change
  }, [requestedSlug]);

  const agent = AGENTS[agentId] ?? genericAgent(agentId);
  const displayList = Array.from(new Set([...AGENT_LIST, agentId]));

  const statusBadge = useMemo(() => statusClasses(agent.status), [agent]);

  // Resolve active KPI for the chart: user selection or highest-priority KPI
  const priorityKpi = useMemo(() => {
    const severityW = (s: Status) => s === "critical" ? 3 : s === "warning" ? 2 : 1;
    return [...agent.kpis].sort((a, b) => {
      const scoreA = severityW(a.status) * a.weight;
      const scoreB = severityW(b.status) * b.weight;
      return scoreB - scoreA;
    })[0];
  }, [agent]);

  const activeKpiKey = selectedKpiKey ?? priorityKpi?.key ?? agent.kpis[0]?.key;
  const activeKpi = agent.kpis.find((k) => k.key === activeKpiKey) ?? agent.kpis[0];
  const activeTrend = agent.kpiTrends[activeKpiKey] ?? { data: agent.chart, target: agent.chartTarget };

  return (
      <main className="flex-1 text-text-primary font-sans px-6 py-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
          <div>
            <p className="text-sm text-text-secondary mb-1">Agent view · Showing yesterday's data (D-1) · May 19</p>
            <h1 className="text-2xl font-medium m-0">Individual performance</h1>
          </div>
          <div className="flex gap-1.5">
            {["D-1", "WTD", "MTD", "QTD"].map((t, i) => (
              <button
                key={t}
                className={`px-3.5 py-1.5 text-sm rounded-md font-medium border ${
                  i === 0 ? "bg-brand-light text-brand border-transparent" : "bg-surface text-text-secondary border-border"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Agent selector */}
        <div className="relative mb-6">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-lg text-sm"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${statusBadge.bg} ${statusBadge.text}`}>
              {initials(agent.name)}
            </div>
            <div className="flex-1 text-left">
              <p className="m-0 font-medium text-sm">{agent.name}</p>
              <p className="m-0 text-xs text-text-secondary">{agent.role}</p>
            </div>
            <span className={`text-xs px-2.5 py-0.5 rounded-md font-medium ${statusBadge.bg} ${statusBadge.text}`}>{statusBadge.label}</span>
            <ChevronDown size={18} className={`text-text-secondary transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-surface border border-border rounded-lg overflow-hidden z-10 shadow-lg">
              {displayList.map((id) => {
                const a = AGENTS[id] ?? genericAgent(id);
                const b = statusClasses(a.status);
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setAgentId(id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 border-t border-border text-sm text-left ${
                      id === agentId ? "bg-surface-muted" : "bg-transparent"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs ${b.bg} ${b.text}`}>
                      {initials(a.name)}
                    </div>
                    <span className="flex-1">{a.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${b.bg} ${b.text}`}>{b.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* KPI table */}
        <p className="text-sm text-text-secondary mb-2.5 uppercase tracking-wide">My performance</p>
        <div className="border border-border rounded-lg overflow-hidden mb-6 bg-surface overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-surface-muted">
                <th className="text-left px-4 py-2.5 font-medium text-text-secondary">KPI</th>
                <th className="text-right px-4 py-2.5 font-medium text-text-secondary">Target</th>
                <th className="text-right px-4 py-2.5 font-medium text-text-secondary">Actual (D-1)</th>
                <th className="text-right px-4 py-2.5 font-medium text-text-secondary">Team avg</th>
                <th className="text-right px-4 py-2.5 font-medium text-text-secondary">Ranking</th>
                <th className="text-center px-4 py-2.5 font-medium text-text-secondary">30d</th>
              </tr>
            </thead>
            <tbody>
              {agent.kpis.map((k) => {
                const b = statusClasses(k.status);
                return (
                  <tr key={k.key} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{k.label}</span>
                        <span className="text-[11px] text-text-tertiary font-mono">{k.weight}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-secondary">
                      {k.target}{k.unit}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-mono font-medium px-2 py-0.5 rounded-md ${b.bg} ${b.text}`}>
                        {k.actual}{k.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-secondary">
                      {k.teamAvg}{k.unit}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-secondary">{k.rank}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        <TrendIcon trend={k.trend} status={k.status} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Chart — KPI selector + dynamic trend */}
        <div className="bg-surface border border-border rounded-lg px-5 py-4 mb-6">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <p className="text-sm text-text-secondary uppercase tracking-wide m-0">
                KPI Evolution — {activeKpi.label}
              </p>
              {/* ITERATION B: period toggle with QTD */}
              <div className="flex gap-1 mt-2">
                {(["weekly","monthly","qtd"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setKpiPeriod(p)}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                      kpiPeriod === p ? "bg-brand-light text-brand border-transparent" : "bg-surface text-text-secondary border-border hover:border-brand/40"
                    }`}
                  >
                    {p === "weekly" ? "Weekly Trend" : p === "monthly" ? "Monthly Trend" : "QTD"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-1 flex-wrap">
              {agent.kpis.map((k) => {
                const b = statusClasses(k.status);
                const isActive = k.key === activeKpiKey;
                const dotColor =
                  k.status === "critical" ? "bg-danger" :
                  k.status === "warning" ? "bg-warning" :
                  "bg-success";
                return (
                  <button
                    key={k.key}
                    onClick={() => setSelectedKpiKey(k.key)}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors inline-flex items-center gap-1.5 ${
                      isActive
                        ? `${b.bg} ${b.text} border-transparent`
                        : "bg-surface text-text-secondary border-border hover:border-brand/40"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
                    {k.label}
                  </button>
                );
              })}
            </div>
          </div>
          <MiniChart
            data={activeTrend.data}
            target={activeTrend.target}
            danger={activeKpi.status === "critical"}
          />
          {!selectedKpiKey && (
            <p className="text-xs text-text-tertiary mt-1 m-0">
              Showing highest-priority KPI by severity and operational weight.
            </p>
          )}
        </div>

        {/* Insight card */}
        <div
          className={`rounded-lg px-5 py-3.5 mb-6 flex gap-3 items-start border ${
            agent.status === "critical" ? "bg-danger-light border-danger/20" : "bg-success-light border-success/20"
          }`}
        >
          {agent.status === "critical" ? (
            <AlertTriangle size={20} className="text-danger mt-0.5 flex-shrink-0" />
          ) : (
            <Award size={20} className="text-success mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className={`text-sm font-medium mb-1.5 ${agent.status === "critical" ? "text-danger" : "text-success"}`}>
              {agent.insight.title}
            </p>
            <p className="text-sm m-0 text-text-primary leading-relaxed">{agent.insight.body}</p>
          </div>
        </div>

        {/* Coaching plan */}
        <p className="text-sm text-text-secondary mb-2.5 uppercase tracking-wide">Coaching plan</p>
        <div className="flex flex-col gap-2 mb-6">
          {agent.coaching.hasAction ? (
            agent.coaching.actions.map((a, i) => (
              <div key={i} className="border border-border rounded-lg px-5 py-3.5 bg-surface flex gap-3 items-start">
                <Clock size={18} className="text-text-tertiary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex gap-2 mb-1 flex-wrap items-center">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-brand-light text-brand font-medium">{a.tag}</span>
                    <span className="text-xs text-text-tertiary font-mono">due {a.due}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-warning-light text-warning font-medium">pending</span>
                  </div>
                  <p className="text-sm m-0 text-text-primary">{a.text}</p>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="border border-border rounded-lg px-5 py-3.5 bg-surface flex gap-3 items-start">
                <Clock size={18} className="text-text-tertiary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm mb-1 m-0">No active coaching actions for {agent.kpis[0].label}</p>
                  <p className="text-sm text-text-secondary m-0">
                    There are no scheduled sessions, assigned training, or pending AI coaching actions for this KPI — despite being in{" "}
                    {agent.status === "critical" ? "critical" : "needs attention"} status.
                  </p>
                </div>
              </div>
              <div className="border border-border rounded-lg px-5 py-3.5 bg-surface flex gap-3 items-start">
                <Lightbulb size={18} className="text-warning mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1 m-0">Suggestion</p>
                  <p className="text-sm text-text-secondary mb-3 mt-1">{agent.coaching.suggestion}</p>
                  <button className="text-sm px-3.5 py-1.5 rounded-md border border-brand bg-brand-light text-brand font-medium inline-flex items-center gap-1.5">
                    Create coaching session <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      </main>
  );
}
