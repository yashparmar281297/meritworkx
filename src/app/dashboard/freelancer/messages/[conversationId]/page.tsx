import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ChatThread from "@/components/dashboard/ChatThread";

export default async function FreelancerChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, freelancer_id, project:projects(title), client:profiles!conversations_client_id_fkey(full_name)")
    .eq("id", conversationId)
    .single();

  if (!conversation || conversation.freelancer_id !== user.id) notFound();

  const project = Array.isArray(conversation.project) ? conversation.project[0] : conversation.project;
  const client = Array.isArray(conversation.client) ? conversation.client[0] : conversation.client;

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, body, file_url, file_name, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-4">
      <Link
        href="/dashboard/freelancer/messages"
        className="text-sm font-medium inline-block transition hover:opacity-70"
        style={{ color: "var(--yellow-deep)" }}
      >
        ← Back to Messages
      </Link>

      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--ink)" }}>
          {client?.full_name ?? "Client"}
        </h1>
        <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
          {project?.title ?? "Project"}
        </p>
      </div>

      <ChatThread
  conversationId={conversationId}
  currentUserId={user.id}
  initialMessages={messages ?? []}
  otherPersonName={client?.full_name ?? "Client"}
/>
    </div>
  );
}