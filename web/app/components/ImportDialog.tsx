"use client";

import { TableType } from "../frontendTypes";
import Modal from "./Modal";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { Package } from "lucide-react";
import { ClipboardList } from "lucide-react";
import { useImport } from "@/services/lib/hooks/useDatabase";
import { TableName } from "@/services/lib/hooks/types";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialTableType: TableType;
  fixedTableType?: boolean;
};

export default function ImportDialog({
  isOpen,
  onClose,
  initialTableType,
  fixedTableType,
}: Props) {
  const [tableType, setTableType] = useState<TableType>(initialTableType);

  const { mutate: imports, isPending } = useImport(tableType as TableName);

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";

    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const toastId = toast.loading("Preparing your import...", {
        description: "Processing CSV data.",
      });

      imports(file, {
        // fire mutation
        onSuccess: () => {
          toast.success("Import successful", { id: toastId });
          onClose();
        },
        onError: (err) => {
          toast.error("Import failed", {
            description: err.message,
            id: toastId,
          });
        },
      });
    };

    input.click();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Import into ${tableType === "Stock" ? "Inventory" : "Loans"}`}
      size="lg"
    >
      <div className="flex flex-col gap-6 py-2">
        {!fixedTableType && (
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-neutral-400 font-mp font-bold">
              Select Table
            </Label>
            <div className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1">
              {(["Loans", "Stock"] as TableType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTableType(t)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 capitalize font-mp
                    ${tableType === t ? "bg-white shadow-sm text-neutral-800" : "text-neutral-500 hover:text-neutral-700"}`}
                >
                  {t === "Stock" ? (
                    <Package size={14} />
                  ) : (
                    <ClipboardList size={14} />
                  )}
                  {t === "Stock" ? "Inventory" : t}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-sm font-mp font-med">
            Import CSV data into the {tableType} table
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-mp font-medium text-neutral-500 hover:bg-neutral-50 rounded-xl hover:scale-105 hover:cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-900 text-white font-mp font-medium rounded-xl hover:bg-neutral-800 hover:cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50"
          >
            <Download size={16} />{" "}
            {isPending
              ? "Importing..."
              : `Import into ${tableType === "Stock" ? "Inventory" : "Loans"}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
