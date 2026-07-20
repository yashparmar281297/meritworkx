export type Granularity = "day" | "month" | "year";

export type DateRange = {
  from: Date;
  to: Date; // exclusive upper bound
  prevFrom: Date;
  prevTo: Date; // exclusive upper bound of the equivalent preceding period
  granularity: Granularity;
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// Resolves the admin dashboard's filter params into a concrete [from, to) range,
// its equivalent preceding period (for growth-rate comparison), and the bucket
// granularity to render the growth chart at.
export function resolveDateRange(params: {
  period?: string;
  month?: string;
  year?: string;
  from?: string;
  to?: string;
}): DateRange {
  const now = new Date();
  const todayEnd = addDays(startOfDay(now), 1);

  const year = params.year ? parseInt(params.year, 10) : null;
  const month = params.month ? parseInt(params.month, 10) : null;

  let from: Date;
  let to: Date;

  if (year && month) {
    from = new Date(year, month - 1, 1);
    to = new Date(year, month, 1);
  } else if (year) {
    from = new Date(year, 0, 1);
    to = new Date(year + 1, 0, 1);
  } else if (params.period === "custom" && params.from && params.to) {
    from = startOfDay(new Date(params.from));
    to = addDays(startOfDay(new Date(params.to)), 1);
  } else {
    switch (params.period) {
      case "this_month":
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = todayEnd;
        break;
      case "this_quarter": {
        const q = Math.floor(now.getMonth() / 3);
        from = new Date(now.getFullYear(), q * 3, 1);
        to = todayEnd;
        break;
      }
      case "last_year":
        from = new Date(now.getFullYear() - 1, 0, 1);
        to = new Date(now.getFullYear(), 0, 1);
        break;
      case "last_5_years":
        from = new Date(now.getFullYear() - 5, 0, 1);
        to = todayEnd;
        break;
      case "this_year":
      default:
        from = new Date(now.getFullYear(), 0, 1);
        to = todayEnd;
        break;
    }
  }

  const spanMs = to.getTime() - from.getTime();
  const prevTo = from;
  const prevFrom = new Date(from.getTime() - spanMs);

  const spanDays = spanMs / (1000 * 60 * 60 * 24);
  const granularity: Granularity = spanDays <= 31 ? "day" : spanDays <= 370 ? "month" : "year";

  return { from, to, prevFrom, prevTo, granularity };
}

function generateBucketEnds(from: Date, to: Date, granularity: Granularity): Date[] {
  const ends: Date[] = [];

  if (granularity === "day") {
    let cursor = new Date(from);
    while (cursor.getTime() < to.getTime()) {
      const next = addDays(cursor, 1);
      ends.push(new Date(Math.min(next.getTime(), to.getTime()) - 1));
      cursor = next;
    }
  } else if (granularity === "month") {
    let cursor = new Date(from.getFullYear(), from.getMonth(), 1);
    while (cursor.getTime() < to.getTime()) {
      const next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      ends.push(new Date(Math.min(next.getTime(), to.getTime()) - 1));
      cursor = next;
    }
  } else {
    let cursor = new Date(from.getFullYear(), 0, 1);
    while (cursor.getTime() < to.getTime()) {
      const next = new Date(cursor.getFullYear() + 1, 0, 1);
      ends.push(new Date(Math.min(next.getTime(), to.getTime()) - 1));
      cursor = next;
    }
  }

  return ends;
}

function formatBucketLabel(d: Date, granularity: Granularity): string {
  if (granularity === "day") return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  if (granularity === "month") return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  return String(d.getFullYear());
}

export type GrowthPoint = { label: string; freelancers: number; clients: number };

// Cumulative freelancer/client counts as of each bucket boundary within the range —
// a true "platform size over time" curve, not new-signups-per-bucket.
export function buildGrowthSeries(
  profiles: { role: string; created_at: string }[],
  range: DateRange
): GrowthPoint[] {
  const sorted = [...profiles].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const bucketEnds = generateBucketEnds(range.from, range.to, range.granularity);

  let idx = 0;
  let freelancers = 0;
  let clients = 0;
  const points: GrowthPoint[] = [];

  for (const bucketEnd of bucketEnds) {
    while (idx < sorted.length && new Date(sorted[idx].created_at).getTime() <= bucketEnd.getTime()) {
      if (sorted[idx].role === "freelancer") freelancers++;
      else if (sorted[idx].role === "client") clients++;
      idx++;
    }
    points.push({ label: formatBucketLabel(bucketEnd, range.granularity), freelancers, clients });
  }

  return points;
}

export type GrowthRate = { rate: number | null; current: number; previous: number };

// Period-over-period % change in new signups (both roles combined) — null means
// there's no prior-period baseline to compare against (show "New" instead of a %).
export function computeGrowthRate(
  profiles: { created_at: string }[],
  range: DateRange
): GrowthRate {
  const inRange = (d: Date, start: Date, end: Date) => d.getTime() >= start.getTime() && d.getTime() < end.getTime();

  const current = profiles.filter((p) => inRange(new Date(p.created_at), range.from, range.to)).length;
  const previous = profiles.filter((p) => inRange(new Date(p.created_at), range.prevFrom, range.prevTo)).length;

  if (previous === 0) {
    return { rate: null, current, previous };
  }
  return { rate: ((current - previous) / previous) * 100, current, previous };
}
