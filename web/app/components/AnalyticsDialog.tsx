"use client";

import { useMemo } from "react";
import Modal from "./Modal";
import { InventoryRow, LoanRow } from "@/services/lib/types";
import { buildDemandData } from "@/services/lib/chart";
import { getLoanStatus } from "@/services/lib/hooks/helpers";
import { getStockStatus } from "@/services/lib/hooks/helpers";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryRow[];
  loans: LoanRow[];
};

export default function AnalyticsDialog({ isOpen, onClose, inventory, loans }: Props) {
  const topDemandItems = useMemo(() => {
    return buildDemandData(inventory).slice(0, 3).map(item => {
      const invItem = inventory.find(i => i.name === item.name);
      const percentageBorrowed = invItem && invItem.total_stock
        ? Math.round((item.borrowed / invItem.total_stock) * 100)
        : 0;
      return { ...item, percentageBorrowed };
    });
  }, [inventory]);

  const lowStockItems = useMemo(() => {
    return inventory.filter(i => ["Low Stock", "Out of Stock"].includes(getStockStatus(i)));
  }, [inventory]);

const loanStats = useMemo(() => {
  const safeLoans = loans ?? [];
  const active = safeLoans.filter(l => ["Active", "Overdue"].includes(getLoanStatus(l))).length;
  const overdue = safeLoans.filter(l => getLoanStatus(l) === "Overdue").length;
  const returned = safeLoans.filter(l => getLoanStatus(l) === "Returned").length;
  return { active, overdue, returned };
}, [loans]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Analytics" size="lg">
      <div className="flex flex-col gap-6 py-2">
        <div>
          <h4 className="text-med font-bold mb-2">Highest Demand Items</h4>
          {topDemandItems.length === 0 ? (
            <p className="text-neutral-400 text-sm">No borrowed items found.</p>
          ) : (
            topDemandItems.map((item, idx) => (
              <div key={idx} className="flex justify-between px-4 py-2 border rounded-lg bg-white mb-1">
                <span className="font-medium">{item.name}</span>
                <span className="text-sm text-neutral-500">{item.borrowed} borrowed ({item.percentageBorrowed}%)</span>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}