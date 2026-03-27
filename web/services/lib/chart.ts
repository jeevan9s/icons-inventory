import { InventoryRow, LoanRow } from "@/services/lib/types";

/**
 * Builds data for cumulative rentals over time (by date)
 */
export function buildCumulativeLoansData(
  loans: LoanRow[],
): { date: string; total: number }[] {
  const counts: Record<string, number> = {};

  loans.forEach((loan) => {
    const raw = (loan as Record<string, unknown>)["time_out"];
    if (!raw) return;
    const date = new Date(raw as string);
    if (isNaN(date.getTime())) return;
    const key = date.toISOString().slice(0, 10);
    counts[key] = (counts[key] ?? 0) + 1;
  });

  const sorted = Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));

  let running = 0;
  return sorted.map(([date, count]) => {
    running += count;
    return { date, total: running };
  });
}

/**
 * Builds data for cumulative rentals by hour of the day
 */
export function buildHourlyLoansData(loans: LoanRow[]) {
  const counts: Record<string, number> = {};

  loans.forEach((loan) => {
    const raw = (loan as any).time_out;
    if (!raw) return;
    const date = new Date(raw as string);
    if (isNaN(date.getTime())) return;
    const hourKey = `${date.getHours().toString().padStart(2, "0")}:00`;
    counts[hourKey] = (counts[hourKey] ?? 0) + 1;
  });

  const sorted = Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
  let running = 0;
  return sorted.map(([hour, count]) => {
    running += count;
    return { hour, total: running };
  });
}

/**
 * Calculates which items have the highest current demand
 */
export function buildDemandData(
  inventory: InventoryRow[],
): { name: string; borrowed: number }[] {
  return inventory
    .map((item) => ({
      name: item.name ?? "Unknown",
      borrowed: Math.max(0, (item.total_stock ?? 0) - (item.net_stock ?? 0)),
    }))
    .filter((d) => d.borrowed > 0)
    .sort((a, b) => b.borrowed - a.borrowed)
    .slice(0, 15);
}