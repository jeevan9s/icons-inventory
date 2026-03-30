import {InventoryRow, LoanRow, LoanTrendOptions} from "@/services/lib/types";
import { getStockStatus } from "./hooks/helpers";
import { normalizeEqType } from "./helpers";
// helpers to build data to be visualized with Recharts

// loan analytic with time
// handles two cases 1. get tiem bounds if selection 2. all if no selection
export function buildLoanTrends(
  loans: LoanRow[],
  selection?: LoanRow[],
  options: LoanTrendOptions = {}
): { label: string; total: number }[] {
  const { mode = "hourly", normalize = false } = options;
  const data = selection?.length ? selection : loans;

  if (!data.length) return [];

  const times = data
    .map((loan) => loan.time_out)
    .filter(Boolean)
    .map((t) => new Date(t as string));

  const start = new Date(Math.min(...times.map((d) => d.getTime())));
  const end = new Date(Math.max(...times.map((d) => d.getTime())));

  const counts: Record<string, number> = {};

  data.forEach((loan) => {
    if (!loan.time_out) return;
    const date = new Date(loan.time_out);

    const key =
      mode === "hourly"
        ? `${date.getHours().toString().padStart(2, "0")}:00`
        : date.toISOString().slice(0, 10); // YYYY-MM-DD

    counts[key] = (counts[key] ?? 0) + 1;
  });

  let keys: string[] = [];
  if (mode === "hourly") {
    keys = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);
  } else {
    const dayMs = 1000 * 60 * 60 * 24;
    const days = Math.ceil((end.getTime() - start.getTime()) / dayMs) + 1;
    keys = Array.from({ length: days }, (_, i) => {
      const d = new Date(start.getTime() + i * dayMs);
      return d.toISOString().slice(0, 10);
    });
  }

  const totalCount = Object.values(counts).reduce((acc, v) => acc + v, 0);

  return keys.map((k) => ({
    label: k,
    total: normalize ? (counts[k] ?? 0) / totalCount : counts[k] ?? 0,
  }));
}

// demand analytic 
// based off frequency and reflects popularity in items 
export function buildDemandData(loans: LoanRow[]): { name: string; totalLoans: number }[] {
  const counts: Record<string, number> = {};

  loans.forEach((loan) => {
    if (!loan.item_name) return;

    const quantity = loan.item_quantity ?? 1;

    // split grouped names (handles "Camera, Tripod")
    const names = loan.item_name.split(",").map((n) => n.trim());

    names.forEach((name) => {
      if (!name) return;
      counts[name] = (counts[name] ?? 0) + quantity;
    });
  });

  return Object.entries(counts)
    .map(([name, totalLoans]) => ({ name, totalLoans }))
    .sort((a, b) => b.totalLoans - a.totalLoans)
    .slice(0, 15);
}
// low-stock analytic 
// based off item quantity and reflects need for a restock
export function buildLowStockData(inventory: InventoryRow[]) : {name: string; available: number; status: string;}[] {
  return inventory.map((item) => {
    const status = getStockStatus(item); 

    return {
      name: item.name ?? "Unknown Item", 
      available: item.net_stock ?? 0, 
      status,
    }
  })
  .filter((item) => 
    item.status === "Low Stock" || item.status === "Out of Stock",
  ).sort((a, b) => a.available - b.available).slice(0, 15);
}

// equipment-type analytic for inventory distribution by equipment type
export function buildEqTypeDistribution(inventory: InventoryRow[]): {equipmentType: string; count: number;}[] {
  const counts: Record<string, number> = {}; 

  inventory.forEach((item) => {
    const type = item.item_properties?.equipment_type ?? "misc"; 
    counts[type] = (counts[type] ?? 0) + 1
  })

  return Object.entries(counts).map(([equipmentType, count]) => ({
    equipmentType, count
  }))
}

// equipment-type analytic for item popularity by equipment type
export function buildEqTypePopularity(inventory: InventoryRow[]) : {type: string; borrowed: number;}[] {
  const counts: Record<string, number> = {}; 

  inventory.forEach((item) => {
    const type = normalizeEqType(item.item_properties?.equipment_type) || "misc"; 
    const borrowed = Math.max(0, (item.total_stock ?? 0) - (item.net_stock ?? 0)); 
    counts[type] = (counts[type] ?? 0) + borrowed;
  })

  return Object.entries(counts).map(([type, borrowed]) => ({type, borrowed})).sort((a, b) => b.borrowed - a.borrowed);
}

