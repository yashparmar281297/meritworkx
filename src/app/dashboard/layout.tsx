import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, message, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div style={{ background: "var(--surface)", minHeight: "100vh" }}>
      <div className="sticky top-0 z-50">
        <DashboardNavbar
          fullName={profile?.full_name ?? "User"}
          avatarUrl={profile?.avatar_url}
          notifications={notifications ?? []}
        />
      </div>
      <main>{children}</main>
    </div>
  );
}

// import { redirect } from "next/navigation";
// import { createClient } from "@/lib/supabase/server";
// import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

// export default async function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const supabase = await createClient();

//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) redirect("/login");

//   const { data: profile } = await supabase
//     .from("profiles")
//     .select("full_name, avatar_url")
//     .eq("id", user.id)
//     .single();

//   const { data: notifications } = await supabase
//     .from("notifications")
//     .select("id, type, message, is_read, created_at")
//     .eq("user_id", user.id)
//     .order("created_at", { ascending: false })
//     .limit(10);

//   return (
//     <div style={{ background: "var(--surface)", minHeight: "100vh" }}>
//       <div className="sticky top-0 z-50">
//         <DashboardNavbar
//           fullName={profile?.full_name ?? "User"}
//           avatarUrl={profile?.avatar_url}
//           notifications={notifications ?? []}
//         />
//       </div>
//       <main>{children}</main>
//     </div>
//   );
// }