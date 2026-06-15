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
type Status = "critical" | "warning" | "ok";
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
const EFFICIENCY: Record<Period, Kpi[]> = {
  "D-1": [
    { key: "aht_phone", label: "AHT phone", value: "758.97", unit: "s", target: "630s", delta: "+20%", status: "critical", trend: "up" },
    { key: "aht_messaging", label: "AHT messaging", value: "—", unit: "", target: "1000s", delta: "no data today", status: "ok", trend: "up" },
    { key: "fcr_phone", label: "FCR phone", value: "77.8", unit: "%", target: "75%", delta: "+2.8pp", status: "ok", trend: "up" },
    { key: "rr_phone", label: "Resolution phone", value: "88.9", unit: "%", target: "85%", delta: "+3.9pp", status: "ok", trend: "up" },
  ],
  WTD: [
    { key: "aht_phone", label: "AHT phone", value: "742.10", unit: "s", target: "630s", delta: "+17.8%", status: "critical", trend: "up" },
    { key: "aht_messaging", label: "AHT messaging", value: "980.4", unit: "s", target: "1000s", delta: "-2%", status: "ok", trend: "down" },
    { key: "fcr_phone", label: "FCR phone", value: "79.1", unit: "%", target: "75%", delta: "+4.1pp", status: "ok", trend: "up" },
    { key: "rr_phone", label: "Resolution phone", value: "87.3", unit: "%", target: "85%", delta: "+2.3pp", status: "ok", trend: "up" },
  ],
  MTD: [
    { key: "aht_phone", label: "AHT phone", value: "729.55", unit: "s", target: "630s", delta: "+15.8%", status: "critical", trend: "up" },
    { key: "aht_messaging", label: "AHT messaging", value: "955.2", unit: "s", target: "1000s", delta: "-4.5%", status: "ok", trend: "down" },
    { key: "fcr_phone", label: "FCR phone", value: "80.6", unit: "%", target: "75%", delta: "+5.6pp", status: "ok", trend: "up" },
    { key: "rr_phone", label: "Resolution phone", value: "86.7", unit: "%", target: "85%", delta: "+1.7pp", status: "ok", trend: "up" },
  ],
  QTD: [
    { key: "aht_phone", label: "AHT phone", value: "711.20", unit: "s", target: "630s", delta: "+12.9%", status: "critical", trend: "down" },
    { key: "aht_messaging", label: "AHT messaging", value: "930.8", unit: "s", target: "1000s", delta: "-6.9%", status: "ok", trend: "down" },
    { key: "fcr_phone", label: "FCR phone", value: "82.4", unit: "%", target: "75%", delta: "+7.4pp", status: "ok", trend: "up" },
    { key: "rr_phone", label: "Resolution phone", value: "85.9", unit: "%", target: "85%", delta: "+0.9pp", status: "ok", trend: "up" },
  ],
};

const QUALITY: Record<Period, Kpi[]> = {
  "D-1": [
    { key: "qa_score", label: "QA score", value: "99", unit: "%", target: "85%", delta: "+14pp", status: "ok", trend: "up" },
    { key: "professionalism", label: "Professionalism", value: "88.9", unit: "%", target: "95%", delta: "-6.1pp", status: "warning", trend: "down" },
    { key: "gross_absence", label: "Gross absence", value: "0", unit: "%", target: "6%", delta: "within target", status: "ok", trend: "up" },
    { key: "nps_phone", label: "NPS phone", value: "33.3", unit: "%", target: "55%", delta: "-21.7pp", status: "critical", trend: "down" },
  ],
  WTD: [
    { key: "qa_score", label: "QA score", value: "92.1", unit: "%", target: "85%", delta: "+7.1pp", status: "ok", trend: "up" },
    { key: "professionalism", label: "Professionalism", value: "90.2", unit: "%", target: "95%", delta: "-4.8pp", status: "warning", trend: "up" },
    { key: "gross_absence", label: "Gross absence", value: "8.4", unit: "%", target: "6%", delta: "+2.4pp", status: "warning", trend: "down" },
    { key: "nps_phone", label: "NPS phone", value: "41.6", unit: "%", target: "55%", delta: "-13.4pp", status: "critical", trend: "up" },
  ],
  MTD: [
    { key: "qa_score", label: "QA score", value: "90.6", unit: "%", target: "85%", delta: "+5.6pp", status: "ok", trend: "up" },
    { key: "professionalism", label: "Professionalism", value: "91.0", unit: "%", target: "95%", delta: "-4.0pp", status: "warning", trend: "up" },
    { key: "gross_absence", label: "Gross absence", value: "11.55", unit: "%", target: "6%", delta: "+5.55pp", status: "critical", trend: "down" },
    { key: "nps_phone", label: "NPS phone", value: "47.2", unit: "%", target: "55%", delta: "-7.8pp", status: "warning", trend: "up" },
  ],
  QTD: [
    { key: "qa_score", label: "QA score", value: "91.4", unit: "%", target: "85%", delta: "+6.4pp", status: "ok", trend: "up" },
    { key: "professionalism", label: "Professionalism", value: "91.8", unit: "%", target: "95%", delta: "-3.2pp", status: "warning", trend: "up" },
    { key: "gross_absence", label: "Gross absence", value: "10.2", unit: "%", target: "6%", delta: "+4.2pp", status: "critical", trend: "down" },
    { key: "nps_phone", label: "NPS phone", value: "52.0", unit: "%", target: "55%", delta: "-3.0pp", status: "warning", trend: "up" },
  ],
};

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

const TEAM_FCR_TREND: Record<Period, number[]> = {
  "D-1": [70, 72, 75, 77.8],
  WTD: [74, 76, 78, 79.1],
  MTD: [76, 78, 79, 80.6],
  QTD: [78, 80, 81, 82.4],
};

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
  const color = status === "critical" ? "#C2462E" : status === "warning" ? "#B8860B" : "#3D7A5C";
  const Icon = trend === "up" ? TrendingUp : TrendingDown;
  return <Icon size={16} color={color} strokeWidth={2} />;
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const valueColor =
    kpi.status === "critical" ? "text-danger" : kpi.status === "ok" && kpi.delta !== "no data today" ? "text-success" : "text-text-primary";
  return (
    <div className="bg-surface-muted rounded-md p-3">
      <p className="text-xs text-text-secondary mb-1 leading-tight">{kpi.label}</p>
      <p className={`text-lg font-medium m-0 leading-tight ${valueColor}`}>
        {kpi.value}
        {kpi.unit && <span className="text-xs font-mono text-text-secondary"> {kpi.unit}</span>}
      </p>
      <p className="text-[11px] text-text-tertiary font-mono mt-0.5 mb-0 leading-tight">
        target {kpi.target} · {kpi.delta}
      </p>
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
      <path d={areaPath} fill="rgba(45,90,74,0.06)" stroke="none" />
      <path d={path} fill="none" stroke="#2D5A4A" strokeWidth="2" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="3.5" fill="#2D5A4A" />
          <text x={p[0]} y={h - 6} textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono, monospace" fill="#A6A398">
            {weeks[i]}
          </text>
          <text x={p[0]} y={p[1] - 10} textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono, monospace" fill="#6B6A63">
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
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [topicTab, setTopicTab] = useState<"top" | "overdue" | "upcoming">("top");
  const [teamId, setTeamId] = useState("team-a");
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [selectedAgentSlug, setSelectedAgentSlug] = useState<string | null>(null);

  const efficiency = EFFICIENCY[period];
  const quality = QUALITY[period];
  const alerts = ALERTS[period];
  const team = TEAM[period];
  const topics = TOPICS[period];

  const periodOptions: Period[] = ["D-1", "WTD", "MTD", "QTD"];

  const selectedAgent = team.find((m) => m.slug === selectedAgentSlug) ?? null;
  const chartData = selectedAgent ? selectedAgent.fcrTrend : TEAM_FCR_TREND[period];
  const chartLabel = selectedAgent ? selectedAgent.name : "whole team";

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

        {/* Alert banner — collapsible */}
        {alerts.length > 0 && (
          <div className="border border-danger/20 bg-danger-light rounded-lg mb-4 overflow-hidden">
            <button
              onClick={() => setAlertsOpen((v) => !v)}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-left"
            >
              <AlertTriangle size={16} className="text-danger flex-shrink-0" />
              <p className="text-sm font-medium text-danger m-0 flex-1">
                {alerts.length} {alerts.length === 1 ? "agent needs" : "agents need"} attention
                {period === "D-1" ? " today" : period === "WTD" ? " this week" : period === "MTD" ? " this month" : " this quarter"}
              </p>
              <ChevronDown size={16} className={`text-danger transition-transform flex-shrink-0 ${alertsOpen ? "rotate-180" : ""}`} />
            </button>
            {alertsOpen && (
              <div className="flex flex-col gap-1 px-4 pb-3 pt-0.5">
                {alerts.map((a) => (
                  <Link key={a.agentSlug} href={`/projects/20260620-agent-view?agent=${a.agentSlug}`} className="text-sm text-text-primary hover:text-danger transition-colors">
                    <span className="font-medium">{a.agent}</span> — {a.reason}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* KPI strip — single row */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
          {[...efficiency, ...quality].map((k) => (
            <KpiCard key={k.key} kpi={k} />
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
            {!selectedAgent && (
              <p className="text-xs text-text-tertiary m-0">Select an agent in the table to see their individual trend.</p>
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
