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

  // fetch all database rows
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

  // delete a row from a table
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

  // export data for any table using filters or a full export
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
            if (threshold && Number(row.net_stock) > Number(threshold)) {
              keepRow = false;
            }
            if (keepRow && equipment_type && equipment_type !== "all") {
              if (row.item_properties?.equipment_type !== equipment_type) {
                keepRow = false;
              }
            }
            if (keepRow && status && status !== "all") {
              const currentStatus = getStockStatus(row).toLowerCase();
              if (currentStatus !== status.toLowerCase()) {
                keepRow = false;
              }
            }
          } else if (tableName === "Loans") {
            if (signeeName) {
              const profile = await getDataFiltered("Profiles", "id", "e", row.signee);
              const actualName = profile?.[0]?.name || row.student_name || "";
              if (!actualName.toLowerCase().includes(signeeName.toLowerCase())) {
                keepRow = false;
              }
            }
            if (keepRow && status && status !== "all") {
              const currentStatus = getLoanStatus(row).toLowerCase();
              if (currentStatus !== status.toLowerCase()) keepRow = false;
            }
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
            const [profile, loanItems] = await Promise.all([
              getDataFiltered("Profiles", "id", "e", row.signee),
              getDataFiltered("Loan Items", "loan_id", "e", row.id),
            ]);

            const itemDetails = await Promise.all(
              (loanItems || []).map(async (li: any) => {
                const stock = await getDataFiltered("Stock", "id", "e", li.item_id);
                const name = stock?.[0]?.name || "Unknown";
                return name.charAt(0).toUpperCase() + name.slice(1);
              }),
            );

            enrichedFilteredData.push({
              ...row,
              signee: profile?.[0]?.name || row.student_name || "-",
              item_name: itemDetails.length > 0 ? itemDetails.join(", ") : "-",
              status: getLoanStatus(row),
            });
          } else {
            enrichedFilteredData.push(row);
          }
        }
      }

      if (enrichedFilteredData.length === 0) return [];

      const sanitizedData = enrichedFilteredData.map(row => {
        const newRow = { ...row };
        for (const key in newRow) {
          if (typeof newRow[key] === 'string') {
            newRow[key] = newRow[key]
              .replace(/[\u2013\u2014]/g, "-") 
              .replace(/[\u2018\u2019]/g, "'") 
              .replace(/[\u201C\u201D]/g, '"'); 
          }
        }
        return newRow;
      });

      return (exportTable as any)(tableName, sanitizedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
  });
};
  // filter rows based on comparison with a qualifier and term
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

  // insert a row into a tabnle
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

  // import a CSV to populate a table

  return { useGetRows, useDeleteRow, useExport, useRowFiltered, useRowInsert };
};

