// general helpers for frontend hooks 

import { InventoryRow } from "../types";
import { LoanRow } from "../types";

// status helpers

// getLoanStatus -> should return whether a loan was completed/incomplete 
export function getLoanStatus(loan: LoanRow): string {
    if (loan.time_in) {
        return 'Returned';
    }

    const now = new Date();
    const loanDate = new Date(loan.time_out); // timestamp when loan started
    const diffDays = (now.getTime() - loanDate.getTime()) / (1000 * 60 * 60 * 24); // convert to days

    if (diffDays > 2) {
        return 'Overdue';
    }

    return 'Active';
}

// getStockStatus -> should return "how much" of an item there is
export function getStockStatus(item: InventoryRow): string {
    if (item.total_stock === 0) {
        return 'No Stock Info';
    } else if (item.net_stock <= 0) {
        return 'Out of Stock';
    } else if (item.net_stock === 1 || item.net_stock / item.total_stock <= 0.25) {
        return 'Low Stock';
    } else {
        return 'Available';
    }
}




