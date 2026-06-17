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
  { label: "One to One", href: "/projects/20260620-one-to-one", icon: BookOpen },
  { label: "DSM", href: "#", icon: FileSpreadsheet },
  { label: "CEDP", href: "#", icon: ClipboardCheck },
  { label: "Schedules", href: "#", icon: CalendarDays },
  { label: "Communications", href: "#", icon: MessageSquare },
  { label: "Project Config", href: "#", icon: Settings },
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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm m-0 leading-tight tracking-tight">
              OPS Supervisor
            </p>
            <p className="text-[10px] uppercase tracking-widest m-0 mt-0.5" style={{ color: "#6B7280" }}>
              Prescriptive Operations Tool
            </p>
          </div>
          <PanelLeft size={14} style={{ color: "#6B7280" }} className="flex-shrink-0" />
        </div>
      </div>

      {/* Nav label */}
      <div className="px-4 pt-4 pb-1">
        <p className="text-[10px] uppercase tracking-widest m-0" style={{ color: "#6B7280" }}>
          Navigation
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2">
        <ul className="flex flex-col gap-0.5 list-none m-0 p-0">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href !== "#" && pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  style={
                    isActive
                      ? {
                          color: "#10B981",
                          background: "rgba(16,185,129,0.08)",
                          borderLeft: "2px solid #10B981",
                          paddingLeft: "10px",
                        }
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
