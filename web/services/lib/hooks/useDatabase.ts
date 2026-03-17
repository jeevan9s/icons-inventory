// @/services/lib/hooks/useDatabase.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteById } from "../database-functions/databaseHelpers"; 
import { TableName } from "./types";
import { getData } from "../database-functions/databaseHelpers";

// query -> read/fetch data
// mutate -> update, create, and delete data

export const useGetRows = (tableName: TableName) => {
    return useQuery({
        queryKey: [tableName],
        queryFn: async () => {
            const data = await getData(tableName, "id", true);
            console.log(`received: ${tableName} (${data?.length || 0} rows)`); // log result
            return data;
        }
    });
};

export const useDeleteRow = (tableName: TableName) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteById(tableName, id), 
    
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      console.log(`deleted ${tableName} item #`, id);
    },
    
    onError: (error, id) => {
      console.error(`deletion failed for item #${id}:`, error.message);
    }
  });
};

// Leo TODO
// useRowInsert - this requires Amaan's implementation, so I'd get started on useRowFiltred first since the function is already implemented. 

// useRowFiltered
export const useRowFiltered = (table: TableName, column: string, qualifier: filterQualifier) => {
  return useMutation({
    mutationFn: () => {
      return getDataFiltered(table, column, qualifier)
    },

    onSuccess: (data, ) => {
      console.log(`Filtered ${table} for ${column} ${qualifier}`);
    },

    onError: (error, ) => {
      console.error(`Filter failed for ${column} ${qualifier}:` , error.message);
    }
  });
};

export type filterQualifier = "e" | "gt" | "lt" | "gte" | "lte" ;
/*
use Spencer's "getDataFiltered()"" function for the mutation function (mutationFn) : , it is already imported at the top - but go check it out cause it'll make implementation easier
parameters needed: table name (same as all functions), column (string), and qualifier 

* the qualifier parameter basically selects which filter to use, i.e. equals to, greater than etc. 
* for this I suggest making a string union that matches the values of all qualifiers, the list can be found in the README file under services or in the function definition
* define string unions like "export type UnionName = "value1" | "value 2" | "value 3" and so on. 
* make sure you export both implementations
*/

// Jeevan TODO
// useRowUpdate

