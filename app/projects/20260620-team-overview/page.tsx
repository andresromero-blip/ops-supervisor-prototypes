"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
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
    { key: "aht_phone", label: "AHT teléfono", value: "758.97", unit: "s", target: "630s", delta: "+20%", status: "critical", trend: "up" },
    { key: "aht_messaging", label: "AHT mensajería", value: "—", unit: "", target: "1000s", delta: "sin datos hoy", status: "ok", trend: "up" },
    { key: "fcr_phone", label: "FCR teléfono", value: "77.8", unit: "%", target: "75%", delta: "+2.8pp", status: "ok", trend: "up" },
    { key: "rr_phone", label: "Resolución teléfono", value: "88.9", unit: "%", target: "85%", delta: "+3.9pp", status: "ok", trend: "up" },
  ],
  WTD: [
    { key: "aht_phone", label: "AHT teléfono", value: "742.10", unit: "s", target: "630s", delta: "+17.8%", status: "critical", trend: "up" },
    { key: "aht_messaging", label: "AHT mensajería", value: "980.4", unit: "s", target: "1000s", delta: "-2%", status: "ok", trend: "down" },
    { key: "fcr_phone", label: "FCR teléfono", value: "79.1", unit: "%", target: "75%", delta: "+4.1pp", status: "ok", trend: "up" },
    { key: "rr_phone", label: "Resolución teléfono", value: "87.3", unit: "%", target: "85%", delta: "+2.3pp", status: "ok", trend: "up" },
  ],
  MTD: [
    { key: "aht_phone", label: "AHT teléfono", value: "729.55", unit: "s", target: "630s", delta: "+15.8%", status: "critical", trend: "up" },
    { key: "aht_messaging", label: "AHT mensajería", value: "955.2", unit: "s", target: "1000s", delta: "-4.5%", status: "ok", trend: "down" },
    { key: "fcr_phone", label: "FCR teléfono", value: "80.6", unit: "%", target: "75%", delta: "+5.6pp", status: "ok", trend: "up" },
    { key: "rr_phone", label: "Resolución teléfono", value: "86.7", unit: "%", target: "85%", delta: "+1.7pp", status: "ok", trend: "up" },
  ],
  QTD: [
    { key: "aht_phone", label: "AHT teléfono", value: "711.20", unit: "s", target: "630s", delta: "+12.9%", status: "critical", trend: "down" },
    { key: "aht_messaging", label: "AHT mensajería", value: "930.8", unit: "s", target: "1000s", delta: "-6.9%", status: "ok", trend: "down" },
    { key: "fcr_phone", label: "FCR teléfono", value: "82.4", unit: "%", target: "75%", delta: "+7.4pp", status: "ok", trend: "up" },
    { key: "rr_phone", label: "Resolución teléfono", value: "85.9", unit: "%", target: "85%", delta: "+0.9pp", status: "ok", trend: "up" },
  ],
};

const QUALITY: Record<Period, Kpi[]> = {
  "D-1": [
    { key: "qa_score", label: "QA score", value: "99", unit: "%", target: "85%", delta: "+14pp", status: "ok", trend: "up" },
    { key: "professionalism", label: "Profesionalismo", value: "88.9", unit: "%", target: "95%", delta: "-6.1pp", status: "warning", trend: "down" },
    { key: "gross_absence", label: "Ausencia bruta", value: "0", unit: "%", target: "6%", delta: "dentro de meta", status: "ok", trend: "up" },
    { key: "nps_phone", label: "NPS teléfono", value: "33.3", unit: "%", target: "55%", delta: "-21.7pp", status: "critical", trend: "down" },
  ],
  WTD: [
    { key: "qa_score", label: "QA score", value: "92.1", unit: "%", target: "85%", delta: "+7.1pp", status: "ok", trend: "up" },
    { key: "professionalism", label: "Profesionalismo", value: "90.2", unit: "%", target: "95%", delta: "-4.8pp", status: "warning", trend: "up" },
    { key: "gross_absence", label: "Ausencia bruta", value: "8.4", unit: "%", target: "6%", delta: "+2.4pp", status: "warning", trend: "down" },
    { key: "nps_phone", label: "NPS teléfono", value: "41.6", unit: "%", target: "55%", delta: "-13.4pp", status: "critical", trend: "up" },
  ],
  MTD: [
    { key: "qa_score", label: "QA score", value: "90.6", unit: "%", target: "85%", delta: "+5.6pp", status: "ok", trend: "up" },
    { key: "professionalism", label: "Profesionalismo", value: "91.0", unit: "%", target: "95%", delta: "-4.0pp", status: "warning", trend: "up" },
    { key: "gross_absence", label: "Ausencia bruta", value: "11.55", unit: "%", target: "6%", delta: "+5.55pp", status: "critical", trend: "down" },
    { key: "nps_phone", label: "NPS teléfono", value: "47.2", unit: "%", target: "55%", delta: "-7.8pp", status: "warning", trend: "up" },
  ],
  QTD: [
    { key: "qa_score", label: "QA score", value: "91.4", unit: "%", target: "85%", delta: "+6.4pp", status: "ok", trend: "up" },
    { key: "professionalism", label: "Profesionalismo", value: "91.8", unit: "%", target: "95%", delta: "-3.2pp", status: "warning", trend: "up" },
    { key: "gross_absence", label: "Ausencia bruta", value: "10.2", unit: "%", target: "6%", delta: "+4.2pp", status: "critical", trend: "down" },
    { key: "nps_phone", label: "NPS teléfono", value: "52.0", unit: "%", target: "55%", delta: "-3.0pp", status: "warning", trend: "up" },
  ],
};

const ALERTS: Record<Period, Alert[]> = {
  "D-1": [
    { agent: "Pedro Godinho", agentSlug: "pedro-godinho", reason: "AHT 25% por encima del objetivo, con tendencia al alza durante 3 semanas" },
    { agent: "Denzel Melo", agentSlug: "denzel-melo", reason: "Ausencias en aumento, 33% vs objetivo de 6%" },
    { agent: "Raymond Akpelu", agentSlug: "raymond-akpelu", reason: "QA bajó de 84.5 a 34.0, casos mal categorizados" },
  ],
  WTD: [
    { agent: "Pedro Godinho", agentSlug: "pedro-godinho", reason: "AHT 17.8% por encima del objetivo durante toda la semana" },
    { agent: "Denzel Melo", agentSlug: "denzel-melo", reason: "Ausencias acumuladas suben a 28% en la semana" },
  ],
  MTD: [
    { agent: "Martinho Wambembe", agentSlug: "martinho-wambembe", reason: "Ausencia bruta del mes en 32.5% vs 11.55% del equipo" },
    { agent: "Toufiq Hossain", agentSlug: "toufiq-hossain", reason: "Patrón alternante de ausencias eleva el promedio mensual a 55.56%" },
  ],
  QTD: [
    { agent: "Martinho Wambembe", agentSlug: "martinho-wambembe", reason: "Tendencia de ausencias en deterioro constante durante el trimestre" },
  ],
};

const TEAM: Record<Period, TeamMember[]> = {
  "D-1": [
    { name: "Pedro Godinho", slug: "pedro-godinho", status: "critical", statusLabel: "Crítico", kpiLabel: "AHT", kpiValue: "863.9s", trend: "up", trendStatus: "critical" },
    { name: "Denzel Melo", slug: "denzel-melo", status: "critical", statusLabel: "Crítico", kpiLabel: "Ausencia", kpiValue: "33.5%", trend: "up", trendStatus: "critical" },
    { name: "Raymond Akpelu", slug: "raymond-akpelu", status: "warning", statusLabel: "Atención", kpiLabel: "QA", kpiValue: "34.0%", trend: "down", trendStatus: "critical" },
    { name: "Alexandre Manuel Pereira", slug: "alexandre-pereira", status: "ok", statusLabel: "En meta", kpiLabel: "AHT", kpiValue: "670.5s", trend: "up", trendStatus: "ok" },
    { name: "Francisco Esperança", slug: "francisco-esperanca", status: "ok", statusLabel: "En meta", kpiLabel: "AHT", kpiValue: "691.4s", trend: "up", trendStatus: "ok" },
    { name: "Camila Robledo", slug: "camila-robledo", status: "warning", statusLabel: "Atención", kpiLabel: "AHT", kpiValue: "821.1s", trend: "down", trendStatus: "warning" },
    { name: "Cristina Ji", slug: "cristina-ji", status: "warning", statusLabel: "Atención", kpiLabel: "FCR", kpiValue: "0%", trend: "down", trendStatus: "critical" },
    { name: "David Reis Carvalho", slug: "david-reis-carvalho", status: "ok", statusLabel: "En meta", kpiLabel: "FCR", kpiValue: "85%", trend: "up", trendStatus: "ok" },
    { name: "Lucas Dias", slug: "lucas-dias", status: "warning", statusLabel: "Atención", kpiLabel: "AHT", kpiValue: "823.9s", trend: "up", trendStatus: "warning" },
    { name: "Marco Nunes Sousa", slug: "marco-nunes-sousa", status: "warning", statusLabel: "Atención", kpiLabel: "AHT", kpiValue: "744.9s", trend: "up", trendStatus: "warning" },
    { name: "Martinho Wambembe", slug: "martinho-wambembe", status: "warning", statusLabel: "Atención", kpiLabel: "Ausencia", kpiValue: "32.5%", trend: "up", trendStatus: "critical" },
    { name: "Phillip Ellis", slug: "phillip-ellis", status: "warning", statusLabel: "Atención", kpiLabel: "FCR", kpiValue: "50%", trend: "down", trendStatus: "warning" },
    { name: "Toufiq Hossain", slug: "toufiq-hossain", status: "warning", statusLabel: "Atención", kpiLabel: "Ausencia", kpiValue: "55.6%", trend: "up", trendStatus: "critical" },
    { name: "Vasile Bunduche", slug: "vasile-bunduche", status: "ok", statusLabel: "En meta", kpiLabel: "FCR", kpiValue: "78%", trend: "up", trendStatus: "ok" },
  ],
  WTD: [
    { name: "Pedro Godinho", slug: "pedro-godinho", status: "critical", statusLabel: "Crítico", kpiLabel: "AHT", kpiValue: "835.2s", trend: "up", trendStatus: "critical" },
    { name: "Denzel Melo", slug: "denzel-melo", status: "warning", statusLabel: "Atención", kpiLabel: "Ausencia", kpiValue: "28.1%", trend: "up", trendStatus: "critical" },
    { name: "Alexandre Manuel Pereira", slug: "alexandre-pereira", status: "ok", statusLabel: "En meta", kpiLabel: "AHT", kpiValue: "655.2s", trend: "down", trendStatus: "ok" },
    { name: "Francisco Esperança", slug: "francisco-esperanca", status: "ok", statusLabel: "En meta", kpiLabel: "AHT", kpiValue: "688.0s", trend: "down", trendStatus: "ok" },
    { name: "Camila Robledo", slug: "camila-robledo", status: "warning", statusLabel: "Atención", kpiLabel: "AHT", kpiValue: "810.4s", trend: "down", trendStatus: "warning" },
  ],
  MTD: [
    { name: "Martinho Wambembe", slug: "martinho-wambembe", status: "critical", statusLabel: "Crítico", kpiLabel: "Ausencia", kpiValue: "32.5%", trend: "up", trendStatus: "critical" },
    { name: "Toufiq Hossain", slug: "toufiq-hossain", status: "critical", statusLabel: "Crítico", kpiLabel: "Ausencia", kpiValue: "55.6%", trend: "up", trendStatus: "critical" },
    { name: "Pedro Godinho", slug: "pedro-godinho", status: "warning", statusLabel: "Atención", kpiLabel: "AHT", kpiValue: "729.6s", trend: "down", trendStatus: "warning" },
    { name: "Alexandre Manuel Pereira", slug: "alexandre-pereira", status: "ok", statusLabel: "En meta", kpiLabel: "AHT", kpiValue: "661.0s", trend: "down", trendStatus: "ok" },
  ],
  QTD: [
    { name: "Martinho Wambembe", slug: "martinho-wambembe", status: "critical", statusLabel: "Crítico", kpiLabel: "Ausencia", kpiValue: "30.8%", trend: "up", trendStatus: "critical" },
    { name: "Pedro Godinho", slug: "pedro-godinho", status: "warning", statusLabel: "Atención", kpiLabel: "AHT", kpiValue: "711.2s", trend: "down", trendStatus: "warning" },
    { name: "Alexandre Manuel Pereira", slug: "alexandre-pereira", status: "ok", statusLabel: "En meta", kpiLabel: "AHT", kpiValue: "670.0s", trend: "down", trendStatus: "ok" },
  ],
};

const TOPICS: Record<Period, Topic[]> = {
  "D-1": [
    { rank: 1, agent: "Pedro Godinho", agentSlug: "pedro-godinho", tag: "Profesionalismo · teléfono", tagStatus: "critical", body: "Manejo de llamadas ineficiente con tendencia al alza (718.9s → 845.5s → 863.9s) pese a 4+ años de antigüedad. AHT 25% por encima del promedio del equipo, con un pico semanal de 890.8s antes de bajar levemente a 835.6s." },
    { rank: 2, agent: "Denzel Melo", agentSlug: "denzel-melo", tag: "Ausencia bruta", tagStatus: "critical", body: "Patrón de ausencias injustificadas con volatilidad semanal creciente (0% → 40% → 20.25% → 50%). La tendencia mensual empeora de 25.26% a 33.47%, pese a tratarse de una incorporación reciente (119 días)." },
    { rank: 3, agent: "Toufiq Hossain", agentSlug: "toufiq-hossain", tag: "FCR · teléfono", tagStatus: "warning", body: "Una semana con 100% de ausencias seguida de otra con 0% elevó la ausencia bruta a 55.56% vs 11.55% del equipo (+44.01pp). La tendencia mensual empeora de 0% a 55.56%." },
    { rank: 4, agent: "Martinho Wambembe", agentSlug: "martinho-wambembe", tag: "Ausencia bruta", tagStatus: "warning", body: "Asistencia en deterioro acelerado: la ausencia bruta semanal sube de forma constante (11.81% → 21.46% → 29.12% → 36.72%), llevando el total a 32.5% vs 11.55% del equipo (+20.95pp)." },
    { rank: 5, agent: "Raymond Akpelu", agentSlug: "raymond-akpelu", tag: "AHT · teléfono", tagStatus: "warning", body: "Fallos críticos en las secciones \"Actuar con responsabilidad\" (0/38) y \"Seguir los pasos\" (0/20) por categorización incorrecta de casos. El QA cayó de 84.5 a 34.0 vs 90.63 del equipo." },
  ],
  WTD: [
    { rank: 1, agent: "Pedro Godinho", agentSlug: "pedro-godinho", tag: "AHT · teléfono", tagStatus: "critical", body: "AHT semanal 17.8% por encima del objetivo, sin señales de mejora respecto a la semana anterior." },
    { rank: 2, agent: "Denzel Melo", agentSlug: "denzel-melo", tag: "Ausencia bruta", tagStatus: "warning", body: "Ausencia acumulada de la semana en 28.1%, más del doble del objetivo de 6%." },
  ],
  MTD: [
    { rank: 1, agent: "Martinho Wambembe", agentSlug: "martinho-wambembe", tag: "Ausencia bruta", tagStatus: "critical", body: "Ausencia bruta mensual en 32.5% vs 11.55% del equipo (+20.95pp), con tendencia de deterioro sostenido." },
    { rank: 2, agent: "Toufiq Hossain", agentSlug: "toufiq-hossain", tag: "Ausencia bruta", tagStatus: "critical", body: "Patrón alternante (100% una semana, 0% la siguiente) eleva el promedio mensual a 55.56% vs 11.55% del equipo." },
  ],
  QTD: [
    { rank: 1, agent: "Martinho Wambembe", agentSlug: "martinho-wambembe", tag: "Ausencia bruta", tagStatus: "critical", body: "Tendencia trimestral de ausencias en deterioro constante, situándose en 30.8% vs 11.55% del equipo." },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function statusClasses(status: Status) {
  switch (status) {
    case "critical":
      return { bg: "bg-danger-light", text: "text-danger", label: "Crítico" };
    case "warning":
      return { bg: "bg-warning-light", text: "text-warning", label: "Atención" };
    default:
      return { bg: "bg-success-light", text: "text-success", label: "En meta" };
  }
}

function TrendIcon({ trend, status }: { trend: "up" | "down"; status: Status }) {
  const color = status === "critical" ? "#C2462E" : status === "warning" ? "#B8860B" : "#3D7A5C";
  const Icon = trend === "up" ? TrendingUp : TrendingDown;
  return <Icon size={16} color={color} strokeWidth={2} />;
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const valueColor =
    kpi.status === "critical" ? "text-danger" : kpi.status === "ok" && kpi.delta !== "sin datos hoy" ? "text-success" : "text-text-primary";
  return (
    <div className="bg-surface-muted rounded-md p-4">
      <p className="text-sm text-text-secondary mb-1.5">{kpi.label}</p>
      <p className={`font-serif text-2xl font-medium m-0 ${valueColor}`}>
        {kpi.value}
        {kpi.unit && <span className="text-sm font-mono text-text-secondary"> {kpi.unit}</span>}
      </p>
      <p className="text-xs text-text-tertiary font-mono mt-1 mb-0">
        objetivo {kpi.target} · {kpi.delta}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
const PERIOD_LABELS: Record<Period, string> = {
  "D-1": "datos de ayer (D-1)",
  WTD: "semana en curso (WTD)",
  MTD: "mes en curso (MTD)",
  QTD: "trimestre en curso (QTD)",
};

export default function TeamOverviewPage() {
  const [period, setPeriod] = useState<Period>("D-1");
  const [showAllAgents, setShowAllAgents] = useState(false);
  const [topicTab, setTopicTab] = useState<"top" | "overdue" | "upcoming">("top");

  const efficiency = EFFICIENCY[period];
  const quality = QUALITY[period];
  const alerts = ALERTS[period];
  const team = TEAM[period];
  const topics = TOPICS[period];

  const visibleTeam = showAllAgents ? team : team.slice(0, 5);
  const hiddenCount = team.length - visibleTeam.length;

  const periodOptions: Period[] = ["D-1", "WTD", "MTD", "QTD"];

  return (
    <main className="min-h-screen bg-bg text-text-primary font-sans px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <Link href="/" className="text-sm text-text-secondary hover:text-brand mb-4 inline-block">
          ← OPS.Supervisor
        </Link>

        {/* Header */}
        <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
          <div>
            <p className="text-sm text-text-secondary mb-1">Equipo · Miércoles 20 mayo · {PERIOD_LABELS[period]}</p>
            <h1 className="font-serif text-2xl font-medium m-0">Resumen del equipo</h1>
          </div>
          <div className="flex gap-1.5">
            {periodOptions.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3.5 py-1.5 text-sm rounded-md font-medium border transition-colors ${
                  period === p ? "bg-brand-light text-brand border-transparent" : "bg-surface text-text-secondary border-border hover:border-brand/40"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Alert banner */}
        {alerts.length > 0 && (
          <div className="bg-danger-light border border-danger/20 rounded-lg px-5 py-3.5 mb-6 flex gap-3 items-start">
            <AlertTriangle size={20} className="text-danger mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-danger mb-1.5">
                {alerts.length} {alerts.length === 1 ? "agente necesita" : "agentes necesitan"} atención
                {period === "D-1" ? " hoy" : period === "WTD" ? " esta semana" : period === "MTD" ? " este mes" : " este trimestre"}
              </p>
              <div className="flex flex-col gap-1">
                {alerts.map((a) => (
                  <Link key={a.agentSlug} href={`/projects/20260620-agent-view?agent=${a.agentSlug}`} className="text-sm text-text-primary hover:text-danger transition-colors">
                    <span className="font-medium">{a.agent}</span> — {a.reason}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Efficiency KPIs */}
        <p className="text-sm text-text-secondary mb-2.5 uppercase tracking-wide">Eficiencia</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {efficiency.map((k) => (
            <KpiCard key={k.key} kpi={k} />
          ))}
        </div>

        {/* Quality KPIs */}
        <p className="text-sm text-text-secondary mb-2.5 uppercase tracking-wide">Calidad y personas</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {quality.map((k) => (
            <KpiCard key={k.key} kpi={k} />
          ))}
        </div>

        {/* Team table */}
        <p className="text-sm text-text-secondary mb-2.5 uppercase tracking-wide">Equipo · {PERIOD_LABELS[period]}</p>
        <div className="border border-border rounded-lg overflow-hidden mb-6 bg-surface overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[480px]">
            <thead>
              <tr className="bg-surface-muted">
                <th className="text-left px-4 py-2.5 font-medium text-text-secondary">Agente</th>
                <th className="text-left px-4 py-2.5 font-medium text-text-secondary">Estado</th>
                <th className="text-left px-4 py-2.5 font-medium text-text-secondary">KPI principal</th>
                <th className="text-center px-4 py-2.5 font-medium text-text-secondary">Tendencia</th>
              </tr>
            </thead>
            <tbody>
              {visibleTeam.map((m) => {
                const b = statusClasses(m.status);
                return (
                  <tr key={m.slug} className="border-t border-border">
                    <td className="px-4 py-2.5">
                      <Link href={`/projects/20260620-agent-view?agent=${m.slug}`} className="hover:text-brand transition-colors">
                        {m.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${b.bg} ${b.text}`}>{m.statusLabel}</span>
                    </td>
                    <td className="px-4 py-2.5 font-mono">
                      <span className={m.trendStatus === "critical" ? "text-danger" : m.trendStatus === "warning" ? "text-warning" : "text-text-secondary"}>
                        {m.kpiLabel}: {m.kpiValue}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex justify-center">
                        <TrendIcon trend={m.trend} status={m.trendStatus} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {hiddenCount > 0 && (
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 text-text-secondary" colSpan={4}>
                    <button
                      onClick={() => setShowAllAgents(true)}
                      className="text-xs px-2.5 py-1 rounded-md border border-border bg-surface text-text-secondary font-medium inline-flex items-center gap-1.5 hover:border-brand/40 transition-colors"
                    >
                      Ver {hiddenCount} agentes más <ChevronDown size={14} />
                    </button>
                  </td>
                </tr>
              )}
              {showAllAgents && team.length > 5 && (
                <tr className="border-t border-border">
                  <td className="px-4 py-2.5 text-text-secondary" colSpan={4}>
                    <button
                      onClick={() => setShowAllAgents(false)}
                      className="text-xs px-2.5 py-1 rounded-md border border-border bg-surface text-text-secondary font-medium inline-flex items-center gap-1.5 hover:border-brand/40 transition-colors"
                    >
                      Ver menos <ChevronUp size={14} />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Key topics */}
        <div className="flex justify-between items-center mb-2.5 flex-wrap gap-2">
          <p className="text-sm text-text-secondary uppercase tracking-wide m-0">Temas clave</p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setTopicTab("top")}
              className={`px-3 py-1.5 text-xs rounded-md font-medium border ${
                topicTab === "top" ? "bg-surface-muted border-transparent" : "bg-surface text-text-secondary border-border"
              }`}
            >
              Top 5 hallazgos
            </button>
            <button
              onClick={() => setTopicTab("overdue")}
              className={`px-3 py-1.5 text-xs rounded-md font-medium border flex items-center gap-1.5 ${
                topicTab === "overdue" ? "bg-surface-muted border-transparent" : "bg-surface text-text-secondary border-border"
              }`}
            >
              Vencidos <span className="bg-danger-light text-danger px-1.5 rounded-md">127</span>
            </button>
            <button
              onClick={() => setTopicTab("upcoming")}
              className={`px-3 py-1.5 text-xs rounded-md font-medium border flex items-center gap-1.5 ${
                topicTab === "upcoming" ? "bg-surface-muted border-transparent" : "bg-surface text-text-secondary border-border"
              }`}
            >
              Próximos <span className="bg-surface-muted text-text-secondary px-1.5 rounded-md">4</span>
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
                    Ver <ArrowRight size={13} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {topicTab === "overdue" && (
          <div className="border border-border rounded-lg px-5 py-8 mb-8 bg-surface text-center">
            <p className="text-sm text-text-secondary m-0">
              127 acciones vencidas pendientes de revisión. Esta vista detallada se construirá en la siguiente iteración del prototipo.
            </p>
          </div>
        )}

        {topicTab === "upcoming" && (
          <div className="border border-border rounded-lg px-5 py-8 mb-8 bg-surface text-center">
            <p className="text-sm text-text-secondary m-0">
              4 acciones próximas a vencer. Esta vista detallada se construirá en la siguiente iteración del prototipo.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
