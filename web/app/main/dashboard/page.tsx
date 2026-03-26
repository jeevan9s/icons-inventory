"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Layout from "@/app/components/Layout";
import {
  Plus,
  Package,
  ClipboardList,
  ListTodo,
  AlertTriangle,
  Download,
  History,
  Table as TableIcon,
  LayoutGrid,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InventoryTable from "@/app/components/InventoryTable";
import StatCard from "@/app/components/StatCard";
import DashboardCard from "@/app/components/DashboardCard";
import ActivityFeed from "@/app/components/ActivityFeed";
import {
  useGetRows,
  useDeleteRow,
  useDeleteLoan,
} from "@/services/lib/hooks/useDatabase";
import ExportDialog from "@/app/components/ExportDialog";
import AddDialog from "@/app/components/AddDialog";
import { getLoanStatus, getStockStatus } from "@/services/lib/hooks/helpers";
import {
  formatText,
  getIndicatorColor,
  enrichData,
  loanFetcher,
} from "@/services/lib/helpers";
import { InventoryRow, LoanRow } from "@/services/lib/types";
import ImportDialog from "@/app/components/ImportDialog";

const UploadIcon = dynamic(
  () => import("lucide-react").then((mod) => mod.Upload),
  { ssr: false }
);
const LoansTable = dynamic(
  () => import("@/app/components/LoansTable"),
  { ssr: false }
);

type Tab = "inventory" | "loans";
type ViewMode = "table" | "grid";

export default function Dashboard() {
  const deleteStock = useDeleteRow("Stock");
  const deleteLoans = useDeleteLoan();

  const [tab, setTab] = useState<Tab>("loans");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isExportOpen, setExportOpen] = useState(false);
  const [isImportOpen, setImportOpen] = useState(false);
  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState<InventoryRow | LoanRow | null>(null);
  const [selectedRows, setSelectedRows] = useState<(InventoryRow | LoanRow)[]>(
    [],
  );
  const [processedLoans, setProcessedLoans] = useState<LoanRow[]>([]);

  const { data: inventoryData = [] } = useGetRows("Stock");
  const { data: rawLoansData = [] } = useGetRows("Loans");

  const typedInventoryData = inventoryData as InventoryRow[];
  const typedLoansData = rawLoansData as LoanRow[];

  const handleClear = async () => {
    const isInventory = tab === "inventory";
    const mutation = isInventory ? deleteStock : deleteLoans;
    const currentData = isInventory ? typedInventoryData : processedLoans;
    const targets = selectedRows.length > 0 ? selectedRows : currentData;

    if (targets.length === 0) return;

    const confirmMsg =
      selectedRows.length > 0
        ? `Delete ${selectedRows.length} selected items?`
        : `Are you sure you want to clear ALL ${tab}?`;

    if (window.confirm(confirmMsg)) {
      targets.forEach((row: InventoryRow | LoanRow) => mutation.mutate(row.id));
      setSelectedRows([]);
    }
  };

  const rawLoansRef = useRef<LoanRow[]>([]);

  useEffect(() => {
    if (JSON.stringify(rawLoansRef.current) === JSON.stringify(typedLoansData))
      return;
    rawLoansRef.current = typedLoansData;

    let isMounted = true;

    if (typedLoansData.length === 0) {
      setTimeout(() => {
        if (isMounted) setProcessedLoans([]);
      }, 0);
      return () => {
        isMounted = false;
      };
    }

    enrichData(typedLoansData, loanFetcher).then((newData) => {
      if (!isMounted) return;
      setProcessedLoans(newData as LoanRow[]);
    });

    return () => {
      isMounted = false;
    };
  }, [typedLoansData]);

  const handleSelectionChange = useCallback(
    (rows: (InventoryRow | LoanRow)[]) => {
      setSelectedRows((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(rows)) return prev;
        return rows;
      });
    },
    [],
  );

  const activeLoans = processedLoans.filter((l) =>
    ["Active", "Overdue"].includes(getLoanStatus(l)),
  ).length;
  const returned = processedLoans.filter(
    (l) => getLoanStatus(l) === "Returned",
  ).length;
  const lowStock = typedInventoryData.filter((i) =>
    ["Low Stock", "Out of Stock"].includes(getStockStatus(i)),
  ).length;

  return (
    <Layout>
      <div className="h-[calc(100vh-115px)] px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-4 overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 shrink-0">
          <StatCard
            icon={Package}
            label={formatText("Total items")}
            value={inventoryData.length}
          />
          <StatCard
            icon={ClipboardList}
            label={formatText("Active Loans")}
            value={activeLoans}
          />
          <StatCard
            icon={ListTodo}
            label={formatText("Returned")}
            value={returned}
          />
          <StatCard
            icon={AlertTriangle}
            label={formatText("Low / Out of Stock")}
            value={lowStock}
          />
        </div>

        <div className="flex flex-col xl:flex-row gap-4 flex-1 min-h-0 overflow-hidden">
          <div className="flex flex-col min-w-0 xl:flex-[2.5] border border-neutral-100 rounded-2xl bg-white min-h-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 gap-3 shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
                  {(["loans", "inventory"] as Tab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTab(t);
                        setSelectedRows([]);
                      }}
                      className={`px-4 py-1.5 rounded-md text-xs font-medium hover:scale-103 hover:cursor-pointer transition-all duration-200 ease-in-out ${tab === t ? "bg-white shadow-sm text-neutral-800" : "text-neutral-400"}`}
                    >
                      {formatText(t)}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-0.5 bg-neutral-50 border border-neutral-100 rounded-lg p-0.5 hover:scale-103 hover:cursor-pointer transition-all duration-200 ease-in-out">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded-md hover:scale-103 hover:cursor-pointer transition-all duration-200 ease-in-out ${viewMode === "table" ? "bg-white shadow-sm text-neutral-800" : "text-neutral-400"}`}
                  >
                    <TableIcon size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md hover:scale-103 hover:cursor-pointer transition-all duration-200 ease-in-out ${viewMode === "grid" ? "bg-white shadow-sm text-neutral-800" : "text-neutral-400"}`}
                  >
                    <LayoutGrid size={14} />
                  </button>
                </div>
              </div>
              <div className="flex flex-row gap-2">
                <button
                  onClick={() => setAddOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-neutral-800 text-white text-[11px] rounded-lg hover:bg-neutral-700 hover:scale-103 hover:cursor-pointer transition-all duration-200 ease-in-out font-medium"
                >
                  <Plus size={12} />
                  {tab === "inventory"
                    ? formatText("Add Item")
                    : formatText("Log Loan")}
                </button>
                <button
                  onClick={handleClear}
                  className={`flex items-center gap-1.5 px-4 py-2 text-[11px] rounded-lg font-medium border hover:scale-103 hover:cursor-pointer transition-all duration-200 ease-in-out ${selectedRows.length > 0 ? "bg-red-50 border-red-100 text-red-600 hover:bg-red-100" : "bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50"}`}
                >
                  <Trash2 size={12} />
                  {selectedRows.length > 0
                    ? `Clear (${selectedRows.length})`
                    : "Clear All"}
                </button>
                <button
                  onClick={() => setImportOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-neutral-800 text-white text-[11px] rounded-lg hover:bg-neutral-700 hover:scale-103 hover:cursor-pointer transition-all duration-200 ease-in-out font-medium"
                >
                  <UploadIcon size={12} /> {formatText("Import")}
                </button>
                <button
                  onClick={() => setExportOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-neutral-800 text-white text-[11px] rounded-lg hover:bg-neutral-700 hover:scale-103 hover:cursor-pointer transition-all duration-200 ease-in-out font-medium"
                >
                  <Download size={12} /> {formatText("Export")}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-neutral-50/30">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${tab}-${viewMode}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full"
                >
                  {viewMode === "table" ? (
                    tab === "inventory" ? (
                      <InventoryTable
                        data={typedInventoryData}
                        onSelectionChange={handleSelectionChange}
                      />
                    ) : (
                      processedLoans.length > 0 && (
                        <LoansTable
                          data={processedLoans}
                          onSelectionChange={handleSelectionChange}
                        />
                      )
                    )
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 2xl:grid-cols-7 gap-2 p-3">
                      {(tab === "inventory"
                        ? typedInventoryData
                        : processedLoans
                      ).map((item) => {
                        const isInv = tab === "inventory";
                        const invItem = item as InventoryRow;
                        const loanItem = item as LoanRow;
                        const status = isInv
                          ? getStockStatus(invItem)
                          : getLoanStatus(loanItem);

                        return (
                          <DashboardCard
                            key={item.id}
                            status={status}
                            indicatorColor={getIndicatorColor(status)}
                            title={
                              isInv
                                ? invItem.name
                                : loanItem.item_name || "Unknown"
                            }
                            subtitle={
                              isInv
                                ? `${
                                    invItem.item_properties?.equipment_type
                                      ? invItem.item_properties.equipment_type.charAt(0).toUpperCase() +
                                        invItem.item_properties.equipment_type.slice(1)
                                      : "—"
                                  } · ${invItem.total_stock} units`
                                : (loanItem.display_name ?? "-")
                            }
                            location={!isInv ? loanItem.location : undefined}
                            studentName={
                              !isInv ? loanItem.student_name : undefined
                            }
                            onClick={() => {
                              setEditData(item);
                              setIsEditOpen(true);
                            }}
                          />
                        );
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
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-800">
                  {formatText("Recent activity")}
                </h3>
              </div>
              <ActivityFeed />
            </div>
          </div>
        </div>

        <ExportDialog
          key={`export-${tab}`}
          isOpen={isExportOpen}
          onClose={() => setExportOpen(false)}
          initialTableType={tab === "inventory" ? "Stock" : "Loans"}
          fixedTableType={true}
          hasSelectedRows={selectedRows.length > 0}
          selectedRows={selectedRows}
        />

        <AddDialog
          key={`add-${tab}`}
          isOpen={isAddOpen}
          onClose={() => setAddOpen(false)}
          initialTableType={tab === "inventory" ? "Stock" : "Loans"}
          fixedTableType={true}
        />

        <AddDialog
          key={`edit-${editData?.id}`}
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setEditData(null);
          }}
          initialTableType={tab === "inventory" ? "Stock" : "Loans"}
          fixedTableType={true}
          editData={editData ?? undefined}
        />

        <ImportDialog
          key={tab}
          isOpen={isImportOpen}
          onClose={() => setImportOpen(false)}
          initialTableType={tab === "inventory" ? "Stock" : "Loans"}
          fixedTableType={true}
        />
      </div>
    </Layout>
  );
}