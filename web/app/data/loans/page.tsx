"use client";

import { useState } from "react";
import Layout from "@/app/components/Layout";
import { useDatabase } from "@/services/lib/hooks/useDatabase";
import { Plus, Download } from "lucide-react";
import { useDialog } from "@/services/lib/hooks/useDialog";
import AddDialog from "@/app/components/AddDialog";
import ExportDialog from "@/app/components/ExportDialog";
import LoansTable from "@/app/components/LoansTable";
import { InventoryRow, LoanRow } from "@/services/lib/types";

export default function LoanPage() {
  const { useGetRows } = useDatabase();
  const { data: loanData = [] } = useGetRows("Loans");
  
  const [selectedRows, setSelectedRows] = useState<(InventoryRow | LoanRow)[]>([]);
  const [isExportOpen, setExportOpen] = useState(false);

  const { Dialog: Add, open: AddOpen } = useDialog(AddDialog);

  return (
    <Layout>
      <div className="h-[calc(100vh-115px)] px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Loans</h1>
            <p className="text-xs text-neutral-500 mt-0.5">Manage and track equipment loans </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setExportOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-neutral-200 text-neutral-700 text-[11px] rounded-lg hover:bg-neutral-50 transition-colors font-medium shadow-sm"
            >
              <Download size={12} /> Export
            </button>
            <button 
              onClick={AddOpen}
              className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white text-[11px] rounded-lg hover:bg-neutral-800 transition-all font-medium shadow-sm active:scale-95"
            >
              <Plus size={12} /> Add Item
            </button>
          </div>
        </div>

        <div className="flex-1 border border-neutral-100 rounded-2xl bg-white flex flex-col overflow-hidden shadow-sm">
          <LoansTable 
            data={loanData as LoanRow[]} 
            onSelectionChange={setSelectedRows} 
          />
        </div>

        <ExportDialog 
          isOpen={isExportOpen} 
          onClose={() => setExportOpen(false)} 
          initialTableType="Loans" 
          fixedTableType={true} 
          hasSelectedRows={selectedRows.length > 0} 
          selectedRows={selectedRows} 
        />
        <Add />
      </div>
    </Layout>
  );
}