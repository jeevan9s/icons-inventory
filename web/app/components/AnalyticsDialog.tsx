"use client";

import { useMemo } from "react";
import Modal from "./Modal";
import { InventoryRow, LoanRow } from "@/services/lib/types";
import { buildDemandData } from "@/services/lib/analytics";
import { getLoanStatus } from "@/services/lib/hooks/helpers";
import { getStockStatus } from "@/services/lib/hooks/helpers";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryRow[];
  loans: LoanRow[];
};

export default function AnalyticsDialog({ isOpen, onClose, inventory, loans }: Props) {
 
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Analytics" size="lg">
      <div className="flex flex-col gap-6 py-2">

      </div>
    </Modal>
  );
}