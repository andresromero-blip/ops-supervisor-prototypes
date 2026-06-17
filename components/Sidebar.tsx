"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  BookOpen,
  FileSpreadsheet,
  ClipboardCheck,
  CalendarDays,
  MessageSquare,
  Settings,
  Send,
  Moon,
  PanelLeft,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Team Overview", href: "/projects/20260620-team-overview", icon: LayoutDashboard },
  { label: "Game Plan", href: "/projects/20260620-game-plan", icon: ClipboardList },
  { label: "Agent View", href: "/projects/20260620-agent-view", icon: Users },
  { label: "One to One", href: "#", icon: BookOpen },
  { label: "DSM", href: "#", icon: FileSpreadsheet },
  { label: "CEDP", href: "#", icon: ClipboardCheck },
  { label: "Schedules", href: "#", icon: CalendarDays },
  { label: "Communications", href: "#", icon: MessageSquare },
  { label: "Project Config", href: "#", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 bg-sidebar-bg min-h-screen flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5">
        <div>
          <p className="text-white font-semibold text-sm m-0 leading-tight">
            OPS<span className="text-sidebar-text-muted">.</span>Supervisor
          </p>
          <p className="text-sidebar-text-muted text-[10px] uppercase tracking-wide m-0 mt-0.5">Prescriptive Operations Tool</p>
        </div>
        <PanelLeft size={16} className="text-sidebar-text-muted flex-shrink-0" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3">
        <p className="text-sidebar-text-muted text-[11px] uppercase tracking-wide px-2 mb-2 mt-2">Navigation</p>
        <ul className="flex flex-col gap-0.5 list-none m-0 p-0">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "#" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive ? "bg-sidebar-active-bg text-sidebar-active font-medium" : "text-sidebar-text hover:text-white"
                  }`}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 flex flex-col gap-0.5 border-t border-sidebar-border pt-3">
        <button className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-sidebar-text hover:text-white transition-colors text-left">
          <Send size={16} className="flex-shrink-0" />
          Email Daily Summary
        </button>
        <button className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-sidebar-text hover:text-white transition-colors text-left">
          <Moon size={16} className="flex-shrink-0" />
          Dark Mode
        </button>
      </div>
    </aside>
  );
}
