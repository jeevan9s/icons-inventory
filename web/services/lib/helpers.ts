import { setMinutes, setHours, parseISO } from "date-fns";
import { getDataFiltered } from "./database-functions/databaseHelpers";
import { LoanItemRow, LoanRow, ActivityItem } from "./types";

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
    return {
      display_name: "—",
      item_name: "—",
      equipment_type: undefined,
      item_status: undefined,
      item_quantity: undefined,
      loan_item_id: undefined,
      item_id: undefined,
    };
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
      item_quantity: undefined,
      loan_item_id: undefined,
      item_id: undefined,
    };
  }

  const uniqueItemIds = Array.from(new Set(itemsList.map(li => li.item_id).filter(Boolean)));

  const enrichedItems = await Promise.all(
    uniqueItemIds.map(async (itemId) => {
      const stock = await getDataFiltered("Stock", "id", "e", itemId);
      const itemData = stock?.[0];
      if (!itemData) return null;

      const loanItem = itemsList.find(li => li.item_id === itemId);
      const quantity = loanItem?.item_quantity ?? 1;
      const itemStatus = loanItem?.status;

      return {
        name: formatCapitalized(itemData.name || "Unknown"),
        type: itemData.item_properties?.equipment_type,
        quantity,
        status: itemStatus,
      };
    })
  );

  const validItems = enrichedItems.filter(Boolean);

  const itemStatuses = Array.from(
    new Set(validItems.map(i => i?.status).filter(Boolean))
  ).join(", ");

 const itemNames = validItems.map(i => i!.name).join(", ");

  const equipmentTypes = Array.from(
    new Set(validItems.map(i => i?.type).filter(Boolean))
  ).join(", ");

  return {
    display_name: profile?.[0]?.name || "—",
    item_name: itemNames || "—",
    equipment_type: equipmentTypes || undefined,
    item_status: itemStatuses || undefined,
    item_quantity: validItems.reduce((sum, i) => sum + (i?.quantity ?? 0), 0),
    loan_item_id: itemsList[0]?.id ?? undefined,
    item_id: itemsList[0]?.item_id ?? undefined,
  };
};

export const deEnrichRow = async (tableName: string, row: any) => {
  console.log(`[deEnrichRow] Processing row for table ${tableName}:`, row);
  const cleanRow = { ...row };

  const virtualColumns = ["item_name", "status", "equipment_type"];
  virtualColumns.forEach((col) => delete cleanRow[col]);
  console.log(`[deEnrichRow] After removing virtual columns:`, cleanRow);

  if (tableName === "Loans") {
    if (typeof cleanRow.signee === "string" && cleanRow.signee !== "-") {
      try {
        const profile = await getDataFiltered("Profiles", "name", "e", cleanRow.signee);
        if (profile && profile.length > 0) {
          cleanRow.signee = profile[0].id;
        }
      } catch (err) {
        throw err;
      }
    }

    if (cleanRow.time_out) cleanRow.time_out = new Date(cleanRow.time_out).toISOString();
    if (cleanRow.time_in) cleanRow.time_in = new Date(cleanRow.time_in).toISOString();
  }
  
  return cleanRow;
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