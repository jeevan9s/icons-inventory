"use client"
import { useRef, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGetRows } from "./useDatabase";
import { LoanRow } from "../types";
import { getUnifiedActivity, enrichData, loanFetcher } from "../helpers";

// hook for activity feed table in dashboard
// logic for getting recent events 

export function useActivity() {
  const { data: rawLoans = [], isLoading: loansLoading } = useGetRows<LoanRow>("Loans");
  const { data: rawStock = [], isLoading: stockLoading } = useGetRows<any>("Stock");

  const seenAt = useRef<Record<string, number>>({});
  const snapshots = useRef<Record<string, string>>({});
  const stockIds = useRef<Set<string>>(new Set());
  const stockNames = useRef<Record<string, string>>({});
  const clearedBefore = useRef<number>(Date.now());
  const initialized = useRef(false);
  const [clearVersion, setClearVersion] = useState(0);

  const loanVersion = useMemo(() => JSON.stringify(rawLoans), [rawLoans]);
  const stockVersion = useMemo(() => JSON.stringify(rawStock), [rawStock]);

  const typedRawLoans = Array.isArray(rawLoans) ? rawLoans : [];
  const typedRawStock = Array.isArray(rawStock) ? rawStock : [];

  const query = useQuery({
    queryKey: ["enriched-activity", loanVersion, stockVersion, clearVersion],
    queryFn: async () => {
      typedRawLoans.forEach((loan: LoanRow) => {
        if (!loan.id) return;
        const snapshot = JSON.stringify(loan);
        const outKey = `${loan.id}-out`;
        const inKey = `${loan.id}-in`;

        if (!snapshots.current[loan.id]) {
          if (initialized.current) {
            seenAt.current[outKey] = Date.now();
          } else {
            seenAt.current[outKey] = 0;
          }
          seenAt.current[inKey] = 0;
          snapshots.current[loan.id] = snapshot;
        } else if (snapshots.current[loan.id] !== snapshot) {
          if (loan.time_in && seenAt.current[inKey] === 0) {
            seenAt.current[inKey] = Date.now();
          } else {
            seenAt.current[outKey] = Date.now();
          }
          snapshots.current[loan.id] = snapshot;
        }
      });

      const enriched = typedRawLoans.length ? await enrichData(typedRawLoans, loanFetcher) : [];
      const loanActivity = getUnifiedActivity(enriched as LoanRow[], seenAt.current);

      const stockActivity: any[] = [];
      const currentStockIds = new Set(typedRawStock.map((i: any) => i.id));

      typedRawStock.forEach((item: any) => {
        if (!item.id) return;
        stockNames.current[item.id] = item.name;
        if (!stockIds.current.has(item.id)) {
          if (initialized.current) {
            seenAt.current[`stock-${item.id}`] = Date.now();
            stockActivity.push({
              id: `stock-${item.id}`,
              type: "stock",
              date: new Date(seenAt.current[`stock-${item.id}`]),
              status: "added",
              action: "added",
              display_name: "—",
              item_name: item.name || "Unknown Item",
              student_name: "—",
            });
          } else {
            stockIds.current.add(item.id);
          }
        }
      });

      // detect deletions
      stockIds.current.forEach((id: string | number) => {
        if (!currentStockIds.has(id)) {
          stockActivity.push({
            id: `stock-${id}-removed`,
            type: "stock",
            date: new Date(),
            status: "removed",
            action: "removed",
            display_name: "—",
            item_name: stockNames.current[id] || "Unknown Item",
            student_name: "—",
          });
        }
      });

      stockIds.current = currentStockIds;
      initialized.current = true;

      return [...loanActivity, ...stockActivity]
        .filter((a) => a.date.getTime() > clearedBefore.current)
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 20);
    },
    enabled: !loansLoading && !stockLoading,
    refetchInterval: 5000,
  });

  const clear = () => {
    clearedBefore.current = Date.now();
    setClearVersion((v) => v + 1);
  };

  return { ...query, clear };
}