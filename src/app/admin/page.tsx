import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AdminFilters from "@/components/admin/AdminFilters";

export const metadata: Metadata = {
  title: "Admin — MeritWorkX",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; country?: string; city?: string }>;
}) {
  const { role, country, city } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (user.email !== process.env.ADMIN_EMAIL) {
    notFound();
  }

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, role, phone_number, company_name, country, city, created_at")
    .order("created_at", { ascending: false });

  if (role) query = query.eq("role", role);
  if (country) query = query.eq("country", country);
  if (city) query = query.ilike("city", `%${city}%`);

  const { data: profiles } = await query;

  const rows = profiles ?? [];
  const clientCount = rows.filter((p) => p.role === "client").length;
  const freelancerCount = rows.filter((p) => p.role === "freelancer").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--ink)" }}>
          Admin
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
          {rows.length} users matching filters — {clientCount} clients, {freelancerCount} freelancers.
        </p>
      </div>

      <AdminFilters />

      <div
        className="rounded-2xl border overflow-x-auto"
        style={{ background: "var(--paper)", borderColor: "var(--line)" }}
      >
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--line)" }}>
              {["Name", "Role", "Email", "Phone", "Company", "Country", "City"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--ink-faint)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center" style={{ color: "var(--ink-faint)" }}>
                  No users match these filters.
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} className="border-b last:border-b-0" style={{ borderColor: "var(--line)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--ink)" }}>
                    {p.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-full"
                      style={
                        p.role === "client"
                          ? { background: "var(--surface-yellow)", color: "var(--yellow-deep)" }
                          : { background: "var(--surface)", color: "var(--ink-soft)" }
                      }
                    >
                      {p.role}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--ink-soft)" }}>
                    {p.email ?? "—"}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--ink-soft)" }}>
                    {p.phone_number ?? "—"}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--ink-soft)" }}>
                    {p.company_name ?? "—"}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--ink-soft)" }}>
                    {p.country ?? "—"}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--ink-soft)" }}>
                    {p.city ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
