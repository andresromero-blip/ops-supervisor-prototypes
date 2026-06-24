import Link from "next/link";
import Sidebar from "@/components/Sidebar";

const PROJECTS = [
  {
    group: "Performance",
    items: [
      { slug: "20260620-team-overview", title: "Team Overview", description: "KPI strip, agent interaction with trends chart, and key team topics by priority." },
      { slug: "20260620-agent-view",    title: "Agent View",    description: "Individual performance with KPI Evolution — now includes QTD trend view." },
      { slug: "20260620-one-to-one",    title: "One to One",    description: "Coaching workspace: KPI → storyline → facts → session record. Period from global header." },
    ],
  },
  {
    group: "Execution",
    items: [
      { slug: "20260620-game-plan", title: "Game Plan", description: "Weekly calendar with daily timeline. Add Event now includes an Additional Context field." },
      { slug: "20260620-dsm",       title: "DSM",       description: "Open commitments expanded by default. Explicit status badges: Overdue, Due today, Due soon, Pending." },
    ],
  },
  {
    group: "Development",
    items: [
      { slug: "20260620-cedp", title: "CEDP", description: "Employee development plan — now under Development in the sidebar." },
    ],
  },
];

export default function Home() {
  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar />
      <main className="flex-1 text-text-primary font-sans px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-text-secondary mb-1">OPS.Supervisor</p>
          <h1 className="text-3xl font-medium mb-8">UX prototypes</h1>

          <div className="flex flex-col gap-6">
            {PROJECTS.map((g) => (
              <div key={g.group}>
                <p className="text-[11px] uppercase tracking-widest text-text-tertiary mb-2 font-semibold">{g.group}</p>
                <div className="flex flex-col gap-2">
                  {g.items.map((p) => (
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
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
