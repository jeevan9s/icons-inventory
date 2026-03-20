import { setMinutes, setHours, parseISO } from "date-fns";
import { getDataFiltered } from "./database-functions/databaseHelpers";
import { LoanItemRow, LoanRow } from "./types";
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
  if (!loan.signee || !loan.id) {
    return { display_name: "—", item_name: "—", equipment_type: undefined, item_status: undefined };
  }

  const [profile, loanItems] = await Promise.all([
    getDataFiltered("Profiles", "id", "e", loan.signee),
    getDataFiltered("Loan Items", "loan_id", "e", loan.id),
  ]);

  const itemsList = (loanItems || []) as LoanItemRow[];

  if (!itemsList || itemsList.length === 0) {
    return {
      display_name: profile?.[0]?.name || "—",
      item_name: "—",
      equipment_type: undefined,
      item_status: undefined,
    };
  }

  // Deduplicate by item_id to avoid fetching the same stock item multiple times
  const uniqueItemIds = Array.from(new Set(itemsList.map(li => li.item_id).filter(Boolean)));

  const enrichedItems = await Promise.all(
    uniqueItemIds.map(async (itemId) => {
      const stock = await getDataFiltered("Stock", "id", "e", itemId);
      const itemData = stock?.[0];
      
      if (!itemData) return null;

      // Count how many times this item appears in the loan
      const quantity = itemsList.filter(li => li.item_id === itemId).length;
      // Get the first status from loan items for this stock item
      const itemStatus = itemsList.find(li => li.item_id === itemId)?.status;

      console.log(`Item ${itemData.name}: quantity=${quantity}, status=${itemStatus}`);

      return {
        name: formatCapitalized(itemData.name || "Unknown"),
        type: itemData.item_properties?.equipment_type,
        quantity,
        status: itemStatus
      };
    })
  );

  const validItems = enrichedItems.filter(Boolean);

  // Get all unique statuses from loan items
  const itemStatuses = Array.from(
    new Set(validItems.map(i => i?.status).filter(Boolean))
  ).join(", ");

  // Format item names with quantity if more than 1
  const itemNames = validItems.map(i => 
    i!.quantity > 1 ? `${i!.name} (x${i!.quantity})` : i!.name
  ).join(", ");

  const equipmentTypes = Array.from(
    new Set(validItems.map(i => i?.type).filter(Boolean))
  ).join(", ");

  return {
    display_name: profile?.[0]?.name || "—",
    item_name: itemNames || "—",
    equipment_type: equipmentTypes || undefined,
    item_status: itemStatuses || undefined,
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

export const getUnifiedActivity = (loans: LoanRow[]): ActivityItem[] => {
  const activities: ActivityItem[] = [];

  loans.forEach((l) => {
    const timeOutDate = parseISO(l.time_out);

    activities.push({
      id: `${l.id}-out`,
      type: "loan",
      date: timeOutDate,
      status: "Active",
      item_name: formatCapitalized(l.item_name || "Unknown Item"),
      student_name: formatCapitalized(l.student_name || "Unknown Student"),
      display_name: formatCapitalized(l.display_name || "Staff"),
      action: "logged loan of",
    });

    if (l.time_in) {
      const timeInDate = parseISO(l.time_in);

      activities.push({
        id: `${l.id}-in`,
        type: "loan",
        date: timeInDate,
        status: "Returned",
        item_name: formatCapitalized(l.item_name || "Unknown Item"),
        student_name: formatCapitalized(l.student_name || "Unknown Student"),
        display_name: formatCapitalized(l.display_name || "Staff"),
        action: "completed loan of",
      });
    }
  });

  return activities
    .filter((item) => !isNaN(item.date.getTime()))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 20);
};