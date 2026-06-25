"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { GlobalHeader, usePeriod, type Period } from "@/components/Header";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type KpiRow = {
  key: string; label: string; weight: string;
  target: string; actual: string; teamAvg: string;
  rank: string; trend30d: "up" | "down" | "none";
  actualColor: "green" | "orange" | "red";
};

type Agent = {
  name: string; tenure: string;
  kpis: KpiRow[];
  kpiTrends: Record<string, { weekly: number[]; monthly: number[]; qtd: number[] }>;
  insights: {
    goldenNuggets: number;
    critical: { title: string; badge: string; body: string; action: string } | null;
    warnings: { title: string; badge: string; body: string } | null;
  };
  actionPoints: {
    training: number;
    aiCoach: number;
    humanDevelopment: { text: string; date: string; tag: string; status: string }[];
  };
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const AGENTS: Record<string, Agent> = {
  "joao-silva": {
    name: "João Silva", tenure: "1y",
    kpis: [
      { key:"overall",  label:"Overall",       weight:"",        target:"100%", actual:"100.1%", teamAvg:"104.4%", rank:"#7/8", trend30d:"none",  actualColor:"green"  },
      { key:"csat",     label:"CSAT",          weight:"25% weight", target:"85%",  actual:"81%",    teamAvg:"84.4%",  rank:"#7/8", trend30d:"none",  actualColor:"orange" },
      { key:"fcr",      label:"FCR",           weight:"20% weight", target:"78%",  actual:"73%",    teamAvg:"76.8%",  rank:"#7/8", trend30d:"none",  actualColor:"orange" },
      { key:"aht",      label:"AHT",           weight:"20% weight", target:"420",  actual:"390",    teamAvg:"372.1",  rank:"#6/8", trend30d:"none",  actualColor:"green"  },
      { key:"nps",      label:"NPS",           weight:"15% weight", target:"45",   actual:"85",     teamAvg:"88.4",   rank:"#7/8", trend30d:"none",  actualColor:"green"  },
      { key:"sales",    label:"Sales",         weight:"10% weight", target:"12%",  actual:"10%",    teamAvg:"11.4%",  rank:"#7/8", trend30d:"none",  actualColor:"orange" },
      { key:"adh",      label:"Adh",           weight:"10% weight", target:"95%",  actual:"92%",    teamAvg:"93.6%",  rank:"#5/8", trend30d:"down",  actualColor:"orange" },
    ],
    kpiTrends: {
      csat:  { weekly:[81,80,80.5,81,80,80.5,81],  monthly:[82,81,80.5,81], qtd:[83,82,81,81] },
      fcr:   { weekly:[74,73,72,73,73,72.5,73],    monthly:[75,74,73,73],   qtd:[76,75,74,73] },
      aht:   { weekly:[395,392,390,388,390,391,390],monthly:[400,395,392,390],qtd:[410,400,395,390] },
      nps:   { weekly:[83,84,85,85,84,85,85],      monthly:[82,83,84,85],   qtd:[80,82,83,85] },
      sales: { weekly:[10.2,10.0,9.8,10.0,10.1,10.0,10.0],monthly:[10.5,10.2,10.1,10.0],qtd:[11,10.8,10.5,10.0] },
      adh:   { weekly:[93,92.5,92,92,91.5,92,92],  monthly:[94,93,92.5,92], qtd:[95,94,93,92] },
    },
    insights: {
      goldenNuggets: 0,
      critical: {
        title: "Sales Conversion",
        badge: "Outlier Alert",
        body: "Low closing technique — sales pitch attempted on only 35% of eligible calls",
        action: "Schedule sales coaching with GROW model. Review top performer Maria's call recordings for best practices.",
      },
      warnings: {
        title: "Quality Score",
        badge: "Quality Repeat Fail",
        body: "Failed on 'Proper Greeting Protocol' in 3 consecutive evaluations\nDeliver targeted feedback on greeting compliance. Schedule observation session.",
      },
    },
    actionPoints: {
      training: 0,
      aiCoach: 0,
      humanDevelopment: [
        { text: "Re-listen to last week's escalation call and self-evaluate.", date: "2026-06-27", tag: "GROW", status: "Pending" },
      ],
    },
  },
};

// Fallback for unknown slugs
function fallbackAgent(name: string): Agent {
  return {
    name, tenure: "—",
    kpis: [
      { key:"overall", label:"Overall", weight:"", target:"100%", actual:"—", teamAvg:"—", rank:"—", trend30d:"none", actualColor:"green" },
    ],
    kpiTrends: {},
    insights: { goldenNuggets:0, critical:null, warnings:null },
    actionPoints: { training:0, aiCoach:0, humanDevelopment:[] },
  };
}

const AGENT_LIST = [
  { slug:"joao-silva",        label:"João Silva"           },
  { slug:"maria-santos",      label:"Maria Santos"         },
  { slug:"carlos-mendes",     label:"Carlos Mendes"        },
  { slug:"ana-ferreira",      label:"Ana Ferreira"         },
  { slug:"pedro-costa",       label:"Pedro Costa"          },
  { slug:"sofia-rodrigues",   label:"Sofia Rodrigues"      },
  { slug:"ricardo-nunes",     label:"Ricardo Nunes"        },
  { slug:"beatriz-lopes",     label:"Beatriz Lopes"        },
];

const PERIOD_LABEL: Record<Period, string> = {
  "D-1": "D-1", WTD: "WTD", MTD: "MTD", QTD: "QTD",
};

// ---------------------------------------------------------------------------
// KPI Evolution Chart
// ---------------------------------------------------------------------------
const DATES_WEEKLY  = ["Jun 18","Jun 19","Jun 20","Jun 21","Jun 22","Jun 23","Jun 24"];
const DATES_MONTHLY = ["W-4","W-3","W-2","W-1"];
const DATES_QTD     = ["Apr","May W1","May W3","Jun"];

function KpiEvolutionChart({
  vals, dates, target, color,
}: { vals: number[]; dates: string[]; target: number; color: string }) {
  const W=620; const H=160; const PL=10; const PR=10; const PT=16; const PB=28;
  const all = [...vals, target];
  const minV = Math.min(...all)*0.96; const maxV = Math.max(...all)*1.04;
  const rangeV = maxV - minV || 1;
  const toX = (i:number) => PL + (i/(dates.length-1))*(W-PL-PR);
  const toY = (v:number) => PT + (1-(v-minV)/rangeV)*(H-PT-PB);
  const linePath = vals.map((v,i) => `${i===0?"M":"L"} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${toX(vals.length-1).toFixed(1)} ${H-PB} L ${toX(0).toFixed(1)} ${H-PB} Z`;
  const targetY = toY(target);
  const areaFill = color==="green" ? "rgba(16,185,129,0.08)" : color==="orange" ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)";
  const lineStroke = color==="green" ? "#10B981" : color==="orange" ? "#F59E0B" : "#EF4444";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" style={{height:140}}>
      <line x1={PL} y1={targetY} x2={W-PR} y2={targetY} stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="5 4"/>
      <text x={W-PR} y={targetY-5} textAnchor="end" fontSize="10" fill="#9CA3AF" fontFamily="Inter,system-ui,sans-serif">TARGET</text>
      <path d={areaPath} fill={areaFill}/>
      <path d={linePath} fill="none" stroke={lineStroke} strokeWidth="2" strokeLinejoin="round"/>
      {vals.map((v,i) => <circle key={i} cx={toX(i)} cy={toY(v)} r="3" fill={lineStroke}/>)}
      {dates.map((d,i) => (
        <text key={d} x={toX(i)} y={H-4} textAnchor="middle" fontSize="10" fill="#9CA3AF" fontFamily="Inter,system-ui,sans-serif">{d}</text>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------------------
export default function AgentViewPage() {
  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <GlobalHeader />
        <Suspense fallback={null}>
          <AgentViewContent />
        </Suspense>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main content
// ---------------------------------------------------------------------------
function AgentViewContent() {
  const { period } = usePeriod();
  const params = useSearchParams();
  const initSlug = params.get("agent") ?? "joao-silva";

  const [agentSlug, setAgentSlug] = useState(initSlug);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCedpModal, setShowCedpModal] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState("csat");
  const [kpiPeriod, setKpiPeriod] = useState<"weekly"|"monthly"|"qtd">("weekly");

  const agent = AGENTS[agentSlug] ?? fallbackAgent(AGENT_LIST.find(a=>a.slug===agentSlug)?.label ?? agentSlug);
  const currentKpi = agent.kpis.find(k=>k.key===selectedKpi) ?? agent.kpis[1] ?? agent.kpis[0];
  const trendData  = agent.kpiTrends[selectedKpi]?.[kpiPeriod] ?? [0];
  const chartDates = kpiPeriod==="weekly" ? DATES_WEEKLY : kpiPeriod==="monthly" ? DATES_MONTHLY : DATES_QTD;

  // Target value from kpi row
  const kpiTarget = parseFloat(currentKpi?.target ?? "0");

  return (
    <main className="flex-1 font-sans text-text-primary overflow-x-hidden">

      {/* ── Page header ────────────────────────────────────────── */}
      <div className="flex items-start justify-between px-8 pt-6 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold m-0 mb-1">Agent Portal</h1>
          <p className="text-sm text-text-secondary m-0">
            Transparency, recognition, and development · Showing <strong>{PERIOD_LABEL[period]}</strong> data
            <span className="ml-3 inline-flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="10" rx="1.5" stroke="#9CA3AF" strokeWidth="1.1"/><path d="M4 1v2M9 1v2" stroke="#9CA3AF" strokeWidth="1.1" strokeLinecap="round"/><path d="M1 5h11" stroke="#9CA3AF" strokeWidth="1.1"/></svg>
              23 Jun
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-sm text-text-secondary bg-surface hover:border-brand/40 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 2h12M1 7h8M1 12h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            Comms <span className="bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">2</span>
          </button>
          <button onClick={() => setShowCedpModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-sm text-text-secondary bg-surface hover:border-brand/40 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2h10v10H2z" stroke="currentColor" strokeWidth="1.2" rx="1"/><path d="M5 5h4M5 8h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            CEDP
          </button>
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-white" style={{background:"#10B981"}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="white" strokeWidth="1.2"/><path d="M7 4.5v3l2 1.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
            How are you feeling?
          </button>
        </div>
      </div>

      {/* ── Employee selector ──────────────────────────────────── */}
      <div className="px-8 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-secondary">Employee:</span>
          <div className="relative">
            <button
              onClick={() => { setShowDropdown(v => !v); setSearchQuery(""); }}
              className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg bg-surface text-sm min-w-[220px]"
            >
              <span className="font-medium flex-1 text-left">{agent.name}</span>
              {/* up-down chevron like original */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 5.5l3-3 3 3" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 8.5l3 3 3-3" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {showDropdown && (
              <div className="absolute top-[calc(100%+4px)] left-0 bg-surface border border-border rounded-xl shadow-xl z-20 w-[280px] overflow-hidden">
                {/* Search field */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#9CA3AF" strokeWidth="1.2"/><path d="M9.5 9.5L13 13" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search employee..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 text-sm outline-none bg-transparent text-text-primary placeholder:text-text-tertiary"
                  />
                </div>
                {/* Unassigned group label */}
                <div className="px-4 pt-2 pb-1">
                  <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wide">Unassigned</span>
                </div>
                {/* Agent list */}
                <div className="pb-2 max-h-64 overflow-y-auto">
                  {AGENT_LIST
                    .filter(a => a.label.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(a => {
                      const isSelected = agentSlug === a.slug;
                      return (
                        <button
                          key={a.slug}
                          onClick={() => { setAgentSlug(a.slug); setShowDropdown(false); setSearchQuery(""); }}
                          className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isSelected ? "bg-surface-muted font-medium" : "hover:bg-surface-muted"}`}
                        >
                          {isSelected ? (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0"><path d="M2 7l4 4 6-6" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          ) : (
                            <span className="w-[14px] flex-shrink-0" />
                          )}
                          <span className={isSelected ? "text-text-primary" : "text-text-secondary"}>{a.label}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-6">

        {/* ── My Performance table ───────────────────────────────── */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden mb-6">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><polyline points="1,12 5,7 9,9 14,3" stroke="#10B981" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/></svg>
            <span className="text-sm font-semibold">My Performance</span>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-2.5 text-[11px] font-medium text-text-tertiary uppercase tracking-wide">KPI</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-medium text-text-tertiary uppercase tracking-wide">Target</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-medium text-text-tertiary uppercase tracking-wide">Actual ({PERIOD_LABEL[period]})</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-medium text-text-tertiary uppercase tracking-wide">Team Avg</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-medium text-text-tertiary uppercase tracking-wide">Rank</th>
                <th className="text-center px-4 py-2.5 text-[11px] font-medium text-text-tertiary uppercase tracking-wide">30d Trend</th>
              </tr>
            </thead>
            <tbody>
              {agent.kpis.map((k) => {
                const valColor = k.actualColor==="green" ? "text-success" : k.actualColor==="orange" ? "text-warning" : "text-danger";
                return (
                  <tr key={k.key} className="border-b border-border last:border-b-0 hover:bg-surface-muted transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium text-sm text-text-primary">{k.label}</div>
                      {k.weight && <div className="text-[11px] text-text-tertiary">{k.weight}</div>}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-text-secondary">{k.target}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-semibold ${valColor}`}>{k.actual}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-text-secondary">{k.teamAvg}</td>
                    <td className="px-4 py-3 text-right text-sm text-text-secondary font-mono">{k.rank}</td>
                    <td className="px-4 py-3 text-center">
                      {k.trend30d === "down" ? (
                        <span className="text-danger text-sm">↘</span>
                      ) : (
                        <span className="text-text-tertiary text-sm">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── KPI Evolution ──────────────────────────────────────── */}
        <div className="bg-surface border border-border rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><polyline points="1,12 5,7 9,9 14,3" stroke="#10B981" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/></svg>
              <span className="text-sm font-semibold">KPI Evolution — {agent.name}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Period toggle */}
              <div className="flex items-center rounded-lg border border-border overflow-hidden">
                {(["weekly","monthly","qtd"] as const).map((p) => (
                  <button key={p} onClick={() => setKpiPeriod(p)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${kpiPeriod===p ? "bg-brand text-white" : "bg-surface text-text-secondary hover:bg-surface-muted"}`}>
                    {p==="weekly" ? "Weekly Trend" : p==="monthly" ? "Monthly Trend" : "QTD"}
                  </button>
                ))}
              </div>
              {/* KPI dropdown */}
              <select
                value={selectedKpi}
                onChange={e => setSelectedKpi(e.target.value)}
                className="text-xs border border-border rounded-lg px-3 py-1.5 bg-surface text-text-primary cursor-pointer"
              >
                {agent.kpis.filter(k=>k.key!=="overall").map(k => (
                  <option key={k.key} value={k.key}>{k.label}</option>
                ))}
              </select>
            </div>
          </div>
          <KpiEvolutionChart
            vals={trendData}
            dates={chartDates}
            target={kpiTarget}
            color={currentKpi?.actualColor ?? "green"}
          />
        </div>

        {/* ── Personal Insights ──────────────────────────────────── */}
        <div className="bg-surface border border-border rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm">⭐</span>
            <span className="text-sm font-semibold">Personal Insights</span>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {/* Golden Nuggets */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-sm">🏅</span>
                <span className="text-sm font-medium text-text-secondary">Golden Nuggets</span>
                <span className="text-sm text-text-tertiary">{agent.insights.goldenNuggets}</span>
              </div>
              <p className="text-sm text-text-tertiary">No golden nuggets yet</p>
            </div>

            {/* Critical */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 12H1L7 1Z" stroke="#EF4444" strokeWidth="1.3" strokeLinejoin="round"/><path d="M7 5v3" stroke="#EF4444" strokeWidth="1.3" strokeLinecap="round"/><circle cx="7" cy="10" r="0.6" fill="#EF4444"/></svg>
                <span className="text-sm font-medium text-danger">Critical</span>
                <span className="w-4 h-4 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">{agent.insights.critical ? 1 : 0}</span>
              </div>
              {agent.insights.critical ? (
                <div className="border border-danger/20 rounded-lg p-3 bg-danger-light">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-semibold text-danger">{agent.insights.critical.title}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-danger text-white whitespace-nowrap">{agent.insights.critical.badge}</span>
                  </div>
                  <p className="text-[12px] text-text-secondary m-0 mb-1 leading-relaxed">{agent.insights.critical.body}</p>
                  <p className="text-[12px] text-text-secondary m-0 leading-relaxed">{agent.insights.critical.action}</p>
                </div>
              ) : (
                <p className="text-sm text-text-tertiary">No critical alerts</p>
              )}
            </div>

            {/* Warnings */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 12H1L7 1Z" stroke="#F59E0B" strokeWidth="1.3" strokeLinejoin="round"/><path d="M7 5v3" stroke="#F59E0B" strokeWidth="1.3" strokeLinecap="round"/><circle cx="7" cy="10" r="0.6" fill="#F59E0B"/></svg>
                <span className="text-sm font-medium text-warning">Warnings</span>
                <span className="text-sm text-text-tertiary">{agent.insights.warnings ? 1 : 0}</span>
              </div>
              {agent.insights.warnings ? (
                <div className="border border-warning/20 rounded-lg p-3 bg-warning-light">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-semibold text-warning">{agent.insights.warnings.title}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-warning text-white whitespace-nowrap">{agent.insights.warnings.badge}</span>
                  </div>
                  <p className="text-[12px] text-text-secondary m-0 leading-relaxed" style={{whiteSpace:"pre-line"}}>{agent.insights.warnings.body}</p>
                </div>
              ) : (
                <p className="text-sm text-text-tertiary">No warnings</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Action Points ──────────────────────────────────────── */}
        <div className="bg-surface border border-border rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="#6B7280" strokeWidth="1.3"/><path d="M5 7.5l2 2 3-3" stroke="#6B7280" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="text-sm font-semibold">Action Points</span>
            <span className="w-5 h-5 rounded-full bg-surface-muted border border-border text-[11px] font-bold flex items-center justify-center text-text-secondary">
              {agent.actionPoints.humanDevelopment.length}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {/* Training */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 7 7 13 1 7z" stroke="#6B7280" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                <span className="text-sm font-medium text-text-secondary">Training</span>
                <span className="text-sm text-text-tertiary">{agent.actionPoints.training}</span>
              </div>
              <p className="text-sm text-text-tertiary">No training actions</p>
            </div>

            {/* AI Coach */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1a6 6 0 100 12A6 6 0 007 1z" stroke="#6B7280" strokeWidth="1.2"/><path d="M5 5.5c.5-1.5 3.5-1.5 3.5.5 0 1.5-1.5 2-1.5 3" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round"/><circle cx="7" cy="10.5" r="0.6" fill="#6B7280"/></svg>
                <span className="text-sm font-medium text-text-secondary">AI Coach</span>
                <span className="text-sm text-text-tertiary">{agent.actionPoints.aiCoach}</span>
              </div>
              <p className="text-sm text-text-tertiary">No AI coaching actions</p>
            </div>

            {/* Human Development */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4" r="2.5" stroke="#6B7280" strokeWidth="1.2"/><path d="M1.5 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <span className="text-sm font-medium text-text-secondary">Human Development</span>
                <span className="text-sm text-text-tertiary">{agent.actionPoints.humanDevelopment.length}</span>
              </div>
              {agent.actionPoints.humanDevelopment.length === 0 ? (
                <p className="text-sm text-text-tertiary">No development actions</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {agent.actionPoints.humanDevelopment.map((h, i) => (
                    <div key={i} className="border border-border rounded-lg p-3">
                      <p className="text-sm text-text-primary m-0 mb-2 leading-relaxed">{h.text}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="0.5" y="1" width="9" height="8" rx="1" stroke="#9CA3AF" strokeWidth="0.9"/><path d="M2.5 0.5v1M7.5 0.5v1" stroke="#9CA3AF" strokeWidth="0.9"/><path d="M0.5 3.5h9" stroke="#9CA3AF" strokeWidth="0.9"/></svg>
                          {h.date}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-brand-light text-brand">{h.tag}</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-warning-light text-warning">{h.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ── CEDP Modal ─────────────────────────────────────── */}
      {showCedpModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowCedpModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-[480px] max-w-[95vw] max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="16" height="16" rx="3" stroke="#10B981" strokeWidth="1.4"/><path d="M5 6h8M5 9h6M5 12h4" stroke="#10B981" strokeWidth="1.4" strokeLinecap="round"/></svg>
                <span className="text-base font-semibold text-text-primary">CEDP — {agent.name}</span>
              </div>
              <button
                onClick={() => setShowCedpModal(false)}
                className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="px-6 pb-3">
              <span className="text-sm text-text-secondary">Draft</span>
            </div>
            <div className="px-6 pb-6 flex flex-col gap-2">
              {[
                "A. Ability to cope with the tasks and daily routine",
                "B. Problem solving and continuous improvement",
                "C. Commitment and responsibility",
                "D. Collaboration and teamwork",
                "E. Knowledge and technical skills",
                "F. Communication and interpersonal skills",
                "G. Propensity to Leave",
              ].map((item) => (
                <div
                  key={item}
                  className="border border-border rounded-lg px-4 py-3 text-sm text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
