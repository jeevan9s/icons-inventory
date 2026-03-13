// general helpers for frontend hooks 

import { InventoryRow } from "@/app/components/InventoryTable";
import { LoanRow } from "@/app/components/LoansTable";

// status helpers

// getLoanStatus -> should return whether a loan was completed/incomplete 
export function getLoanStatus(loan: LoanRow): string {
    if (loan.time_in) return 'Returned'
    else return 'Not Returned'
}

// getStockStatus -> should return "how much" of an item there is
export function getStockStatus(item: InventoryRow): string {
    if (item.net_stock <= 0) return 'Out of Stock'
    if (item.net_stock / item.total_stock <= 0.25) return 'Low Stock'
    return 'Available'
}




