"use client";

import { useState, useMemo, useEffect } from "react";
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
import { MoreVertical, Search } from "lucide-react";
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

export type InventoryRow = {
  id: number;
  name: string;
  total_stock: number;
  net_stock: number;
  item_properties: {
    equipment_type?: equipmentType;
    [key: string]: unknown;
  } | null;
};

export type equipmentType = "stationary" | "electronic" | "misc";

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
        cell: ({ getValue }) => (
          <span className="text-neutral-800 font-medium capitalize">
            {(getValue() as string)?.toLowerCase()}
          </span>
        ),
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
        cell: ({ getValue }) => (
          <span className="text-neutral-600">{getValue() as number}</span>
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
        cell: ({ getValue }) => (
          <span className="text-neutral-600 font-semibold">
            {getValue() as number}
          </span>
        ),
      },
      {
        id: "equipment_type",
        accessorFn: (row) => row.item_properties?.equipment_type ?? "—",
        header: ({ column }) => (
          <ColHeader
            label="Type"
            type="text"
            isSorted={column.getIsSorted()}
            onSort={column.getToggleSortingHandler()!}
          />
        ),
        cell: ({ getValue }) => (
          <span className="text-neutral-400 text-xs capitalize">
            {(getValue() as string)?.toLowerCase()}
          </span>
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
        cell: () => (
          <button className="text-neutral-300 hover:text-neutral-700 transition-colors">
            <MoreVertical size={14} />
          </button>
        ),
        size: 40,
        enableSorting: false,
      },
    ],
    [],
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
      onSelectionChange(selectedData);
    }
  }, [rowSelection, table, onSelectionChange]);

  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, onSelectionChange, table]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-100 sticky top-0 z-10 bg-white">
        <div className="flex items-center gap-2 flex-1">
          <Search size={13} className="text-neutral-400 shrink-0" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search inventory..."
            className="h-7 bg-transparent border-none text-xs text-neutral-600 placeholder:text-neutral-400 focus-visible:ring-0 font-mp p-0"
          />
        </div>
        {table.getSelectedRowModel().rows.length > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
            <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
              {table.getSelectedRowModel().rows.length} Selected
            </span>
            <button
              onClick={() => setRowSelection({})}
              className="text-[10px] text-neutral-400 hover:text-neutral-600 underline decoration-neutral-200"
            >
              Clear
            </button>
          </div>
        )}
      </div>
      <div className="overflow-auto flex-1">
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
                    className="bg-neutral-50 px-4 py-2 text-xs border-r border-neutral-100 last:border-r-0 font-bold"
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
                      className="px-4 py-2 text-sm border-r border-neutral-50 last:border-r-0"
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
    </div>
  );
}
