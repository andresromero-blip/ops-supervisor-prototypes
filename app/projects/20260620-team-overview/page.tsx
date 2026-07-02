"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { GlobalHeader, usePeriod, type Period } from "@/components/Header";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type AgentStatus = "At Risk" | "On Target" | "Off Target";
type TopicTab = "top5" | "overdue" | "upcoming";

type KpiDef = {
  key: string; label: string; fullLabel: string;
  unit: string; target: number; targetLabel: string;
  // Team value per period
  teamVals: Record<Period, number[]>; // 7 daily points Jun 18–24
  teamAvg: Record<Period, string>;
  delta: Record<Period, string>; deltaPos: Record<Period, boolean | null>;
  atRisk: Record<Period, boolean>;
  displayVal: Record<Period, string>;
  // Color when selected
  lineColor: string; areaColor: string;
};

type TeamStatusRow = {
  name: string;
  // value + status per KPI key
  kpiData: Record<string, { value: string; status: AgentStatus }>;
  // Agent trend data per KPI (7 daily points)
  agentTrend: Record<string, number[]>;
};

type Topic = { rank: number; agent: string; tag: string; tagColor: string; body: string };
type MemberRow = {
  initials: string; name: string;
  kpiScores: { label: string; color: string }[];
  allOnTarget: boolean; outlier: boolean;
  trend: string; trendIcon: string;
  pending: string; pendingAlert: boolean;
};

// ---------------------------------------------------------------------------
// KPI definitions — all 6 KPIs with full trend data
// ---------------------------------------------------------------------------
const KPIS: KpiDef[] = [
  {
    key: "csat", label: "CSAT", fullLabel: "Customer Satisfaction",
    unit: "%", target: 85, targetLabel: "85.0%",
    teamVals: {
      "D-1": [88.0, 86.5, 84.8, 83.0, 82.5, 83.5, 84.1],
      WTD:   [87.0, 85.5, 84.0, 83.5, 84.0, 84.5, 84.0],
      MTD:   [85.0, 84.5, 84.8, 85.2, 84.6, 84.9, 84.6],
      QTD:   [84.0, 84.5, 85.0, 85.2, 85.0, 85.1, 85.1],
    },
    teamAvg:    { "D-1": "83.1", WTD: "84.0", MTD: "84.6", QTD: "85.1" },
    displayVal: { "D-1": "83.1", WTD: "84.0", MTD: "84.6", QTD: "85.1" },
    delta:      { "D-1": "0%",  WTD: "+0.9pp", MTD: "+1.5pp", QTD: "+2.0pp" },
    deltaPos:   { "D-1": null,  WTD: true,     MTD: true,     QTD: true  },
    atRisk:     { "D-1": true,  WTD: true,     MTD: true,     QTD: false },
    lineColor: "#F59E0B", areaColor: "rgba(245,158,11,0.08)",
  },
  {
    key: "fcr", label: "FCR", fullLabel: "First Contact Resolution",
    unit: "%", target: 78, targetLabel: "78.0%",
    teamVals: {
      "D-1": [79.0, 77.5, 76.0, 75.5, 76.0, 75.8, 75.5],
      WTD:   [78.0, 77.0, 76.5, 76.8, 77.0, 76.5, 76.8],
      MTD:   [77.0, 77.5, 78.0, 78.2, 78.0, 78.1, 78.2],
      QTD:   [76.0, 77.0, 78.0, 79.0, 78.5, 79.0, 79.0],
    },
    teamAvg:    { "D-1": "75.5", WTD: "76.8", MTD: "78.2", QTD: "79.0" },
    displayVal: { "D-1": "75.5", WTD: "76.8", MTD: "78.2", QTD: "79.0" },
    delta:      { "D-1": "-1%", WTD: "-1.2pp", MTD: "+0.2pp", QTD: "+1.0pp" },
    deltaPos:   { "D-1": false, WTD: false,     MTD: true,     QTD: true  },
    atRisk:     { "D-1": true,  WTD: true,      MTD: false,    QTD: false },
    lineColor: "#F59E0B", areaColor: "rgba(245,158,11,0.08)",
  },
  {
    key: "aht", label: "AHT", fullLabel: "Average Handling Time",
    unit: "s", target: 420, targetLabel: "420",
    teamVals: {
      "D-1": [405, 400, 395, 390, 385, 382, 378],
      WTD:   [410, 405, 395, 388, 382, 375, 365],
      MTD:   [420, 410, 400, 390, 375, 365, 358],
      QTD:   [440, 425, 410, 395, 378, 360, 350],
    },
    teamAvg:    { "D-1": "378",  WTD: "365",  MTD: "358",  QTD: "350"  },
    displayVal: { "D-1": "378",  WTD: "365",  MTD: "358",  QTD: "350"  },
    delta:      { "D-1": "+4%", WTD: "+13s", MTD: "+20s", QTD: "+28s" },
    deltaPos:   { "D-1": true,  WTD: true,   MTD: true,   QTD: true   },
    atRisk:     { "D-1": false, WTD: false,  MTD: false,  QTD: false  },
    lineColor: "#10B981", areaColor: "rgba(16,185,129,0.08)",
  },
  {
    key: "nps", label: "NPS", fullLabel: "Net Promoter Score",
    unit: "", target: 45, targetLabel: "45",
    teamVals: {
      "D-1": [82, 84, 86, 87, 86, 87, 87],
      WTD:   [80, 82, 83, 84, 84, 83, 84],
      MTD:   [78, 79, 80, 81, 81, 80, 81],
      QTD:   [75, 76, 77, 78, 78, 77, 78],
    },
    teamAvg:    { "D-1": "87", WTD: "84", MTD: "81", QTD: "78" },
    displayVal: { "D-1": "87", WTD: "84", MTD: "81", QTD: "78" },
    delta:      { "D-1": "0%", WTD: "-3", MTD: "-6", QTD: "-9" },
    deltaPos:   { "D-1": null, WTD: false, MTD: false, QTD: false },
    atRisk:     { "D-1": false, WTD: false, MTD: false, QTD: false },
    lineColor: "#10B981", areaColor: "rgba(16,185,129,0.08)",
  },
  {
    key: "sales", label: "SALES", fullLabel: "Sales Conversion",
    unit: "%", target: 12, targetLabel: "12.0%",
    teamVals: {
      "D-1": [11.5, 11.2, 11.0, 10.8, 10.9, 10.9, 10.9],
      WTD:   [11.0, 11.1, 11.2, 11.3, 11.4, 11.3, 11.4],
      MTD:   [11.2, 11.4, 11.5, 11.6, 11.7, 11.6, 11.7],
      QTD:   [11.5, 11.6, 11.7, 11.8, 11.9, 11.8, 11.9],
    },
    teamAvg:    { "D-1": "10.9", WTD: "11.4", MTD: "11.7", QTD: "11.9" },
    displayVal: { "D-1": "10.9", WTD: "11.4", MTD: "11.7", QTD: "11.9" },
    delta:      { "D-1": "+4%", WTD: "+0.5pp", MTD: "+0.8pp", QTD: "+1.0pp" },
    deltaPos:   { "D-1": true,  WTD: true,     MTD: true,     QTD: true  },
    atRisk:     { "D-1": true,  WTD: true,     MTD: true,     QTD: true  },
    lineColor: "#F59E0B", areaColor: "rgba(245,158,11,0.08)",
  },
  {
    key: "adh", label: "ADH", fullLabel: "Adherence",
    unit: "%", target: 95, targetLabel: "95.0%",
    teamVals: {
      "D-1": [90.0, 89.5, 88.5, 88.0, 87.8, 87.5, 87.5],
      WTD:   [89.0, 89.5, 89.0, 89.2, 89.0, 89.0, 89.0],
      MTD:   [90.5, 90.2, 90.0, 90.5, 90.2, 90.0, 90.2],
      QTD:   [91.0, 91.2, 91.5, 91.4, 91.2, 91.4, 91.4],
    },
    teamAvg:    { "D-1": "87.5", WTD: "89.0", MTD: "90.2", QTD: "91.4" },
    displayVal: { "D-1": "87.5", WTD: "89.0", MTD: "90.2", QTD: "91.4" },
    delta:      { "D-1": "-3%", WTD: "+1.5pp", MTD: "+2.7pp", QTD: "+3.9pp" },
    deltaPos:   { "D-1": false, WTD: true,     MTD: true,     QTD: true  },
    atRisk:     { "D-1": true,  WTD: true,     MTD: true,     QTD: true  },
    lineColor: "#F59E0B", areaColor: "rgba(245,158,11,0.08)",
  },
];

// ---------------------------------------------------------------------------
// Team Status — per-agent, per-KPI values
// ---------------------------------------------------------------------------
const TEAM_STATUS: TeamStatusRow[] = [
  {
    name: "João Silva",
    kpiData: {
      csat:  { value: "81.0%", status: "At Risk"   },
      fcr:   { value: "73.0%", status: "At Risk"   },
      aht:   { value: "390s",  status: "On Target" },
      nps:   { value: "82",    status: "On Target" },
      sales: { value: "10.0%", status: "At Risk"   },
      adh:   { value: "92.0%", status: "On Target" },
    },
    agentTrend: {
      csat:  [82, 81, 80.5, 81, 80, 80.5, 81],
      fcr:   [75, 74, 73, 73.5, 73, 72.5, 73],
      aht:   [395, 392, 390, 388, 390, 391, 390],
      nps:   [80, 82, 83, 82, 82, 83, 82],
      sales: [10.5, 10.2, 10.0, 9.8, 10.0, 10.1, 10.0],
      adh:   [93, 92.5, 92, 92.5, 92, 91.5, 92],
    },
  },
  {
    name: "Maria Santos",
    kpiData: {
      csat:  { value: "88.0%", status: "On Target" },
      fcr:   { value: "80.0%", status: "On Target" },
      aht:   { value: "350s",  status: "On Target" },
      nps:   { value: "90",    status: "On Target" },
      sales: { value: "12.5%", status: "On Target" },
      adh:   { value: "96.0%", status: "On Target" },
    },
    agentTrend: {
      csat:  [87, 87.5, 88, 88.5, 88, 87.5, 88],
      fcr:   [79, 79.5, 80, 80.5, 80, 79.5, 80],
      aht:   [355, 352, 350, 348, 350, 351, 350],
      nps:   [89, 89.5, 90, 90.5, 90, 89.5, 90],
      sales: [12.2, 12.4, 12.5, 12.6, 12.5, 12.4, 12.5],
      adh:   [96, 95.5, 96, 96.5, 96, 95.5, 96],
    },
  },
  {
    name: "Carlos Mendes",
    kpiData: {
      csat:  { value: "82.0%", status: "At Risk"    },
      fcr:   { value: "76.0%", status: "At Risk"    },
      aht:   { value: "395s",  status: "On Target"  },
      nps:   { value: "84",    status: "On Target"  },
      sales: { value: "10.5%", status: "At Risk"    },
      adh:   { value: "88.0%", status: "At Risk"    },
    },
    agentTrend: {
      csat:  [83.5, 83, 82.5, 82, 82.5, 82, 82],
      fcr:   [77, 76.5, 76, 76.5, 76, 75.5, 76],
      aht:   [398, 396, 395, 394, 395, 396, 395],
      nps:   [85, 84.5, 84, 84.5, 84, 83.5, 84],
      sales: [11.0, 10.8, 10.5, 10.3, 10.5, 10.6, 10.5],
      adh:   [89, 88.5, 88, 88.5, 88, 87.5, 88],
    },
  },
  {
    name: "Ana Ferreira",
    kpiData: {
      csat:  { value: "85.0%", status: "On Target" },
      fcr:   { value: "79.0%", status: "On Target" },
      aht:   { value: "360s",  status: "On Target" },
      nps:   { value: "88",    status: "On Target" },
      sales: { value: "12.2%", status: "On Target" },
      adh:   { value: "95.0%", status: "On Target" },
    },
    agentTrend: {
      csat:  [85.5, 85, 85, 85.5, 85, 84.5, 85],
      fcr:   [79, 78.5, 79, 79.5, 79, 78.5, 79],
      aht:   [362, 361, 360, 359, 360, 361, 360],
      nps:   [88, 87.5, 88, 88.5, 88, 87.5, 88],
      sales: [12.0, 12.1, 12.2, 12.3, 12.2, 12.1, 12.2],
      adh:   [95, 94.5, 95, 95.5, 95, 94.5, 95],
    },
  },
  {
    name: "Pedro Costa",
    kpiData: {
      csat:  { value: "79.0%", status: "Off Target" },
      fcr:   { value: "74.0%", status: "At Risk"    },
      aht:   { value: "415s",  status: "On Target"  },
      nps:   { value: "80",    status: "On Target"  },
      sales: { value: "11.0%", status: "At Risk"    },
      adh:   { value: "93.0%", status: "On Target"  },
    },
    agentTrend: {
      csat:  [81, 80, 79.5, 79, 79.5, 79, 79],
      fcr:   [75, 74.5, 74, 74.5, 74, 73.5, 74],
      aht:   [420, 418, 415, 413, 415, 416, 415],
      nps:   [81, 80.5, 80, 80.5, 80, 79.5, 80],
      sales: [11.5, 11.2, 11.0, 10.8, 11.0, 11.1, 11.0],
      adh:   [94, 93.5, 93, 93.5, 93, 92.5, 93],
    },
  },
  {
    name: "Sofia Rodrigues",
    kpiData: {
      csat:  { value: "87.0%", status: "On Target" },
      fcr:   { value: "80.5%", status: "On Target" },
      aht:   { value: "352s",  status: "On Target" },
      nps:   { value: "91",    status: "On Target" },
      sales: { value: "12.8%", status: "On Target" },
      adh:   { value: "96.5%", status: "On Target" },
    },
    agentTrend: {
      csat:  [86.5, 87, 87, 87.5, 87, 86.5, 87],
      fcr:   [80, 80.5, 80.5, 81, 80.5, 80, 80.5],
      aht:   [355, 354, 353, 352, 353, 353, 352],
      nps:   [90.5, 91, 91, 91.5, 91, 90.5, 91],
      sales: [12.5, 12.6, 12.8, 12.9, 12.8, 12.7, 12.8],
      adh:   [96.5, 96, 96.5, 97, 96.5, 96, 96.5],
    },
  },
  {
    name: "Ricardo Nunes",
    kpiData: {
      csat:  { value: "84.0%", status: "At Risk"   },
      fcr:   { value: "77.0%", status: "At Risk"   },
      aht:   { value: "375s",  status: "On Target" },
      nps:   { value: "86",    status: "On Target" },
      sales: { value: "11.8%", status: "On Target" },
      adh:   { value: "85.0%", status: "At Risk"   },
    },
    agentTrend: {
      csat:  [85, 84.5, 84, 84.5, 84, 83.5, 84],
      fcr:   [78, 77.5, 77, 77.5, 77, 76.5, 77],
      aht:   [378, 377, 376, 375, 376, 376, 375],
      nps:   [87, 86.5, 86, 86.5, 86, 85.5, 86],
      sales: [12.0, 11.9, 11.8, 11.9, 11.8, 11.7, 11.8],
      adh:   [86, 85.5, 85, 85.5, 85, 84.5, 85],
    },
  },
  {
    name: "Beatriz Lopes",
    kpiData: {
      csat:  { value: "89.0%", status: "On Target" },
      fcr:   { value: "81.0%", status: "On Target" },
      aht:   { value: "340s",  status: "On Target" },
      nps:   { value: "92",    status: "On Target" },
      sales: { value: "13.0%", status: "On Target" },
      adh:   { value: "97.0%", status: "On Target" },
    },
    agentTrend: {
      csat:  [88.5, 89, 89, 89.5, 89, 88.5, 89],
      fcr:   [80.5, 81, 81, 81.5, 81, 80.5, 81],
      aht:   [343, 342, 341, 340, 341, 341, 340],
      nps:   [91.5, 92, 92, 92.5, 92, 91.5, 92],
      sales: [12.8, 12.9, 13.0, 13.1, 13.0, 12.9, 13.0],
      adh:   [97, 96.5, 97, 97.5, 97, 96.5, 97],
    },
  },
];

// ---------------------------------------------------------------------------
// Static data unchanged
// ---------------------------------------------------------------------------
const TOPICS: Record<Period, Topic[]> = {
  "D-1": [
    { rank:1, agent:"Pedro Costa",   tag:"AHT",        tagColor:"bg-warning-light text-warning", body:"System Navigation Silence Time elevated — 42% of AHT is hold/silence" },
    { rank:2, agent:"João Silva",    tag:"Sales",      tagColor:"bg-danger-light text-danger",   body:"Low closing technique — sales pitch attempted on only 35% of eligible calls" },
    { rank:3, agent:"Carlos Mendes", tag:"Attendance", tagColor:"bg-warning-light text-warning", body:"3 unplanned absences in last 2 weeks. Absenteeism rate: 12%" },
    { rank:4, agent:"Ricardo Nunes", tag:"Adh",        tagColor:"bg-warning-light text-warning", body:"" },
  ],
  WTD: [
    { rank:1, agent:"Pedro Godinho", tag:"AHT",           tagColor:"bg-danger-light text-danger",   body:"Weekly AHT 17.8% above target, no improvement vs previous week." },
    { rank:2, agent:"Denzel Melo",   tag:"Gross absence", tagColor:"bg-warning-light text-warning", body:"Cumulative weekly absence at 28.1%, more than double the 6% target." },
  ],
  MTD: [
    { rank:1, agent:"Martinho Wambembe", tag:"Gross absence", tagColor:"bg-danger-light text-danger", body:"Monthly gross absence at 32.5% vs 11.55% team average (+20.95pp)." },
    { rank:2, agent:"Toufiq Hossain",    tag:"Gross absence", tagColor:"bg-danger-light text-danger", body:"Alternating pattern raises the monthly average to 55.56% vs 11.55% team average." },
  ],
  QTD: [
    { rank:1, agent:"Martinho Wambembe", tag:"Gross absence", tagColor:"bg-danger-light text-danger", body:"Steadily worsening quarterly absence trend, now at 30.8% vs 11.55% team average." },
  ],
};

const MEMBERS: MemberRow[] = [
  { initials:"JS", name:"João Silva",      kpiScores:[{label:"FCR: 73.0%",color:"text-danger"}],                                                              allOnTarget:false, outlier:true,  trend:"— Stable",    trendIcon:"",  pending:"2 activities", pendingAlert:true  },
  { initials:"MS", name:"Maria Santos",    kpiScores:[],                                                                                                      allOnTarget:true,  outlier:false, trend:"↗ Improving", trendIcon:"↗", pending:"None",         pendingAlert:false },
  { initials:"CM", name:"Carlos Mendes",   kpiScores:[{label:"Sales: 10.5%",color:"text-danger"},{label:"Adh: 88.0%",color:"text-danger"}],                   allOnTarget:false, outlier:true,  trend:"— Stable",    trendIcon:"",  pending:"2 activities", pendingAlert:true  },
  { initials:"AF", name:"Ana Ferreira",    kpiScores:[],                                                                                                      allOnTarget:true,  outlier:false, trend:"— Stable",    trendIcon:"",  pending:"None",         pendingAlert:false },
  { initials:"PC", name:"Pedro Costa",     kpiScores:[{label:"CSAT: 79.0%",color:"text-danger"}],                                                            allOnTarget:false, outlier:true,  trend:"— Stable",    trendIcon:"",  pending:"None",         pendingAlert:false },
  { initials:"SR", name:"Sofia Rodrigues", kpiScores:[],                                                                                                      allOnTarget:true,  outlier:false, trend:"— Stable",    trendIcon:"",  pending:"None",         pendingAlert:false },
  { initials:"RN", name:"Ricardo Nunes",   kpiScores:[{label:"Adh: 85.0%",color:"text-danger"}],                                                             allOnTarget:false, outlier:true,  trend:"— Stable",    trendIcon:"",  pending:"None",         pendingAlert:false },
  { initials:"BL", name:"Beatriz Lopes",   kpiScores:[],                                                                                                      allOnTarget:true,  outlier:false, trend:"— Stable",    trendIcon:"",  pending:"1 activity",   pendingAlert:true  },
];

// ---------------------------------------------------------------------------
// Interactive KPI Trend Chart
// ---------------------------------------------------------------------------
const DATES = ["Jun 18","Jun 19","Jun 20","Jun 21","Jun 22","Jun 23","Jun 24"];

function KpiTrendChart({
  kpiDef, period, agentRow,
}: {
  kpiDef: KpiDef; period: Period; agentRow: TeamStatusRow | null;
}) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; idx: number } | null>(null);

  const W = 620; const H = 200;
  const PL = 44; const PR = 60; const PT = 16; const PB = 28;

  const teamVals  = kpiDef.teamVals[period];
  const agentVals = agentRow ? agentRow.agentTrend[kpiDef.key] : null;
  const target    = kpiDef.target;

  // Y scale: fit both team + agent + target
  const allVals = [...teamVals, ...(agentVals ?? []), target];
  const minY = Math.min(...allVals) * (kpiDef.unit === "s" ? 0.95 : 0.97);
  const maxY = Math.max(...allVals) * (kpiDef.unit === "s" ? 1.05 : 1.03);
  const rangeY = maxY - minY || 1;

  const toX = (i: number) => PL + (i / (DATES.length - 1)) * (W - PL - PR);
  const toY = (v: number) => PT + (1 - (v - minY) / rangeY) * (H - PT - PB);

  // Y axis labels — 5 evenly spaced
  const yLabels = Array.from({ length: 5 }, (_, i) => {
    const v = minY + (i / 4) * (maxY - minY);
    return Math.round(v * 10) / 10;
  }).reverse();

  const teamPath  = teamVals.map((v, i)  => `${i===0?"M":"L"} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(" ");
  const agentPath = agentVals ? agentVals.map((v, i) => `${i===0?"M":"L"} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(" ") : null;
  const targetY   = toY(target);

  // Area fill under agent line (when agent selected) else team
  const mainPath  = agentPath ?? teamPath;
  const mainColor = agentRow ? kpiDef.lineColor : kpiDef.lineColor;
  const areaPath  = `${mainPath} L ${toX(DATES.length-1).toFixed(1)} ${H-PB} L ${toX(0).toFixed(1)} ${H-PB} Z`;

  const fmt = (v: number) => kpiDef.unit === "s" ? `${Math.round(v)}` : `${Math.round(v*10)/10}`;

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full block"
        style={{ height: 200 }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Y grid + labels */}
        {yLabels.map((v, i) => (
          <g key={i}>
            <line x1={PL} y1={toY(v)} x2={W - PR} y2={toY(v)} stroke="#F3F4F6" strokeWidth="1" />
            <text x={PL - 4} y={toY(v) + 4} textAnchor="end" fontSize="10" fill="#9CA3AF" fontFamily="Inter,system-ui,sans-serif">
              {fmt(v)}
            </text>
          </g>
        ))}

        {/* Target dashed line */}
        <line x1={PL} y1={targetY} x2={W - PR} y2={targetY} stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="5 4" />
        <text x={W - PR + 4} y={targetY + 4} fontSize="10" fill="#374151" fontFamily="Inter,system-ui,sans-serif" fontWeight="600">TARGET</text>

        {/* Team line — dashed grey when agent is selected */}
        {agentRow ? (
          <path d={teamPath} fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="4 3" strokeLinejoin="round" />
        ) : (
          <>
            <path d={areaPath} fill={kpiDef.areaColor} />
            <path d={teamPath} fill="none" stroke={mainColor} strokeWidth="2" strokeLinejoin="round" />
          </>
        )}

        {/* Agent line — solid colored when selected */}
        {agentPath && (
          <>
            <path d={areaPath} fill={kpiDef.areaColor} />
            <path d={agentPath} fill="none" stroke={mainColor} strokeWidth="2" strokeLinejoin="round" />
          </>
        )}

        {/* X labels */}
        {DATES.map((d, i) => (
          <text key={d} x={toX(i)} y={H - 4} textAnchor="middle" fontSize="10" fill="#9CA3AF" fontFamily="Inter,system-ui,sans-serif">{d}</text>
        ))}

        {/* Hover overlay — invisible rects per column */}
        {DATES.map((_, i) => (
          <rect
            key={i}
            x={toX(i) - (W - PL - PR) / (DATES.length - 1) / 2}
            y={PT}
            width={(W - PL - PR) / (DATES.length - 1)}
            height={H - PT - PB}
            fill="transparent"
            onMouseEnter={() => {
              const ax = agentVals ? agentVals[i] : null;
              setTooltip({ x: toX(i), y: ax ? toY(ax) : toY(teamVals[i]), idx: i });
            }}
          />
        ))}

        {/* Tooltip crosshair + dots */}
        {tooltip && (
          <g>
            <line x1={toX(tooltip.idx)} y1={PT} x2={toX(tooltip.idx)} y2={H - PB} stroke="#9CA3AF" strokeWidth="1" strokeDasharray="3 2" />
            {agentVals && (
              <circle cx={toX(tooltip.idx)} cy={toY(agentVals[tooltip.idx])} r="4" fill={mainColor} />
            )}
            <circle cx={toX(tooltip.idx)} cy={toY(teamVals[tooltip.idx])} r="4" fill={agentRow ? "#9CA3AF" : mainColor} />
          </g>
        )}
      </svg>

      {/* Tooltip card */}
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: Math.min(toX(tooltip.idx) / 620 * 100, 65) + "%",
            top: "20%",
            background: "#1F2937",
            color: "#fff",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 12,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 10,
            boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          }}
        >
          <p style={{ margin: 0, fontWeight: 700, fontSize: 11, color: "#9CA3AF", letterSpacing: "0.05em", marginBottom: 6 }}>
            {DATES[tooltip.idx].toUpperCase()}
          </p>
          {agentRow && agentVals && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: mainColor, display: "inline-block" }} />
              <span>{agentRow.name}</span>
              <span style={{ marginLeft: "auto", fontWeight: 700, paddingLeft: 16 }}>
                {fmt(agentVals[tooltip.idx])}{kpiDef.unit}
              </span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: agentRow ? "#9CA3AF" : mainColor, display: "inline-block" }} />
            <span>Team</span>
            <span style={{ marginLeft: "auto", fontWeight: 700, paddingLeft: 16 }}>
              {fmt(teamVals[tooltip.idx])}{kpiDef.unit}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function TeamOverviewPage() {
  const { period } = usePeriod();
  const [topicTab, setTopicTab]       = useState<TopicTab>("top5");
  const [selectedKpiKey, setSelectedKpiKey] = useState<string>("csat");
  const [selectedAgent, setSelectedAgent]   = useState<string | null>(null);

  const topics = TOPICS[period];
  const activeKpi = KPIS.find((k) => k.key === selectedKpiKey) ?? KPIS[0];
  const agentRow  = selectedAgent ? TEAM_STATUS.find((r) => r.name === selectedAgent) ?? null : null;

  const handleKpiClick = (key: string) => {
    setSelectedKpiKey(key);
    // Keep agent selected — chart will just update KPI
  };
  const handleAgentClick = (name: string) => {
    setSelectedAgent((prev) => (prev === name ? null : name));
  };

  // Legend items for chart
  const legendItems = [
    ...(agentRow ? [{ label: agentRow.name, color: activeKpi.lineColor, dashed: false }] : []),
    { label: "Team", color: agentRow ? "#9CA3AF" : activeKpi.lineColor, dashed: agentRow ? true : false },
    { label: "Target", color: "#D1D5DB", dashed: true },
  ];

  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <GlobalHeader />

        <main className="flex-1 font-sans text-text-primary overflow-x-hidden px-8 py-6">

          {/* ── Page header ─────────────────────────────────────── */}
          <div className="mb-5">
            <h1 className="text-2xl font-semibold m-0 mb-1">Performance Dashboard</h1>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <span>Team performance overview — Wednesday 24 June</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="10" rx="1.5" stroke="#9CA3AF" strokeWidth="1.1"/><path d="M4 1v2M9 1v2" stroke="#9CA3AF" strokeWidth="1.1" strokeLinecap="round"/><path d="M1 5h11" stroke="#9CA3AF" strokeWidth="1.1"/></svg>
                Daily (D1): 23 Jun
              </span>
            </div>
          </div>

          {/* ── KPI cards — clickable to switch chart ───────────── */}
          {/* UX writing helper */}
          <p className="text-[11px] text-text-tertiary mb-2 m-0">
            {selectedAgent
              ? <>Showing KPIs for <span className="font-semibold text-text-primary">{selectedAgent}</span> · <button onClick={() => setSelectedAgent(null)} className="underline hover:text-text-primary transition-colors">Back to team view</button></>
              : "Click a KPI card to focus the trend chart. Select an agent in Team Status to compare individually."}
          </p>
          <div className="grid grid-cols-6 gap-3 mb-5">
            {KPIS.map((k) => {
              const isActive   = k.key === selectedKpiKey;
              const agentKpi   = agentRow?.kpiData[k.key];
              const displayVal = agentKpi ? agentKpi.value : `${k.displayVal[period]}${k.unit}`;
              const valColor   = k.atRisk[period] ? "text-warning" : "text-success";
              const deltaColor = k.deltaPos[period] === false ? "text-danger" : k.deltaPos[period] === true ? "text-success" : "text-text-tertiary";

              return (
                <div
                  key={k.key}
                  onClick={() => handleKpiClick(k.key)}
                  className="bg-surface border rounded-lg p-3 cursor-pointer transition-all"
                  style={{
                    borderColor: isActive ? k.lineColor : "#E5E7EB",
                    borderWidth: isActive ? 2 : 1,
                    boxShadow: isActive ? `0 0 0 3px ${k.areaColor}` : "none",
                  }}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wide">{k.label}</span>
                    {k.atRisk[period] && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-warning-light text-warning whitespace-nowrap leading-tight">AT RISK</span>
                    )}
                  </div>
                  <p className={`text-[22px] font-bold leading-tight m-0 mt-0.5 ${valColor}`}>
                    {displayVal.replace(k.unit, "")}<span className="text-sm font-normal text-text-secondary">{k.unit}</span>
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px] text-text-tertiary flex items-center gap-0.5">
                      <span style={{fontSize:10}}>⊙</span> Target {k.targetLabel}
                    </span>
                    <span className={`text-[11px] font-medium ${deltaColor}`}>{k.delta[period]}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── KPI Trends + Team Status ─────────────────────────── */}
          <div className="grid gap-4 mb-6" style={{gridTemplateColumns:"1fr 300px"}}>

            {/* KPI Trends */}
            <div className="bg-surface border border-border rounded-xl p-5">
              {/* Header with chip */}
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><polyline points="1,12 5,7 9,9 14,3" stroke="#F5C800" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/></svg>
                <span className="text-sm font-semibold text-text-primary">
                  KPI Trends — {activeKpi.fullLabel}
                </span>
                {selectedAgent && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border"
                    style={{ background: activeKpi.areaColor, color: activeKpi.lineColor, borderColor: activeKpi.lineColor + "40" }}
                  >
                    {selectedAgent}
                    <button onClick={() => setSelectedAgent(null)} className="ml-0.5 leading-none hover:opacity-70">×</button>
                  </span>
                )}
              </div>
              <p className="text-xs text-text-tertiary mb-3 m-0">Daily trend</p>

              {/* Legend */}
              <div className="flex items-center gap-4 mb-2 justify-end">
                {legendItems.map((l) => (
                  <span key={l.label} className="flex items-center gap-1.5 text-xs text-text-secondary">
                    {l.dashed
                      ? <span style={{width:20,height:0,display:"inline-block",borderTop:`2px dashed ${l.color}`}}/>
                      : <span style={{width:20,height:2,background:l.color,display:"inline-block",borderRadius:2}}/>
                    }
                    {l.label}
                  </span>
                ))}
              </div>

              <KpiTrendChart kpiDef={activeKpi} period={period} agentRow={agentRow} />

              {!selectedAgent && (
                <p className="text-[11px] text-text-tertiary mt-3 m-0 leading-relaxed border-t border-border pt-3">
                  Select an agent from <span className="font-medium text-text-secondary">Team Status</span> to compare their individual trend against the team.
                </p>
              )}
            </div>

            {/* Team Status — updates title + values to match selected KPI */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="4" r="2" stroke="#6B7280" strokeWidth="1.2"/><path d="M1 11c0-2 1.79-3.5 4-3.5s4 1.5 4 3.5" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round"/><circle cx="10.5" cy="4.5" r="1.5" stroke="#6B7280" strokeWidth="1.2"/><path d="M10.5 8c1.38 0 2.5 1.12 2.5 2.5" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <span className="text-sm font-semibold text-text-primary">
                  Team Status — {activeKpi.label}
                </span>
              </div>
              {/* UX writing helper */}
              <p className="text-[11px] text-text-tertiary px-4 pt-2.5 pb-1 m-0">
                Select an agent to update the chart and KPI cards.
              </p>
              <div className="divide-y divide-border">
                {TEAM_STATUS.map((row) => {
                  const isSelected = selectedAgent === row.name;
                  const kd = row.kpiData[selectedKpiKey];
                  const valColor =
                    kd.status === "On Target"  ? "text-success" :
                    kd.status === "Off Target" ? "text-danger"  : "text-warning";
                  const badgeCls =
                    kd.status === "On Target"  ? "bg-success-light text-success" :
                    kd.status === "Off Target" ? "bg-danger-light text-danger"   :
                    "bg-warning-light text-warning";
                  return (
                    <div
                      key={row.name}
                      onClick={() => handleAgentClick(row.name)}
                      className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors border-l-2 ${
                        isSelected
                          ? "bg-brand-light border-brand"
                          : "hover:bg-surface-muted border-transparent"
                      }`}
                    >
                      <span className={`text-sm ${isSelected ? "font-semibold text-brand" : "text-text-primary"}`}>
                        {row.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${valColor}`}>{kd.value}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${badgeCls}`}>
                          {kd.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Team Members — Last 30 Days ───────────────────────── */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden mb-8">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="text-sm font-semibold text-text-primary">Team Members — Last 30 Days</span>
              <span className="text-xs text-text-tertiary">8 agents</span>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-2.5 text-[11px] font-medium text-text-tertiary uppercase tracking-wide">Agent</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-medium text-text-tertiary uppercase tracking-wide">KPI Score</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-medium text-text-tertiary uppercase tracking-wide">Outlier</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-medium text-text-tertiary uppercase tracking-wide">Trend</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-medium text-text-tertiary uppercase tracking-wide">Pending Activities</th>
                </tr>
              </thead>
              <tbody>
                {MEMBERS.map((m) => (
                  <tr key={m.name} className="border-b border-border last:border-b-0 hover:bg-surface-muted transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{background:"#DBEAFE",color:"#1E40AF"}}>{m.initials}</span>
                        <span className="text-sm font-medium text-text-primary">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {m.allOnTarget
                        ? <span className="text-sm font-medium text-success">All on target</span>
                        : <div className="flex items-center gap-1.5 flex-wrap">{m.kpiScores.map((s) => <span key={s.label} className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.color==="text-danger"?"bg-danger-light text-danger":"bg-warning-light text-warning"}`}>{s.label}</span>)}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {m.outlier
                        ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-danger-light text-danger"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1L9 9H1L5 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>Outlier</span>
                        : <span className="text-[11px] font-medium text-text-tertiary px-2 py-0.5 rounded-full bg-surface-muted">Normal</span>}
                    </td>
                    <td className="px-4 py-3"><span className={`text-sm ${m.trendIcon==="↗"?"text-success":"text-text-secondary"}`}>{m.trend}</span></td>
                    <td className="px-4 py-3">
                      {m.pendingAlert
                        ? <span className="flex items-center gap-1.5 text-sm text-warning font-medium"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="#F59E0B" strokeWidth="1.2"/><path d="M6.5 4v3" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round"/><circle cx="6.5" cy="9" r="0.6" fill="#F59E0B"/></svg>{m.pending}</span>
                        : <span className="text-sm text-text-tertiary">{m.pending}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          {/* ── Your Key Topics ──────────────────────────────────── */}
          <div className="bg-surface border border-border rounded-xl mb-5 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><polyline points="1,12 5,7 9,9 14,3" stroke="#F5C800" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/></svg>
              <span className="text-sm font-semibold text-text-primary">Your Key Topics</span>
            </div>
            <div className="flex border-b border-border">
              {([["top5","Top 5 Facts","4",false],["overdue","Overdue","8",true],["upcoming","Upcoming","5",false]] as const).map(([k,label,count,danger]) => (
                <button key={k} onClick={() => setTopicTab(k)}
                  className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                    topicTab===k ? "border-brand text-brand bg-surface" : "border-transparent text-text-secondary hover:text-text-primary bg-surface-muted"
                  }`}>
                  {label}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${danger ? "bg-danger text-white" : "bg-border text-text-secondary"}`}>{count}</span>
                </button>
              ))}
            </div>
            <div>
              {topics.map((t) => (
                <div key={t.rank} className="flex items-start gap-4 px-5 py-3.5 border-b border-border last:border-b-0 hover:bg-surface-muted transition-colors">
                  <span className="text-sm font-semibold text-text-tertiary min-w-[24px]">#{t.rank}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-text-primary">{t.agent}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${t.tagColor}`}>{t.tag}</span>
                    </div>
                    {t.body && <p className="text-sm text-text-secondary m-0 mt-0.5">{t.body}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>


        </main>
      </div>
    </div>
  );
}
