import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ConversationList from "@/components/dashboard/ConversationList";

export default async function ClientMessagesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: convosRaw } = await supabase
    .from("conversations")
    .select("id, created_at, project:projects(title), freelancer:profiles!conversations_freelancer_id_fkey(full_name)")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  const conversations = await Promise.all(
    (convosRaw ?? []).map(async (c) => {
      const project = Array.isArray(c.project) ? c.project[0] : c.project;
      const freelancer = Array.isArray(c.freelancer) ? c.freelancer[0] : c.freelancer;

      const { data: lastMsg } = await supabase
        .from("messages")
        .select("body, created_at")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        id: c.id,
        otherPersonName: freelancer?.full_name ?? "Freelancer",
        projectTitle: project?.title ?? "Project",
        lastMessage: lastMsg?.body ?? null,
        lastMessageAt: lastMsg?.created_at ?? c.created_at,
      };
    })
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--ink)" }}>
          Messages
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
          Conversations with freelancers you&apos;ve hired.
        </p>
      </div>

      <ConversationList conversations={conversations} basePath="/dashboard/client/messages" />
    </div>
  );
}