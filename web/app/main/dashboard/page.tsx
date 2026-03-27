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
  Table as TableIcon,
  LayoutGrid,
  Trash2,
  History,
  LineChart as LineChartIcon,
} from "lucide-react";
import {AnimatePresence } from "framer-motion";
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
import AnalyticsDialog from "@/app/components/AnalyticsDialog";
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
import { getUserInfo } from "@/services/auth/authCallers";
import { toast } from "sonner";

const UploadIcon = dynamic(
  () => import("lucide-react").then((mod) => mod.Upload),
  { ssr: false },
);
const LoansTable = dynamic(() => import("@/app/components/LoansTable"), {
  ssr: false,
});

type Tab = "inventory" | "loans";
type ViewMode = "table" | "grid" | "chart";

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
  const [isAnalyticsOpen, setAnalyticsOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<(InventoryRow | LoanRow)[]>(
    [],
  );
  const [processedLoans, setProcessedLoans] = useState<LoanRow[]>([]);
  const [showReturned, setShowReturned] = useState(false);
  const [onlyReturned, setOnlyReturned] = useState(false);

  const { data: inventoryData = [] } = useGetRows("Stock");
  const { data: rawLoansData = [] } = useGetRows("Loans");

  const typedInventoryData = inventoryData as InventoryRow[];
  const typedLoansData = rawLoansData as LoanRow[];

  const handleClear = async () => {
    const user = await getUserInfo();

    if (!user || !["Admin", "Dev"].includes(user.role)) {
      toast.error("You don't have permisson to clear records.");
      return;
    }

    const isInventory = tab === "inventory";
    const mutation = isInventory ? deleteStock : deleteLoans;
    const currentData = isInventory ? typedInventoryData : processedLoans;
    const targets = selectedRows.length > 0 ? selectedRows : currentData;

    if (targets.length === 0) return;

    const confirmMsg =
      selectedRows.length > 0
        ? `Delete ${selectedRows.length} selected items?`
        : `Are you sure you want to clear ALL ${tab}?`;

    toast("Clear Records", {
      description: confirmMsg,
      action: {
        label: "Clear",
        onClick: () => {
          targets.forEach((row: InventoryRow | LoanRow) =>
            mutation.mutate(row.id),
          );
          setSelectedRows([]);
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
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

  const filteredLoans = processedLoans.filter((loan) => {
    const status = getLoanStatus(loan);
    if (onlyReturned) return status === "Returned";
    if (!showReturned) return status !== "Returned";
    return true;
  });

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
                      className={`px-4 py-1.5 font-mp rounded-md text-sm font-medium hover:scale-103 hover:cursor-pointer transition-all duration-200 ease-in-out ${tab === t ? "bg-white shadow-sm text-neutral-800" : "text-neutral-400"}`}
                    >
                      {formatText(t)}
                    </button>
                  ))}
                </div>

                {tab === "loans" && (
                  <div className="flex items-center gap-2">
                    {returned > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setShowReturned(!showReturned);
                            if (onlyReturned && showReturned)
                              setOnlyReturned(false);
                          }}
                          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 cursor-pointer transition-all duration-200 ${
                            showReturned
                              ? "bg-blue-600 border-blue-600"
                              : "bg-white border-neutral-300 hover:border-blue-500"
                          }`}
                          title="Show returned"
                        />
                        <span className="text-sm font-mp">Show returned</span>

                        {showReturned && (
                          <>
                            <button
                              onClick={() => setOnlyReturned(!onlyReturned)}
                              className={`w-4 h-4 font-mp rounded-full border-2 flex-shrink-0 cursor-pointer transition-all duration-200 ${
                                onlyReturned
                                  ? "bg-blue-600 border-blue-600"
                                  : "bg-white border-neutral-300 hover:border-blue-500"
                              }`}
                              title="Only returned"
                            />
                            <span className="text-med font-mp">Only returned</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-0.5 bg-neutral-50 border border-neutral-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-3 rounded-md hover:scale-103 hover:cursor-pointer transition-all duration-200 ease-in-out ${viewMode === "table" ? "bg-white shadow-sm text-neutral-800" : "text-neutral-400"}`}
                  >
                    <TableIcon size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-3 rounded-md hover:scale-103 hover:cursor-pointer transition-all duration-200 ease-in-out ${viewMode === "grid" ? "bg-white shadow-sm text-neutral-800" : "text-neutral-400"}`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("chart")}
                    className={`p-3 rounded-md hover:scale-103 hover:cursor-pointer transition-all duration-200 ease-in-out ${viewMode === "chart" ? "bg-white shadow-sm text-neutral-800" : "text-neutral-400"}`}
                  >
                    <LineChartIcon size={18} />
                  </button>
                </div>
              </div>

              <div className="flex flex-row gap-2">
                <button
                  onClick={() => setAddOpen(true)}
                  className="flex items-center font-mp gap-1.5 px-4 py-2 bg-neutral-800 text-white text-[13px] rounded-lg hover:bg-neutral-700 hover:scale-103 hover:cursor-pointer transition-all duration-200 ease-in-out font-medium"
                >
                  <Plus size={15} />
                  {tab === "inventory"
                    ? formatText("Add Item")
                    : formatText("Log Loan")}
                </button>
                <button
                  onClick={handleClear}
                  className={`flex items-center font-mp gap-1.5 px-4 py-2 text-[13px] rounded-lg font-medium border hover:scale-103 hover:cursor-pointer transition-all duration-200 ease-in-out ${selectedRows.length > 0 ? "bg-red-50 border-red-100 text-red-600 hover:bg-red-100" : "bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50"}`}
                >
                  <Trash2 size={15} />
                  {selectedRows.length > 0
                    ? `Clear (${selectedRows.length})`
                    : "Clear All"}
                </button>
                <button
                  onClick={() => setAnalyticsOpen(true)}
                  className="flex items-center gap-1.5 font-mp px-4 py-2 text-[13px] rounded-lg font-medium border hover:scale-103 hover:cursor-pointer transition-all duration-200 ease-in-out bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                >
                  <LineChartIcon size={15} />
                  Analytics
                </button>
                <button
                  onClick={() => setExportOpen(true)}
                  className="flex items-center gap-1.5 font-mp px-4 py-2 text-[13px] rounded-lg font-medium border hover:scale-103 hover:cursor-pointer transition-all duration-200 ease-in-out bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                >
                  <Download size={15} />
                  Export
                </button>
                <button
                  onClick={() => setImportOpen(true)}
                  className="flex items-center gap-1.5 font-mp px-4 py-2 text-[13px] rounded-lg font-medium border hover:scale-103 hover:cursor-pointer transition-all duration-200 ease-in-out bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                >
                  <UploadIcon size={15} />
                  Import
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
              {tab === "inventory" && viewMode === "table" && (
                <InventoryTable
                  data={typedInventoryData}
                  selectedRows={selectedRows as InventoryRow[]}
                  onSelectionChange={handleSelectionChange}
                />
              )}
              {tab === "loans" && viewMode === "table" && (
                <LoansTable
                  data={filteredLoans}
                  selectedRows={selectedRows as LoanRow[]}
                  onSelectionChange={handleSelectionChange}
                />
              )}
              {viewMode === "chart" && (
                <>
                  {tab === "inventory" ? (
                    <InventoryDemandChart
                      inventory={typedInventoryData}
                      selectedRows={selectedRows}
                    />
                  ) : (
                    <LoansChart
                      loans={processedLoans}
                      selectedRows={selectedRows}
                    />
                  )}
                </>
              )}
              {viewMode === "grid" && (
                <div className="flex flex-col flex-1 gap-4 p-4 overflow-auto min-h-0">
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
                    {tab === "inventory" &&
                      typedInventoryData.map((invItem) => {
                        const status = getStockStatus(invItem);
                        return (
                          <DashboardCard
                            key={invItem.id}
                            status={status}
                            indicatorColor={getIndicatorColor(status)}
                            title={invItem.name}
                            subtitle={`${
                              invItem.item_properties?.equipment_type
                                ? invItem.item_properties.equipment_type
                                    .charAt(0)
                                    .toUpperCase() +
                                  invItem.item_properties.equipment_type.slice(1)
                                : "—"
                            } · ${invItem.total_stock} units`}
                            onClick={() => {
                              setEditData(invItem);
                              setIsEditOpen(true);
                            }}
                          />
                        );
                      })}

                    {tab === "loans" &&
                      filteredLoans.map((loanItem) => {
                        const status = getLoanStatus(loanItem);
                        return (
                          <DashboardCard
                            key={loanItem.id}
                            status={status}
                            indicatorColor={getIndicatorColor(status)}
                            title={loanItem.item_name || "Unknown"}
                            subtitle={loanItem.display_name ?? "-"}
                            location={loanItem.location}
                            studentName={loanItem.student_name}
                            onClick={() => {
                              setEditData(loanItem);
                              setIsEditOpen(true);
                            }}
                          />
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="xl:flex-[1] min-w-0 flex flex-col gap-4">
            <div className="flex-1 border border-neutral-100 rounded-2xl bg-white flex flex-col overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2 shrink-0">
                <History size={15} className="text-neutral-400" />
                <h3 className=" font-mp text-med font-semibold text-neutral-800">
                  {formatText("Recent Activity")}
                </h3>
              </div>
              <ActivityFeed />
            </div>
          </div>

        </div> 
      </div>

      <AnimatePresence>
        {isExportOpen && (
          <ExportDialog
            key={`export-${tab}`}
            isOpen={isExportOpen}
            onClose={() => setExportOpen(false)}
            initialTableType={tab === "inventory" ? "Stock" : "Loans"}
            fixedTableType={true}
            hasSelectedRows={selectedRows.length > 0}
            selectedRows={selectedRows}
          />
        )}
        {isImportOpen && (
          <ImportDialog
            key={tab}
            isOpen={isImportOpen}
            onClose={() => setImportOpen(false)}
            initialTableType={tab === "inventory" ? "Stock" : "Loans"}
            fixedTableType={true}
          />
        )}
        {isAddOpen && (
          <AddDialog
            key={tab}
            isOpen={isAddOpen}
            onClose={() => setAddOpen(false)}
            initialTableType={tab === "inventory" ? "Stock" : "Loans"}
            fixedTableType={true}
          />
        )}
        {isEditOpen && (
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
        )}
        {isAnalyticsOpen && (
          <AnalyticsDialog
            isOpen={isAnalyticsOpen}
            onClose={() => setAnalyticsOpen(false)}
            inventory={typedInventoryData}
            loans={processedLoans}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}
