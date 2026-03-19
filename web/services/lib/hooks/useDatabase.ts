// @/services/lib/hooks/useDatabase.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteById, exportTable } from "../database-functions/databaseHelpers";
import { TableName } from "./types";
import { getData } from "../database-functions/databaseHelpers";
import { getDataFiltered } from "../database-functions/databaseHelpers";
import { filterQualifier } from "./types";
import { getLoanStatus } from "./helpers";
import { getStockStatus } from "./helpers";
import { Database } from "../database-functions/database.types";
import { insertEntry } from "../database-functions/databaseHelpers";
// query -> read/fetch data
// mutate -> update, create, and delete data

export const useDatabase = () => {
  const queryClient = useQueryClient();

  const useGetRows = (tableName: TableName) => {
    return useQuery({
      queryKey: [tableName],
      queryFn: async () => {
        const data = await getData(tableName, "id", true);
        console.log(`received: ${tableName} (${data?.length || 0} rows)`);
        return data || [];
      },
    });
  };

  const useDeleteRow = (tableName: TableName) => {
    return useMutation({
      mutationFn: (id: number) => deleteById(tableName, id),
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: [tableName] });
        console.log(`deleted ${tableName} item #`, id);
      },
      onError: (error: Error) => {
        console.error(`deletion failed:`, error.message);
      },
    });
  };

  const useExport = (tableName: TableName) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (payload: any) => {
        // 1. Fetch the primary data
        const allData = (await getData(tableName, "id", true)) as any[];
        if (!allData || allData.length === 0) return [];

        // 2. Pre-fetch reference data to avoid N+1 query performance issues
        let profileMap: Record<string, any> = {};
        let stockMap: Record<string, any> = {};

        if (tableName === "Loans") {
          const [profiles, stock] = await Promise.all([
            getData("Profiles", "id", true),
            getData("Stock", "id", true)
          ]);
          
          profileMap = (profiles || []).reduce((acc: any, p: any) => ({ ...acc, [p.id]: p }), {});
          stockMap = (stock || []).reduce((acc: any, s: any) => ({ ...acc, [s.id]: s }), {});
        }

        const enrichedFilteredData = [];

        for (const row of allData) {
          let keepRow = true;

          // --- Filtering Logic ---
          if (payload.mode === "selected" && payload.ids) {
            keepRow = payload.ids.some((id: any) => String(id) === String(row.id));
          } 
          else if (payload.mode === "filtered" && payload.filters) {
            const f = payload.filters;

            if (tableName === "Stock") {
              if (f.threshold && Number(row.net_stock) > Number(f.threshold)) keepRow = false;
              if (keepRow && f.equipment_type && f.equipment_type !== "all") {
                if (row.item_properties?.equipment_type !== f.equipment_type) keepRow = false;
              }
              if (keepRow && f.status && f.status !== "all") {
                if (getStockStatus(row).toLowerCase() !== f.status.toLowerCase()) keepRow = false;
              }
            } 
            else if (tableName === "Loans") {
              if (f.signeeName) {
                const actualName = profileMap[row.signee]?.name || row.student_name || "";
                if (!actualName.toLowerCase().includes(f.signeeName.toLowerCase())) keepRow = false;
              }
              if (keepRow && f.status && f.status !== "all") {
                if (getLoanStatus(row).toLowerCase() !== f.status.toLowerCase()) keepRow = false;
              }
              const rowTime = row.time_out ? new Date(row.time_out) : null;
              if (keepRow && f.startDateTime && rowTime && rowTime < new Date(f.startDateTime)) keepRow = false;
              if (keepRow && f.endDateTime && rowTime && rowTime > new Date(f.endDateTime)) keepRow = false;
            }
          }

          // --- Enrichment Logic ---
          if (keepRow) {
            if (tableName === "Loans") {
              // Get the names of items in this specific loan
              const loanItems = await getDataFiltered("Loan Items", "loan_id", "e", row.id);
              const itemNames = (loanItems || []).map((li: any) => {
                const name = stockMap[li.item_id]?.name || "Unknown";
                return name.charAt(0).toUpperCase() + name.slice(1);
              });

              enrichedFilteredData.push({
                ...row,
                display_name: profileMap[row.signee]?.name || row.student_name || "—",
                item_name: itemNames.length > 0 ? itemNames.join(", ") : "—",
                status: getLoanStatus(row),
              });
            } else {
              enrichedFilteredData.push(row);
            }
          }
        }

        if (enrichedFilteredData.length === 0) return [];

        // Use casting here to ensure the data is passed correctly to your helper
        return (exportTable as any)(tableName, enrichedFilteredData);
      },
      onSuccess: () => {
        // No need to invalidate unless the export actually changes DB data
        console.log("Export successful");
      },
    });
  };

  const useRowFiltered = <T extends TableName, C extends keyof Database['public']['Tables'][T]['Row']>
  (tableName: T, column: C, qualifier: filterQualifier, filterTerm: Database['public']['Tables'][T]['Row'][C]) => {
    return useQuery({
      queryKey: [tableName, column, qualifier, filterTerm],
          queryFn: async () => {
        const data = await getDataFiltered(tableName, column, qualifier, filterTerm); 
        console.log(`Filtered ${tableName}`, data);
        if (!data) throw new Error(`Filter failed for ${tableName}`);
        return data;
      },
    });
  };

  const useRowInsert = <T extends keyof Database['public']['Tables']>() => {
    return useMutation({
      mutationFn: async (params: {table: T, data: Database["public"]["Tables"][T]["Insert"]}
     )  => {
      const {table, data} = params
      const result = await insertEntry(table, data); 
      console.log(`Inserted into ${table}`, data);

      if (!result) {
        throw new Error(`insert failed for ${String(table)}`)
      }

      return result;
    }
    });
  };

  return { useGetRows, useDeleteRow, useExport, useRowFiltered, useRowInsert };
};

