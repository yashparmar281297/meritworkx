"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, MessageSquare, Wallet } from "lucide-react";

const links = [
  { href: "/dashboard/client", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/client/projects", label: "Projects", icon: Briefcase },
  { href: "/dashboard/client/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/client/payments", label: "Payments", icon: Wallet },
];

export default function DashboardTabs() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard/client" ? pathname === "/dashboard/client" : pathname.startsWith(href);

  return (
    <nav
      className="grid grid-cols-4 sm:flex sm:justify-center gap-1 px-2 sm:px-6 py-1.5 border-b"
      style={{ background: "var(--paper)", borderColor: "var(--line)" }}
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium text-center transition"
          style={
            isActive(link.href)
              ? { background: "var(--surface-yellow)", color: "var(--yellow-deep)" }
              : { color: "var(--ink-soft)" }
          }
        >
          <link.icon size={15} />
          <span className="truncate">{link.label}</span>
        </Link>
      ))}
    </nav>
  );
}