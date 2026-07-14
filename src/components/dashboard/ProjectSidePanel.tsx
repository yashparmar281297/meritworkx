"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Clock, X } from "lucide-react";
import ChatThread from "./ChatThread";
import Timesheet from "./Timesheet";

type Message = {
  id: string;
  sender_id: string;
  body: string;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
};

type TimesheetEntry = {
  id: string;
  description: string;
  hours: number;
  file_url: string | null;
  file_name: string | null;
  entry_date: string;
  created_at: string;
  confidence_score: number | null;
  confidence_reason: string | null;
};


export default function ProjectSidePanel({
  conversationId,
  currentUserId,
  otherPersonName,
  initialMessages,
  canSubmitTimesheet,
  timesheetEntries,
}: {
  conversationId: string;
  currentUserId: string;
  otherPersonName: string;
  initialMessages: Message[];
  canSubmitTimesheet: boolean;
  timesheetEntries: TimesheetEntry[];
}) {
  const [chatOpen, setChatOpen] = useState(false);
  const [timesheetOpen, setTimesheetOpen] = useState(false);

  useEffect(() => {
    const anyOpen = chatOpen || timesheetOpen;
    if (anyOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.position = "";
        const top = document.body.style.top;
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflow = "";
        window.scrollTo(0, parseInt(top || "0", 10) * -1);
      };
    }
  }, [chatOpen, timesheetOpen]);

  return (
    <>
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-24 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition hover:opacity-90"
          style={{ background: "var(--yellow)", color: "var(--ink)" }}
          aria-label="Open messages"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {!timesheetOpen && (
        <button
          onClick={() => setTimesheetOpen(true)}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition hover:opacity-90"
          style={{ background: "var(--ink)", color: "var(--yellow)" }}
          aria-label="Open timesheet"
        >
          <Clock size={24} />
        </button>
      )}

      {chatOpen && (
        <div
          className="fixed bottom-5 right-5 z-50 w-[92vw] sm:w-96 max-w-sm h-[75vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--line)" }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b shrink-0"
            style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          >
            <div className="flex items-center gap-2">
              <MessageCircle size={16} style={{ color: "var(--yellow-deep)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                {otherPersonName}
              </p>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-[var(--surface)]"
              style={{ color: "var(--ink-faint)" }}
              aria-label="Close messages"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 min-h-0 p-3">
            <ChatThread
              conversationId={conversationId}
              currentUserId={currentUserId}
              initialMessages={initialMessages}
            />
          </div>
        </div>
      )}

      {timesheetOpen && (
        <div
          className="fixed bottom-5 right-5 z-50 w-[92vw] sm:w-96 max-w-sm h-[75vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--line)" }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b shrink-0"
            style={{ borderColor: "var(--line)", background: "var(--paper)" }}
          >
            <div className="flex items-center gap-2">
              <Clock size={16} style={{ color: "var(--yellow-deep)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                Timesheet
              </p>
            </div>
            <button
              onClick={() => setTimesheetOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-[var(--surface)]"
              style={{ color: "var(--ink-faint)" }}
              aria-label="Close timesheet"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 min-h-0 p-3">
            <Timesheet conversationId={conversationId} canSubmit={canSubmitTimesheet} entries={timesheetEntries} />
          </div>
        </div>
      )}
    </>
  );
}