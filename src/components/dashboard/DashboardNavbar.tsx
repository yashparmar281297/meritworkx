"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Notification = {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function DashboardNavbar({
  fullName,
  avatarUrl,
  notifications,
}: {
  fullName: string;
  avatarUrl?: string | null;
  notifications: Notification[];
}) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(notifications);

  const unreadCount = items.filter((n) => !n.is_read).length;
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function markAsRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  }

  return (
    <header
      className="backdrop-blur-md"
      style={{ background: "rgba(255,255,255,0.9)", borderBottom: "1px solid var(--line)" }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <Link href="/dashboard/client" className="flex items-center gap-2 font-semibold text-base sm:text-lg" style={{ color: "var(--ink)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.svg" alt="" className="w-8 h-8 rounded-lg" />
          MeritWorkX
        </Link>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="relative p-2 rounded-full hover:bg-[var(--surface)] transition"
              aria-label="Notifications"
            >
              <Bell size={20} style={{ color: "var(--ink)" }} />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: "var(--yellow)", color: "var(--ink)" }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {open && (
              <div
                className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl border shadow-lg overflow-hidden"
                style={{ background: "var(--paper)", borderColor: "var(--line)" }}
              >
                <div className="px-4 py-3 border-b text-sm font-semibold" style={{ borderColor: "var(--line)", color: "var(--ink)" }}>
                  Notifications
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {items.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-center" style={{ color: "var(--ink-faint)" }}>
                      No notifications yet.
                    </p>
                  ) : (
                    items.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className="w-full text-left px-4 py-3 border-b last:border-b-0 transition hover:bg-[var(--surface)]"
                        style={{
                          borderColor: "var(--line)",
                          background: n.is_read ? "var(--paper)" : "var(--surface-yellow)",
                        }}
                      >
                        <p className="text-sm" style={{ color: "var(--ink)" }}>{n.message}</p>
                        <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <Link
  href="/dashboard/settings"
  className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm hover:opacity-90 transition overflow-hidden"
  style={{ background: "var(--yellow)", color: "var(--ink)" }}
>
  {avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
  ) : (
    initials || "U"
  )}
</Link>
        </div>
      </div>
    </header>
  );
}