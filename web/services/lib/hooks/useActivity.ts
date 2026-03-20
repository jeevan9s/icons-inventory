// @/services/lib/hooks/useActivity.ts
import { useQuery } from "@tanstack/react-query";
import { enrichData, loanFetcher, getUnifiedActivity } from "../helpers";
import { LoanRow } from "../types";
import { useGetRows } from "./useDatabase";

export function useActivity() {
  
  const { data: rawLoans = [], ...rest } = useGetRows<LoanRow>("Loans");

  return useQuery({
    queryKey: ["enriched-activity", rawLoans],
    queryFn: async () => {
      if (rawLoans.length === 0) return [];
      
      const enriched = await enrichData(rawLoans, loanFetcher);
      
      return getUnifiedActivity(enriched as LoanRow[]);
    },
    enabled: rawLoans.length >= 0,
  });
}