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
  Sun,
} from "lucide-react";
import { useTheme } from "./Theme";

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
      { label: "Schedules",  href: "/projects/20260620-schedules", icon: CalendarDays },
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
      { label: "Project Config", href: "/projects/20260620-project-config", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <aside className="w-52 flex-shrink-0 min-h-screen flex flex-col bg-sidebar-bg border-r border-sidebar-border">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-sidebar-border flex items-center gap-2.5">
        <svg
          width="18"
          height="20"
          viewBox="0 0 289 318"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0"
          aria-label="TP logo"
        >
          <path d="M0,60 L0,63 L56,118 L56,61 Z" fill="white" />
          <path
            d="M230,8 L208,2 L179,0 L179,57 L176,60 L123,60 L120,62 L120,264 L117,267 L59,268 L110,317 L174,317 L175,197 L211,193 L239,183 L265,163 L277,147 L282,136 L288,114 L289,91 L281,56 L269,36 L255,22 Z"
            fill="white"
          />
        </svg>
        <div>
          <p className="text-sidebar-active font-semibold text-sm m-0 leading-tight tracking-tight">
            OPS Supervisor<span className="text-accent">.</span>
          </p>
          <p className="text-[10px] uppercase tracking-widest m-0 mt-0.5 text-sidebar-text-muted">
            Prescriptive Operations Tool
          </p>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className="mb-1">
            {group.label && (
              <p
                className="text-[10px] uppercase tracking-widest px-2 pt-3 pb-1 m-0 text-sidebar-text-muted"
                style={{ fontWeight: 600, letterSpacing: "0.08em" }}
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
                        className="flex items-center gap-2.5 py-1.5 pr-3 rounded-r-md text-sm text-sidebar-text opacity-40"
                        style={{ paddingLeft: 10, borderLeft: "2px solid transparent" }}
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
                      className={`flex items-center gap-2.5 py-1.5 pr-3 rounded-r-md text-sm transition-colors hover:text-sidebar-active ${
                        isActive
                          ? "text-sidebar-active font-medium bg-sidebar-active-bg/10 border-l-[3px] border-accent"
                          : "text-sidebar-text border-l-[3px] border-transparent"
                      }`}
                      style={{ paddingLeft: isActive ? 9 : 10 }}
                    >
                      <Icon size={15} className="flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-4 pt-3 border-t border-sidebar-border">
        <button
          className="w-full flex items-center gap-2.5 py-1.5 px-3 rounded-md text-sm transition-colors hover:text-sidebar-active text-left text-sidebar-text"
        >
          <Send size={14} className="flex-shrink-0" />
          Email Daily Summary
        </button>
        <button
          onClick={toggleTheme}
          aria-pressed={isDark}
          className="w-full flex items-center gap-2.5 py-1.5 px-3 rounded-md text-sm transition-colors hover:text-sidebar-active text-left text-sidebar-text"
        >
          {isDark ? <Sun size={14} className="flex-shrink-0" /> : <Moon size={14} className="flex-shrink-0" />}
          {isDark ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </aside>
  );
}
