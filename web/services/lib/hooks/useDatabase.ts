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
        const allData = (await getData(tableName, "id", true)) as any[];
        if (!allData || allData.length === 0) return [];

        const enrichedFilteredData = [];

        for (const row of allData) {
          let keepRow = true;

          if (payload.mode === "selected" && payload.ids) {
            keepRow = payload.ids.some(
              (id: any) => String(id) === String(row.id),
            );
          } else if (payload.mode === "filtered" && payload.filters) {
            const {
              signeeName,
              startDateTime,
              endDateTime,
              status,
              equipment_type,
              threshold,
            } = payload.filters;

            if (tableName === "Stock") {
              const { threshold, equipment_type, status } = payload.filters;

              // filter by threshold
              if (threshold && Number(row.net_stock) > Number(threshold)) {
                keepRow = false;
              }

              // filter by equipment type
              if (keepRow && equipment_type && equipment_type !== "all") {
                if (row.item_properties?.equipment_type !== equipment_type) {
                  keepRow = false;
                }
              }

                // filter by status
              if (keepRow && status && status !== "all") {
                const currentStatus = getStockStatus(row).toLowerCase();
                if (currentStatus !== status.toLowerCase()) {
                  keepRow = false;
                }
              }
            } else if (tableName === "Loans") {
              // filter by signee name - using getDataFiltered for enrichment (might make this a helper function later on)
              if (signeeName) {
                const profile = await getDataFiltered(
                  "Profiles",
                  "id",
                  "e",
                  row.signee,
                );
                const actualName = profile?.[0]?.name || row.student_name || "";
                if (
                  !actualName.toLowerCase().includes(signeeName.toLowerCase())
                )
                  keepRow = false;
              }

              // filter by status
              if (keepRow && status && status !== "all") {
                const currentStatus = getLoanStatus(row).toLowerCase();
                if (currentStatus !== status.toLowerCase()) keepRow = false;
              }

              // filter by date
              const rowTimeOut = row.time_out ? new Date(row.time_out) : null;
              if (keepRow && startDateTime && rowTimeOut) {
                if (rowTimeOut < new Date(startDateTime)) keepRow = false;
              }
              if (keepRow && endDateTime && rowTimeOut) {
                if (rowTimeOut > new Date(endDateTime)) keepRow = false;
              }
            }
          }

          if (keepRow) {
            if (tableName === "Loans") {
              // enrichment
              const [profile, loanItems] = await Promise.all([
                getDataFiltered("Profiles", "id", "e", row.signee),
                getDataFiltered("Loan Items", "loan_id", "e", row.id),
              ]);

              const itemDetails = await Promise.all(
                (loanItems || []).map(async (li: any) => {
                  const stock = await getDataFiltered(
                    "Stock",
                    "id",
                    "e",
                    li.item_id,
                  );
                  const name = stock?.[0]?.name || "Unknown";
                  return name.charAt(0).toUpperCase() + name.slice(1);
                }),
              );

              enrichedFilteredData.push({
                ...row,
                display_name: profile?.[0]?.name || row.student_name || "—",
                item_name:
                  itemDetails.length > 0 ? itemDetails.join(", ") : "—",
                status: getLoanStatus(row),
              });
            } else {
              enrichedFilteredData.push(row);
            }
          }
        }

        if (enrichedFilteredData.length === 0) return [];

        return exportTable(tableName, enrichedFilteredData);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [tableName] });
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
    const queryClient = useQueryClient();
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


