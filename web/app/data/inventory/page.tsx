"use client";

import { useState } from "react";
import Layout from "@/app/components/Layout";
import InventoryTable from "@/app/components/InventoryTable";
import { useDatabase } from "@/services/lib/hooks/useDatabase";
import { Plus, Download, Package, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDialog } from "@/services/lib/hooks/useDialog";
import AddDialog from "@/app/components/AddDialog";
import ExportDialog from "@/app/components/ExportDialog";

export default function InventoryPage() {
  const { useGetRows } = useDatabase();
  const { data: inventoryData = [] } = useGetRows("Stock");
  
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [isExportOpen, setExportOpen] = useState(false);

  const { Dialog: Add, open: AddOpen } = useDialog(AddDialog);

  return (
    <Layout>
      <div className="h-[calc(100vh-115px)] px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Inventory</h1>
            <p className="text-xs text-neutral-500 mt-0.5">Manage and track equipment stock </p>
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
          <InventoryTable 
            data={inventoryData} 
            onSelectionChange={setSelectedRows} 
          />
        </div>

        <ExportDialog 
          isOpen={isExportOpen} 
          onClose={() => setExportOpen(false)} 
          initialTableType="Stock" 
          fixedTableType={true} 
          hasSelectedRows={selectedRows.length > 0} 
          selectedRows={selectedRows} 
        />
        <Add />
      </div>
    </Layout>
  );
}