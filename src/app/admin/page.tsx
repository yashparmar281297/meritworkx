import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AdminFilters from "@/components/admin/AdminFilters";
import StatCard from "@/components/admin/StatCard";
import GrowthChart from "@/components/admin/GrowthChart";
import { resolveDateRange, buildGrowthSeries, computeGrowthRate } from "@/lib/adminStats";
import { getExchangeRates } from "@/lib/exchangeRates";

export const metadata: Metadata = {
  title: "Admin — MeritWorkX",
};

// Filter-driven stats page — never statically cache it, always compute fresh.
export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    role?: string;
    country?: string;
    city?: string;
    period?: string;
    month?: string;
    year?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const { role, country, city, period, month, year, from, to } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (user.email !== process.env.ADMIN_EMAIL) {
    notFound();
  }

  const range = resolveDateRange({ period, month, year, from, to });

  const { data: allProfilesRaw } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, phone_number, company_name, country, city, created_at, token_plan, client_plan, is_admin")
    .order("created_at", { ascending: false });

  // Admin accounts aren't real platform users — exclude them from every stat, the
  // growth chart, and the table below.
  const allProfiles = (allProfilesRaw ?? []).filter((p) => !p.is_admin);
  const countryScoped = country ? allProfiles.filter((p) => p.country === country) : allProfiles;

  const rows = countryScoped.filter(
    (p) => (!role || p.role === role) && (!city || (p.city ?? "").toLowerCase().includes(city.toLowerCase()))
  );

  const totalFreelancers = countryScoped.filter((p) => p.role === "freelancer").length;
  const totalClients = countryScoped.filter((p) => p.role === "client").length;
  const growth = computeGrowthRate(countryScoped, range);
  const growthSeries = buildGrowthSeries(countryScoped, range);

  const scopedIds = new Set(countryScoped.map((p) => p.id));

  const { data: paymentsRaw } = await supabase
    .from("payments")
    .select("id, type, status, amount, total_charged, payment_date, client_id, freelancer_id");

  const allPayments = paymentsRaw ?? [];
  const scopedPayments = country
    ? allPayments.filter((p) => scopedIds.has(p.client_id ?? "") || scopedIds.has(p.freelancer_id ?? ""))
    : allPayments;

  const inRangePayments = scopedPayments.filter((p) => {
    const d = new Date(p.payment_date);
    return d.getTime() >= range.from.getTime() && d.getTime() < range.to.getTime();
  });

  const rates = await getExchangeRates();
  const inrRate = rates.INR ?? 83;

  const paymentsReceivedUsd = inRangePayments
    .filter((p) => p.type === "project" && p.status === "released")
    .reduce((sum, p) => sum + Number(p.total_charged ?? 0), 0);
  const subscriptionRevenueInr = inRangePayments
    .filter((p) => p.type === "subscription")
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  const paymentsByUser = new Map<string, number>();
  for (const p of allPayments) {
    if (p.type !== "project") continue;
    if (p.status === "released" && p.freelancer_id) {
      paymentsByUser.set(p.freelancer_id, (paymentsByUser.get(p.freelancer_id) ?? 0) + Number(p.amount ?? 0));
    }
    if ((p.status === "held" || p.status === "released") && p.client_id) {
      paymentsByUser.set(p.client_id, (paymentsByUser.get(p.client_id) ?? 0) + Number(p.total_charged ?? 0));
    }
  }

  const clientCount = rows.filter((p) => p.role === "client").length;
  const freelancerCount = rows.filter((p) => p.role === "freelancer").length;

  const growthTrend =
    growth.rate === null
      ? growth.current > 0
        ? { direction: "up" as const, label: "New" }
        : null
      : {
          direction: (growth.rate > 0 ? "up" : growth.rate < 0 ? "down" : "flat") as "up" | "down" | "flat",
          label: `${growth.rate > 0 ? "+" : ""}${growth.rate.toFixed(1)}%`,
        };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--ink)" }}>
          Admin
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
          Platform statistics, growth, and the full user list.
        </p>
      </div>

      <AdminFilters />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total freelancers" value={totalFreelancers.toLocaleString()} />
        <StatCard label="Total clients" value={totalClients.toLocaleString()} />
        <StatCard
          label="Growth rate (this range)"
          value={growth.rate === null ? `${growth.current} new` : `${growth.rate > 0 ? "+" : ""}${growth.rate.toFixed(1)}%`}
          trend={growthTrend}
        />
        <StatCard label="Payments received" value={`₹${(paymentsReceivedUsd * inrRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
        <StatCard label="Subscription revenue" value={`₹${subscriptionRevenueInr.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
      </div>

      <GrowthChart data={growthSeries} />

      <div>
        <p className="text-sm mb-4" style={{ color: "var(--ink-soft)" }}>
          {rows.length} users matching filters — {clientCount} clients, {freelancerCount} freelancers.
        </p>

        <div
          className="rounded-2xl border overflow-x-auto"
          style={{ background: "var(--paper)", borderColor: "var(--line)" }}
        >
          <table className="w-full text-sm min-w-[960px]">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--line)" }}>
                {["Name", "Role", "Email", "Phone", "Company", "Country", "City", "Payments", "Plan"].map((h) => (
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
                  <td colSpan={9} className="px-4 py-10 text-center" style={{ color: "var(--ink-faint)" }}>
                    No users match these filters.
                  </td>
                </tr>
              ) : (
                rows.map((p) => {
                  const paymentsInr = (paymentsByUser.get(p.id) ?? 0) * inrRate;
                  const plan = p.role === "freelancer" ? p.token_plan : p.client_plan;
                  return (
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
                      <td className="px-4 py-3" style={{ color: "var(--ink-soft)" }}>
                        {paymentsInr > 0 ? `₹${paymentsInr.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—"}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--ink-soft)" }}>
                        {plan ?? "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
