"use client";

import { useState } from "react";
import Modal from "./Modal";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner"; 
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Download, 
  FileText, 
  CheckCircle2, 
  Filter, 
  Clock, 
  AlertCircle, 
  Tag, 
  User, 
  Package, 
  ClipboardList,
  Calendar as CalendarIcon,
  X
} from "lucide-react";
import { format, setHours, setMinutes, isAfter } from "date-fns";
import { useDatabase } from "@/services/lib/hooks/useDatabase";
import { TableName } from "@/services/lib/hooks/types";

type ExportOptions = "all" | "selected" | "filtered";
type TableType = "Stock" | "Loans";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  hasSelectedRows?: boolean;
  initialTableType: TableType;
  fixedTableType?: boolean;
  selectedRows?: any[];
};

export default function ExportDialog({
  isOpen,
  onClose,
  hasSelectedRows = false,
  initialTableType,
  fixedTableType = false,
  selectedRows = [],
}: Props) {
  const [tableType, setTableType] = useState<TableType>(initialTableType);
  const [exportType, setExportType] = useState<ExportOptions>(hasSelectedRows ? "selected" : "all");
  const [useEndDate, setUseEndDate] = useState(false);
  
  const [filters, setFilters] = useState({
    startDate: new Date(),
    endDate: new Date(),
    startHour: "12",
    startMinute: "00",
    startPeriod: "AM",
    endHour: "11",
    endMinute: "59",
    endPeriod: "PM",
    threshold: "",
    equipment_type: "all",
    status: "all",
    signeeName: ""
  });

  const { useExport } = useDatabase(); 
  const { mutate: exports, isPending } = useExport(tableType as TableName);

  const convertTo24Hour = (hour: string, period: string) => {
    let h = parseInt(hour);
    if (period === "PM" && h < 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return h;
  };

  const handleExport = () => {
    const sHour = convertTo24Hour(filters.startHour, filters.startPeriod);
    const startDateTime = setMinutes(setHours(filters.startDate, sHour), parseInt(filters.startMinute));

    let endDateTime = null;
    if (useEndDate) {
      const eHour = convertTo24Hour(filters.endHour, filters.endPeriod);
      endDateTime = setMinutes(setHours(filters.endDate, eHour), parseInt(filters.endMinute));

      if (exportType === "filtered" && isAfter(startDateTime, endDateTime)) {
        toast.error("Invalid Range", { description: "Start time cannot be after end time." });
        return;
      }
    }

    if (exportType === "selected" && selectedRows.length === 0) {
      toast.error("No selection", { description: "Please select rows in the table first." });
      return;
    }

    exports({
      mode: exportType,
      ids: exportType === "selected" ? selectedRows.map(row => row.id) : undefined,
      filters: {
        signeeName: filters.signeeName,
        status: filters.status,
        equipment_type: filters.equipment_type,
        threshold: filters.threshold,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime ? endDateTime.toISOString() : null,
      }
    }, {
      onSuccess: (data: any) => {
        if (!data || (Array.isArray(data) && data.length === 0)) {
          toast.warning("No entries found", { description: "Try adjusting your filters." });
        } else {
          toast.success("Export successful", { description: "Your file is downloading." });
          onClose();
        }
      },
      onError: (err: any) => {
        toast.error("Export failed", { description: err.message || "An unexpected error occurred." });
      }
    });
  };

  const hours12 = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i).toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Export ${tableType === 'Stock' ? 'Inventory' : 'Loans'}`} size="lg">
      <div className="flex flex-col gap-6 py-2">
        {!fixedTableType && (
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-neutral-400 font-mp font-bold">Select Table</Label>
            <div className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1">
              {(["Loans", "Stock"] as TableType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTableType(t)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 capitalize font-mp
                    ${tableType === t ? "bg-white shadow-sm text-neutral-800" : "text-neutral-500 hover:text-neutral-700"}`}
                >
                  {t === "Stock" ? <Package size={14} /> : <ClipboardList size={14} />}
                  {t === "Stock" ? "Inventory" : t}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wider text-neutral-400 font-mp font-bold">Export Range</Label>
          <RadioGroup value={exportType} onValueChange={(v) => setExportType(v as ExportOptions)} className="flex p-1 bg-neutral-100 rounded-xl gap-1">
            {[
              { id: "all", value: "all", label: "All", icon: FileText },
              { id: "selected", value: "selected", label: "Selected", icon: CheckCircle2, disabled: !hasSelectedRows },
              { id: "filtered", value: "filtered", label: "Filter", icon: Filter },
            ].map((option) => (
              <div key={option.id} className="flex-1">
                <RadioGroupItem value={option.value} id={option.id} disabled={option.disabled} className="sr-only" />
                <Label
                  htmlFor={option.id}
                  className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-lg transition-all duration-200 cursor-pointer text-xs font-mp font-semibold
                    ${option.disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-white/50"}
                    ${exportType === option.value && !option.disabled ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500"}`}
                >
                  <option.icon size={16} className={exportType === option.value && !option.disabled ? "text-neutral-900" : "text-neutral-400"} />
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {exportType === "filtered" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-neutral-50 border border-neutral-100 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
            {tableType === "Stock" ? (
              <>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-1"><AlertCircle size={12} /> Stock Status</Label>
                  <select 
                    className="w-full h-10 rounded-md border border-neutral-200 bg-white px-3 text-xs focus:ring-1 focus:ring-neutral-400" 
                    value={filters.status} 
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="all">All Statuses</option>
                    <option value="in stock">In Stock</option>
                    <option value="low stock">Low Stock</option>
                    <option value="out of stock">Out of Stock</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-1"><Tag size={12} /> Equipment Type</Label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-white px-3 text-xs focus:ring-1 focus:ring-neutral-400" 
                    value={filters.equipment_type} 
                    onChange={(e) => setFilters({...filters, equipment_type: e.target.value})}
                  >
                    <option value="all">All Categories</option>
                    <option value="electronic">Electronic</option>
                    <option value="stationary">Stationary</option>
                    <option value="misc">Misc</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-1"><AlertCircle size={12} /> Stock Threshold</Label>
                  <Input type="number" placeholder="Filter by Qty below..." className="text-xs h-10 bg-white border-neutral-200" value={filters.threshold} onChange={(e) => setFilters({...filters, threshold: e.target.value})} />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3 md:col-span-2">
                  <Label className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-1"><Clock size={12} /> Precise Loan Timeframe</Label>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-end">
                      <div className="sm:col-span-3 space-y-1">
                        <span className="text-[9px] text-neutral-400 uppercase font-bold pl-1">Start Date</span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full h-10 justify-start text-xs bg-white">
                              <CalendarIcon className="mr-2 h-3 w-3" />
                              {format(filters.startDate, "PP")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                            <Calendar mode="single" selected={filters.startDate} onSelect={(d) => d && setFilters({...filters, startDate: d})} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="flex gap-1 sm:col-span-3">
                        <select value={filters.startHour} onChange={(e) => setFilters({...filters, startHour: e.target.value})} className="flex-1 h-10 rounded-md border border-input bg-white text-xs">
                          {hours12.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <select value={filters.startMinute} onChange={(e) => setFilters({...filters, startMinute: e.target.value})} className="flex-1 h-10 rounded-md border border-input bg-white text-xs">
                          {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select value={filters.startPeriod} onChange={(e) => setFilters({...filters, startPeriod: e.target.value})} className="w-14 h-10 rounded-md border border-input bg-white text-xs font-bold">
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                    
                    {useEndDate ? (
                       <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-end">
                       <div className="sm:col-span-3 space-y-1">
                         <div className="flex justify-between items-center pr-1">
                            <span className="text-[9px] text-neutral-400 uppercase font-bold pl-1">End Date</span>
                            <button onClick={() => setUseEndDate(false)} className="text-neutral-400 hover:text-red-500 transition-colors">
                                <X size={10} />
                            </button>
                         </div>
                         <Popover>
                           <PopoverTrigger asChild>
                             <Button variant="outline" className="w-full h-10 justify-start text-xs bg-white border-neutral-300">
                               <CalendarIcon className="mr-2 h-3 w-3" />
                               {format(filters.endDate, "PP")}
                             </Button>
                           </PopoverTrigger>
                           <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                             <Calendar mode="single" selected={filters.endDate} onSelect={(d) => d && setFilters({...filters, endDate: d})} initialFocus />
                           </PopoverContent>
                         </Popover>
                       </div>
                       <div className="flex gap-1 sm:col-span-3">
                         <select value={filters.endHour} onChange={(e) => setFilters({...filters, endHour: e.target.value})} className="flex-1 h-10 rounded-md border border-input bg-white text-xs">
                           {hours12.map(h => <option key={h} value={h}>{h}</option>)}
                         </select>
                         <select value={filters.endMinute} onChange={(e) => setFilters({...filters, endMinute: e.target.value})} className="flex-1 h-10 rounded-md border border-input bg-white text-xs">
                           {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                         </select>
                         <select value={filters.endPeriod} onChange={(e) => setFilters({...filters, endPeriod: e.target.value})} className="w-14 h-10 rounded-md border border-input bg-white text-xs font-bold">
                           <option value="AM">AM</option>
                           <option value="PM">PM</option>
                         </select>
                       </div>
                     </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        onClick={() => setUseEndDate(true)}
                        className="w-full border border-dashed border-neutral-300 text-neutral-400 text-[10px] font-bold uppercase h-10 hover:bg-neutral-100 hover:text-neutral-600"
                      >
                        + Add End Date Constraint
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-1"><AlertCircle size={12} /> Loan Status</Label>
                  <select 
                    className="w-full h-10 rounded-md border border-neutral-200 bg-white px-3 text-xs focus:ring-1 focus:ring-neutral-400" 
                    value={filters.status} 
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="returned">Returned</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-1"><User size={12} /> Signee Name</Label>
                  <Input 
                    placeholder="Search name..." 
                    className="text-xs h-10 bg-white border-neutral-200" 
                    value={filters.signeeName} 
                    onChange={(e) => setFilters({...filters, signeeName: e.target.value})} 
                  />
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 text-sm font-mp font-medium text-neutral-500 hover:bg-neutral-50 rounded-xl transition-colors">Cancel</button>
          <button
            onClick={handleExport}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-900 text-white font-mp font-medium rounded-xl hover:bg-neutral-800 active:scale-95 transition-all shadow-md disabled:opacity-50"
          >
            <Download size={16} /> {isPending ? "Exporting..." : `Export ${tableType === "Stock" ? "Inventory" : "Loans"}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}