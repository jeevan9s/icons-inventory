"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
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
import { Search } from "lucide-react";
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
import { getStockStatus } from "@/services/lib/hooks/helpers";
import { InventoryRow } from "@/services/lib/types";
import {
  useUpdateRow,
  useGetRows,
  useDeleteRow,
} from "@/services/lib/hooks/useDatabase";
import { toast } from "sonner";
import { formatCapitalized, normalizeEqType } from "@/services/lib/helpers";
import RowActionsMenu from "./RowActionsMenu";
import AddDialog from "./AddDialog";
import { getUserInfo } from "@/services/auth/authCallers";

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

interface InventoryTableProps {
  data: InventoryRow[];
  onSelectionChange?: (rows: InventoryRow[]) => void;
}

export default function InventoryTable({
  data,
  onSelectionChange,
}: InventoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [editData, setEditData] = useState<InventoryRow | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const previousSelectionRef = useRef<InventoryRow[]>([]);

  const updateStock = useUpdateRow("Stock");
  const updateStockRef = useRef(updateStock);
  useEffect(() => {
    updateStockRef.current = updateStock;
  }, [updateStock]);

  const deleteStock = useDeleteRow("Stock");

  const { data: stockRows = [] } = useGetRows("Stock");

  const equipmentTypes = useMemo(() => {
    if (typeof window === "undefined") return [];
    const customTypes = JSON.parse(
      localStorage.getItem("custom_equipment_types") ?? "[]",
    );
    return Array.from(
      new Set([
        ...(stockRows as any[])
          .map((r) => r.item_properties?.equipment_type)
          .filter(Boolean),
        ...customTypes,
      ]),
    );
  }, [stockRows]);

  const handleDelete = async (id: number) => {
    const user = await getUserInfo();

    if (!user || !["Admin", "Dev"].includes(user.role)) {
      toast.error("You don't have permission to delete items.");
      return;
    }

    toast("Delete Item", {
      description: "Are you sure you want to delete this item?",
      action: {
        label: "Delete",
        onClick: () => deleteStock.mutate(id),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const handleUpdate = useCallback(
    (id: string, columnId: string, value: string) => {
      let parsedValue: string | number = value;
      if (columnId === "total_stock" || columnId === "net_stock")
        parsedValue = Number(value);

      if (columnId === "equipment_type") {
        const row = data.find((r) => r.id.toString() === id);
        updateStockRef.current.mutate(
          {
            id,
            data: {
              item_properties: {
                ...row?.item_properties,
                equipment_type: normalizeEqType(value),
              },
            },
          },
          {
            onSuccess: () => toast.success("Updated successfully"),
            onError: () => toast.error("Failed to update"),
          },
        );
        return;
      }

      updateStockRef.current.mutate(
        { id, data: { [columnId]: parsedValue } },
        {
          onSuccess: () => toast.success("Updated successfully"),
          onError: () => toast.error("Failed to update"),
        },
      );
    },
    [data],
  );

  const columns = useMemo<ColumnDef<InventoryRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="translate-y-[2px] border-neutral-300 data-[state=checked]:bg-neutral-900 data-[state=checked]:border-neutral-900"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px] border-neutral-300 data-[state=checked]:bg-neutral-900 data-[state=checked]:border-neutral-900"
          />
        ),
        size: 40,
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <ColHeader
            label="Item Name"
            type="text"
            isSorted={column.getIsSorted()}
            onSort={column.getToggleSortingHandler()!}
          />
        ),
        cell: ({ getValue, row, column }) => (
          <EditableCell
            value={formatCapitalized(getValue() as string) || ""}
            rowId={row.original.id.toString()}
            columnId={column.id}
            updateData={handleUpdate}
          />
        ),
      },
      {
        id: "equipment_type",
        accessorFn: (row) => row.item_properties?.equipment_type ?? "",
        header: ({ column }) => (
          <ColHeader
            label="Type"
            type="text"
            isSorted={column.getIsSorted()}
            onSort={column.getToggleSortingHandler()!}
          />
        ),
        cell: ({ getValue, row }) => {
          const current = getValue() as string;
          return (
            <select
              value={current || ""}
              onChange={(e) =>
                handleUpdate(
                  row.original.id.toString(),
                  "equipment_type",
                  e.target.value,
                )
              }
              className="w-full h-7 text-sm border-none bg-transparent text-neutral-600 font-mp focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-2 capitalize cursor-pointer"
            >
              <option value="">—</option>
              {equipmentTypes.map((type) => (
                <option key={type} value={type} className="capitalize">
                  {type}
                </option>
              ))}
            </select>
          );
        },
      },
      {
        accessorKey: "total_stock",
        header: ({ column }) => (
          <ColHeader
            label="Total"
            type="int"
            isSorted={column.getIsSorted()}
            onSort={column.getToggleSortingHandler()!}
          />
        ),
        cell: ({ getValue, row, column }) => (
          <EditableCell
            value={String(getValue() ?? "")}
            rowId={row.original.id.toString()}
            columnId={column.id}
            updateData={(id, colId, newValue) => {
              const numValue = Number(newValue);
              const available = Number(row.original.net_stock);
              if (numValue < available) {
                toast.error("Invalid Input", {
                  description: "Total cannot be less than available stock",
                });
                return;
              }
              handleUpdate(id, colId, newValue);
            }}
          />
        ),
      },
      {
        accessorKey: "net_stock",
        header: ({ column }) => (
          <ColHeader
            label="Available"
            type="int"
            isSorted={column.getIsSorted()}
            onSort={column.getToggleSortingHandler()!}
          />
        ),
        cell: ({ getValue, row, column }) => (
          <EditableCell
            value={String(getValue() ?? "")}
            rowId={row.original.id.toString()}
            columnId={column.id}
            updateData={(id, colId, newValue) => {
              const numValue = Number(newValue);
              const total = Number(row.original.total_stock);
              if (numValue > total) {
                toast.warning("Warning: Invalid Input", {
                  description: (
                    <div className="flex flex-col gap-1">
                      <span>Available cannot be greater than total stock.</span>
                      <span className="text-xs opacity-70 italic">
                        Please adjust the Total value first.
                      </span>
                    </div>
                  ),
                });
                return;
              }
              handleUpdate(id, colId, newValue);
            }}
          />
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <ColHeader
            label="Status"
            type="text"
            isSorted={column.getIsSorted()}
            onSort={column.getToggleSortingHandler()!}
          />
        ),
        cell: ({ row }) => (
          <StatusBadge status={getStockStatus(row.original)} />
        ),
      },
      {
        id: "actions",
        header: () => null,
        cell: ({ row }) => (
          <RowActionsMenu
            itemName={row.original.name}
            onEdit={() => {
              setEditData(row.original);
              setIsEditOpen(true);
            }}
            onDelete={() => {
              handleDelete(row.original.id);
            }}
          />
        ),
        size: 40,
        enableSorting: false,
      },
    ],
    [handleUpdate, equipmentTypes, handleDelete],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  useEffect(() => {
    if (onSelectionChange) {
      const selectedData = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);
      const hasChanged =
        selectedData.length !== previousSelectionRef.current.length ||
        selectedData.some(
          (row, idx) => row.id !== previousSelectionRef.current[idx]?.id,
        );
      if (hasChanged) previousSelectionRef.current = selectedData;
      onSelectionChange(selectedData);
    }
  }, [rowSelection, onSelectionChange, table]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-2 sm:px-3 py-2 border-b border-neutral-100 sticky top-0 z-10 bg-white gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[150px]">
          <Search size={13} className="text-neutral-400 shrink-0" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search inventory..."
            className="h-7 bg-transparent border-none text-xs text-neutral-600 placeholder:text-neutral-400 focus-visible:ring-0 font-mp p-0 w-full"
            maxLength={50}
          />
        </div>
        {table.getSelectedRowModel().rows.length > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200 flex-wrap text-xs sm:text-sm">
            <span className="text-[11px] sm:text-[12px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full whitespace-nowrap">
              {table.getSelectedRowModel().rows.length} Selected
            </span>
            <button
              onClick={() => {
                table
                  .getSelectedRowModel()
                  .rows.forEach((row) => handleDelete(row.original.id));
                setRowSelection({});
              }}
              className="text-[12px] text-neutral-400 hover:text-neutral-600 underline decoration-neutral-200"
            >
              Clear
            </button>
          </div>
        )}
      </div>
      <div className="overflow-auto flex-1 -mx-4 sm:mx-0">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow
                key={hg.id}
                className="border-neutral-100 hover:bg-transparent"
              >
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="bg-neutral-50 px-2 sm:px-4 py-2 text-xs border-r border-neutral-100 last:border-r-0 font-bold whitespace-nowrap"
                    style={{ width: header.getSize() }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
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
                  className={`border-b border-neutral-50 transition-colors ${row.getIsSelected() ? "bg-neutral-50" : "hover:bg-neutral-50/50"}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-2 sm:px-4 py-2 text-xs sm:text-sm border-r border-neutral-50 last:border-r-0 whitespace-nowrap"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-neutral-400 py-12 font-mp text-sm"
                >
                  No items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <AddDialog
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditData(null);
        }}
        initialTableType="Stock"
        fixedTableType={true}
        editData={editData ?? undefined}
      />
    </div>
  );
}
