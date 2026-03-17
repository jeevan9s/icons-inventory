"use client";

import { useState } from "react";
import Modal from "./Modal";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Download, FileText, CheckCircle2, Filter } from "lucide-react";

type ExportOptions = "all" | "selected" | "filtered";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  hasSelectedRows: boolean;
  onExport: (type: ExportOptions) => void;
};

export default function ExportDialog({
  isOpen,
  onClose,
  hasSelectedRows,
  onExport,
}: Props) {
  const initialExportType: ExportOptions = hasSelectedRows ? "selected" : "all";
  const [exportType, setExportType] = useState<ExportOptions>(initialExportType);

  const options = [
    {
      id: "all",
      value: "all",
      label: "All Data",
      icon: FileText,
    },
    {
      id: "selected",
      value: "selected",
      label: "Selected",
      icon: CheckCircle2,
      disabled: !hasSelectedRows,
    },
    {
      id: "filtered",
      value: "filtered",
      label: "Filtered",
      icon: Filter,
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Data" size="md">
      <div className="flex flex-col gap-6 py-2">
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wider text-neutral-400 font-mp font-bold">
            Select Range
          </Label>
          
          <RadioGroup
            value={exportType}
            onValueChange={(v) => setExportType(v as ExportOptions)}
            className="flex p-1 bg-neutral-100 rounded-xl gap-1"
          >
            {options.map((option) => (
              <div key={option.id} className="flex-1">
                <RadioGroupItem
                  value={option.value}
                  id={option.id}
                  disabled={option.disabled}
                  className="sr-only"
                />
                <Label
                  htmlFor={option.id}
                  className={`
                    flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-lg transition-all duration-200 cursor-pointer text-xs font-mp font-semibold
                    ${option.disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-white/50"}
                    ${exportType === option.value && !option.disabled 
                      ? "bg-white shadow-sm text-neutral-900" 
                      : "text-neutral-500"}
                  `}
                >
                  <option.icon size={16} />
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4">
          <p className="text-xs text-neutral-500 font-mp leading-relaxed">
            {exportType === "all" && "All records in the current table will be exported to a CSV file."}
            {exportType === "selected" && `Exporting the ${hasSelectedRows ? "currently checked" : "0"} items from your selection.`}
            {exportType === "filtered" && "Only items matching your active search and filters will be included."}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-mp font-medium text-neutral-600 hover:bg-neutral-50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onExport(exportType)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-900 text-white font-mp font-medium rounded-xl hover:bg-neutral-800 active:scale-95 transition-all shadow-md"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>
    </Modal>
  );
}