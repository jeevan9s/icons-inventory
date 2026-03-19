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
import { getLoanStatus } from "@/services/lib/hooks/helpers";
import { format } from "date-fns";
import { formatCapitalized } from "@/services/lib/helpers";
import { LoanRow } from "@/services/lib/types";
import { enrichData, loanFetcher } from "@/services/lib/helpers";

interface LoansTableProps {
  data: LoanRow[];
  onSelectionChange?: (rows: LoanRow[]) => void;
}

export default function LoansTable({
  data,
  onSelectionChange,
}: LoansTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [enrichedData, setEnrichedData] = useState<LoanRow[]>([]);

  useEffect(() => {
  if (data?.length > 0) {
    enrichData(data, loanFetcher).then(setEnrichedData);
  } else {
    setEnrichedData([]);
  }
}, [data]);

  const columns = useMemo<ColumnDef<LoanRow>[]>(
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
        accessorKey: "item_name",
        header: ({ column }) => (
          <ColHeader
            label="Item(s)"
            type="text"
            isSorted={column.getIsSorted()}
            onSort={column.getToggleSortingHandler()!}
          />
        ),
        cell: ({ getValue }) => (
          <span className="text-neutral-800 font-medium">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "student_name",
        header: ({ column }) => (
          <ColHeader
            label="Student Name"
            type="text"
            isSorted={column.getIsSorted()}
            onSort={column.getToggleSortingHandler()!}
          />
        ),
        cell: ({ getValue }) => (
          <span className="text-neutral-600">
            {formatCapitalized(getValue() as string)}
          </span>
        ),
      },
      {
        accessorKey: "student_number",
        header: ({ column }) => (
          <ColHeader
            label="Student ID"
            type="text"
            isSorted={column.getIsSorted()}
            onSort={column.getToggleSortingHandler()!}
          />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs text-neutral-400">
            {row.original.student_number ||
              (row.original as LoanRow).student_number ||
              "—"}
          </span>
        ),
      },
      {
        accessorKey: "location",
        header: ({ column }) => (
          <ColHeader
            label="Location"
            type="text"
            isSorted={column.getIsSorted()}
            onSort={column.getToggleSortingHandler()!}
          />
        ),
        cell: ({ getValue }) => (
          <span className="text-neutral-600">{getValue() as string}</span>
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
        cell: ({ row }) => <StatusBadge status={getLoanStatus(row.original)} />,
      },
      {
        accessorKey: "display_name",
        header: ({ column }) => (
          <ColHeader
            label="Signee"
            type="text"
            isSorted={column.getIsSorted()}
            onSort={column.getToggleSortingHandler()!}
          />
        ),
        cell: ({ getValue }) => (
          <span className="text-neutral-600">
            {formatCapitalized(getValue() as string)}
          </span>
        ),
      },
      {
        accessorKey: "time_out",
        header: ({ column }) => (
          <ColHeader
            label="Time Loaned"
            type="timestamp"
            isSorted={column.getIsSorted()}
            onSort={column.getToggleSortingHandler()!}
          />
        ),
        cell: ({ getValue }) => {
          const date = getValue() as string;
          return (
            <span className="font-mono text-xs text-neutral-400">
              {date ? format(new Date(date), "MMM d, h:mm b") : "—"}
            </span>
          );
        },
      },
      {
        accessorKey: "time_in",
        header: ({ column }) => (
          <ColHeader
            label="Time Returned"
            type="timestamp"
            isSorted={column.getIsSorted()}
            onSort={column.getToggleSortingHandler()!}
          />
        ),
        cell: ({ getValue }) => {
          const date = getValue() as string;
          return (
            <span className="font-mono text-xs text-neutral-400">
              {date ? format(new Date(date), "MMM d, h:mm b") : "—"}
            </span>
          );
        },
      },

      {
        id: "actions",
        cell: () => (
          <button className="text-neutral-400 hover:text-neutral-700">
            <MoreVertical size={14} />
          </button>
        ),
        size: 40,
      },
    ],
    [],
  );

  // @eslint-disable-next-line react-compiler/react-compiler
  const table = useReactTable({
    data: enrichedData,
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
      const selectedData = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);
      onSelectionChange(selectedData);
    }
  }, [rowSelection, table, onSelectionChange]);

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
      </div>
      <div className="overflow-auto flex-1 custom-scrollbar">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-neutral-100">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="bg-neutral-50 px-4 py-2.5"
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
                  className={`border-b border-neutral-50 ${row.getIsSelected() ? "bg-neutral-50" : "hover:bg-neutral-50/50"}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-2.5 text-sm">
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
                  className="text-center text-neutral-400 py-12 text-sm"
                >
                  No loans found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
