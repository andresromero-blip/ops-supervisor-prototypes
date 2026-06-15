import Link from "next/link";

const PROJECTS = [
  {
    slug: "20260620-team-overview",
    title: "Team Overview — dashboard de rendimiento del equipo",
    description: "Alertas críticas priorizadas, KPIs agrupados por categoría, filtros de periodo y temas clave del equipo.",
  },
  {
    slug: "20260620-agent-view",
    title: "Agent View — vista de rendimiento individual",
    description: "Rediseño de la vista de agente con selector, KPIs agrupados y plan de coaching contextual.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-bg text-text-primary font-sans px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <p className="text-sm text-text-secondary mb-1">OPS.Supervisor</p>
        <h1 className="font-serif text-3xl font-medium mb-8">Prototipos UX</h1>

        <div className="flex flex-col gap-3">
          {PROJECTS.map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="block border border-border rounded-lg px-5 py-4 bg-surface hover:border-brand transition-colors"
            >
              <p className="font-medium text-sm mb-1">{p.title}</p>
              <p className="text-sm text-text-secondary m-0">{p.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
