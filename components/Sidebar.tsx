"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  FileSpreadsheet,
  CalendarDays,
  ClipboardCheck,
  MessageSquare,
  Settings,
  Send,
  Moon,
} from "lucide-react";

// ITERATION: sidebar grouped into Performance / Execution / Development
const NAV_GROUPS = [
  {
    label: "Performance",
    items: [
      { label: "Team Overview", href: "/projects/20260620-team-overview", icon: LayoutDashboard },
      { label: "Agent View",    href: "/projects/20260620-agent-view",    icon: Users },
      { label: "One to One",   href: "/projects/20260620-one-to-one",   icon: BookOpen },
    ],
  },
  {
    label: "Execution",
    items: [
      { label: "Game Plan",  href: "/projects/20260620-game-plan", icon: ClipboardList },
      { label: "DSM",        href: "/projects/20260620-dsm",       icon: FileSpreadsheet },
      { label: "Schedules",  href: "#",                            icon: CalendarDays, disabled: true },
    ],
  },
  {
    label: "Development",
    items: [
      { label: "CEDP", href: "/projects/20260620-cedp", icon: ClipboardCheck },
    ],
  },
  {
    label: "",
    items: [
      { label: "Communications", href: "#", icon: MessageSquare, disabled: true },
      { label: "Project Config", href: "#", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-52 flex-shrink-0 min-h-screen flex flex-col"
      style={{ background: "#1A1D23", borderRight: "1px solid #2D3148" }}
    >
      {/* Logo */}
      <div className="px-4 py-4 border-b" style={{ borderColor: "#2D3148" }}>
        <p className="text-white font-semibold text-sm m-0 leading-tight tracking-tight">
          OPS Supervisor
        </p>
        <p className="text-[10px] uppercase tracking-widest m-0 mt-0.5" style={{ color: "#6B7280" }}>
          Prescriptive Operations Tool
        </p>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className="mb-1">
            {group.label && (
              <p
                className="text-[10px] uppercase tracking-widest px-2 pt-3 pb-1 m-0"
                style={{ color: "#4B5563", fontWeight: 600, letterSpacing: "0.08em" }}
              >
                {group.label}
              </p>
            )}
            <ul className="flex flex-col gap-0.5 list-none m-0 p-0">
              {group.items.map((item) => {
                const isActive = item.href !== "#" && pathname === item.href;
                const isDisabled = item.disabled;
                const Icon = item.icon;

                if (isDisabled) {
                  return (
                    <li key={item.label}>
                      <span
                        className="flex items-center gap-2.5 py-1.5 pr-3 rounded-r-md text-sm"
                        style={{ color: "#8B8FA8", paddingLeft: 10, borderLeft: "2px solid transparent", opacity: 0.38 }}
                      >
                        <Icon size={15} className="flex-shrink-0" />
                        <span>{item.label}</span>
                      </span>
                    </li>
                  );
                }

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      style={
                        isActive
                          ? { color: "#10B981", background: "rgba(16,185,129,0.08)", borderLeft: "2px solid #10B981", paddingLeft: "10px" }
                          : { color: "#8B8FA8", borderLeft: "2px solid transparent", paddingLeft: "10px" }
                      }
                      className="flex items-center gap-2.5 py-1.5 pr-3 rounded-r-md text-sm transition-colors hover:text-white"
                    >
                      <Icon size={15} className="flex-shrink-0" />
                      <span className={isActive ? "font-medium" : ""}>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-4 pt-3" style={{ borderTop: "1px solid #2D3148" }}>
        <button
          className="w-full flex items-center gap-2.5 py-1.5 px-3 rounded-md text-sm transition-colors hover:text-white text-left"
          style={{ color: "#8B8FA8" }}
        >
          <Send size={14} className="flex-shrink-0" />
          Email Daily Summary
        </button>
        <button
          className="w-full flex items-center gap-2.5 py-1.5 px-3 rounded-md text-sm transition-colors hover:text-white text-left"
          style={{ color: "#8B8FA8" }}
        >
          <Moon size={14} className="flex-shrink-0" />
          Dark Mode
        </button>
      </div>
    </aside>
  );
}
