import { TableName, filterQualifier } from "./types";
import { Database } from "../database-functions/database.types";
import {
  getDataFiltered,
  insertEntry,
  getData,
  deleteById,
  exportTable,
  importCSV,
  updateEntry,
} from "../database-functions/databaseHelpers";
import { getLoanStatus, getStockStatus } from "./helpers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deEnrichRow } from "../helpers";
import Papa from "papaparse"

// query -> read/fetch data
// mutate -> update, create, and delete data

// fetch all database rows
export const useGetRows = <T>(tableName: TableName) => {
  return useQuery<T[]>({
    queryKey: [tableName],
    queryFn: async () => {
      const data = await getData(tableName, "id", true);
      return data || [];
    },
    refetchInterval: 5000,
  });
};

// delete a row from a table
export const useDeleteRow = <
  T extends keyof Database["public"]["Tables"]
>(table: T) => {
  return useMutation({
    mutationFn: async (id: Database["public"]["Tables"][T]["Row"]["id"]) => {
      return await deleteById(table, id);
    },
  });
};

// export data for any table using filters or a full export
export const useExport = (tableName: TableName) => {
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
            if (signeeName && row.signee && row.signee !== null && row.signee !== undefined) {
              const profile = await getDataFiltered(
                "Profiles",
                "id",
                "e",
                row.signee,
              );
              const actualName = profile?.[0]?.name || row.student_name || "";
              if (
                !actualName.toLowerCase().includes(signeeName.toLowerCase())
              ) {
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
            // skip enrichment if required fields are missing or invalid
            if (!row.signee || !row.id || row.signee === null || row.id === null || row.signee === undefined || row.id === undefined) {
              enrichedFilteredData.push({
                ...row,
                signee: row.student_name || "-",
                item_name: "-",
                status: getLoanStatus(row),
              });
              continue;
            }

            const [profile, loanItems] = await Promise.all([
              getDataFiltered("Profiles", "id", "e", row.signee),
              getDataFiltered("Loan Items", "loan_id", "e", row.id),
            ]);

            const itemDetails = await Promise.all(
              (loanItems || []).map(async (li: any) => {
                if (!li.item_id || li.item_id === null || li.item_id === undefined) return { name: "Unknown", equipment_type: undefined };
                const stock = await getDataFiltered(
                  "Stock",
                  "id",
                  "e",
                  li.item_id,
                );
                const name = stock?.[0]?.name || "Unknown";
                const equipment_type = stock?.[0]?.item_properties?.equipment_type;
                return {
                  name: name.charAt(0).toUpperCase() + name.slice(1),
                  equipment_type
                };
              }),
            );

            // get the first equipment_type from the items
            const equipment_type = itemDetails.find(item => item.equipment_type)?.equipment_type;

            enrichedFilteredData.push({
              ...row,
              signee: profile?.[0]?.name || row.student_name || "-",
              item_name: itemDetails.length > 0 ? itemDetails.map(item => item.name).join(", ") : "-",
              equipment_type,
              status: getLoanStatus(row),
            });
          } else {
            enrichedFilteredData.push(row);
          }
        }
      }

      if (enrichedFilteredData.length === 0) return [];

      const sanitizedData = enrichedFilteredData.map((row) => {
        const newRow = { ...row };
        for (const key in newRow) {
          if (typeof newRow[key] === "string") {
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
export const useRowFiltered = <
  T extends TableName,
  C extends keyof Database["public"]["Tables"][T]["Row"],
>(
  tableName: T,
  column: C,
  qualifier: filterQualifier,
  filterTerm: Database["public"]["Tables"][T]["Row"][C],
) => {
  return useQuery({
    queryKey: [tableName, column, qualifier, filterTerm],
    queryFn: async () => {
      const data = await getDataFiltered(
        tableName,
        column,
        qualifier,
        filterTerm,
      );
      console.log(`Filtered ${tableName}`, data);
      if (!data) throw new Error(`Filter failed for ${tableName}`);
      return data;
    },
  });
};

// insert a row into a tabnle
export const useRowInsert = <
  T extends keyof Database["public"]["Tables"],
>() => {
  return useMutation({
    mutationFn: async (params: {
      table: T;
      data: Database["public"]["Tables"][T]["Insert"];
    }) => {
      const { table, data } = params;
      const result = await insertEntry(table, data);
      console.log(`Inserted into ${table}`, data);

      if (!result) {
        throw new Error(`insert failed for ${String(table)}`);
      }

      return result;
    },
  });
};

export const useCreateRow = <
  T extends keyof Database["public"]["Tables"],
>(table: T) => {
  const mutation = useRowInsert<T>();

  return {
    ...mutation,
    mutateAsync: (params: {
      data: Database["public"]["Tables"][T]["Insert"];
    }) => {
      return mutation.mutateAsync({
        table,
        data: params.data,
      });
    },
  };
};

// import a CSV to populate a table
export const useImport = <T extends TableName>(table: T) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const text = await file.text();

      const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        quoteChar: '"',
        escapeChar: '"',
        skipEmptyLines: 'greedy',
        strictHeader: false,
      } as any);

      const criticalErrors = parsed.errors.filter((err: any) =>
        err.code !== 'TooManyFields' && err.code !== 'TooFewFields'
      );

      if (criticalErrors.length > 0) {
        throw new Error(`CSV parse error: ${criticalErrors[0].message}`);
      }

      const filteredRows = parsed.data.map((row: any) => {
        const cleaned: any = {};
        Object.entries(row).forEach(([key, value]) => {
          if (key &&
            !key.startsWith('__') &&
            key.trim() &&
            value !== null &&
            value !== undefined &&
            value !== '') {
            cleaned[key] = value;
          }
        });
        return cleaned;
      });

      const originalRows = filteredRows.map((r: any) => ({ ...r }));

      const cleanedRows = await Promise.all(
        filteredRows.map((row: any) => {
          try {
            return deEnrichRow(table, row);
          } catch (err) {
            throw err;
          }
        })
      );

      const cleanedCsvString = Papa.unparse(cleanedRows);
      const cleanedFile = new File([cleanedCsvString], file.name, { type: "text/csv" });

      const result = await importCSV(table, cleanedFile);
      if (!result) throw new Error(`Import failed for ${String(table)}`);

      if (table === "Loans") {
        const insertedLoans = result as any[];

        for (let i = 0; i < insertedLoans.length; i++) {
          const loan = insertedLoans[i];
          const original = originalRows[i];
          if (!original.item_name) continue;

          const stockMatch = await getDataFiltered("Stock", "name", "ilike", `%${original.item_name.trim()}%`);
          if (!stockMatch || stockMatch.length === 0) continue;

          const stock = stockMatch[0];

          await insertEntry("Loan Items", {
            loan_id: loan.id,
            item_id: stock.id,
            item_quantity: 1,
          });

          const isActive = !original.time_in || original.time_in === "";
          if (isActive) {
            await updateEntry("Stock", stock.id, {
              net_stock: Number(stock.net_stock) - 1,
            });
          }
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
      queryClient.invalidateQueries({ queryKey: ["Loan Items"] });
      queryClient.invalidateQueries({ queryKey: ["Stock"] });
    },
    onError: (error: Error) => {
      console.error(`Import failed for ${String(table)}:`, error.message);
    },
  });

  const openPicker = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) mutation.mutate(file);
    };
    input.click();
  };

  return { ...mutation, openPicker };
};

// hook for updating entries, stock - rows
export const useUpdateRow = <T extends keyof Database["public"]["Tables"]>(
  table: T,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string | number;
      data: Database["public"]["Tables"][T]["Update"];
    }) => {
      const result = await updateEntry(table, id, data);

      if (!result) {
        throw new Error(`Update failed for ${String(table)} at ID: ${id}`);
      }

      return result;
    },
    onSuccess: async (updatedData, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [table] }),
        queryClient.invalidateQueries({ queryKey: [table, variables.id] }),
      ]);
    },
    onError: (error: Error) => {
      console.error(error);
    },
  });
};

export const useReturnToggle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loan: { id: number; time_in: string | null }) => {
      const isReturning = !loan.time_in; 

      await updateEntry("Loans", loan.id, {
        time_in: isReturning ? new Date().toISOString() : null,
      });

      const loanItems = await getDataFiltered("Loan Items", "loan_id", "e", loan.id);
      if (!loanItems || loanItems.length === 0) return;

      for (const li of loanItems as any[]) {
        const stock = await getDataFiltered("Stock", "id", "e", li.item_id);
        if (!stock || stock.length === 0) continue;

        const current = stock[0];
        const qty = li.item_quantity ?? 1;

        await updateEntry("Stock", current.id, {
          net_stock: isReturning
            ? Number(current.net_stock) + qty   // returning: add back
            : Number(current.net_stock) - qty,  // un-returning: subtract again
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Loans"] });
      queryClient.invalidateQueries({ queryKey: ["Stock"] });
      queryClient.invalidateQueries({ queryKey: ["Loan Items"] });
    },
    onError: (error: Error) => {
      console.error("Return toggle failed:", error.message);
    },
  });
};

export const useDeleteLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loanId: number) => {
      const loanItems = await getDataFiltered("Loan Items", "loan_id", "e", loanId);

      if (loanItems && loanItems.length > 0) {
        for (const li of loanItems as any[]) {
          const stock = await getDataFiltered("Stock", "id", "e", li.item_id);
          if (!stock || stock.length === 0) continue;

          const current = stock[0];
          const qty = li.item_quantity ?? 1;
          const loan = await getDataFiltered("Loans", "id", "e", loanId);
          const isActive = !loan?.[0]?.time_in;

          if (isActive) {
            await updateEntry("Stock", current.id, {
              net_stock: Number(current.net_stock) + qty,
            });
          }
        }
      }

      await deleteById("Loans", loanId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Loans"] });
      queryClient.invalidateQueries({ queryKey: ["Stock"] });
      queryClient.invalidateQueries({ queryKey: ["Loan Items"] });
    },
    onError: (error: Error) => {
      console.error("Delete loan failed:", error.message);
    },
  });
};

export const useUpdateLoanQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loanItemId, newQuantity, oldQuantity, itemId }: {
      loanItemId: number;
      newQuantity: number;
      oldQuantity: number;
      itemId: number;
    }) => {
      await updateEntry("Loan Items", loanItemId, { item_quantity: newQuantity });

      const stock = await getDataFiltered("Stock", "id", "e", itemId);
      if (!stock || stock.length === 0) throw new Error("Stock item not found");

      const diff = newQuantity - oldQuantity;
      await updateEntry("Stock", stock[0].id, {
        net_stock: Number(stock[0].net_stock) - diff,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Loans"] });
      queryClient.invalidateQueries({ queryKey: ["Loan Items"] });
      queryClient.invalidateQueries({ queryKey: ["Stock"] });
    },
    onError: (error: Error) => {
      console.error("Quantity update failed:", error.message);
    },
  });
};