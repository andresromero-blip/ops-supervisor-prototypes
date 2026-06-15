import Link from "next/link";
import Sidebar from "@/components/Sidebar";

const PROJECTS = [
  {
    slug: "20260620-game-plan",
    title: "Game Plan — supervisor weekly planner",
    description: "Compact weekly calendar with a master-detail daily timeline and team facts grouped by severity.",
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
    </div>
  );
}
