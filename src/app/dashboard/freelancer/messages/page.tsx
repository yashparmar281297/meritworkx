import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ConversationList from "@/components/dashboard/ConversationList";

export default async function FreelancerMessagesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: convosRaw } = await supabase
    .from("conversations")
    .select("id, created_at, project:projects(title), client:profiles!conversations_client_id_fkey(full_name)")
    .eq("freelancer_id", user.id)
    .order("created_at", { ascending: false });

  const conversations = await Promise.all(
    (convosRaw ?? []).map(async (c) => {
      const project = Array.isArray(c.project) ? c.project[0] : c.project;
      const client = Array.isArray(c.client) ? c.client[0] : c.client;

      const { data: lastMsg } = await supabase
        .from("messages")
        .select("body, created_at")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        id: c.id,
        otherPersonName: client?.full_name ?? "Client",
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
          Conversations with clients who&apos;ve hired you.
        </p>
      </div>

      <ConversationList conversations={conversations} basePath="/dashboard/freelancer/messages" />
    </div>
  );
}