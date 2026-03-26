"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  SortingState,
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ColHeader, StatusBadge } from "../frontendTypes";
import { Circle, Search, CheckCircle2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { getLoanStatus } from "@/services/lib/hooks/helpers";
import { format } from "date-fns";
import { LoanRow } from "@/services/lib/types";
import { enrichData, formatCapitalized, loanFetcher } from "@/services/lib/helpers";
import { useUpdateRow, useReturnToggle, useUpdateLoanQuantity, useGetRows, useDeleteLoan } from "@/services/lib/hooks/useDatabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import RowActionsMenu from "./RowActionsMenu";
import AddDialog from "./AddDialog";
import { getUserInfo } from "@/services/auth/authCallers";

const LOAN_READONLY_FIELDS = ["equipment_type", "display_name", "status", "item_status"];

interface EditableCellProps {
  value: string;
  rowId: string;
  columnId: string;
  updateData: (id: string, columnId: string, value: string) => void;
}

const EditableCell = ({
  value: initialValue,
  rowId,
  columnId,
  updateData,
}: EditableCellProps) => {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const onBlur = () => {
    setIsEditing(false);
    if (value !== initialValue) updateData(rowId, columnId, value);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
    if (e.key === "Escape") {
      setValue(initialValue);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        autoFocus
        className="h-7 text-xs px-2 py-0 border-blue-400 font-mp focus-visible:ring-1 w-full"
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-neutral-100 px-2 py-1 rounded transition-colors truncate min-h-[1.5rem] w-full font-mp capitalize"
    >
      {value || <span className="text-neutral-300 italic normal-case">-</span>}
    </div>
  );
};

interface LoansTableProps {
  data: LoanRow[];
  onSelectionChange?: (rows: LoanRow[]) => void;
}

export default function LoansTable({ data, onSelectionChange }: LoansTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [localData, setLocalData] = useState<LoanRow[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editData, setEditData] = useState<LoanRow | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const updateLoan = useUpdateRow("Loans");
  const updateLoanRef = useRef(updateLoan);
  useEffect(() => { updateLoanRef.current = updateLoan; }, [updateLoan]);

  const updateStock = useUpdateRow("Stock");
  const updateStockRef = useRef(updateStock);
  useEffect(() => { updateStockRef.current = updateStock; }, [updateStock]);

  const returnToggle = useReturnToggle();
  const updateLoanQuantity = useUpdateLoanQuantity();
  const deleteLoan = useDeleteLoan();
  const router = useRouter();

  const { data: stockRows = [] } = useGetRows("Stock");

  const customTypes = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("custom_equipment_types") ?? "[]")
    : [];

  const equipmentTypes = Array.from(
    new Set([
      ...(stockRows as any[]).map((r) => r.item_properties?.equipment_type).filter(Boolean),
      ...customTypes,
    ])
  ) as string[];

  useEffect(() => {
    let active = true;
    if (!data || data.length === 0) {
      setLocalData([]);
      return;
    }
    enrichData(data, loanFetcher).then((result) => {
      if (active) setLocalData(result as LoanRow[]);
    });
    return () => { active = false; };
  }, [data, refreshKey]);

  const handleDelete = async (id: number) => {
    const user = await getUserInfo();

    if (!user || !["Admin", "Dev"].includes(user.role)) {
      toast.error("You don't have permission to delete items.");
      return;
    }

    toast("Delete Loan", {
      description: "Are you sure you want to delete this loan?",
      action: {
        label: "Delete",
        onClick: () => deleteLoan.mutate(id),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const handleUpdate = useCallback(
    (id: string, columnId: string, value: string) => {
      const row = localData.find((r) => r.id.toString() === id);

      if (columnId === "item_name") {
        if (!row?.item_id) { toast.error("Cannot update item name: stock item not found"); return; }
        const stockItem = (stockRows as any[]).find((s) => s.id === row.item_id);
        if (!stockItem) { toast.error("Stock item not found"); return; }
        updateStockRef.current.mutate(
          { id: row.item_id, data: { name: value } },
          {
            onSuccess: () => { toast.success("Item name updated"); setRefreshKey((k) => k + 1); },
            onError: () => toast.error("Failed to update item name"),
          },
        );
        return;
      }

      if (columnId === "item_quantity") {
        if (!row?.loan_item_id || !row?.item_id) { toast.error("Cannot update quantity: loan item not found"); return; }
        updateLoanQuantity.mutate(
          {
            loanItemId: row.loan_item_id,
            newQuantity: Number(value),
            oldQuantity: row.item_quantity ?? 1,
            itemId: row.item_id,
          },
          {
            onSuccess: () => { toast.success("Quantity updated"); setRefreshKey((k) => k + 1); },
            onError: () => toast.error("Failed to update quantity"),
          },
        );
        return;
      }

      if (columnId === "equipment_type") {
        if (!row?.item_id) { toast.error("Cannot update type: stock item not found"); return; }
        const stockItem = (stockRows as any[]).find((s) => s.id === row.item_id);
        if (!stockItem) { toast.error("Stock item not found"); return; }
        updateStockRef.current.mutate(
          {
            id: row.item_id,
            data: { item_properties: { ...stockItem.item_properties, equipment_type: value } },
          },
          {
            onSuccess: () => { toast.success("Type updated"); setRefreshKey((k) => k + 1); },
            onError: () => toast.error("Failed to update type"),
          },
        );
        return;
      }

      if (LOAN_READONLY_FIELDS.includes(columnId)) return;

      updateLoanRef.current.mutate(
        { id, data: { [columnId]: value } },
        {
          onSuccess: () => toast.success("Updated successfully"),
          onError: () => toast.error("Failed to update"),
        },
      );
    },
    [localData, updateLoanQuantity, stockRows],
  );

  const handleReturnToggle = useCallback(
    (row: LoanRow) => {
      returnToggle.mutate(
        { id: row.id, time_in: row.time_in ?? null },
        {
          onSuccess: () => {
            toast.success(row.time_in ? "Check-in removed" : "Item returned successfully");
            router.refresh();
          },
          onError: () => toast.error("Failed to update loan status"),
        },
      );
    },
    [returnToggle, router],
  );

  const columns = useMemo<ColumnDef<LoanRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            className="translate-y-[2px] border-neutral-300"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            className="translate-y-[2px] border-neutral-300"
          />
        ),
        size: 40,
      },
      {
        id: "quick_return",
        header: () => <div className="w-8" />,
        cell: ({ row }) => {
          const isReturned = !!row.original.time_in;
          return (
            <div className="flex items-center justify-center">
              <button
                title={isReturned ? "Remove check-in" : "Check-in loan"}
                onClick={(e) => { e.stopPropagation(); handleReturnToggle(row.original); }}
                className={`p-2 rounded-lg transition-all duration-200 hover:cursor-pointer ${isReturned ? "text-green-500 bg-green-50 hover:bg-green-100" : "text-neutral-400 hover:text-blue-600 hover:bg-blue-50"}`}
              >
                {isReturned ? <CheckCircle2 size={15} /> : <Circle size={15} />}
              </button>
            </div>
          );
        },
        size: 50,
      },
      {
        accessorKey: "item_name",
        header: ({ column }) => (
          <ColHeader label="Item" type="text" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />
        ),
        cell: ({ getValue, row, column }) => (
          <EditableCell value={(getValue() as string) || "—"} rowId={row.original.id.toString()} columnId={column.id} updateData={handleUpdate} />
        ),
      },
      {
        accessorKey: "item_quantity",
        header: ({ column }) => (
          <ColHeader label="Qty" type="int" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />
        ),
        cell: ({ getValue, row, column }) => (
          <EditableCell value={String(getValue() ?? "1")} rowId={row.original.id.toString()} columnId={column.id} updateData={handleUpdate} />
        ),
        size: 60,
      },
      {
        accessorKey: "equipment_type",
        header: ({ column }) => (
          <ColHeader label="Equipment Type" type="text" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />
        ),
        cell: ({ getValue, row }) => {
          const current = getValue() as string;
          return (
            <select
              value={current || ""}
              onChange={(e) => handleUpdate(row.original.id.toString(), "equipment_type", e.target.value)}
              className="w-full h-7 text-sm border-none bg-transparent text-neutral-600 font-mp focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-2 capitalize cursor-pointer"
            >
              <option value="">—</option>
              {equipmentTypes.map((type) => (
                <option key={type} value={type} className="capitalize font-mp text-sm">{type}</option>
              ))}
            </select>
          );
        },
      },
      {
        accessorKey: "student_name",
        header: ({ column }) => (
          <ColHeader label="Student Name" type="text" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />
        ),
        cell: ({ getValue, row, column }) => (
          <EditableCell value={formatCapitalized(getValue() as string) || "—"} rowId={row.original.id.toString()} columnId={column.id} updateData={handleUpdate} />
        ),
      },
      {
        accessorKey: "student_number",
        header: ({ column }) => (
          <ColHeader label="Student ID" type="text" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />
        ),
        cell: ({ getValue, row, column }) => (
          <EditableCell value={(getValue() as string) || ""} rowId={row.original.id.toString()} columnId={column.id} updateData={handleUpdate} />
        ),
      },
      {
        accessorKey: "location",
        header: ({ column }) => (
          <ColHeader label="Location" type="text" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />
        ),
        cell: ({ getValue, row, column }) => (
          <EditableCell value={(getValue() as string) || ""} rowId={row.original.id.toString()} columnId={column.id} updateData={handleUpdate} />
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <ColHeader label="Status" type="text" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />
        ),
        cell: ({ row }) => <StatusBadge status={getLoanStatus(row.original)} />,
      },
      {
        accessorKey: "display_name",
        header: ({ column }) => (
          <ColHeader label="Signee" type="text" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />
        ),
        cell: ({ getValue }) => (
          <span className="text-neutral-600 font-mp px-2">{formatCapitalized(getValue() as string)}</span>
        ),
      },
      {
        accessorKey: "time_out",
        header: ({ column }) => (
          <ColHeader label="Time Loaned" type="timestamp" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />
        ),
        cell: ({ getValue }) => {
          const date = getValue() as string;
          return <span className="font-mono text-xs font-mp text-neutral-400 px-2">{date ? format(new Date(date), "MMM d, h:mm b") : "—"}</span>;
        },
      },
      {
        accessorKey: "time_in",
        header: ({ column }) => (
          <ColHeader label="Time Returned" type="timestamp" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />
        ),
        cell: ({ getValue }) => {
          const date = getValue() as string;
          return <span className="font-mono text-xs font-mp text-neutral-400 px-2">{date ? format(new Date(date), "MMM d, h:mm b") : "—"}</span>;
        },
      },
      {
        id: "actions",
        header: () => null,
        cell: ({ row }) => (
          <RowActionsMenu
            itemName={row.original.item_name}
            onEdit={() => { setEditData(row.original); setIsEditOpen(true); }}
            onDelete={() => handleDelete(row.original.id)}
          />
        ),
        size: 40,
      },
    ],
    [handleUpdate, handleReturnToggle, equipmentTypes, handleDelete],
  );

  const table = useReactTable({
    data: localData,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  useEffect(() => {
    if (onSelectionChange) {
      const selectedData = table.getSelectedRowModel().rows.map((row) => row.original);
      onSelectionChange(selectedData);
    }
  }, [rowSelection]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-100 sticky top-0 z-10 bg-white">
        <div className="flex items-center gap-2 flex-1">
          <Search size={13} className="text-neutral-400 shrink-0" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search loans..."
            className="h-7 bg-transparent border-none text-xs focus-visible:ring-0 p-0"
          />
        </div>
        {table.getSelectedRowModel().rows.length > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
            <span className="text-[12px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
              {table.getSelectedRowModel().rows.length} Selected
            </span>
            <button
              onClick={() => {
                table.getSelectedRowModel().rows.forEach((row) => handleDelete(row.original.id));
                setRowSelection({});
              }}
              className="text-[12px] text-neutral-400 hover:text-neutral-600 underline decoration-neutral-200"
            >
              Clear
            </button>
          </div>
        )}
      </div>
      <div className="overflow-auto flex-1 custom-scrollbar">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-neutral-100">
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="bg-neutral-50 px-4 py-2.5 font-mp" style={{ width: header.getSize() }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.005 }}
                  className={`border-b border-neutral-50 ${row.getIsSelected() ? "bg-neutral-50" : "hover:bg-neutral-50/50"}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-2.5 text-sm font-mp">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-neutral-400 py-12 text-sm font-mp">
                  No loans found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddDialog
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setEditData(null); }}
        initialTableType="Loans"
        fixedTableType={true}
        editData={editData ?? undefined}
      />
    </div>
  );
}