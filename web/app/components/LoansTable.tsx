"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
import { Circle, MoreVertical, Search, CheckCircle2 } from "lucide-react";
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
import {
  enrichData,
  loanFetcher,
  formatCapitalized,
} from "@/services/lib/helpers";
import { useUpdateRow } from "@/services/lib/hooks/useDatabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
    if (value !== initialValue) {
      updateData(rowId, columnId, value);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
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
      className="cursor-pointer hover:bg-neutral-100 px-2 py-1 rounded transition-colors truncate min-h-[1.5rem] w-full font-mp"
    >
      {value || <span className="text-neutral-300 italic">Empty</span>}
    </div>
  );
};

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

  const updateLoan = useUpdateRow("Loans");
  const router = useRouter();

  const handleUpdate = useCallback(
    (id: string, columnId: string, value: string) => {
      updateLoan.mutate(
        {
          id,
          data: { [columnId]: value },
        },
        {
          onSuccess: () => {
            toast.success("Updated successfully");
          },
          onError: () => {
            toast.error("Failed to update");
          },
        },
      );
    },
    [updateLoan],
  );

  const handleReturnToggle = useCallback(
    (row: LoanRow) => {
      const isReturned = !!row.time_in;
      const newTimeIn = isReturned ? null : new Date().toISOString();

      updateLoan.mutate(
        {
          id: row.id,
          data: { time_in: newTimeIn },
        },
        {
          onSuccess: () => {
            toast.success(
              isReturned ? "Check-in removed" : "Item returned successfully",
            );
            router.refresh();
          },
          onError: () => {
            toast.error("Failed to update loan status");
          },
        },
      );
    },
    [updateLoan, router],
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!data || data.length === 0) {
        setEnrichedData([]);
        return;
      }
      const result = await enrichData(data, loanFetcher);
      if (active) setEnrichedData(result);
    };
    load();
    return () => {
      active = false;
    };
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
        id: "quick_return",
        header: () => <div className="w-8" />,
        cell: ({ row }) => {
          const isReturned = !!row.original.time_in;

          return (
            <div className="flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReturnToggle(row.original);
                }}
                className={`p-2 rounded-lg transition-all duration-200 hover:cursor-pointer ${
                  isReturned
                    ? "text-green-500 bg-green-50 hover:bg-green-100"
                    : "text-neutral-400 hover:text-blue-600 hover:bg-blue-50"
                }`}
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
          <ColHeader
            label="Item"
            type="text"
            isSorted={column.getIsSorted()}
            onSort={column.getToggleSortingHandler()!}
          />
        ),
        cell: ({ getValue, row, column }) => (
          <EditableCell
            value={getValue() as string}
            rowId={row.original.id.toString()}
            columnId={column.id}
            updateData={handleUpdate}
          />
        ),
      },
      {
        accessorKey: "equipment_type",
        header: ({ column }) => (
          <ColHeader
            label="Equipment Type"
            type="text"
            isSorted={column.getIsSorted()}
            onSort={column.getToggleSortingHandler()!}
          />
        ),
        cell: ({ getValue, row, column }) => (
          <EditableCell
            value={formatCapitalized(getValue() as string) || "—"}
            rowId={row.original.id.toString()}
            columnId={column.id}
            updateData={handleUpdate}
          />
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
        cell: ({ getValue, row, column }) => (
          <EditableCell
            value={formatCapitalized(getValue() as string) || "—"}
            rowId={row.original.id.toString()}
            columnId={column.id}
            updateData={handleUpdate}
          />
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
        cell: ({ getValue, row, column }) => (
          <EditableCell
            value={(getValue() as string) || ""}
            rowId={row.original.id.toString()}
            columnId={column.id}
            updateData={handleUpdate}
          />
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
        cell: ({ getValue, row, column }) => (
          <EditableCell
            value={getValue() as string}
            rowId={row.original.id.toString()}
            columnId={column.id}
            updateData={handleUpdate}
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
          <span className="text-neutral-600 font-mp px-2">
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
            <span className="font-mono text-xs font-mp text-neutral-400 px-2">
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
            <span className="font-mono text-xs font-mp text-neutral-400 px-2">
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
    [handleUpdate, handleReturnToggle],
  );

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
  }, [rowSelection, onSelectionChange, table]);

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
                    className="bg-neutral-50 px-4 py-2.5 font-mp"
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
                  className={`border-b border-neutral-50 ${
                    row.getIsSelected()
                      ? "bg-neutral-50"
                      : "hover:bg-neutral-50/50"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-2.5 text-sm font-mp">
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
                  className="text-center text-neutral-400 py-12 text-sm font-mp"
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
