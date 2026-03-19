// general lib helpers

import { setMinutes, setHours } from "date-fns";
import { getDataFiltered } from "./database-functions/databaseHelpers";
import { getStockStatus } from "./hooks/helpers";
import { InventoryRow, LoanItemRow, LoanRow } from "./types";
import { ActivityItem } from "./types";

export const createDateTime = (
  date: Date,
  hour: string,
  minute: string,
  period: string,
) => {
  let h = parseInt(hour);
  if (period === "PM" && h < 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return setMinutes(setHours(date, h), parseInt(minute));
};

// helper to capitalize every word (e.g., "room 302" -> "Room 302")
export const formatCapitalized = (text: string | null | undefined) => {
  if (!text || text === "—") return "—";
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

  export const formatText = (text: string | null | undefined) => {
    if (!text || text === "—") return "—";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

export async function enrichData<T, R>(
  data: T[],
  fetcher: (item: T) => Promise<R>
): Promise<(T & R)[]> {
  if (!data || data.length === 0) return [];
  
  return await Promise.all(
    data.map(async (item) => {
      const enrichment = await fetcher(item);
      return { ...item, ...enrichment };
    })
  );
}

export const loanFetcher = async (loan: LoanRow) => {
  const [profile, loanItems] = await Promise.all([
    getDataFiltered("Profiles", "id", "e", loan.signee),
    getDataFiltered("Loan Items", "loan_id", "e", loan.id),
  ]);

  const itemNames = await Promise.all(
    (loanItems || []).map(async (li: LoanItemRow) => {
      const stock = await getDataFiltered("Stock", "id", "e", li.item_id);
      return formatCapitalized(stock?.[0]?.name || "Unknown");
    })
  );

  return {
    display_name: profile?.[0]?.name || "—",
    item_name: itemNames.length > 0 ? itemNames.join(", ") : "—",
  };
};


  export const getIndicatorColor = (status: string) => {
    switch (status) {
      case 'Available': case 'In Stock': return 'bg-green-400';
      case 'Returned': return 'bg-neutral-400';
      case 'Overdue': case 'Out of Stock': return 'bg-red-400';
      case 'Active': return 'bg-blue-400';
      default: return 'bg-amber-400';
    }
  };


// for activity feed to get recent actions
export const getUnifiedActivity = (loans: LoanRow[], stock: InventoryRow[]): ActivityItem[] => {
  const loanActivity: ActivityItem[] = loans.map((l) => {
    const isReturned = l.status === "Returned";
    return {
      id: l.id,
      type: "loan",
      date: l.time_out ? new Date(l.time_out) : new Date(),
      status: l.status,
      item_name: formatCapitalized(l.item_name || ""),
      student_name: formatCapitalized(l.student_name || ""),
      display_name: formatCapitalized(l.display_name || ""),
      action: isReturned ? "completed" : "logged",
    };
  });

  const stockActivity: ActivityItem[] = stock.map((s) => ({
    id: s.id,
    type: "stock",
    date: new Date(0), 
    status: getStockStatus(s),
    item_name: formatCapitalized(s.name),
    action: "updated", 
  }));

  return [...loanActivity, ...stockActivity]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 20);
};
