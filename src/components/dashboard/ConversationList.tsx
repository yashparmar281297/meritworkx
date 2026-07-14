import Link from "next/link";

type Conversation = {
  id: string;
  otherPersonName: string;
  projectTitle: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
};

export default function ConversationList({
  conversations,
  basePath,
}: {
  conversations: Conversation[];
  basePath: string;
}) {
  if (conversations.length === 0) {
    return (
      <div
        className="rounded-2xl border p-10 sm:p-16 text-center"
        style={{ background: "var(--paper)", borderColor: "var(--line)" }}
      >
        <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
          No conversations yet. They&apos;ll appear here once a project connects you with someone.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {conversations.map((c) => (
        <Link
          key={c.id}
          href={`${basePath}/${c.id}`}
          className="flex items-center gap-4 rounded-2xl border p-4 sm:p-5 transition hover:shadow-sm"
          style={{ background: "var(--paper)", borderColor: "var(--line)" }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
            style={{ background: "var(--yellow)", color: "var(--ink)" }}
          >
            {c.otherPersonName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-sm truncate" style={{ color: "var(--ink)" }}>
                {c.otherPersonName}
              </h3>
              {c.lastMessageAt && (
                <span className="text-xs shrink-0" style={{ color: "var(--ink-faint)" }}>
                  {new Date(c.lastMessageAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <p className="text-xs truncate" style={{ color: "var(--ink-faint)" }}>
              {c.projectTitle}
            </p>
            <p className="text-sm truncate mt-0.5" style={{ color: "var(--ink-soft)" }}>
              {c.lastMessage ?? "No messages yet — say hello!"}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}