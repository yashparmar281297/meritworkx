import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FreelancerTabs from "@/components/dashboard/FreelancerTabs";

export default async function FreelancerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "freelancer") redirect("/dashboard/client");

  return (
    <div>
      <FreelancerTabs />
      <main>{children}</main>
    </div>
  );
}