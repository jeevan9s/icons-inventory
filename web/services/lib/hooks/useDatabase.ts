// @/services/lib/hooks/useDatabase.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteById } from "../database-functions/databaseHelpers"; 
import { TableName } from "./types";
import { getData } from "../database-functions/databaseHelpers";

export const useRowDelete = (tableName: TableName) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteById(tableName, id), 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
  });
};

export const useRows = (tableName: TableName) => {
  return useQuery({
    queryKey: [tableName],
    queryFn: () => getData(tableName, "id", true),
  });
};

// Leo TODO
// useRowInsert
// useRowFiltered

