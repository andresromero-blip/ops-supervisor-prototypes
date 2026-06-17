"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Status = "critical" | "warning" | "ok" | "at_risk";
type Period = "D-1" | "WTD" | "MTD" | "QTD";

type Kpi = {
  key: string;
  label: string;
  value: string;
  unit: string;
  target: string;
  delta: string;
  status: Status;
  trend: "up" | "down";
};

type Alert = {
  agent: string;
  agentSlug: string;
  reason: string;
};

type TeamMember = {
  name: string;
  slug: string;
  status: Status;
  statusLabel: string;
  kpiLabel: string;
  kpiValue: string;
  trend: "up" | "down";
  trendStatus: Status;
  fcrTrend: number[];
};

type Topic = {
  rank: number;
  agent: string;
  agentSlug: string;
  tag: string;
  tagStatus: Status;
  body: string;
};

// ---------------------------------------------------------------------------
// Mock data by period
// ---------------------------------------------------------------------------
const MAIN_KPIS: Record<Period, Kpi[]> = {
  "D-1": [
    { key: "csat", label: "CSAT", value: "83.1", unit: "%", target: "85.0%", delta: "0%", status: "at_risk", trend: "up" },
    { key: "fcr", label: "FCR", value: "75.5", unit: "%", target: "78.0%", delta: "-1%", status: "at_risk", trend: "down" },
    { key: "aht", label: "AHT", value: "378", unit: "s", target: "420", delta: "+4%", status: "ok", trend: "up" },
    { key: "nps", label: "NPS", value: "87", unit: "", target: "45", delta: "0%", status: "ok", trend: "up" },
    { key: "sales", label: "Sales", value: "10.9", unit: "%", target: "12.0%", delta: "+4%", status: "at_risk", trend: "up" },
    { key: "adh", label: "ADH", value: "87.5", unit: "%", target: "95.0%", delta: "-3%", status: "at_risk", trend: "down" },
  ],
  WTD: [
    { key: "csat", label: "CSAT", value: "84.0", unit: "%", target: "85.0%", delta: "+0.9pp", status: "at_risk", trend: "up" },
    { key: "fcr", label: "FCR", value: "76.8", unit: "%", target: "78.0%", delta: "-1.2pp", status: "at_risk", trend: "up" },
    { key: "aht", label: "AHT", value: "365", unit: "s", target: "420", delta: "+13s", status: "ok", trend: "down" },
    { key: "nps", label: "NPS", value: "84", unit: "", target: "45", delta: "-3", status: "ok", trend: "down" },
    { key: "sales", label: "Sales", value: "11.4", unit: "%", target: "12.0%", delta: "+0.5pp", status: "at_risk", trend: "up" },
    { key: "adh", label: "ADH", value: "89.0", unit: "%", target: "95.0%", delta: "+1.5pp", status: "at_risk", trend: "up" },
  ],
  MTD: [
    { key: "csat", label: "CSAT", value: "84.6", unit: "%", target: "85.0%", delta: "+1.5pp", status: "at_risk", trend: "up" },
    { key: "fcr", label: "FCR", value: "78.2", unit: "%", target: "78.0%", delta: "+0.2pp", status: "ok", trend: "up" },
    { key: "aht", label: "AHT", value: "358", unit: "s", target: "420", delta: "+20s", status: "ok", trend: "down" },
    { key: "nps", label: "NPS", value: "81", unit: "", target: "45", delta: "-6", status: "ok", trend: "down" },
    { key: "sales", label: "Sales", value: "11.7", unit: "%", target: "12.0%", delta: "+0.8pp", status: "at_risk", trend: "up" },
    { key: "adh", label: "ADH", value: "90.2", unit: "%", target: "95.0%", delta: "+2.7pp", status: "at_risk", trend: "up" },
  ],
  QTD: [
    { key: "csat", label: "CSAT", value: "85.1", unit: "%", target: "85.0%", delta: "+2.0pp", status: "ok", trend: "up" },
    { key: "fcr", label: "FCR", value: "79.0", unit: "%", target: "78.0%", delta: "+1.0pp", status: "ok", trend: "up" },
    { key: "aht", label: "AHT", value: "350", unit: "s", target: "420", delta: "+28s", status: "ok", trend: "down" },
    { key: "nps", label: "NPS", value: "78", unit: "", target: "45", delta: "-9", status: "ok", trend: "down" },
    { key: "sales", label: "Sales", value: "11.9", unit: "%", target: "12.0%", delta: "+1.0pp", status: "at_risk", trend: "up" },
    { key: "adh", label: "ADH", value: "91.4", unit: "%", target: "95.0%", delta: "+3.9pp", status: "at_risk", trend: "up" },
  ],
};

// ---------------------------------------------------------------------------
// KPI priority scoring data
// severity_weight × deviation_pct × (critical_count + warning_count × 0.5)
// ---------------------------------------------------------------------------
type KpiStat = {
  key: string;
  label: string;
  severityWeight: number; // 3=critical 2=warning 1=ok
  deviationPct: number;   // absolute % deviation vs target
  criticalCount: number;
  warningCount: number;
  trendData: Record<Period, number[]>;
  trendTarget: number;
};

const KPI_STATS: KpiStat[] = [
  { key: "aht",   label: "AHT",          severityWeight: 3, deviationPct: 0.20, criticalCount: 2, warningCount: 4, trendData: { "D-1": [690, 720, 745, 759], WTD: [685, 710, 730, 742], MTD: [670, 695, 715, 730], QTD: [650, 670, 695, 711] }, trendTarget: 630 },
  { key: "adh",   label: "ADH",          severityWeight: 2, deviationPct: 0.08, criticalCount: 0, warningCount: 5, trendData: { "D-1": [90, 89, 88, 87.5], WTD: [90, 89.5, 89, 89], MTD: [91, 90.5, 90, 90.2], QTD: [92, 91.8, 91.5, 91.4] }, trendTarget: 95 },
  { key: "sales", label: "Sales",        severityWeight: 2, deviationPct: 0.09, criticalCount: 0, warningCount: 3, trendData: { "D-1": [10.2, 10.5, 10.7, 10.9], WTD: [10.8, 11.0, 11.2, 11.4], MTD: [11.0, 11.2, 11.5, 11.7], QTD: [11.2, 11.5, 11.7, 11.9] }, trendTarget: 12 },
  { key: "csat",  label: "CSAT",         severityWeight: 2, deviationPct: 0.02, criticalCount: 0, warningCount: 2, trendData: { "D-1": [82, 82.5, 83, 83.1], WTD: [83, 83.2, 83.8, 84], MTD: [83.5, 84, 84.2, 84.6], QTD: [84, 84.5, 84.8, 85.1] }, trendTarget: 85 },
  { key: "fcr",   label: "FCR",          severityWeight: 2, deviationPct: 0.03, criticalCount: 0, warningCount: 2, trendData: { "D-1": [73, 74, 75, 75.5], WTD: [74, 75, 76, 76.8], MTD: [75, 76, 77, 78.2], QTD: [76, 77, 78, 79] }, trendTarget: 78 },
  { key: "nps",   label: "NPS",          severityWeight: 1, deviationPct: 0,    criticalCount: 0, warningCount: 0, trendData: { "D-1": [85, 86, 87, 87], WTD: [83, 84, 84, 84], MTD: [80, 81, 81, 81], QTD: [77, 78, 78, 78] }, trendTarget: 45 },
];

function getPriorityKpi(period: Period): KpiStat {
  return [...KPI_STATS].sort((a, b) => {
    const scoreA = a.severityWeight * a.deviationPct * (a.criticalCount + a.warningCount * 0.5);
    const scoreB = b.severityWeight * b.deviationPct * (b.criticalCount + b.warningCount * 0.5);
    return scoreB - scoreA;
  })[0];
}

const ALERTS: Record<Period, Alert[]> = {
  "D-1": [
    { agent: "Pedro Godinho", agentSlug: "pedro-godinho", reason: "AHT 25% above target, trending up for 3 weeks" },
    { agent: "Denzel Melo", agentSlug: "denzel-melo", reason: "Absences rising, 33% vs 6% target" },
    { agent: "Raymond Akpelu", agentSlug: "raymond-akpelu", reason: "QA dropped from 84.5 to 34.0, miscategorized cases" },
  ],
  WTD: [
    { agent: "Pedro Godinho", agentSlug: "pedro-godinho", reason: "AHT 17.8% above target throughout the week" },
    { agent: "Denzel Melo", agentSlug: "denzel-melo", reason: "Cumulative absences rise to 28% this week" },
  ],
  MTD: [
    { agent: "Martinho Wambembe", agentSlug: "martinho-wambembe", reason: "Monthly gross absence at 32.5% vs 11.55% team average" },
    { agent: "Toufiq Hossain", agentSlug: "toufiq-hossain", reason: "Alternating absence pattern raises the monthly average to 55.56%" },
  ],
  QTD: [
    { agent: "Martinho Wambembe", agentSlug: "martinho-wambembe", reason: "Steadily worsening absence trend throughout the quarter" },
  ],
};

const TEAM: Record<Period, TeamMember[]> = {
  "D-1": [
    { name: "Pedro Godinho", slug: "pedro-godinho", status: "critical", statusLabel: "Critical", kpiLabel: "AHT", kpiValue: "863.9s", trend: "up", trendStatus: "critical" , fcrTrend: [42, 42, 44, 40] },
    { name: "Denzel Melo", slug: "denzel-melo", status: "critical", statusLabel: "Critical", kpiLabel: "Absence", kpiValue: "33.5%", trend: "up", trendStatus: "critical" , fcrTrend: [43, 45, 43, 41] },
    { name: "Raymond Akpelu", slug: "raymond-akpelu", status: "warning", statusLabel: "Needs attention", kpiLabel: "QA", kpiValue: "34.0%", trend: "down", trendStatus: "critical" , fcrTrend: [47, 47, 42, 44] },
    { name: "Alexandre Manuel Pereira", slug: "alexandre-pereira", status: "ok", statusLabel: "On target", kpiLabel: "AHT", kpiValue: "670.5s", trend: "up", trendStatus: "ok" , fcrTrend: [88, 93, 92, 87] },
    { name: "Francisco Esperança", slug: "francisco-esperanca", status: "ok", statusLabel: "On target", kpiLabel: "AHT", kpiValue: "691.4s", trend: "up", trendStatus: "ok" , fcrTrend: [85, 85, 85, 83] },
    { name: "Camila Robledo", slug: "camila-robledo", status: "warning", statusLabel: "Needs attention", kpiLabel: "AHT", kpiValue: "821.1s", trend: "down", trendStatus: "warning" , fcrTrend: [65, 66, 71, 74] },
    { name: "Cristina Ji", slug: "cristina-ji", status: "warning", statusLabel: "Needs attention", kpiLabel: "FCR", kpiValue: "0%", trend: "down", trendStatus: "critical" , fcrTrend: [42, 39, 43, 43] },
    { name: "David Reis Carvalho", slug: "david-reis-carvalho", status: "ok", statusLabel: "On target", kpiLabel: "FCR", kpiValue: "85%", trend: "up", trendStatus: "ok" , fcrTrend: [86, 88, 86, 82] },
    { name: "Lucas Dias", slug: "lucas-dias", status: "warning", statusLabel: "Needs attention", kpiLabel: "AHT", kpiValue: "823.9s", trend: "up", trendStatus: "warning" , fcrTrend: [68, 72, 77, 80] },
    { name: "Marco Nunes Sousa", slug: "marco-nunes-sousa", status: "warning", statusLabel: "Needs attention", kpiLabel: "AHT", kpiValue: "744.9s", trend: "up", trendStatus: "warning" , fcrTrend: [60, 56, 54, 51] },
    { name: "Martinho Wambembe", slug: "martinho-wambembe", status: "warning", statusLabel: "Needs attention", kpiLabel: "Absence", kpiValue: "32.5%", trend: "up", trendStatus: "critical" , fcrTrend: [40, 43, 45, 43] },
    { name: "Phillip Ellis", slug: "phillip-ellis", status: "warning", statusLabel: "Needs attention", kpiLabel: "FCR", kpiValue: "50%", trend: "down", trendStatus: "warning" , fcrTrend: [65, 61, 62, 65] },
    { name: "Toufiq Hossain", slug: "toufiq-hossain", status: "warning", statusLabel: "Needs attention", kpiLabel: "Absence", kpiValue: "55.6%", trend: "up", trendStatus: "critical" , fcrTrend: [42, 41, 43, 42] },
    { name: "Vasile Bunduche", slug: "vasile-bunduche", status: "ok", statusLabel: "On target", kpiLabel: "FCR", kpiValue: "78%", trend: "up", trendStatus: "ok" , fcrTrend: [84, 82, 86, 84] },
  ],
  WTD: [
    { name: "Pedro Godinho", slug: "pedro-godinho", status: "critical", statusLabel: "Critical", kpiLabel: "AHT", kpiValue: "835.2s", trend: "up", trendStatus: "critical" , fcrTrend: [42, 42, 44, 40] },
    { name: "Denzel Melo", slug: "denzel-melo", status: "warning", statusLabel: "Needs attention", kpiLabel: "Absence", kpiValue: "28.1%", trend: "up", trendStatus: "critical" , fcrTrend: [43, 45, 43, 41] },
    { name: "Alexandre Manuel Pereira", slug: "alexandre-pereira", status: "ok", statusLabel: "On target", kpiLabel: "AHT", kpiValue: "655.2s", trend: "down", trendStatus: "ok" , fcrTrend: [88, 93, 92, 87] },
    { name: "Francisco Esperança", slug: "francisco-esperanca", status: "ok", statusLabel: "On target", kpiLabel: "AHT", kpiValue: "688.0s", trend: "down", trendStatus: "ok" , fcrTrend: [85, 85, 85, 83] },
    { name: "Camila Robledo", slug: "camila-robledo", status: "warning", statusLabel: "Needs attention", kpiLabel: "AHT", kpiValue: "810.4s", trend: "down", trendStatus: "warning" , fcrTrend: [65, 66, 71, 74] },
  ],
  MTD: [
    { name: "Martinho Wambembe", slug: "martinho-wambembe", status: "critical", statusLabel: "Critical", kpiLabel: "Absence", kpiValue: "32.5%", trend: "up", trendStatus: "critical" , fcrTrend: [40, 43, 45, 43] },
    { name: "Toufiq Hossain", slug: "toufiq-hossain", status: "critical", statusLabel: "Critical", kpiLabel: "Absence", kpiValue: "55.6%", trend: "up", trendStatus: "critical" , fcrTrend: [42, 41, 43, 42] },
    { name: "Pedro Godinho", slug: "pedro-godinho", status: "warning", statusLabel: "Needs attention", kpiLabel: "AHT", kpiValue: "729.6s", trend: "down", trendStatus: "warning" , fcrTrend: [62, 62, 64, 60] },
    { name: "Alexandre Manuel Pereira", slug: "alexandre-pereira", status: "ok", statusLabel: "On target", kpiLabel: "AHT", kpiValue: "661.0s", trend: "down", trendStatus: "ok" , fcrTrend: [88, 93, 92, 87] },
  ],
  QTD: [
    { name: "Martinho Wambembe", slug: "martinho-wambembe", status: "critical", statusLabel: "Critical", kpiLabel: "Absence", kpiValue: "30.8%", trend: "up", trendStatus: "critical" , fcrTrend: [40, 43, 45, 43] },
    { name: "Pedro Godinho", slug: "pedro-godinho", status: "warning", statusLabel: "Needs attention", kpiLabel: "AHT", kpiValue: "711.2s", trend: "down", trendStatus: "warning" , fcrTrend: [62, 62, 64, 60] },
    { name: "Alexandre Manuel Pereira", slug: "alexandre-pereira", status: "ok", statusLabel: "On target", kpiLabel: "AHT", kpiValue: "670.0s", trend: "down", trendStatus: "ok" , fcrTrend: [88, 93, 92, 87] },
  ],
};

const TOPICS: Record<Period, Topic[]> = {
  "D-1": [
    { rank: 1, agent: "Pedro Godinho", agentSlug: "pedro-godinho", tag: "Professionalism · phone", tagStatus: "critical", body: "Inefficient call handling, trending upward (718.9s → 845.5s → 863.9s) despite 4+ years of tenure. AHT is 25% above the team average, with a weekly peak of 890.8s before slightly easing to 835.6s." },
    { rank: 2, agent: "Denzel Melo", agentSlug: "denzel-melo", tag: "Gross absence", tagStatus: "critical", body: "Unexcused absence pattern with growing weekly volatility (0% → 40% → 20.25% → 50%). The monthly trend worsens from 25.26% to 33.47%, despite being a recent hire (119 days)." },
    { rank: 3, agent: "Toufiq Hossain", agentSlug: "toufiq-hossain", tag: "FCR · phone", tagStatus: "warning", body: "A week with 100% absence followed by one with 0% pushed gross absence to 55.56% vs 11.55% team average (+44.01pp). The monthly trend worsens from 0% to 55.56%." },
    { rank: 4, agent: "Martinho Wambembe", agentSlug: "martinho-wambembe", tag: "Gross absence", tagStatus: "warning", body: "Accelerating attendance deterioration: weekly gross absence rises steadily (11.81% → 21.46% → 29.12% → 36.72%), bringing the total to 32.5% vs 11.55% team average (+20.95pp)." },
    { rank: 5, agent: "Raymond Akpelu", agentSlug: "raymond-akpelu", tag: "AHT · phone", tagStatus: "warning", body: "Critical failures in the \"Act with ownership\" (0/38) and \"Follow the steps\" (0/20) sections due to incorrect case categorization. QA dropped from 84.5 to 34.0 vs 90.63 team average." },
  ],
  WTD: [
    { rank: 1, agent: "Pedro Godinho", agentSlug: "pedro-godinho", tag: "AHT · phone", tagStatus: "critical", body: "Weekly AHT 17.8% above target, with no signs of improvement compared to the previous week." },
    { rank: 2, agent: "Denzel Melo", agentSlug: "denzel-melo", tag: "Gross absence", tagStatus: "warning", body: "Cumulative weekly absence at 28.1%, more than double the 6% target." },
  ],
  MTD: [
    { rank: 1, agent: "Martinho Wambembe", agentSlug: "martinho-wambembe", tag: "Gross absence", tagStatus: "critical", body: "Monthly gross absence at 32.5% vs 11.55% team average (+20.95pp), with a sustained downward trend." },
    { rank: 2, agent: "Toufiq Hossain", agentSlug: "toufiq-hossain", tag: "Gross absence", tagStatus: "critical", body: "Alternating pattern (100% one week, 0% the next) raises the monthly average to 55.56% vs 11.55% team average." },
  ],
  QTD: [
    { rank: 1, agent: "Martinho Wambembe", agentSlug: "martinho-wambembe", tag: "Gross absence", tagStatus: "critical", body: "Steadily worsening quarterly absence trend, now at 30.8% vs 11.55% team average." },
  ],
};

const TEAMS = [
  { id: "team-a", name: "Team A — Retail Support" },
  { id: "team-b", name: "Team B — Premium Support" },
  { id: "team-c", name: "Team C — Backoffice" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function statusClasses(status: Status) {
  switch (status) {
    case "critical":
      return { bg: "bg-danger-light", text: "text-danger", label: "Critical" };
    case "warning":
      return { bg: "bg-warning-light", text: "text-warning", label: "Needs attention" };
    case "at_risk":
      return { bg: "bg-warning-light", text: "text-warning", label: "At risk" };
    default:
      return { bg: "bg-success-light", text: "text-success", label: "On target" };
  }
}

function TrendIcon({ trend, status }: { trend: "up" | "down"; status: Status }) {
  const color = status === "critical" ? "#EF4444" : status === "warning" || status === "at_risk" ? "#F59E0B" : "#10B981";
  const Icon = trend === "up" ? TrendingUp : TrendingDown;
  return <Icon size={16} color={color} strokeWidth={2} />;
}

function KpiCard({ kpi, highlighted }: { kpi: Kpi; highlighted?: boolean }) {
  const valueColor =
    kpi.status === "critical" ? "text-danger" :
    kpi.status === "at_risk" || kpi.status === "warning" ? "text-warning" :
    "text-success";
  const deltaColor = kpi.delta.startsWith("+")
    ? "text-success"
    : kpi.delta.startsWith("-")
      ? "text-danger"
      : "text-text-tertiary";
  return (
    <div className={`bg-surface rounded-lg p-3 border ${highlighted ? "border-success ring-1 ring-success/30" : "border-border"}`}>
      <div className="flex items-center justify-between mb-1.5 gap-1">
        <p className="text-[11px] font-medium text-text-secondary m-0 leading-tight uppercase tracking-wide">{kpi.label}</p>
        {kpi.status === "at_risk" && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-warning-light text-warning whitespace-nowrap">AT RISK</span>
        )}
      </div>
      <p className={`text-2xl font-bold m-0 leading-tight ${valueColor}`}>
        {kpi.value}
        {kpi.unit && <span className="text-sm font-normal text-text-secondary"> {kpi.unit}</span>}
      </p>
      <div className="flex items-center justify-between mt-1.5">
        <p className="text-xs text-text-tertiary m-0 leading-tight flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full border border-text-tertiary flex-shrink-0" /> Target {kpi.target}
        </p>
        <span className={`text-xs font-medium ${deltaColor}`}>{kpi.delta}</span>
      </div>
    </div>
  );
}

function TrendChart({ data, label }: { data: number[]; label: string }) {
  const w = 600;
  const h = 180;
  const pad = 28;
  const max = Math.max(...data) * 1.1;
  const min = Math.min(...data) * 0.85;
  const range = max - min || 1;
  const weeks = ["W-3", "W-2", "W-1", "Current"];

  const points = data.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (data.length - 1);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y];
  });

  const path = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(" ");
  const areaPath = `${path} L ${points[points.length - 1][0]} ${h - pad} L ${points[0][0]} ${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36 block">
      <path d={areaPath} fill="rgba(16,185,129,0.06)" stroke="none" />
      <path d={path} fill="none" stroke="#10B981" strokeWidth="2" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="3.5" fill="#10B981" />
          <text x={p[0]} y={h - 6} textAnchor="middle" fontSize="11" fontFamily="Inter, system-ui, sans-serif" fill="#9CA3AF">
            {weeks[i]}
          </text>
          <text x={p[0]} y={p[1] - 10} textAnchor="middle" fontSize="11" fontFamily="Inter, system-ui, sans-serif" fill="#6B7280">
            {data[i]}%
          </text>
        </g>
      ))}
    </svg>
  );
}


const PERIOD_LABELS: Record<Period, string> = {
  "D-1": "yesterday's data (D-1)",
  WTD: "week to date (WTD)",
  MTD: "month to date (MTD)",
  QTD: "quarter to date (QTD)",
};

export default function TeamOverviewPage() {
  const [period, setPeriod] = useState<Period>("D-1");
  const [topicTab, setTopicTab] = useState<"top" | "overdue" | "upcoming">("top");
  const [teamId, setTeamId] = useState("team-a");
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [selectedAgentSlug, setSelectedAgentSlug] = useState<string | null>(null);

  const mainKpis = MAIN_KPIS[period];
  const alerts = ALERTS[period];
  const team = TEAM[period];
  const topics = TOPICS[period];

  const periodOptions: Period[] = ["D-1", "WTD", "MTD", "QTD"];

  const priorityKpi = getPriorityKpi(period);
  const selectedAgent = team.find((m) => m.slug === selectedAgentSlug) ?? null;
  const chartData = selectedAgent ? selectedAgent.fcrTrend : priorityKpi.trendData[period];
  const chartLabel = selectedAgent ? selectedAgent.name : `${priorityKpi.label} — whole team`;

  // Alert block: top 3 visible, rest behind "See all"
  const TOP_ALERT_COUNT = 3;
  const [alertsExpanded, setAlertsExpanded] = useState(false);
  const visibleAlerts = alertsExpanded ? alerts : alerts.slice(0, TOP_ALERT_COUNT);
  const hiddenAlertCount = alerts.length - TOP_ALERT_COUNT;

  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar />
      <main className="flex-1 text-text-primary font-sans px-6 py-8 overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
          <div>
            <p className="text-sm text-text-secondary mb-1">Team · Wednesday May 20 · {PERIOD_LABELS[period]}</p>
            <h1 className="text-2xl font-medium m-0">Team overview</h1>
          </div>
          <div className="flex items-start gap-2 flex-wrap">
            <div className="relative">
              <button
                onClick={() => setTeamDropdownOpen((v) => !v)}
                className="px-3.5 py-1.5 text-sm rounded-md font-medium border border-border bg-surface text-text-secondary flex items-center gap-1.5 hover:border-brand/40 transition-colors"
              >
                {TEAMS.find((t) => t.id === teamId)?.name}
                <ChevronDown size={14} className={`transition-transform ${teamDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {teamDropdownOpen && (
                <div className="absolute top-[calc(100%+6px)] right-0 bg-surface border border-border rounded-lg overflow-hidden z-10 shadow-lg min-w-[200px]">
                  {TEAMS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTeamId(t.id);
                        setTeamDropdownOpen(false);
                        setSelectedAgentSlug(null);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm border-t border-border first:border-t-0 ${
                        t.id === teamId ? "bg-surface-muted font-medium" : "bg-transparent text-text-secondary"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-1.5">
              {periodOptions.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriod(p);
                    setSelectedAgentSlug(null);
                  }}
                  className={`px-3.5 py-1.5 text-sm rounded-md font-medium border transition-colors ${
                    period === p ? "bg-brand-light text-brand border-transparent" : "bg-surface text-text-secondary border-border hover:border-brand/40"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alert block — compact, top 3 always visible */}
        {alerts.length > 0 && (
          <div className="border border-danger/20 bg-danger-light rounded-lg mb-4 px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={15} className="text-danger flex-shrink-0" />
              <p className="text-sm font-medium text-danger m-0">
                {alerts.length} {alerts.length === 1 ? "agent needs" : "agents need"} attention
                {period === "D-1" ? " today" : period === "WTD" ? " this week" : period === "MTD" ? " this month" : " this quarter"}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              {visibleAlerts.map((a) => (
                <Link
                  key={a.agentSlug}
                  href={`/projects/20260620-agent-view?agent=${a.agentSlug}`}
                  className="text-sm text-text-primary hover:text-danger transition-colors flex items-baseline gap-1.5"
                >
                  <span className="font-medium whitespace-nowrap">{a.agent}</span>
                  <span className="text-text-secondary">·</span>
                  <span className="text-text-secondary">{a.reason}</span>
                </Link>
              ))}
            </div>
            {hiddenAlertCount > 0 && !alertsExpanded && (
              <button
                onClick={() => setAlertsExpanded(true)}
                className="mt-2 text-xs text-danger font-medium flex items-center gap-1 hover:underline"
              >
                <ChevronDown size={13} /> See all {alerts.length} alerts
              </button>
            )}
            {alertsExpanded && hiddenAlertCount > 0 && (
              <button
                onClick={() => setAlertsExpanded(false)}
                className="mt-2 text-xs text-danger font-medium flex items-center gap-1 hover:underline"
              >
                <ChevronDown size={13} className="rotate-180" /> Show less
              </button>
            )}
          </div>
        )}

        {/* KPI strip — single row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          {mainKpis.map((k) => (
            <KpiCard key={k.key} kpi={k} highlighted={k.status === "ok" && k.key === "csat"} />
          ))}
        </div>

        {/* Main grid: chart | team table */}
        <div className="grid md:grid-cols-2 gap-4 mb-6 items-stretch">
          {/* KPI Trends chart — master-detail panel */}
          <div className="border border-border rounded-lg bg-surface px-4 py-3 flex flex-col">
            <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
              <p className="text-sm text-text-secondary uppercase tracking-wide m-0">KPI Trends — {chartLabel}</p>
              {selectedAgent && (
                <button
                  onClick={() => setSelectedAgentSlug(null)}
                  className="text-xs px-2 py-0.5 rounded-md border border-border text-text-secondary font-medium hover:border-brand/40 transition-colors"
                >
                  Team
                </button>
              )}
            </div>
            <div className="flex-1 flex items-center">
              <TrendChart data={chartData} label={chartLabel} />
            </div>
            {!selectedAgent ? (
              <p className="text-xs text-text-tertiary m-0">
                Default chart shows the KPI with the highest operational priority based on severity, deviation vs target, and number of affected agents. Select an agent in the table to see their individual trend.
              </p>
            ) : (
              <p className="text-xs text-text-tertiary m-0">Showing FCR_Phone trend for selected agent. Click <strong>Team</strong> to return to team view.</p>
            )}
          </div>

          {/* Team table */}
          <div className="border border-border rounded-lg bg-surface overflow-hidden flex flex-col">
            <div className="px-4 py-2 border-b border-border bg-surface-muted">
              <p className="text-sm text-text-secondary uppercase tracking-wide m-0">Team · {PERIOD_LABELS[period]}</p>
            </div>
            <div className="overflow-y-auto max-h-72">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {team.map((m) => {
                    const b = statusClasses(m.status);
                    const isSelected = m.slug === selectedAgentSlug;
                    return (
                      <tr
                        key={m.slug}
                        onClick={() => setSelectedAgentSlug(m.slug)}
                        className={`border-b border-border last:border-b-0 cursor-pointer transition-colors ${isSelected ? "bg-brand-light" : "hover:bg-surface-muted"}`}
                      >
                        <td className="px-3 py-2">
                          <Link
                            href={`/projects/20260620-agent-view?agent=${m.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-brand hover:underline transition-colors"
                          >
                            {m.name}
                          </Link>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${b.bg} ${b.text}`}>{m.statusLabel}</span>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">
                          <span className={m.trendStatus === "critical" ? "text-danger" : m.trendStatus === "warning" ? "text-warning" : "text-text-secondary"}>
                            {m.kpiLabel}: {m.kpiValue}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex justify-center">
                            <TrendIcon trend={m.trend} status={m.trendStatus} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Key topics */}
        <div className="flex justify-between items-center mb-2.5 flex-wrap gap-2">
          <p className="text-sm text-text-secondary uppercase tracking-wide m-0">Key topics</p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setTopicTab("top")}
              className={`px-3 py-1.5 text-xs rounded-md font-medium border ${
                topicTab === "top" ? "bg-surface-muted border-transparent" : "bg-surface text-text-secondary border-border"
              }`}
            >
              Top 5 facts
            </button>
            <button
              onClick={() => setTopicTab("overdue")}
              className={`px-3 py-1.5 text-xs rounded-md font-medium border flex items-center gap-1.5 ${
                topicTab === "overdue" ? "bg-surface-muted border-transparent" : "bg-surface text-text-secondary border-border"
              }`}
            >
              Overdue <span className="bg-danger-light text-danger px-1.5 rounded-md">127</span>
            </button>
            <button
              onClick={() => setTopicTab("upcoming")}
              className={`px-3 py-1.5 text-xs rounded-md font-medium border flex items-center gap-1.5 ${
                topicTab === "upcoming" ? "bg-surface-muted border-transparent" : "bg-surface text-text-secondary border-border"
              }`}
            >
              Upcoming <span className="bg-surface-muted text-text-secondary px-1.5 rounded-md">4</span>
            </button>
          </div>
        </div>

        {topicTab === "top" && (
          <div className="flex flex-col gap-2 mb-8">
            {topics.map((t) => {
              const b = statusClasses(t.tagStatus);
              return (
                <div key={t.rank} className="border border-border rounded-lg px-5 py-3.5 flex gap-3.5 items-start bg-surface">
                  <span className="font-mono text-sm text-text-tertiary min-w-[20px]">{String(t.rank).padStart(2, "0")}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-sm">{t.agent}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${b.bg} ${b.text}`}>{t.tag}</span>
                    </div>
                    <p className="text-sm text-text-secondary m-0">{t.body}</p>
                  </div>
                  <Link
                    href={`/projects/20260620-agent-view?agent=${t.agentSlug}`}
                    className="text-xs px-2.5 py-1 rounded-md border border-border text-text-secondary font-medium inline-flex items-center gap-1.5 whitespace-nowrap hover:border-brand/40 transition-colors"
                  >
                    View <ArrowRight size={13} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {topicTab === "overdue" && (
          <div className="border border-border rounded-lg px-5 py-8 mb-8 bg-surface text-center">
            <p className="text-sm text-text-secondary m-0">
              127 overdue actions pending review. This detailed view will be built in the next iteration of the prototype.
            </p>
          </div>
        )}

        {topicTab === "upcoming" && (
          <div className="border border-border rounded-lg px-5 py-8 mb-8 bg-surface text-center">
            <p className="text-sm text-text-secondary m-0">
              4 actions coming due soon. This detailed view will be built in the next iteration of the prototype.
            </p>
          </div>
        )}
      </div>
      </main>
    </div>
  );
}
