"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { GlobalHeader, usePeriod, type Period } from "@/components/Header";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type KpiCard = {
  key: string; label: string; value: string; unit: string;
  target: string; delta: string; atRisk: boolean; deltaPos: boolean | null;
};

type AgentStatus = "At Risk" | "On Target" | "Off Target";

type TeamStatusRow = {
  name: string; value: string; status: AgentStatus;
};

type TopicTab = "top5" | "overdue" | "upcoming";

type Topic = {
  rank: number; agent: string;
  tag: string; tagColor: string; // tailwind bg+text combo
  body: string;
};

type MemberRow = {
  initials: string; name: string;
  kpiScores: { label: string; color: string }[]; // e.g. [{label:"FCR: 73.0%", color:"text-danger"}]
  allOnTarget: boolean;
  outlier: boolean;
  trend: string; trendIcon: string; // "— Stable" / "↗ Improving"
  pending: string; pendingAlert: boolean;
};

// ---------------------------------------------------------------------------
// Data — D-1 (main view matching screenshot exactly)
// ---------------------------------------------------------------------------
const KPI_CARDS: Record<Period, KpiCard[]> = {
  "D-1": [
    { key:"csat",  label:"CSAT",  value:"83.1", unit:"%", target:"85.0%", delta:"0%",   atRisk:true,  deltaPos:null  },
    { key:"fcr",   label:"FCR",   value:"75.5", unit:"%", target:"78.0%", delta:"-1%",  atRisk:true,  deltaPos:false },
    { key:"aht",   label:"AHT",   value:"378",  unit:"s", target:"420",   delta:"+4%",  atRisk:false, deltaPos:true  },
    { key:"nps",   label:"NPS",   value:"87",   unit:"",  target:"45",    delta:"0%",   atRisk:false, deltaPos:null  },
    { key:"sales", label:"SALES", value:"10.9", unit:"%", target:"12.0%", delta:"+4%",  atRisk:true,  deltaPos:true  },
    { key:"adh",   label:"ADH",   value:"87.5", unit:"%", target:"95.0%", delta:"-3%",  atRisk:true,  deltaPos:false },
  ],
  WTD: [
    { key:"csat",  label:"CSAT",  value:"84.0", unit:"%", target:"85.0%", delta:"+0.9pp", atRisk:true,  deltaPos:true  },
    { key:"fcr",   label:"FCR",   value:"76.8", unit:"%", target:"78.0%", delta:"-1.2pp", atRisk:true,  deltaPos:false },
    { key:"aht",   label:"AHT",   value:"365",  unit:"s", target:"420",   delta:"+13s",   atRisk:false, deltaPos:true  },
    { key:"nps",   label:"NPS",   value:"84",   unit:"",  target:"45",    delta:"-3",     atRisk:false, deltaPos:false },
    { key:"sales", label:"SALES", value:"11.4", unit:"%", target:"12.0%", delta:"+0.5pp", atRisk:true,  deltaPos:true  },
    { key:"adh",   label:"ADH",   value:"89.0", unit:"%", target:"95.0%", delta:"+1.5pp", atRisk:true,  deltaPos:true  },
  ],
  MTD: [
    { key:"csat",  label:"CSAT",  value:"84.6", unit:"%", target:"85.0%", delta:"+1.5pp", atRisk:true,  deltaPos:true  },
    { key:"fcr",   label:"FCR",   value:"78.2", unit:"%", target:"78.0%", delta:"+0.2pp", atRisk:false, deltaPos:true  },
    { key:"aht",   label:"AHT",   value:"358",  unit:"s", target:"420",   delta:"+20s",   atRisk:false, deltaPos:true  },
    { key:"nps",   label:"NPS",   value:"81",   unit:"",  target:"45",    delta:"-6",     atRisk:false, deltaPos:false },
    { key:"sales", label:"SALES", value:"11.7", unit:"%", target:"12.0%", delta:"+0.8pp", atRisk:true,  deltaPos:true  },
    { key:"adh",   label:"ADH",   value:"90.2", unit:"%", target:"95.0%", delta:"+2.7pp", atRisk:true,  deltaPos:true  },
  ],
  QTD: [
    { key:"csat",  label:"CSAT",  value:"85.1", unit:"%", target:"85.0%", delta:"+2.0pp", atRisk:false, deltaPos:true  },
    { key:"fcr",   label:"FCR",   value:"79.0", unit:"%", target:"78.0%", delta:"+1.0pp", atRisk:false, deltaPos:true  },
    { key:"aht",   label:"AHT",   value:"350",  unit:"s", target:"420",   delta:"+28s",   atRisk:false, deltaPos:true  },
    { key:"nps",   label:"NPS",   value:"78",   unit:"",  target:"45",    delta:"-9",     atRisk:false, deltaPos:false },
    { key:"sales", label:"SALES", value:"11.9", unit:"%", target:"12.0%", delta:"+1.0pp", atRisk:true,  deltaPos:true  },
    { key:"adh",   label:"ADH",   value:"91.4", unit:"%", target:"95.0%", delta:"+3.9pp", atRisk:true,  deltaPos:true  },
  ],
};

// Team Status sidebar (right panel, CSAT values)
const TEAM_STATUS: TeamStatusRow[] = [
  { name:"João Silva",      value:"81.0%", status:"At Risk"    },
  { name:"Maria Santos",    value:"88.0%", status:"On Target"  },
  { name:"Carlos Mendes",   value:"82.0%", status:"At Risk"    },
  { name:"Ana Ferreira",    value:"85.0%", status:"On Target"  },
  { name:"Pedro Costa",     value:"79.0%", status:"Off Target" },
  { name:"Sofia Rodrigues", value:"87.0%", status:"On Target"  },
  { name:"Ricardo Nunes",   value:"84.0%", status:"At Risk"    },
  { name:"Beatriz Lopes",   value:"89.0%", status:"On Target"  },
];

// Topics data
const TOPICS: Record<Period, Topic[]> = {
  "D-1": [
    { rank:1, agent:"Pedro Costa",   tag:"AHT",        tagColor:"bg-warning-light text-warning", body:"System Navigation Silence Time elevated — 42% of AHT is hold/silence" },
    { rank:2, agent:"João Silva",    tag:"Sales",      tagColor:"bg-danger-light text-danger",   body:"Low closing technique — sales pitch attempted on only 35% of eligible calls" },
    { rank:3, agent:"Carlos Mendes", tag:"Attendance", tagColor:"bg-warning-light text-warning", body:"3 unplanned absences in last 2 weeks. Absenteeism rate: 12%" },
    { rank:4, agent:"Ricardo Nunes", tag:"Adh",        tagColor:"bg-warning-light text-warning", body:"" },
  ],
  WTD: [
    { rank:1, agent:"Pedro Godinho", tag:"AHT",          tagColor:"bg-danger-light text-danger",   body:"Weekly AHT 17.8% above target, no improvement vs previous week." },
    { rank:2, agent:"Denzel Melo",   tag:"Gross absence", tagColor:"bg-warning-light text-warning", body:"Cumulative weekly absence at 28.1%, more than double the 6% target." },
  ],
  MTD: [
    { rank:1, agent:"Martinho Wambembe", tag:"Gross absence", tagColor:"bg-danger-light text-danger",   body:"Monthly gross absence at 32.5% vs 11.55% team average (+20.95pp)." },
    { rank:2, agent:"Toufiq Hossain",    tag:"Gross absence", tagColor:"bg-danger-light text-danger",   body:"Alternating pattern raises the monthly average to 55.56% vs 11.55% team average." },
  ],
  QTD: [
    { rank:1, agent:"Martinho Wambembe", tag:"Gross absence", tagColor:"bg-danger-light text-danger",   body:"Steadily worsening quarterly absence trend, now at 30.8% vs 11.55% team average." },
  ],
};

// Team Members table (Last 30 Days) — matches screenshot exactly
const MEMBERS: MemberRow[] = [
  { initials:"JS", name:"João Silva",      kpiScores:[{label:"FCR: 73.0%", color:"text-danger"}],                            allOnTarget:false, outlier:true,  trend:"— Stable",   trendIcon:"",  pending:"2 activities", pendingAlert:true  },
  { initials:"MS", name:"Maria Santos",    kpiScores:[],                                                                     allOnTarget:true,  outlier:false, trend:"↗ Improving", trendIcon:"↗", pending:"None",         pendingAlert:false },
  { initials:"CM", name:"Carlos Mendes",   kpiScores:[{label:"Sales: 10.5%", color:"text-danger"},{label:"Adh: 88.0%", color:"text-danger"}], allOnTarget:false, outlier:true,  trend:"— Stable",   trendIcon:"",  pending:"2 activities", pendingAlert:true  },
  { initials:"AF", name:"Ana Ferreira",    kpiScores:[],                                                                     allOnTarget:true,  outlier:false, trend:"— Stable",   trendIcon:"",  pending:"None",         pendingAlert:false },
  { initials:"PC", name:"Pedro Costa",     kpiScores:[{label:"CSAT: 79.0%", color:"text-danger"}],                          allOnTarget:false, outlier:true,  trend:"— Stable",   trendIcon:"",  pending:"None",         pendingAlert:false },
  { initials:"SR", name:"Sofia Rodrigues", kpiScores:[],                                                                     allOnTarget:true,  outlier:false, trend:"— Stable",   trendIcon:"",  pending:"None",         pendingAlert:false },
  { initials:"RN", name:"Ricardo Nunes",   kpiScores:[{label:"Adh: 85.0%", color:"text-danger"}],                           allOnTarget:false, outlier:true,  trend:"— Stable",   trendIcon:"",  pending:"None",         pendingAlert:false },
  { initials:"BL", name:"Beatriz Lopes",   kpiScores:[],                                                                     allOnTarget:true,  outlier:false, trend:"— Stable",   trendIcon:"",  pending:"1 activity",   pendingAlert:true  },
];

// ---------------------------------------------------------------------------
// KPI Trend SVG — matches original: smooth curve, Y axis labels, X date labels,
// target dashed line, Team solid green + dashed grey
// ---------------------------------------------------------------------------
function KpiTrendChart() {
  const W = 620; const H = 200;
  const PL = 44; const PR = 16; const PT = 16; const PB = 28;

  // Approximate the curve from the screenshot (Jun 18–24, CSAT daily trend)
  const dates = ["Jun 18","Jun 19","Jun 20","Jun 21","Jun 22","Jun 23","Jun 24"];
  const teamVals = [88.0, 86.5, 84.8, 83.0, 82.5, 83.5, 84.1];
  const targetVal = 85.0;

  const yLabels = [91.8, 88.0, 84.1, 80.1, 76.1];
  const minY = 75.0; const maxY = 93.0; const rangeY = maxY - minY;

  const toX = (i: number) => PL + (i / (dates.length - 1)) * (W - PL - PR);
  const toY = (v: number) => PT + (1 - (v - minY) / rangeY) * (H - PT - PB);

  const teamPath = teamVals.map((v,i) => `${i===0?"M":"L"} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(" ");
  const targetY  = toY(targetVal);

  // Smooth area under team line
  const areaPath = `${teamPath} L ${toX(teamVals.length-1).toFixed(1)} ${H-PB} L ${toX(0).toFixed(1)} ${H-PB} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" style={{height:200}}>
      {/* Y grid lines */}
      {yLabels.map(v => (
        <g key={v}>
          <line x1={PL} y1={toY(v)} x2={W-PR} y2={toY(v)} stroke="#F3F4F6" strokeWidth="1"/>
          <text x={PL-4} y={toY(v)+4} textAnchor="end" fontSize="10" fill="#9CA3AF" fontFamily="Inter,system-ui,sans-serif">{v}</text>
        </g>
      ))}
      {/* Target dashed line */}
      <line x1={PL} y1={targetY} x2={W-PR} y2={targetY} stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="5 4"/>
      <text x={W-PR+2} y={targetY+4} fontSize="10" fill="#374151" fontFamily="Inter,system-ui,sans-serif" fontWeight="600">TARGET</text>
      {/* Area fill */}
      <path d={areaPath} fill="rgba(16,185,129,0.08)"/>
      {/* Team line */}
      <path d={teamPath} fill="none" stroke="#10B981" strokeWidth="2" strokeLinejoin="round"/>
      {/* X date labels */}
      {dates.map((d,i) => (
        <text key={d} x={toX(i)} y={H-4} textAnchor="middle" fontSize="10" fill="#9CA3AF" fontFamily="Inter,system-ui,sans-serif">{d}</text>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function TeamOverviewPage() {
  const { period } = usePeriod();
  const [topicTab, setTopicTab] = useState<TopicTab>("top5");

  const kpis   = KPI_CARDS[period];
  const topics = TOPICS[period];

  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <GlobalHeader />

        <main className="flex-1 font-sans text-text-primary overflow-x-hidden px-8 py-6">

          {/* ── Page header ──────────────────────────────────────── */}
          <div className="mb-5">
            <h1 className="text-2xl font-semibold m-0 mb-1">Performance Dashboard</h1>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <span>Team performance overview — Wednesday 24 June</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                {/* calendar icon */}
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="10" rx="1.5" stroke="#9CA3AF" strokeWidth="1.1"/><path d="M4 1v2M9 1v2" stroke="#9CA3AF" strokeWidth="1.1" strokeLinecap="round"/><path d="M1 5h11" stroke="#9CA3AF" strokeWidth="1.1"/></svg>
                Daily (D1): 23 Jun
              </span>
            </div>
          </div>

          {/* ── KPI strip ────────────────────────────────────────── */}
          <div className="grid grid-cols-6 gap-3 mb-5">
            {kpis.map((k) => {
              const valColor = k.atRisk ? "text-warning" : k.key === "nps" || k.key === "aht" ? "text-success" : "text-success";
              const deltaColor = k.deltaPos === false ? "text-danger" : k.deltaPos === true ? "text-success" : "text-text-tertiary";
              // CSAT first card has green border highlight like screenshot
              const isFirst = k.key === "csat";
              return (
                <div
                  key={k.key}
                  className="bg-surface border rounded-lg p-3"
                  style={{ borderColor: isFirst ? "#10B981" : "#E5E7EB" }}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wide">{k.label}</span>
                    {k.atRisk && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-warning-light text-warning whitespace-nowrap leading-tight">AT RISK</span>
                    )}
                  </div>
                  <p className={`text-[22px] font-bold leading-tight m-0 mt-0.5 ${valColor}`}>
                    {k.value}<span className="text-sm font-normal text-text-secondary">{k.unit}</span>
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px] text-text-tertiary flex items-center gap-0.5">
                      <span style={{fontSize:10}}>⊙</span> Target {k.target}
                    </span>
                    <span className={`text-[11px] font-medium ${deltaColor}`}>{k.delta}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── KPI Trends + Team Status ─────────────────────────── */}
          <div className="grid gap-4 mb-6" style={{gridTemplateColumns:"1fr 300px"}}>

            {/* KPI Trends card */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-1">
                {/* trend icon */}
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><polyline points="1,12 5,7 9,9 14,3" stroke="#10B981" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/></svg>
                <span className="text-sm font-semibold text-text-primary">KPI Trends — Customer Satisfaction</span>
              </div>
              <p className="text-xs text-text-tertiary mb-3 m-0">Daily trend</p>
              {/* Legend */}
              <div className="flex items-center gap-4 mb-2 justify-end">
                <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <span style={{width:20,height:2,background:"#10B981",display:"inline-block",borderRadius:2}}/>
                  Team
                </span>
                <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <span style={{width:20,height:0,display:"inline-block",borderTop:"2px dashed #9CA3AF"}}/>
                  Target
                </span>
              </div>
              <KpiTrendChart />
            </div>

            {/* Team Status card */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                {/* people icon */}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="4" r="2" stroke="#6B7280" strokeWidth="1.2"/><path d="M1 11c0-2 1.79-3.5 4-3.5s4 1.5 4 3.5" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round"/><circle cx="10.5" cy="4.5" r="1.5" stroke="#6B7280" strokeWidth="1.2"/><path d="M10.5 8c1.38 0 2.5 1.12 2.5 2.5" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <span className="text-sm font-semibold text-text-primary">Team Status — CSAT</span>
              </div>
              <div className="divide-y divide-border">
                {TEAM_STATUS.map((row) => {
                  const valColor = row.status === "On Target" ? "text-success" : row.status === "Off Target" ? "text-danger" : "text-warning";
                  const badgeCls =
                    row.status === "On Target"  ? "bg-success-light text-success" :
                    row.status === "Off Target" ? "bg-danger-light text-danger"   :
                    "bg-warning-light text-warning";
                  return (
                    <div key={row.name} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-sm text-text-primary">{row.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${valColor}`}>{row.value}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${badgeCls}`}>
                          {row.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Your Key Topics ───────────────────────────────────── */}
          <div className="bg-surface border border-border rounded-xl mb-5 overflow-hidden">
            {/* Header row */}
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><polyline points="1,12 5,7 9,9 14,3" stroke="#10B981" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/></svg>
              <span className="text-sm font-semibold text-text-primary">Your Key Topics</span>
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-border">
              {([
                ["top5",    "Top 5 Facts", "4",   false],
                ["overdue", "Overdue",     "8",   true ],
                ["upcoming","Upcoming",    "5",   false],
              ] as const).map(([k, label, count, danger]) => (
                <button
                  key={k}
                  onClick={() => setTopicTab(k)}
                  className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                    topicTab === k
                      ? "border-brand text-brand bg-surface"
                      : "border-transparent text-text-secondary hover:text-text-primary bg-surface-muted"
                  }`}
                >
                  {label}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${danger ? "bg-danger text-white" : "bg-border text-text-secondary"}`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Topic rows */}
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
                    {/* Agent */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                          style={{background:"#DBEAFE", color:"#1E40AF"}}
                        >
                          {m.initials}
                        </span>
                        <span className="text-sm font-medium text-text-primary">{m.name}</span>
                      </div>
                    </td>

                    {/* KPI Score */}
                    <td className="px-4 py-3">
                      {m.allOnTarget ? (
                        <span className="text-sm font-medium text-success">All on target</span>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {m.kpiScores.map((s) => (
                            <span
                              key={s.label}
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.color === "text-danger" ? "bg-danger-light text-danger" : "bg-warning-light text-warning"}`}
                            >
                              {s.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Outlier */}
                    <td className="px-4 py-3">
                      {m.outlier ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-danger-light text-danger">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1L9 9H1L5 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                          Outlier
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-text-tertiary px-2 py-0.5 rounded-full bg-surface-muted">Normal</span>
                      )}
                    </td>

                    {/* Trend */}
                    <td className="px-4 py-3">
                      <span className={`text-sm ${m.trendIcon === "↗" ? "text-success" : "text-text-secondary"}`}>
                        {m.trend}
                      </span>
                    </td>

                    {/* Pending Activities */}
                    <td className="px-4 py-3">
                      {m.pendingAlert ? (
                        <span className="flex items-center gap-1.5 text-sm text-warning font-medium">
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="#F59E0B" strokeWidth="1.2"/><path d="M6.5 4v3" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round"/><circle cx="6.5" cy="9" r="0.6" fill="#F59E0B"/></svg>
                          {m.pending}
                        </span>
                      ) : (
                        <span className="text-sm text-text-tertiary">{m.pending}</span>
                      )}
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
