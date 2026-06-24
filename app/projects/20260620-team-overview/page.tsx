"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { GlobalHeader, usePeriod, type Period } from "@/components/Header";
import { AlertTriangle, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Status = "critical" | "warning" | "ok" | "at_risk";

type KpiCard = {
  key: string; label: string; value: string; unit: string;
  target: string; delta: string; atRisk: boolean; deltaPos: boolean | null;
};

type Alert = {
  agent: string; agentSlug: string; reason: string;
  actionCount: number; // 0 = no plan
};

type TeamRow = {
  name: string; slug: string;
  status: Status; statusLabel: string;
  kpiLabel: string; kpiValue: string;
  trendDir: "up" | "down"; trendStatus: Status; trendWeeks: number;
  actionCount: number;
  trendData: number[]; // 4 weekly points for sparkline
};

type Topic = {
  rank: number; agent: string; agentSlug: string;
  tag: string; tagStatus: Status; body: string;
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const KPI_CARDS: Record<Period, KpiCard[]> = {
  "D-1": [
    { key: "csat",  label: "CSAT",  value: "83.1", unit: "%", target: "85.0%", delta: "0%",  atRisk: true,  deltaPos: null },
    { key: "fcr",   label: "FCR",   value: "75.5", unit: "%", target: "78.0%", delta: "-1%", atRisk: true,  deltaPos: false },
    { key: "aht",   label: "AHT",   value: "378",  unit: "s", target: "420",   delta: "+4%", atRisk: false, deltaPos: true },
    { key: "nps",   label: "NPS",   value: "87",   unit: "",  target: "45",    delta: "0%",  atRisk: false, deltaPos: null },
    { key: "sales", label: "SALES", value: "10.9", unit: "%", target: "12.0%", delta: "+4%", atRisk: true,  deltaPos: true },
    { key: "adh",   label: "ADH",   value: "87.5", unit: "%", target: "95.0%", delta: "-3%", atRisk: true,  deltaPos: false },
  ],
  WTD: [
    { key: "csat",  label: "CSAT",  value: "84.0", unit: "%", target: "85.0%", delta: "+0.9pp", atRisk: true,  deltaPos: true },
    { key: "fcr",   label: "FCR",   value: "76.8", unit: "%", target: "78.0%", delta: "-1.2pp", atRisk: true,  deltaPos: false },
    { key: "aht",   label: "AHT",   value: "365",  unit: "s", target: "420",   delta: "+13s",   atRisk: false, deltaPos: true },
    { key: "nps",   label: "NPS",   value: "84",   unit: "",  target: "45",    delta: "-3",     atRisk: false, deltaPos: false },
    { key: "sales", label: "SALES", value: "11.4", unit: "%", target: "12.0%", delta: "+0.5pp", atRisk: true,  deltaPos: true },
    { key: "adh",   label: "ADH",   value: "89.0", unit: "%", target: "95.0%", delta: "+1.5pp", atRisk: true,  deltaPos: true },
  ],
  MTD: [
    { key: "csat",  label: "CSAT",  value: "84.6", unit: "%", target: "85.0%", delta: "+1.5pp", atRisk: true,  deltaPos: true },
    { key: "fcr",   label: "FCR",   value: "78.2", unit: "%", target: "78.0%", delta: "+0.2pp", atRisk: false, deltaPos: true },
    { key: "aht",   label: "AHT",   value: "358",  unit: "s", target: "420",   delta: "+20s",   atRisk: false, deltaPos: true },
    { key: "nps",   label: "NPS",   value: "81",   unit: "",  target: "45",    delta: "-6",     atRisk: false, deltaPos: false },
    { key: "sales", label: "SALES", value: "11.7", unit: "%", target: "12.0%", delta: "+0.8pp", atRisk: true,  deltaPos: true },
    { key: "adh",   label: "ADH",   value: "90.2", unit: "%", target: "95.0%", delta: "+2.7pp", atRisk: true,  deltaPos: true },
  ],
  QTD: [
    { key: "csat",  label: "CSAT",  value: "85.1", unit: "%", target: "85.0%", delta: "+2.0pp", atRisk: false, deltaPos: true },
    { key: "fcr",   label: "FCR",   value: "79.0", unit: "%", target: "78.0%", delta: "+1.0pp", atRisk: false, deltaPos: true },
    { key: "aht",   label: "AHT",   value: "350",  unit: "s", target: "420",   delta: "+28s",   atRisk: false, deltaPos: true },
    { key: "nps",   label: "NPS",   value: "78",   unit: "",  target: "45",    delta: "-9",     atRisk: false, deltaPos: false },
    { key: "sales", label: "SALES", value: "11.9", unit: "%", target: "12.0%", delta: "+1.0pp", atRisk: true,  deltaPos: true },
    { key: "adh",   label: "ADH",   value: "91.4", unit: "%", target: "95.0%", delta: "+3.9pp", atRisk: true,  deltaPos: true },
  ],
};

const ALERTS: Record<Period, Alert[]> = {
  "D-1": [
    { agent: "Pedro Godinho",  agentSlug: "pedro-godinho",  reason: "AHT 25% above target, trending up for 3 weeks", actionCount: 0 },
    { agent: "Denzel Melo",    agentSlug: "denzel-melo",    reason: "Absences rising, 33% vs 6% target",             actionCount: 0 },
    { agent: "Raymond Akpelu", agentSlug: "raymond-akpelu", reason: "QA dropped from 84.5 to 34.0, miscategorized cases", actionCount: 1 },
  ],
  WTD: [
    { agent: "Pedro Godinho", agentSlug: "pedro-godinho", reason: "AHT 17.8% above target throughout the week", actionCount: 0 },
    { agent: "Denzel Melo",   agentSlug: "denzel-melo",   reason: "Cumulative absences rise to 28% this week",  actionCount: 0 },
  ],
  MTD: [
    { agent: "Martinho Wambembe", agentSlug: "martinho-wambembe", reason: "Monthly gross absence at 32.5% vs 11.55% team average", actionCount: 2 },
    { agent: "Toufiq Hossain",    agentSlug: "toufiq-hossain",    reason: "Alternating absence pattern raises the monthly average to 55.56%", actionCount: 0 },
  ],
  QTD: [
    { agent: "Martinho Wambembe", agentSlug: "martinho-wambembe", reason: "Steadily worsening absence trend throughout the quarter", actionCount: 2 },
  ],
};

const TEAM: Record<Period, TeamRow[]> = {
  "D-1": [
    { name: "Pedro Godinho",            slug: "pedro-godinho",      status: "critical", statusLabel: "Critical",        kpiLabel: "AHT",     kpiValue: "863.9s", trendDir: "up",   trendStatus: "critical", trendWeeks: 3, actionCount: 0, trendData: [690,720,745,759] },
    { name: "Denzel Melo",              slug: "denzel-melo",        status: "critical", statusLabel: "Critical",        kpiLabel: "Absence", kpiValue: "33.5%",  trendDir: "up",   trendStatus: "critical", trendWeeks: 4, actionCount: 0, trendData: [22,27,29,33]    },
    { name: "Raymond Akpelu",           slug: "raymond-akpelu",     status: "warning",  statusLabel: "Needs attention", kpiLabel: "QA",      kpiValue: "34.0%",  trendDir: "down", trendStatus: "critical", trendWeeks: 2, actionCount: 1, trendData: [84,80,70,34]    },
    { name: "Alexandre Manuel Pereira", slug: "alexandre-pereira",  status: "ok",       statusLabel: "On target",       kpiLabel: "AHT",     kpiValue: "670.5s", trendDir: "up",   trendStatus: "ok",       trendWeeks: 2, actionCount: 2, trendData: [88,90,91,88]    },
    { name: "Francisco Esperança",      slug: "francisco-esperanca",status: "ok",       statusLabel: "On target",       kpiLabel: "AHT",     kpiValue: "691.4s", trendDir: "up",   trendStatus: "ok",       trendWeeks: 3, actionCount: 0, trendData: [85,85,85,83]    },
    { name: "Camila Robledo",           slug: "camila-robledo",     status: "warning",  statusLabel: "Needs attention", kpiLabel: "AHT",     kpiValue: "821.1s", trendDir: "down", trendStatus: "warning",  trendWeeks: 1, actionCount: 0, trendData: [65,66,71,74]    },
    { name: "Cristina Ji",              slug: "cristina-ji",        status: "warning",  statusLabel: "Needs attention", kpiLabel: "FCR",     kpiValue: "0%",     trendDir: "down", trendStatus: "critical", trendWeeks: 2, actionCount: 0, trendData: [42,39,43,43]    },
    { name: "David Reis Carvalho",      slug: "david-reis-carvalho",status: "ok",       statusLabel: "On target",       kpiLabel: "FCR",     kpiValue: "85%",    trendDir: "up",   trendStatus: "ok",       trendWeeks: 2, actionCount: 0, trendData: [86,88,86,82]    },
    { name: "Lucas Dias",               slug: "lucas-dias",         status: "warning",  statusLabel: "Needs attention", kpiLabel: "AHT",     kpiValue: "823.9s", trendDir: "up",   trendStatus: "warning",  trendWeeks: 1, actionCount: 0, trendData: [68,72,77,80]    },
    { name: "Marco Nunes Sousa",        slug: "marco-nunes-sousa",  status: "warning",  statusLabel: "Needs attention", kpiLabel: "AHT",     kpiValue: "744.9s", trendDir: "up",   trendStatus: "warning",  trendWeeks: 2, actionCount: 0, trendData: [60,56,54,51]    },
    { name: "Martinho Wambembe",        slug: "martinho-wambembe",  status: "warning",  statusLabel: "Needs attention", kpiLabel: "Absence", kpiValue: "32.5%",  trendDir: "up",   trendStatus: "critical", trendWeeks: 4, actionCount: 2, trendData: [20,25,29,33]    },
    { name: "Phillip Ellis",            slug: "phillip-ellis",      status: "warning",  statusLabel: "Needs attention", kpiLabel: "FCR",     kpiValue: "50%",    trendDir: "down", trendStatus: "warning",  trendWeeks: 1, actionCount: 0, trendData: [65,61,62,65]    },
    { name: "Toufiq Hossain",           slug: "toufiq-hossain",     status: "warning",  statusLabel: "Needs attention", kpiLabel: "Absence", kpiValue: "55.6%",  trendDir: "up",   trendStatus: "critical", trendWeeks: 3, actionCount: 0, trendData: [20,40,30,56]    },
    { name: "Vasile Bunduche",          slug: "vasile-bunduche",    status: "ok",       statusLabel: "On target",       kpiLabel: "FCR",     kpiValue: "78%",    trendDir: "up",   trendStatus: "ok",       trendWeeks: 2, actionCount: 0, trendData: [84,82,86,84]    },
  ],
  WTD: [
    { name: "Pedro Godinho",            slug: "pedro-godinho",      status: "critical", statusLabel: "Critical",        kpiLabel: "AHT",     kpiValue: "835.2s", trendDir: "up",   trendStatus: "critical", trendWeeks: 3, actionCount: 0, trendData: [685,710,730,742] },
    { name: "Denzel Melo",              slug: "denzel-melo",        status: "warning",  statusLabel: "Needs attention", kpiLabel: "Absence", kpiValue: "28.1%",  trendDir: "up",   trendStatus: "critical", trendWeeks: 4, actionCount: 0, trendData: [15,20,24,28]    },
    { name: "Alexandre Manuel Pereira", slug: "alexandre-pereira",  status: "ok",       statusLabel: "On target",       kpiLabel: "AHT",     kpiValue: "655.2s", trendDir: "down", trendStatus: "ok",       trendWeeks: 2, actionCount: 2, trendData: [88,93,92,87]    },
    { name: "Francisco Esperança",      slug: "francisco-esperanca",status: "ok",       statusLabel: "On target",       kpiLabel: "AHT",     kpiValue: "688.0s", trendDir: "down", trendStatus: "ok",       trendWeeks: 1, actionCount: 0, trendData: [85,85,85,83]    },
    { name: "Camila Robledo",           slug: "camila-robledo",     status: "warning",  statusLabel: "Needs attention", kpiLabel: "AHT",     kpiValue: "810.4s", trendDir: "down", trendStatus: "warning",  trendWeeks: 1, actionCount: 0, trendData: [65,66,71,74]    },
  ],
  MTD: [
    { name: "Martinho Wambembe",        slug: "martinho-wambembe",  status: "critical", statusLabel: "Critical",        kpiLabel: "Absence", kpiValue: "32.5%",  trendDir: "up",   trendStatus: "critical", trendWeeks: 4, actionCount: 2, trendData: [20,25,29,33]    },
    { name: "Toufiq Hossain",           slug: "toufiq-hossain",     status: "critical", statusLabel: "Critical",        kpiLabel: "Absence", kpiValue: "55.6%",  trendDir: "up",   trendStatus: "critical", trendWeeks: 3, actionCount: 0, trendData: [20,40,30,56]    },
    { name: "Pedro Godinho",            slug: "pedro-godinho",      status: "warning",  statusLabel: "Needs attention", kpiLabel: "AHT",     kpiValue: "729.6s", trendDir: "down", trendStatus: "warning",  trendWeeks: 1, actionCount: 0, trendData: [62,62,64,60]    },
    { name: "Alexandre Manuel Pereira", slug: "alexandre-pereira",  status: "ok",       statusLabel: "On target",       kpiLabel: "AHT",     kpiValue: "661.0s", trendDir: "down", trendStatus: "ok",       trendWeeks: 2, actionCount: 2, trendData: [88,93,92,87]    },
  ],
  QTD: [
    { name: "Martinho Wambembe",        slug: "martinho-wambembe",  status: "critical", statusLabel: "Critical",        kpiLabel: "Absence", kpiValue: "30.8%",  trendDir: "up",   trendStatus: "critical", trendWeeks: 5, actionCount: 2, trendData: [20,25,29,31]    },
    { name: "Pedro Godinho",            slug: "pedro-godinho",      status: "warning",  statusLabel: "Needs attention", kpiLabel: "AHT",     kpiValue: "711.2s", trendDir: "down", trendStatus: "warning",  trendWeeks: 1, actionCount: 0, trendData: [62,62,64,60]    },
    { name: "Alexandre Manuel Pereira", slug: "alexandre-pereira",  status: "ok",       statusLabel: "On target",       kpiLabel: "AHT",     kpiValue: "670.0s", trendDir: "down", trendStatus: "ok",       trendWeeks: 2, actionCount: 2, trendData: [88,93,92,87]    },
  ],
};

// Chart trend data for the KPI Trends panel (whole-team view)
const CHART_TREND: Record<Period, { data: number[]; label: string; unit: string }> = {
  "D-1": { data: [690, 720, 745, 759], label: "AHT — Whole team", unit: "s" },
  WTD:   { data: [685, 710, 730, 742], label: "AHT — Whole team", unit: "s" },
  MTD:   { data: [670, 695, 715, 730], label: "AHT — Whole team", unit: "s" },
  QTD:   { data: [650, 670, 695, 711], label: "AHT — Whole team", unit: "s" },
};

const TOPICS: Record<Period, Topic[]> = {
  "D-1": [
    { rank: 1, agent: "Pedro Godinho",     agentSlug: "pedro-godinho",     tag: "Professionalism · phone", tagStatus: "critical", body: "Inefficient call handling, trending upward (718.9s → 845.5s → 863.9s) despite 4+ years of tenure. AHT is 25% above the team average, with a weekly peak of 890.8s before slightly easing to 835.6s." },
    { rank: 2, agent: "Denzel Melo",       agentSlug: "denzel-melo",       tag: "Gross absence",           tagStatus: "critical", body: "Unexcused absence pattern with growing weekly volatility (0% → 40% → 20.25% → 50%). The monthly trend worsens from 25.26% to 33.47%, despite being a recent hire (119 days)." },
    { rank: 3, agent: "Toufiq Hossain",    agentSlug: "toufiq-hossain",    tag: "FCR · phone",             tagStatus: "warning",  body: "A week with 100% absence followed by one with 0% pushed gross absence to 55.56% vs 11.55% team average (+44.01pp). The monthly trend worsens from 0% to 55.56%." },
    { rank: 4, agent: "Martinho Wambembe", agentSlug: "martinho-wambembe", tag: "Gross absence",           tagStatus: "warning",  body: "Accelerating attendance deterioration: weekly gross absence rises steadily (11.81% → 21.46% → 29.12% → 36.72%), bringing the total to 32.5% vs 11.55% team average (+20.95pp)." },
    { rank: 5, agent: "Raymond Akpelu",    agentSlug: "raymond-akpelu",    tag: "AHT · phone",             tagStatus: "warning",  body: 'Critical failures in the "Act with ownership" (0/38) and "Follow the steps" (0/20) sections due to incorrect case categorization. QA dropped from 84.5 to 34.0 vs 90.63 team average.' },
  ],
  WTD: [
    { rank: 1, agent: "Pedro Godinho", agentSlug: "pedro-godinho", tag: "AHT · phone",   tagStatus: "critical", body: "Weekly AHT 17.8% above target, with no signs of improvement compared to the previous week." },
    { rank: 2, agent: "Denzel Melo",   agentSlug: "denzel-melo",   tag: "Gross absence", tagStatus: "warning",  body: "Cumulative weekly absence at 28.1%, more than double the 6% target." },
  ],
  MTD: [
    { rank: 1, agent: "Martinho Wambembe", agentSlug: "martinho-wambembe", tag: "Gross absence", tagStatus: "critical", body: "Monthly gross absence at 32.5% vs 11.55% team average (+20.95pp), with a sustained downward trend." },
    { rank: 2, agent: "Toufiq Hossain",    agentSlug: "toufiq-hossain",    tag: "Gross absence", tagStatus: "critical", body: "Alternating pattern (100% one week, 0% the next) raises the monthly average to 55.56% vs 11.55% team average." },
  ],
  QTD: [
    { rank: 1, agent: "Martinho Wambembe", agentSlug: "martinho-wambembe", tag: "Gross absence", tagStatus: "critical", body: "Steadily worsening quarterly absence trend, now at 30.8% vs 11.55% team average." },
  ],
};

const PERIOD_SUB: Record<Period, string> = {
  "D-1": "yesterday's data (D-1)",
  WTD:   "week to date (WTD)",
  MTD:   "month to date (MTD)",
  QTD:   "quarter to date (QTD)",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function StatusBadge({ status, label }: { status: Status; label: string }) {
  const cls =
    status === "critical" ? "bg-danger-light text-danger" :
    status === "warning"  ? "bg-warning-light text-warning" :
    "bg-success-light text-success";
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}

function TrendBadge({ dir, status, weeks }: { dir: "up" | "down"; status: Status; weeks: number }) {
  const color =
    status === "critical" ? "text-danger" :
    status === "warning"  ? "text-warning" : "text-success";
  const Icon = dir === "up" ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${color}`}>
      <Icon size={13} strokeWidth={2} />
      {weeks}w
    </span>
  );
}

// Sparkline SVG for the left KPI trend panel
function KpiTrendChart({ data, label, unit }: { data: number[]; label: string; unit: string }) {
  const W = 560; const H = 160; const PL = 20; const PR = 20; const PT = 20; const PB = 32;
  const weeks = ["W-3", "W-2", "W-1", "Current"];
  const vals = data;
  const minV = Math.min(...vals) * 0.95;
  const maxV = Math.max(...vals) * 1.05;
  const rangeV = maxV - minV || 1;
  const toX = (i: number) => PL + (i / (vals.length - 1)) * (W - PL - PR);
  const toY = (v: number) => PT + (1 - (v - minV) / rangeV) * (H - PT - PB);
  const pts = vals.map((v, i) => [toX(i), toY(v)] as [number, number]);
  const linePath = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1][0]} ${H - PB} L ${pts[0][0]} ${H - PB} Z`;

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary mb-1 m-0">
        KPI Trends — {label}
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" style={{ height: 150 }}>
        <path d={areaPath} fill="rgba(16,185,129,0.07)" />
        <path d={linePath} fill="none" stroke="#10B981" strokeWidth="2" />
        {pts.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="3.5" fill="#10B981" />
            <text x={x} y={y - 8} textAnchor="middle" fontSize="11"
              fontFamily="Inter,system-ui,sans-serif" fill="#6B7280">
              {vals[i]}{unit}
            </text>
            <text x={x} y={H - PB + 16} textAnchor="middle" fontSize="11"
              fontFamily="Inter,system-ui,sans-serif" fill="#9CA3AF">
              {weeks[i]}
            </text>
          </g>
        ))}
      </svg>
      <p className="text-[11px] text-text-tertiary mt-1 m-0 leading-relaxed">
        Default chart shows the KPI with the highest operational priority based on severity,
        deviation vs target, and number of affected agents. Select an agent in the table to
        see their individual trend.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function TeamOverviewPage() {
  const { period } = usePeriod();
  const [topicTab, setTopicTab] = useState<"top" | "overdue" | "upcoming">("top");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const kpis    = KPI_CARDS[period];
  const alerts  = ALERTS[period];
  const team    = TEAM[period];
  const topics  = TOPICS[period];
  const chart   = CHART_TREND[period];

  const selectedRow = team.find((r) => r.slug === selectedSlug) ?? null;
  const activeChart = selectedRow
    ? { data: selectedRow.trendData, label: selectedRow.name, unit: "" }
    : chart;

  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <GlobalHeader />

        <main className="flex-1 font-sans text-text-primary overflow-x-hidden px-8 py-6">

          {/* ── Page title ─────────────────────────────────────────── */}
          <div className="mb-5">
            <p className="text-sm text-text-secondary m-0">
              Team · Wednesday May 20 · {PERIOD_SUB[period]}
            </p>
            <h1 className="text-2xl font-semibold m-0 mt-0.5">Team overview</h1>
          </div>

          {/* ── Alert banner ───────────────────────────────────────── */}
          {alerts.length > 0 && (
            <div
              className="rounded-lg mb-5 px-4 py-3"
              style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-danger flex-shrink-0" />
                <p className="text-sm font-semibold text-danger m-0">
                  {alerts.length} agent{alerts.length > 1 ? "s need" : " needs"} attention
                  {period === "D-1" ? " today" : period === "WTD" ? " this week" : period === "MTD" ? " this month" : " this quarter"}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                {alerts.map((a) => (
                  <div key={a.agentSlug} className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-baseline gap-1.5 flex-1 min-w-0">
                      <Link
                        href={`/projects/20260620-agent-view?agent=${a.agentSlug}`}
                        className="text-sm font-semibold text-text-primary hover:text-danger transition-colors whitespace-nowrap"
                      >
                        {a.agent}
                      </Link>
                      <span className="text-sm text-text-secondary truncate">· {a.reason}</span>
                    </div>
                    {a.actionCount === 0 ? (
                      <Link
                        href={`/projects/20260620-agent-view?agent=${a.agentSlug}`}
                        className="flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap"
                        style={{ background: "#EF4444", color: "#fff" }}
                      >
                        No plan · Create
                      </Link>
                    ) : (
                      <span
                        className="flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap"
                        style={{ background: "#FEF3C7", color: "#92400E" }}
                      >
                        {a.actionCount} pending
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── KPI strip ──────────────────────────────────────────── */}
          <div className="grid grid-cols-6 gap-3 mb-5">
            {kpis.map((k) => {
              const valColor = k.atRisk ? "text-warning" : "text-success";
              const deltaColor = k.deltaPos === true ? "text-success" : k.deltaPos === false ? "text-danger" : "text-text-tertiary";
              return (
                <div key={k.key} className="bg-surface border border-border rounded-lg p-3">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wide">
                      {k.label}
                    </span>
                    {k.atRisk && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-warning-light text-warning whitespace-nowrap leading-tight">
                        AT RISK
                      </span>
                    )}
                  </div>
                  <p className={`text-[22px] font-bold leading-tight m-0 ${valColor}`}>
                    {k.value}
                    <span className="text-sm font-normal text-text-secondary"> {k.unit}</span>
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-text-tertiary">⊙ Target {k.target}</span>
                    <span className={`text-[11px] font-medium ${deltaColor}`}>{k.delta}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Chart + Team table ─────────────────────────────────── */}
          <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "1fr 420px" }}>

            {/* KPI Trend chart */}
            <div className="bg-surface border border-border rounded-lg px-5 py-4">
              <KpiTrendChart
                data={activeChart.data}
                label={activeChart.label}
                unit={activeChart.unit}
              />
            </div>

            {/* Team status table */}
            <div className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col">
              <div className="px-4 py-2.5 border-b border-border bg-surface-muted">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary m-0">
                  Team · {PERIOD_SUB[period]}
                </p>
              </div>
              <div className="overflow-y-auto flex-1" style={{ maxHeight: 260 }}>
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {team.map((row) => {
                      const isSelected = row.slug === selectedSlug;
                      return (
                        <tr
                          key={row.slug}
                          onClick={() => setSelectedSlug(isSelected ? null : row.slug)}
                          className={`border-b border-border last:border-b-0 cursor-pointer transition-colors ${
                            isSelected ? "bg-brand-light" : "hover:bg-surface-muted"
                          }`}
                        >
                          {/* Name */}
                          <td className="px-4 py-2 font-medium text-text-primary whitespace-nowrap">
                            <Link
                              href={`/projects/20260620-agent-view?agent=${row.slug}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-brand hover:underline transition-colors"
                            >
                              {row.name}
                            </Link>
                          </td>
                          {/* Status badge */}
                          <td className="px-2 py-2 whitespace-nowrap">
                            <StatusBadge status={row.status} label={row.statusLabel} />
                          </td>
                          {/* KPI value */}
                          <td className={`px-2 py-2 text-xs font-mono whitespace-nowrap ${
                            row.trendStatus === "critical" ? "text-danger" :
                            row.trendStatus === "warning"  ? "text-warning" : "text-text-secondary"
                          }`}>
                            {row.kpiLabel}: {row.kpiValue}
                          </td>
                          {/* Trend */}
                          <td className="px-2 py-2 whitespace-nowrap">
                            <TrendBadge dir={row.trendDir} status={row.trendStatus} weeks={row.trendWeeks} />
                          </td>
                          {/* Actions */}
                          <td className="px-3 py-2 text-right whitespace-nowrap">
                            {row.status !== "ok" ? (
                              row.actionCount === 0
                                ? <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-danger-light text-danger">0 actions</span>
                                : <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-warning-light text-warning">{row.actionCount} pending</span>
                            ) : (
                              <span className="text-text-tertiary text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Key Topics ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary m-0">
              Key Topics
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setTopicTab("top")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                  topicTab === "top"
                    ? "bg-surface-muted border-border text-text-primary"
                    : "bg-surface border-transparent text-text-secondary hover:border-border"
                }`}
              >
                Top 5 facts
              </button>
              <button
                onClick={() => setTopicTab("overdue")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors flex items-center gap-1.5 ${
                  topicTab === "overdue"
                    ? "bg-surface-muted border-border text-text-primary"
                    : "bg-surface border-transparent text-text-secondary hover:border-border"
                }`}
              >
                Overdue
                <span className="bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  127
                </span>
              </button>
              <button
                onClick={() => setTopicTab("upcoming")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors flex items-center gap-1.5 ${
                  topicTab === "upcoming"
                    ? "bg-surface-muted border-border text-text-primary"
                    : "bg-surface border-transparent text-text-secondary hover:border-border"
                }`}
              >
                Upcoming
                <span className="bg-surface-muted text-text-secondary text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  4
                </span>
              </button>
            </div>
          </div>

          {topicTab === "top" && (
            <div className="flex flex-col gap-2 pb-8">
              {topics.map((t) => {
                const tagCls =
                  t.tagStatus === "critical" ? "bg-danger-light text-danger" :
                  t.tagStatus === "warning"  ? "bg-warning-light text-warning" :
                  "bg-success-light text-success";
                return (
                  <div
                    key={t.rank}
                    className="bg-surface border border-border rounded-lg px-5 py-4 flex gap-4 items-start"
                  >
                    <span className="font-mono text-sm text-text-tertiary min-w-[20px] mt-0.5">
                      {String(t.rank).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-sm text-text-primary">{t.agent}</span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${tagCls}`}>
                          {t.tag}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary m-0 leading-relaxed">{t.body}</p>
                    </div>
                    <Link
                      href={`/projects/20260620-agent-view?agent=${t.agentSlug}`}
                      className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-md border border-border text-text-secondary inline-flex items-center gap-1.5 hover:border-brand/40 transition-colors whitespace-nowrap"
                    >
                      View <ArrowRight size={12} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {topicTab === "overdue" && (
            <div className="bg-surface border border-border rounded-lg px-5 py-10 text-center pb-8">
              <p className="text-sm text-text-secondary m-0">127 overdue actions pending review.</p>
            </div>
          )}

          {topicTab === "upcoming" && (
            <div className="bg-surface border border-border rounded-lg px-5 py-10 text-center pb-8">
              <p className="text-sm text-text-secondary m-0">4 actions coming due soon.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
