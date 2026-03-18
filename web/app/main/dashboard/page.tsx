"use client";

import { useState, useEffect } from "react";
import Layout from "@/app/components/Layout";
import {
  Plus, Package, ClipboardList, ListTodo, AlertTriangle,
  Download, History, TrendingUp, Table as TableIcon, LayoutGrid, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InventoryTable from "@/app/components/InventoryTable";
import LoansTable from "@/app/components/LoansTable";
import StatCard from "@/app/components/StatCard";
import { useDatabase } from "@/services/lib/hooks/useDatabase";
import { useDialog } from "@/services/lib/hooks/useDialog";
import ExportDialog from "@/app/components/ExportDialog";
import AddDialog from "@/app/components/AddDialog";
import { getLoanStatus, getStockStatus } from "@/services/lib/hooks/helpers";
import { getDataFiltered } from "@/services/lib/database-functions/databaseHelpers";

type Tab = "inventory" | "loans";
type ViewMode = "table" | "grid";

export default function Dashboard() {
  const { useGetRows, useDeleteRow } = useDatabase();
  const deleteStock = useDeleteRow("Stock");
  const deleteLoans = useDeleteRow("Loans");

  const [tab, setTab] = useState<Tab>("loans");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isExportOpen, setExportOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [processedLoans, setProcessedLoans] = useState<any[]>([]);

  const { data: inventoryData = [] } = useGetRows("Stock");
  const { data: rawLoansData = [] } = useGetRows("Loans");

  const formatText = (text: string | null | undefined) => {
    if (!text || text === "—") return "—";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const handleClear = async () => {
    const isInventory = tab === "inventory";
    const mutation = isInventory ? deleteStock : deleteLoans;
    const currentData = isInventory ? inventoryData : processedLoans;
    const targets = selectedRows.length > 0 ? selectedRows : currentData;

    if (targets.length === 0) return;

    const confirmMsg = selectedRows.length > 0 
      ? `Delete ${selectedRows.length} selected items?` 
      : `Are you sure you want to clear ALL ${tab}?`;

    if (window.confirm(confirmMsg)) {
      targets.forEach((row: any) => mutation.mutate(row.id));
      setSelectedRows([]);
    }
  };

  useEffect(() => {
    const processData = async () => {
      const mapped = await Promise.all(
        rawLoansData.map(async (row: any) => {
          const [profile, loanItems] = await Promise.all([
            getDataFiltered("Profiles", "id", "e", row.signee),
            getDataFiltered("Loan Items", "loan_id", "e", row.id),
          ]);

          const itemDetails = await Promise.all(
            (loanItems || []).map(async (li: any) => {
              const stock = await getDataFiltered("Stock", "id", "e", li.item_id);
              const rawName = stock?.[0]?.name || "Unknown";
              return rawName.charAt(0).toUpperCase() + rawName.slice(1);
            })
          );

          return {
            ...row,
            item_name: itemDetails.length > 0 ? itemDetails.join(", ") : "—",
            display_name: profile?.[0]?.name || row.student_name || "—",
            status: formatText(getLoanStatus(row))
          };
        })
      );
      setProcessedLoans(mapped);
    };
    if (rawLoansData.length > 0) {
      processData();
    } else {
      setProcessedLoans([]);
    }
  }, [rawLoansData]);

  const activeLoans = processedLoans.filter(l => l.status === "Active" || l.status === "Overdue").length;
  const returned = processedLoans.filter(l => l.status === "Returned").length;
  const lowStock = inventoryData.filter(i => ["Low Stock", "Out of Stock"].includes(getStockStatus(i))).length;

  const { Dialog: Add, open: AddOpen } = useDialog(AddDialog);

  const getIndicatorColor = (status: string) => {
    switch (status) {
      case 'Available': case 'In Stock': return 'bg-green-400';
      case 'Returned': return 'bg-blue-400';
      case 'Overdue': case 'Out of Stock': return 'bg-red-400';
      case 'Active': return 'bg-neutral-400';
      default: return 'bg-amber-400';
    }
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-115px)] px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-4 overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 shrink-0">
          <StatCard icon={Package} label={formatText("Total items")} value={inventoryData.length} />
          <StatCard icon={ClipboardList} label={formatText("Active Loans")} value={activeLoans} />
          <StatCard icon={ListTodo} label={formatText("Returned")} value={returned} />
          <StatCard icon={AlertTriangle} label={formatText("Low / Out of Stock")} value={lowStock} />
        </div>

        <div className="flex flex-col xl:flex-row gap-4 flex-1 min-h-0 overflow-hidden">
          <div className="flex flex-col min-w-0 xl:flex-[2.5] border border-neutral-100 rounded-2xl bg-white min-h-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 gap-3 shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
                  {(["loans", "inventory"] as Tab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTab(t); setSelectedRows([]); }}
                      className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${tab === t ? "bg-white shadow-sm text-neutral-800" : "text-neutral-400"}`}
                    >
                      {formatText(t)}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-0.5 bg-neutral-50 border border-neutral-100 rounded-lg p-0.5">
                  <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-md ${viewMode === "table" ? "bg-white shadow-sm text-neutral-800" : "text-neutral-400"}`}><TableIcon size={14} /></button>
                  <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md ${viewMode === "grid" ? "bg-white shadow-sm text-neutral-800" : "text-neutral-400"}`}><LayoutGrid size={14} /></button>
                </div>
              </div>
              <div className="flex flex-row gap-2">
                <button 
                  onClick={handleClear}
                  className={`flex items-center gap-1.5 px-4 py-2 text-[11px] rounded-lg transition-all font-medium border ${selectedRows.length > 0 ? "bg-red-50 border-red-100 text-red-600 hover:bg-red-100" : "bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50"}`}
                >
                  <Trash2 size={12} /> {selectedRows.length > 0 ? `Clear (${selectedRows.length})` : "Clear All"}
                </button>
                <button onClick={() => setExportOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-neutral-800 text-white text-[11px] rounded-lg hover:bg-neutral-700 hover:cursor-pointer transition-colors font-medium"><Download size={12} /> {formatText("Export")}</button>
                <button onClick={AddOpen} className="flex items-center gap-1.5 px-4 py-2 bg-neutral-800 text-white text-[11px] rounded-lg hover:bg-neutral-700 transition-colors font-medium"><Plus size={12} /> {tab === "inventory" ? formatText("Add Item") : formatText("Log Rental")}</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-neutral-50/30">
              <AnimatePresence mode="wait">
                <motion.div key={`${tab}-${viewMode}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                  {viewMode === "table" ? (
                    tab === "inventory" ? <InventoryTable data={inventoryData} onSelectionChange={setSelectedRows} /> : <LoansTable data={processedLoans} onSelectionChange={setSelectedRows} />
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 2xl:grid-cols-7 gap-2 p-3">
                      {(tab === "inventory" ? inventoryData : processedLoans).map((item: any, idx: number) => {
                        const currentStatus = tab === "inventory" ? getStockStatus(item) : item.status;
                        return (
                          <div key={item.id || idx} className="aspect-square p-3 rounded-lg border border-neutral-100 bg-white flex flex-col justify-between hover:border-neutral-200 transition-colors cursor-pointer">
                             <div className="flex justify-between items-start">
                              <span className="text-[10px] font-medium uppercase text-neutral-400 tracking-tight">{formatText(currentStatus)}</span>
                              <div className={`w-1.5 h-1.5 rounded-full ${getIndicatorColor(currentStatus)}`} />
                            </div>
                            <h4 className="text-[14px] font-medium text-neutral-900 leading-[1.2] line-clamp-2">{formatText(tab === "inventory" ? item.name : item.item_name)}</h4>
                            <div className="flex flex-col gap-0.5 border-t border-neutral-50 pt-2">
                              <p className="text-[11px] text-neutral-600 truncate">{formatText(tab === "inventory" ? `Qty: ${item.total_stock}` : item.display_name)}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="xl:flex-[1] min-w-0 flex flex-col gap-4">
            <div className="flex-1 border border-neutral-100 rounded-2xl bg-white flex flex-col overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2 shrink-0">
                <History size={15} className="text-neutral-400" />
                <h3 className="text-[10px] font-medium uppercase tracking-widest text-neutral-800">{formatText("Recent activity")}</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {processedLoans.slice(0, 12).map((loan: any, idx: number) => (
                  <div key={loan.id || idx} className="flex gap-3 items-center border-b border-neutral-50 pb-2 last:border-0">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getIndicatorColor(loan.status)}`} />
                    <div className="flex flex-col min-w-0">
                      <p className="text-[11px] font-medium text-neutral-800 leading-tight tracking-tight">
                        Logged rental of <span className="text-neutral-900 font-semibold">{loan.item_name}</span> for <span className="text-neutral-900 font-semibold capitalize">{loan.student_name}</span>
                      </p>
                      <p className="text-[9px] text-neutral-400 mt-0.5">{loan.status} • {loan.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-fit border border-neutral-100 rounded-2xl bg-white p-4 shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={15} className="text-neutral-400" />
                <h3 className="text-[10px] font-medium uppercase tracking-widest text-neutral-800">{formatText("Quick Stats")}</h3>
              </div>
            </div>
          </div>
        </div>

        <ExportDialog isOpen={isExportOpen} onClose={() => setExportOpen(false)} initialTableType={tab === "inventory" ? "Stock" : "Loans"} fixedTableType={true} hasSelectedRows={selectedRows.length > 0} selectedRows={selectedRows} />
        <Add />
      </div>
    </Layout>
  );
}